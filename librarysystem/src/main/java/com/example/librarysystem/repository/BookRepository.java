package com.example.librarysystem.repository;

import com.example.librarysystem.domain.Book;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {
}
