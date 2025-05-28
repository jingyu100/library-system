package com.example.librarysystem.service;

import com.example.librarysystem.domain.Book;
import com.example.librarysystem.domain.Loan;
import com.example.librarysystem.domain.Member;
import com.example.librarysystem.domain.enums.LoanStatus;
import com.example.librarysystem.dto.BookDto;
import com.example.librarysystem.dto.LoanDto;
import com.example.librarysystem.dto.LoanRequest;
import com.example.librarysystem.dto.MemberDto;
import com.example.librarysystem.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final MemberService memberService;
    private final BookService bookService;

    @Transactional(readOnly = true)
    public List<LoanDto> getAllActiveLoans() {
        return loanRepository.findByStatus(LoanStatus.ACTIVE)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoanDto> getUserLoans(Long userId) {
        return loanRepository.findByMemberIdAndStatus(userId, LoanStatus.ACTIVE)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoanDto> getBookLoanHistory(Long bookId) {
        return loanRepository.findByBookIdOrderByLoanDateDesc(bookId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoanDto> getOverdueLoans() {
        return loanRepository.findOverdueLoans(LocalDateTime.now(), LoanStatus.ACTIVE)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public LoanDto loanBook(LoanRequest request) {
        Member member = memberService.findByMemberName(getUsernameById(request.getUserId()))
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        Book book = bookService.findById(request.getBookId())
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));

        if (!book.isAvailable()) {
            throw new IllegalStateException("Book is not available for loan");
        }

        // 기존 대출 확인
        Optional<Loan> existingLoan = loanRepository.findByBookIdAndStatus(book.getId(), LoanStatus.ACTIVE);
        if (existingLoan.isPresent()) {
            throw new IllegalStateException("Book is already loaned");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dueDate = now.plusDays(15);

        Loan loan = Loan.builder()
                .member(member)
                .book(book)
                .loanDate(now)
                .dueDate(dueDate)
                .status(LoanStatus.ACTIVE)
                .build();

        book.loanOut();

        Loan savedLoan = loanRepository.save(loan);
        return convertToDto(savedLoan);
    }

    @Transactional
    public LoanDto returnBook(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new IllegalArgumentException("Loan not found"));

        if (loan.getStatus() == LoanStatus.RETURNED) {
            throw new IllegalStateException("Book is already returned");
        }

        loan.returnBook();

        Loan savedLoan = loanRepository.save(loan);
        return convertToDto(savedLoan);
    }

    @Transactional
    public LoanDto returnBookByBookId(Long bookId) {
        Loan loan = loanRepository.findByBookIdAndStatus(bookId, LoanStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Active loan not found for this book"));

        loan.returnBook();

        Loan savedLoan = loanRepository.save(loan);
        return convertToDto(savedLoan);
    }

    private String getUsernameById(Long userId) {
        return memberService.getMemberById(userId)
                .map(MemberDto::getUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private LoanDto convertToDto(Loan loan) {
        MemberDto userDto = MemberDto.builder()
                .id(loan.getMember().getId())
                .username(loan.getMember().getUsername())
                .contact(loan.getMember().getContact())
                .memo(loan.getMember().getMemo())
                .userType(loan.getMember().getUserType())
                .build();

        BookDto bookDto = BookDto.builder()
                .id(loan.getBook().getId())
                .title(loan.getBook().getTitle())
                .author(loan.getBook().getAuthor())
                .publisher(loan.getBook().getPublisher())
                .publishedAt(loan.getBook().getPublishedAt())
                .price(loan.getBook().getPrice())
                .status(loan.getBook().getStatus())
                .available(loan.getBook().isAvailable())
                .build();

        return LoanDto.builder()
                .id(loan.getId())
                .user(userDto)
                .book(bookDto)
                .loanDate(loan.getLoanDate())
                .dueDate(loan.getDueDate())
                .returnDate(loan.getReturnDate())
                .status(loan.getStatus())
                .overdue(loan.isOverdue())
                .build();
    }
}