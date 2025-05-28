package com.example.librarysystem.dto;

import lombok.Data;

@Data
public class RequestAccessToken {
    private String username;
    private String password;
}