package com.example.librarysystem.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserLoanStatistics {
    private Long userId;
    private long totalLoans;      // 총 대출 횟수
    private long activeLoans;     // 현재 대출 중인 도서 수
    private long overdueLoans;    // 연체 중인 도서 수
    private long returnedLoans;   // 반납 완료된 도서 수
}