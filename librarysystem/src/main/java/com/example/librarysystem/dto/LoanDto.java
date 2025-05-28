package com.example.librarysystem.dto;

import com.example.librarysystem.domain.enums.LoanStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LoanDto {
    private Long id;
    private UserDto user;
    private BookDto book;
    private LocalDateTime loanDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;
    private LoanStatus status;
    private boolean overdue;
}