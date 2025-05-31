package org.project.second.groupBuy.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.GroupBuyStatus;
import org.project.second.groupBuy.dto.GroupBuyDto;
import org.project.second.groupBuy.dto.GroupBuyResponseDto;
import org.project.second.groupBuy.service.GroupBuyService;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.LinkedList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groupBy")
public class GroupBuyController {

    private final GroupBuyService groupBuyService;

    //작성
    @PostMapping(value = "admin/write", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createPost(
            @RequestPart("status") String status,
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestPart("description") String description,
            @RequestPart("maxQuantity") Integer maxQuantity,
            @RequestPart("originalPrice") Long originalPrice,
            @RequestPart("salePrice") Long salePrice,
            @RequestPart("deadline")LocalDateTime deadline,
            @RequestPart(value = "images", required = false) List<MultipartFile> imageFiles,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        GroupBuyDto groupBuyDto = GroupBuyDto.builder()
                .status(GroupBuyStatus.valueOf(status))
                .title(title)
                .content(content)
                .description(description)
                .maxQuantity(maxQuantity)
                .originalPrice(originalPrice)
                .salePrice(salePrice)
                .deadline(deadline)
                .build();

        Member loginUser = userDetails.getMember();
        groupBuyService.createPost(groupBuyDto, imageFiles, loginUser);
        return ResponseEntity.status(HttpStatus.CREATED).body("게시글이 작성되었습니다");
    }

    //수정
    @PutMapping(value = "admin/edit/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> editPost (
            @PathVariable Long id,
            @RequestPart("status") String status,
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestPart("description") String description,
            @RequestPart("maxQuantity") Integer maxQuantity,
            @RequestPart("originalPrice") Long originalPrice,
            @RequestPart("salePrice") Long salePrice,
            @RequestPart("deadline")LocalDateTime deadline,
            @RequestPart(value = "images", required = false) List<MultipartFile> imageFiles,
            @RequestParam(value = "deleteImageIds", required = false) List<Long> deleteImageIds,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        GroupBuyDto groupBuyDto = GroupBuyDto.builder()
                .status(GroupBuyStatus.valueOf(status))
                .title(title)
                .content(content)
                .description(description)
                .maxQuantity(maxQuantity)
                .originalPrice(originalPrice)
                .salePrice(salePrice)
                .deadline(deadline)
                .build();

        Member loginUser = userDetails.getMember();
        groupBuyService.editPost(id, groupBuyDto, loginUser, imageFiles, deleteImageIds);
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
    ){
        GroupBuyResponseDto post = groupBuyService.detailView(id);
        return ResponseEntity.ok(post);
    }

    //상태별조회(필요하면쓰고아니면 ㄴㄴ)
   // @GetMapping("/status/{status}")


}
