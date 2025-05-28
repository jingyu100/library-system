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

    @GetMapping
    public ResponseEntity<Page<BookDto>> getAllBooks(Pageable pageable) {
        Page<BookDto> books = bookService.getAllBooks(pageable);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDto> getBook(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/loans")
    public ResponseEntity<List<LoanDto>> getBookLoanHistory(@PathVariable Long id) {
        List<LoanDto> loans = loanService.getBookLoanHistory(id);
        return ResponseEntity.ok(loans);
    }

    @PostMapping
    public ResponseEntity<BookDto> createBook(@RequestBody BookCreateRequest request) {
        BookDto book = bookService.createBook(request);
        return ResponseEntity.ok(book);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookDto> updateBook(@PathVariable Long id, @RequestBody BookCreateRequest request) {
        try {
            BookDto book = bookService.updateBook(id, request);
            return ResponseEntity.ok(book);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok().build();
    }
}