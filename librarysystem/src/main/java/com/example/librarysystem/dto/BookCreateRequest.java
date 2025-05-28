package com.example.librarysystem.dto;

import lombok.Data;

@Data
public class BookCreateRequest {
    private String title;
    private String author;
    private String publisher;
    private Integer publishedAt;
    private Integer price;
}