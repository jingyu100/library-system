package com.example.librarysystem.domain;

import com.example.librarysystem.domain.enums.BookStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "books")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private String publisher;

    private Integer publishedAt;

    private Integer price;

    @Enumerated(EnumType.STRING)
    private BookStatus status = BookStatus.AVAILABLE;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL)
    private List<Loan> loans = new ArrayList<>();

    // 현재 대출 여부 확인
    public boolean isAvailable() {
        return status == BookStatus.AVAILABLE;
    }

    // 대출 처리
    public void loanOut() {
        this.status = BookStatus.LOANED;
    }

    // 반납 처리
    public void returnBook() {
        this.status = BookStatus.AVAILABLE;
    }
}
