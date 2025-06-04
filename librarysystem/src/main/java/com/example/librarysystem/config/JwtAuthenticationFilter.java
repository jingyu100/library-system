package com.example.librarysystem.config;

import com.example.librarysystem.dto.ResponseAccessToken;
import com.example.librarysystem.dto.ResponseTokenError;
import com.example.librarysystem.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final static String HEADER_STRING = "Authorization";
    private final static String REFRESH_HEADER_STRING = "Refresh-Token";
    private final static String TOKEN_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String requestURI = request.getRequestURI();

        // "/api"로 시작하지 않으면 필터를 그냥 통과
        if (!requestURI.startsWith("/api")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = getTokenString(request);
        String refreshToken = getRefreshTokenString(request);

        try {
            if (token != null) {
                Authentication authentication = jwtService.verifyToken(token);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
            filterChain.doFilter(request, response);
        } catch (ExpiredJwtException e) {
            // Access Token이 만료된 경우, Refresh Token으로 재발급 시도
            if (refreshToken != null) {
                try {
                    ResponseAccessToken newTokenResponse = jwtService.getAccessTokenByRefreshToken(refreshToken);

                    if (newTokenResponse.getError() == null && newTokenResponse.getAccessToken() != null) {
                        // 새 토큰으로 인증 설정
                        Authentication authentication = jwtService.verifyToken(newTokenResponse.getAccessToken());
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        // 응답 헤더에 새 토큰들 추가
                        response.setHeader("New-Access-Token", newTokenResponse.getAccessToken());
                        if (newTokenResponse.getRefreshToken() != null) {
                            response.setHeader("New-Refresh-Token", newTokenResponse.getRefreshToken());
                        }

                        filterChain.doFilter(request, response);
                        return;
                    }
                } catch (Exception refreshException) {
                    // Refresh Token도 유효하지 않은 경우
                    setErrorResponse(response, new RuntimeException("Both access and refresh tokens are invalid"));
                    return;
                }
            }

            // Refresh Token이 없거나 재발급 실패한 경우
            setErrorResponse(response, e);
        } catch (SignatureException | IllegalArgumentException | UsernameNotFoundException e) {
            setErrorResponse(response, e);
        }
    }

    private String getTokenString(HttpServletRequest request) {
        String header = request.getHeader(HEADER_STRING);
        if (header != null && header.startsWith(TOKEN_PREFIX)) {
            return header.substring(TOKEN_PREFIX.length());
        }
        return null;
    }

    private String getRefreshTokenString(HttpServletRequest request) {
        return request.getHeader(REFRESH_HEADER_STRING);
    }

    public void setErrorResponse(HttpServletResponse res, Throwable ex) throws IOException {
        res.setStatus(HttpStatus.UNAUTHORIZED.value());
        res.setContentType("application/json; charset=UTF-8");
        ResponseTokenError jwtExceptionResponse = new ResponseTokenError(ex.getMessage());
        ObjectMapper mapper = new ObjectMapper();
        res.getWriter().write(mapper.writeValueAsString(jwtExceptionResponse));
    }
}