package com.example.librarysystem.dto;

import lombok.Data;

@Data
public class UserCreateRequest {
    private String username;
    private String password;
    private String name;
    private String contact;
    private String memo;
}