package org.project.second.groupBuy.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.GroupBuyStatus;
import org.project.second.groupBuy.dto.GroupBuyDto;
import org.project.second.groupBuy.dto.GroupBuyResponseDto;
import org.project.second.groupBuy.service.GroupBuyService;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groupBuy")
public class GroupBuyController {

    private final GroupBuyService groupBuyService;

    //작성
    @PostMapping(value = "admin/write", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createPost(
            @RequestParam("status") String status,
            @RequestParam("title") String title,
            @RequestParam(value = "content", required = false, defaultValue = "") String content,
            @RequestParam("productUrl") String productUrl,
            @RequestParam("description") String description,
            @RequestParam("maxParticipants") Integer maxParticipants,
            @RequestParam("minParticipants") Integer minParticipants,
            @RequestParam("maxQuantity") Integer maxQuantity,
            @RequestParam("originalPrice") Long originalPrice,
            @RequestParam("salePrice") Long salePrice,
            @RequestParam("deadline") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime deadline,
            @RequestParam("hotdeal") boolean hotdeal,
            @RequestParam(value = "images", required = false) MultipartFile imageFile,
            @RequestParam(value = "contentImage", required = false) List<MultipartFile> contentImages,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        GroupBuyDto groupBuyDto = GroupBuyDto.builder()
                .status(GroupBuyStatus.valueOf(status))
                .title(title)
                .content(content)
                .productUrl(productUrl)
                .description(description)
                .maxParticipants(maxParticipants)
                .minParticipants(minParticipants)
                .maxQuantity(maxQuantity)
                .originalPrice(originalPrice)
                .salePrice(salePrice)
                .deadline(deadline)
                .hotdeal(hotdeal)
                .build();

        Member loginUser = userDetails.getMember();

        // 단일 파일 → 리스트로 변환
        List<MultipartFile> imageFiles = imageFile != null ? List.of(imageFile) : List.of();

        groupBuyService.createPost(groupBuyDto, imageFiles, contentImages, loginUser);

        return ResponseEntity.status(HttpStatus.CREATED).body("게시글이 작성되었습니다");
    }


    //수정
    @PutMapping(value = "admin/edit/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> editPost(
            @PathVariable Long id,
            @RequestParam("status") String status,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("productUrl") String productUrl,
            @RequestParam("description") String description,
            @RequestParam("maxParticipants") Integer maxParticipants,
            @RequestParam("minParticipants") Integer minParticipants,
            @RequestParam("maxQuantity") Integer maxQuantity,
            @RequestParam("originalPrice") Long originalPrice,
            @RequestParam("salePrice") Long salePrice,
            @RequestParam("deadline") LocalDateTime deadline,
            @RequestParam(value = "images", required = false) List<MultipartFile> imageFiles,
            @RequestParam(value = "deleteImageIds", required = false) List<Long> deleteImageIds,
            @RequestParam(value = "contentImage", required = false) List<MultipartFile> contentImages,
            @RequestParam(value = "deleteContentImageIds", required = false) List<Long> deleteContentImageIds,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        GroupBuyDto groupBuyDto = GroupBuyDto.builder()
                .status(GroupBuyStatus.valueOf(status))
                .title(title)
                .content(content)
                .productUrl(productUrl)
                .description(description)
                .maxParticipants(maxParticipants)
                .minParticipants(minParticipants)
                .maxQuantity(maxQuantity)
                .originalPrice(originalPrice)
                .salePrice(salePrice)
                .deadline(deadline)
                .build();

        Member loginUser = userDetails.getMember();
        groupBuyService.editPost(id, groupBuyDto, loginUser, imageFiles, deleteImageIds, contentImages, deleteContentImageIds);
        return ResponseEntity.status(HttpStatus.OK).body("게시글이 수정되었습니다");
    }

    //삭제
    @DeleteMapping("admin/delete/{id}")
    public ResponseEntity<String> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Member loginUser = userDetails.getMember();
        groupBuyService.deletePost(id, loginUser);
        return ResponseEntity.status(HttpStatus.OK).body("게시글이 삭제되었습니다");
    }

    //전체조회
    @GetMapping("/view")
    public ResponseEntity<List<GroupBuyResponseDto>> viewAll() {
        List<GroupBuyResponseDto> posts = groupBuyService.viewAll();
        return ResponseEntity.ok(posts);
    }

    //상세조회
    @GetMapping("/detail/{id}")
    public ResponseEntity<GroupBuyResponseDto> detailView(
            @PathVariable Long id
    ) {
        GroupBuyResponseDto post = groupBuyService.detailView(id);
        return ResponseEntity.ok(post);
    }

    //상태별조회
    @GetMapping("/view/{status}")
    public ResponseEntity<List<GroupBuyResponseDto>> statusView(
            @PathVariable GroupBuyStatus status
    ) {
        List<GroupBuyResponseDto> post = groupBuyService.statusView(status);
        return ResponseEntity.ok(post);
    }


}
