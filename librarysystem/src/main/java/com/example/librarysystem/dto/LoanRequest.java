package com.example.librarysystem.dto;

import lombok.Data;

@Data
public class LoanRequest {
    private Long userId;
    private Long bookId;
}