package com.example.librarysystem.repository;

import com.example.librarysystem.domain.Book;
import com.example.librarysystem.domain.enums.BookStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookRepository extends JpaRepository<Book, Long> {

    @Query("SELECT b FROM Book b WHERE " +
            "(:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:author IS NULL OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
            "(:publisher IS NULL OR LOWER(b.publisher) LIKE LOWER(CONCAT('%', :publisher, '%')))")
    Page<Book> findBooksWithFilters(@Param("title") String title,
                                    @Param("author") String author,
                                    @Param("publisher") String publisher,
                                    Pageable pageable);

    Page<Book> findByStatus(BookStatus status, Pageable pageable);

    @Query("SELECT b FROM Book b LEFT JOIN FETCH b.loans l WHERE b.id = :bookId")
    Book findByIdWithLoans(@Param("bookId") Long bookId);
}