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
        System.out.println("Login attempt for username: " + request.getUsername());

        Member user = memberService.findByMemberName(request.getUsername()).orElse(null);

        if (user == null) {
            System.out.println("User not found: " + request.getUsername());
            return ResponseAccessToken.builder().error("User not found").build();
        }

        System.out.println("User found: " + user.getUsername() + ", Type: " + user.getUserType());
        System.out.println("Stored password hash: " + user.getPassword());
        System.out.println("Input password: " + request.getPassword());

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        System.out.println("Password matches: " + passwordMatches);

        if (passwordMatches) {
            ResponseAccessToken token = jwtService.getAccessTokenByUsername(user);
            System.out.println("Token generated successfully");
            return token;
        }

        System.out.println("Invalid password for user: " + request.getUsername());
        return ResponseAccessToken.builder().error("Invalid username or password").build();
    }
}