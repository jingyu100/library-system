package com.example.librarysystem.dto;

import lombok.Data;

@Data
public class BookSearchRequest {
    private String title;
    private String author;
    private String publisher;
    private String sortBy = "title"; // title, author, publishedYear
    private String sortDirection = "asc"; // asc, desc
    private int page = 0;
    private int size = 10;
}