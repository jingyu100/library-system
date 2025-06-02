package com.example.librarysystem.controller;

import com.example.librarysystem.dto.RequestAccessToken;
import com.example.librarysystem.dto.ResponseAccessToken;
import com.example.librarysystem.service.TokenAuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final TokenAuthenticationService tokenAuthenticationService;

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
}