package com.example.librarysystem.domain;

import com.example.librarysystem.domain.enums.LoanStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "loans")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Member member;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    private LocalDateTime loanDate;

    // 대출 15일
    private LocalDateTime dueDate;

    private LocalDateTime returnDate;

    @Enumerated(EnumType.STRING)
    private LoanStatus status;

    // 연체 여부 확인
    public boolean isOverdue() {
        if (status == LoanStatus.RETURNED) {
            return false;
        }
        return LocalDateTime.now().isAfter(dueDate);
    }

    // 반납 처리
    public void returnBook() {
        this.returnDate = LocalDateTime.now();
        this.status = LoanStatus.RETURNED;
        this.book.returnBook();
    }
}
