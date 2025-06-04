package com.example.librarysystem.controller;

import com.example.librarysystem.dto.RequestAccessToken;
import com.example.librarysystem.dto.ResponseAccessToken;
import com.example.librarysystem.repository.MemberRepository;
import com.example.librarysystem.repository.RefreshTokenRepository;
import com.example.librarysystem.service.JwtService;
import com.example.librarysystem.service.TokenAuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final TokenAuthenticationService tokenAuthenticationService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<ResponseAccessToken> login(@RequestBody RequestAccessToken request) {
        try {
            System.out.println("Login request received: " + request.getUsername());

            ResponseAccessToken response = tokenAuthenticationService.generateToken(request);

            if (response.getError() != null) {
                System.out.println("Login failed: " + response.getError());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            System.out.println("Login successful for: " + request.getUsername());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("Login exception: " + e.getMessage());
            e.printStackTrace();
            ResponseAccessToken errorResponse = ResponseAccessToken.builder()
                    .error("Internal server error: " + e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        try {
            String refreshToken = request.getHeader("Refresh-Token");

            if (refreshToken != null) {
                // Refresh Token으로 사용자 찾기
                String username = jwtService.getRefreshJwtParser()
                        .parseSignedClaims(refreshToken)
                        .getPayload()
                        .getSubject();

                // DB에서 Refresh Token 완전 삭제
                refreshTokenRepository.findByMember_Username(username)
                        .ifPresent(refreshTokenRepository::delete);
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "Successfully logged out");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Logout completed");
            return ResponseEntity.ok(response);
        }
    }
}