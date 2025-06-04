package com.example.librarysystem.service;

import com.example.librarysystem.domain.Member;
import com.example.librarysystem.domain.enums.UserType;
import com.example.librarysystem.dto.*;
import com.example.librarysystem.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<MemberDto> getAllMembers(Pageable pageable) {
        return memberRepository.findAll(pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Optional<MemberDto> getMemberById(Long id) {
        return memberRepository.findById(id)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Optional<Member> findByMemberName(String username) {
        return memberRepository.findByUsername(username);
    }

    @Transactional
    public MemberDto createMember(MemberCreateRequest request) {
        if (memberRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        Member member = Member.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .contact(request.getContact())
                .memo(request.getMemo())
                .userType(UserType.USER)
                .build();

        Member savedMember = memberRepository.save(member);
        return convertToDto(savedMember);
    }

    @Transactional
    public MemberDto createAdmin(MemberCreateRequest request) {
        if (memberRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        Member member = Member.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .contact(request.getContact())
                .memo(request.getMemo())
                .userType(UserType.ADMIN)
                .build();

        Member savedMember = memberRepository.save(member);
        return convertToDto(savedMember);
    }

    @Transactional
    public MemberDto updateMember(Long id, MemberCreateRequest request) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        // 사용자명 변경 시 중복 체크
        if (!member.getUsername().equals(request.getUsername()) &&
                memberRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        member.setUsername(request.getUsername());
        member.setContact(request.getContact());
        member.setMemo(request.getMemo());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            member.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Member savedMember = memberRepository.save(member);
        return convertToDto(savedMember);
    }

    @Transactional
    public void deleteMember(Long id) {
        memberRepository.deleteById(id);
    }

    private MemberDto convertToDto(Member member) {
        return MemberDto.builder()
                .id(member.getId())
                .username(member.getUsername())
                .contact(member.getContact())
                .memo(member.getMemo())
                .userType(member.getUserType())
                .build();
    }
}