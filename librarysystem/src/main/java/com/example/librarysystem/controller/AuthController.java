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

        ResponseAccessToken response = tokenAuthenticationService.generateToken(request);

        if (response.getError() != null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        return ResponseEntity.ok(response);
    }
}
