package com.example.librarysystem.service;

import com.example.librarysystem.config.JwtProperties;
import com.example.librarysystem.domain.RefreshToken;
import com.example.librarysystem.domain.Member;
import com.example.librarysystem.dto.ResponseAccessToken;
import com.example.librarysystem.repository.RefreshTokenRepository;
import com.example.librarysystem.repository.MemberRepository;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class JwtService {
    private final JwtProperties jwtProperties;
    private final UserDetailsService userDetailsService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final MemberRepository memberRepository;

    public static final String ACCESS_TOKEN = "access_token";
    public static final String REFRESH_TOKEN = "refresh_token";

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(jwtProperties.getSecretKey()));
    }

    private SecretKey getRefreshSecretKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(jwtProperties.getRefreshKey()));
    }

    private JwtParser getJwtParser() {
        return Jwts.parser().verifyWith(getSecretKey()).build();
    }

    public JwtParser getRefreshJwtParser() {
        return Jwts.parser().verifyWith(getRefreshSecretKey()).build();
    }

    public String generateToken(String username, String type) {
        if (type == null || !type.equals(REFRESH_TOKEN)) {
            type = ACCESS_TOKEN;
        }

        Date now = new Date();
        Duration duration = Duration.ofMinutes(type.equals(ACCESS_TOKEN) ? jwtProperties.getDuration() : jwtProperties.getRefreshDuration());
        Date expiration = new Date(now.getTime() + duration.toMillis());

        return Jwts.builder()
                .issuer(jwtProperties.getIssuer())
                .subject(username)
                .expiration(expiration)
                .signWith(type.equals(ACCESS_TOKEN) ? getSecretKey() : getRefreshSecretKey())
                .compact();
    }

    public Authentication verifyToken(String token) throws JwtException, UsernameNotFoundException {
        String username = getJwtParser().parseSignedClaims(token).getPayload().getSubject();
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        return new UsernamePasswordAuthenticationToken(userDetails.getUsername(), null, userDetails.getAuthorities());
    }

    @Transactional
    public ResponseAccessToken getAccessTokenByUsername(Member member) {
        String accessToken = generateToken(member.getUsername(), ACCESS_TOKEN);
        String refreshToken = generateToken(member.getUsername(), REFRESH_TOKEN);

        RefreshToken rtEntity = refreshTokenRepository.findByMember_Username(member.getUsername()).orElse(null);
        if (rtEntity == null) {
            rtEntity = RefreshToken.builder()
                    .member(member)
                    .refreshToken(refreshToken)
                    .build();
        } else {
            rtEntity.setRefreshToken(refreshToken);
        }
        refreshTokenRepository.save(rtEntity);

        return ResponseAccessToken.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional
    public ResponseAccessToken getAccessTokenByRefreshToken(String token) throws JwtException, UsernameNotFoundException {
        try {
            String username = getRefreshJwtParser().parseSignedClaims(token).getPayload().getSubject();
            Member member = memberRepository.findByUsername(username).orElse(null);
            RefreshToken refreshTokenEntity = refreshTokenRepository.findByMember_Username(username).orElse(null);

            if (member == null) {
                return ResponseAccessToken.builder().error("Unknown user.").build();
            }

            // DB에서 삭제된 Refresh Token은 무효화
            if (refreshTokenEntity == null) {
                return ResponseAccessToken.builder().error("Refresh token not found in database.").build();
            }

            // LocalStorage의 토큰과 DB의 토큰이 일치해야 함
            if (!refreshTokenEntity.getRefreshToken().equals(token)) {
                // 토큰이 다르면 보안 위험으로 간주하고 DB에서 삭제
                refreshTokenRepository.delete(refreshTokenEntity);
                return ResponseAccessToken.builder().error("Invalid refresh token.").build();
            }

            // Refresh Token 만료 시간 검증
            try {
                getRefreshJwtParser().parseSignedClaims(token);
            } catch (ExpiredJwtException e) {
                // 만료된 Refresh Token은 DB에서 삭제
                refreshTokenRepository.delete(refreshTokenEntity);
                return ResponseAccessToken.builder().error("Refresh token expired.").build();
            }
            return getAccessTokenByUsername(member);
        } catch (Exception e) {
            // 모든 예외 상황에서는 인증 실패로 처리
            return ResponseAccessToken.builder().error("Token validation failed.").build();
        }
    }
}