package com.example.librarysystem.repository;

import com.example.librarysystem.domain.Loan;
import com.example.librarysystem.domain.enums.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    @Query("SELECT l FROM Loan l JOIN FETCH l.member JOIN FETCH l.book WHERE l.member.id = :userId AND l.status = :status")
    List<Loan> findByMemberIdAndStatus(@Param("userId") Long userId, @Param("status") LoanStatus status);

    @Query("SELECT l FROM Loan l JOIN FETCH l.member JOIN FETCH l.book WHERE l.book.id = :bookId AND l.status = :status")
    Optional<Loan> findByBookIdAndStatus(@Param("bookId") Long bookId, @Param("status") LoanStatus status);

    @Query("SELECT l FROM Loan l JOIN FETCH l.member JOIN FETCH l.book WHERE l.status = :status")
    List<Loan> findByStatus(@Param("status") LoanStatus status);

    @Query("SELECT l FROM Loan l JOIN FETCH l.member JOIN FETCH l.book WHERE l.dueDate < :currentDate AND l.status = :status")
    List<Loan> findOverdueLoans(@Param("currentDate") LocalDateTime currentDate, @Param("status") LoanStatus status);

    @Query("SELECT l FROM Loan l JOIN FETCH l.member JOIN FETCH l.book WHERE l.book.id = :bookId ORDER BY l.loanDate DESC")
    List<Loan> findByBookIdOrderByLoanDateDesc(@Param("bookId") Long bookId);
}