package com.example.librarysystem.dto;

import com.example.librarysystem.domain.enums.BookStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookDto {
    private Long id;
    private String title;
    private String author;
    private String publisher;
    private Integer publishedAt;
    private Integer price;
    private BookStatus status;
    private boolean available;
}