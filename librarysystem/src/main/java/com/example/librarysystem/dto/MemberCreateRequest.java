package com.example.librarysystem.dto;

import lombok.Data;

@Data
public class MemberCreateRequest {
    private String username;
    private String password;
    private String contact;
    private String memo;
}