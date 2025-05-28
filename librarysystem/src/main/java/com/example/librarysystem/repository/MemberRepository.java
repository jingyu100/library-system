package com.example.librarysystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.librarysystem.domain.Member;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByUsername(String username);

    boolean existsByUsername(String username);
}
