package com.example.librarysystem.dto;

import com.example.librarysystem.domain.enums.UserType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String name;
    private String contact;
    private String memo;
    private UserType userType;
}