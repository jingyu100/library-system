package com.example.librarysystem.controller;

import com.example.librarysystem.dto.BookDto;
import com.example.librarysystem.dto.BookSearchRequest;
import com.example.librarysystem.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/books")
@RequiredArgsConstructor
public class PublicBookController {

    private final BookService bookService;

    // 도서 검색
    @GetMapping("/search")
    public ResponseEntity<Page<BookDto>> searchBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String publisher,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        BookSearchRequest request = new BookSearchRequest();
        request.setTitle(title);
        request.setAuthor(author);
        request.setPublisher(publisher);
        request.setSortBy(sortBy);
        request.setSortDirection(sortDirection);
        request.setPage(page);
        request.setSize(size);

        Page<BookDto> books = bookService.searchBooks(request);
        return ResponseEntity.ok(books);
    }
}