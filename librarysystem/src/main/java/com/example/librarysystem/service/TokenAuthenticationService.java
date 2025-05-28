package com.example.librarysystem.service;

import com.example.librarysystem.domain.Member;
import com.example.librarysystem.dto.RequestAccessToken;
import com.example.librarysystem.dto.ResponseAccessToken;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenAuthenticationService {

    private final MemberService memberService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public ResponseAccessToken generateToken(RequestAccessToken request) {

        Member user = memberService.findByMemberName(request.getUsername()).orElse(null);

        if (user != null && passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return jwtService.getAccessTokenByUsername(user);
        }

        return ResponseAccessToken.builder().error("Invalid username or password").build();
    }

    public ResponseAccessToken refreshAccessToken(String refreshToken) {
        return jwtService.getAccessTokenByRefreshToken(refreshToken);
    }
}