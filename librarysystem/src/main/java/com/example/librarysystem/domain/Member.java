package com.example.librarysystem.domain;

import com.example.librarysystem.domain.enums.UserType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String contact;

    private String memo; // 부서나 기타 정보

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserType userType = UserType.USER;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Loan> loans = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL)
    private RefreshToken refreshToken;
}