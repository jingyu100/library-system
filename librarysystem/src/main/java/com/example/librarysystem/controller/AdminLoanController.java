package com.example.librarysystem.controller;

import com.example.librarysystem.dto.LoanDto;
import com.example.librarysystem.dto.LoanRequest;
import com.example.librarysystem.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/loans")
@RequiredArgsConstructor
public class AdminLoanController {

    private final LoanService loanService;

    @GetMapping
    public ResponseEntity<List<LoanDto>> getAllActiveLoans() {
        List<LoanDto> loans = loanService.getAllActiveLoans();
        return ResponseEntity.ok(loans);
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<LoanDto>> getOverdueLoans() {
        List<LoanDto> loans = loanService.getOverdueLoans();
        return ResponseEntity.ok(loans);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LoanDto>> getUserLoans(@PathVariable Long userId) {
        List<LoanDto> loans = loanService.getUserLoans(userId);
        return ResponseEntity.ok(loans);
    }

    @PostMapping("/loan")
    public ResponseEntity<LoanDto> loanBook(@RequestBody LoanRequest request) {
        try {
            LoanDto loan = loanService.loanBook(request);
            return ResponseEntity.ok(loan);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/return/{loanId}")
    public ResponseEntity<LoanDto> returnBook(@PathVariable Long loanId) {
        try {
            LoanDto loan = loanService.returnBook(loanId);
            return ResponseEntity.ok(loan);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/return/book/{bookId}")
    public ResponseEntity<LoanDto> returnBookByBookId(@PathVariable Long bookId) {
        try {
            LoanDto loan = loanService.returnBookByBookId(bookId);
            return ResponseEntity.ok(loan);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}