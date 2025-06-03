package com.example.librarysystem.dto;

import lombok.Data;

@Data
public class LoanRequest {
    private Long userId;
    private Long bookId;
    private Integer loanDays = 14; // 기본값 14일
}