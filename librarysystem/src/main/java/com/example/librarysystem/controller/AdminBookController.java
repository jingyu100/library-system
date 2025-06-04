package com.example.librarysystem.controller;

import com.example.librarysystem.dto.BookCreateRequest;
import com.example.librarysystem.dto.BookDto;
import com.example.librarysystem.dto.LoanDto;
import com.example.librarysystem.service.BookService;
import com.example.librarysystem.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/books")
@RequiredArgsConstructor
public class AdminBookController {

    private final BookService bookService;
    private final LoanService loanService;

    // 모든 도서 조회
    @GetMapping
    public ResponseEntity<Page<BookDto>> getAllBooks(Pageable pageable) {
        Page<BookDto> books = bookService.getAllBooks(pageable);
        return ResponseEntity.ok(books);
    }

    // 도서 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<BookDto> getBook(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 도서 별 대출 내역 조회
    @GetMapping("/{id}/loans")
    public ResponseEntity<List<LoanDto>> getBookLoanHistory(@PathVariable Long id) {
        List<LoanDto> loans = loanService.getBookLoanHistory(id);
        return ResponseEntity.ok(loans);
    }

    // 도서 등록
    @PostMapping
    public ResponseEntity<BookDto> createBook(@RequestBody BookCreateRequest request) {
        BookDto book = bookService.createBook(request);
        return ResponseEntity.ok(book);
    }

    // 도서 수정
    @PutMapping("/{id}")
    public ResponseEntity<BookDto> updateBook(@PathVariable Long id, @RequestBody BookCreateRequest request) {
        try {
            BookDto book = bookService.updateBook(id, request);
            return ResponseEntity.ok(book);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 도서 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok().build();
    }
}