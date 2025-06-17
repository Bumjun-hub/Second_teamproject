package org.project.second.accountBook.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
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

    //수입작성
    @PostMapping("/income")
    public ResponseEntity<String> addIncome(
            @RequestBody IncomeDto dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
            ){
        Member loginUser = userDetails.getMember();
        accountBookService.addIncome(dto, loginUser);
        return ResponseEntity.status(HttpStatus.CREATED).body("수입 작성 완료");
    }

    //지출작성
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

    //수입수정
    @PutMapping("/income/edit/{id}")
    public ResponseEntity<String> editIncome(
            @PathVariable Long id,
            @RequestBody IncomeDto dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
            ){
        Member loginUSer = userDetails.getMember();
        accountBookService.editIncome(id, dto, loginUSer);
        return ResponseEntity.ok("수정 되었습니다");
    }

    //지출수정
    @PutMapping("/expense/edit/{id}")
    public ResponseEntity<String> editExpense(
            @PathVariable Long id,
            @RequestPart ExpenseDto dto,
            @RequestPart(value = "images", required = false) List<MultipartFile> imageFiles,
            @RequestPart(value = "removedImages", required = false) String removedImagesJson,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        Member loginUser = userDetails.getMember();
        // 삭제할 이미지 URL 파싱
        List<String> removedUrls = List.of();
        if (removedImagesJson != null && !removedImagesJson.isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                removedUrls = objectMapper.readValue(removedImagesJson, new TypeReference<List<String>>() {});
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("이미지 삭제 목록 파싱 실패");
            }
        }
        accountBookService.editExpense(id, loginUser, dto, imageFiles, removedUrls);
        return ResponseEntity.ok("수정 되었습니다");
    }

    //수입삭제
    @DeleteMapping("/income/delete/{id}")
    public ResponseEntity<String> deleteIncome(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        Member loginUSer = userDetails.getMember();
        accountBookService.deleteIncome(id, loginUSer);
        return ResponseEntity.ok("삭제되었습니다");
    }

    //지출삭제
    @DeleteMapping("/expense/delete/{id}")
    public ResponseEntity<String> deleteExpense(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        Member loginUser = userDetails.getMember();
        accountBookService.deleteExpense(id, loginUser);
        return ResponseEntity.ok("삭제되었습니다");
    }

}
