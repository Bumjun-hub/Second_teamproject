package org.project.second.accountBook.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.accountBook.domain.AccountBookImage;
import org.project.second.accountBook.dto.ExpenseDto;
import org.project.second.accountBook.dto.IncomeDto;
import org.project.second.accountBook.service.AccountBookService;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/accountBook")
public class AccountBookController {

    private final AccountBookService accountBookService;

    @PostMapping("/income")
    public ResponseEntity<String> addIncome(
            @RequestBody IncomeDto dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
            ){
        Member loginUser = userDetails.getMember();
        accountBookService.addIncome(dto, loginUser);
        return ResponseEntity.status(HttpStatus.CREATED).body("수입 작성 완료");
    }

    @PostMapping("/expense")
    public ResponseEntity<String> addExpense(
            @RequestPart ExpenseDto dto,
            @RequestPart(value = "images", required = false) List<MultipartFile> imageFiles,
            @AuthenticationPrincipal CustomUserDetails userDetails
            ){
        Member loginUser = userDetails.getMember();
        accountBookService.addExpense(dto, imageFiles, loginUser);
        return ResponseEntity.status(HttpStatus.CREATED).body("지출 작성 완료");

    }
}
