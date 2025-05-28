package com.example.librarysystem.service;

import com.example.librarysystem.domain.Book;
import com.example.librarysystem.dto.BookCreateRequest;
import com.example.librarysystem.dto.BookDto;
import com.example.librarysystem.dto.BookSearchRequest;
import com.example.librarysystem.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    @Transactional(readOnly = true)
    public Page<BookDto> searchBooks(BookSearchRequest request) {

        // 정렬 설정
        Sort sort = Sort.by(
                "desc".equalsIgnoreCase(request.getSortDirection()) ?
                        Sort.Direction.DESC : Sort.Direction.ASC,
                getSortField(request.getSortBy())
        );

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        return bookRepository.findBooksWithFilters(
                request.getTitle(),
                request.getAuthor(),
                request.getPublisher(),
                pageable
        ).map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Page<BookDto> getAllBooks(Pageable pageable) {
        return bookRepository.findAll(pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Optional<BookDto> getBookById(Long id) {
        return bookRepository.findById(id)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Optional<Book> findById(Long id) {
        return bookRepository.findById(id);
    }

    @Transactional
    public BookDto createBook(BookCreateRequest request) {
        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .publisher(request.getPublisher())
                .publishedAt(request.getPublishedAt())
                .price(request.getPrice())
                .build();

        Book savedBook = bookRepository.save(book);
        return convertToDto(savedBook);
    }

    @Transactional
    public BookDto updateBook(Long id, BookCreateRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setPublisher(request.getPublisher());
        book.setPublishedAt(request.getPublishedAt());
        book.setPrice(request.getPrice());

        Book savedBook = bookRepository.save(book);
        return convertToDto(savedBook);
    }

    @Transactional
    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }

    private String getSortField(String sortBy) {
        return switch (sortBy) {
            case "author" -> "author";
            case "publishedAt" -> "publishedAt";
            case "publisher" -> "publisher";
            default -> "title";
        };
    }

    private BookDto convertToDto(Book book) {
        return BookDto.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .publisher(book.getPublisher())
                .publishedAt(book.getPublishedAt())
                .price(book.getPrice())
                .status(book.getStatus())
                .available(book.isAvailable())
                .build();
    }
}