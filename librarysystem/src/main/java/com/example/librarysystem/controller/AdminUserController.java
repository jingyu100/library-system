package com.example.librarysystem.controller;

import com.example.librarysystem.dto.LoanDto;
import com.example.librarysystem.dto.MemberCreateRequest;
import com.example.librarysystem.dto.MemberDto;
import com.example.librarysystem.dto.UserLoanStatistics;
import com.example.librarysystem.service.LoanService;
import com.example.librarysystem.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final MemberService memberService;
    private final LoanService loanService;

    @GetMapping
    public ResponseEntity<Page<MemberDto>> getAllUsers(Pageable pageable) {
        Page<MemberDto> users = memberService.getAllMembers(pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemberDto> getUser(@PathVariable Long id) {
        return memberService.getMemberById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MemberDto> createUser(@RequestBody MemberCreateRequest request) {
        try {
            MemberDto user = memberService.createMember(request);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemberDto> updateUser(@PathVariable Long id, @RequestBody MemberCreateRequest request) {
        try {
            MemberDto user = memberService.updateMember(id, request);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/loans")
    public ResponseEntity<List<LoanDto>> getUserLoans(@PathVariable Long id) {
        try {
            List<LoanDto> loans = loanService.getAllUserLoans(id);
            return ResponseEntity.ok(loans);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/loans/active")
    public ResponseEntity<List<LoanDto>> getUserActiveLoans(@PathVariable Long id) {
        try {
            List<LoanDto> loans = loanService.getUserActiveLoans(id);
            return ResponseEntity.ok(loans);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/loan-statistics")
    public ResponseEntity<UserLoanStatistics> getUserLoanStatistics(@PathVariable Long id) {
        try {
            UserLoanStatistics statistics = loanService.getUserLoanStatistics(id);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
