package org.project.second.community.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.CommunityCategory;
import org.project.second.community.dto.CommunityDto;
import org.project.second.community.dto.CommunityResponseDto;
import org.project.second.community.service.CommunityService;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/community")
public class CommunityController {

    private final CommunityService communityService;

    //게시글 작성
    @PostMapping(value = "/write", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createPost(
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestPart("category") String category,
            @RequestPart(value = "images", required = false) List<MultipartFile> imageFiles,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        CommunityDto communityDto = CommunityDto.builder()
                .category(CommunityCategory.valueOf(category))
                .title(title)
                .content(content)
                .build();

        Member loginUser = userDetails.getMember();
        communityService.createPost(communityDto, imageFiles, loginUser); // 서비스로 넘김
        return ResponseEntity.status(HttpStatus.CREATED).body("게시글이 작성되었습니다");
    }

    //게시글 수정
    @PutMapping (value = "/edit/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> editPost(
            @PathVariable Long id,
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestPart("category") String category,
            @RequestPart(value = "images", required = false)List<MultipartFile> imageFiles,
            @RequestParam(value = "deleteImageIds", required = false) List<Long> deleteImageIds,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

            CommunityDto communityDto = CommunityDto.builder()
                .category(CommunityCategory.valueOf(category))
                .title(title)
                .content(content)
                .build();

        Member loginUser = userDetails.getMember();
        communityService.editPost(id, communityDto, loginUser, imageFiles, deleteImageIds);
        return ResponseEntity.status(HttpStatus.OK).body("게시글이 수정되었습니다");
    }

    //게시글 삭제
    @DeleteMapping ("/delete/{id}")
        public ResponseEntity<String> deletePost(
                @PathVariable Long id,
                @AuthenticationPrincipal CustomUserDetails userDetails
                ) {

        Member loginUser = userDetails.getMember();
        communityService.deletePost(id, loginUser);
        return ResponseEntity.status(HttpStatus.OK).body("게시글이 삭제되었습니다");
    }

    //게시글 전체조회
    @GetMapping("/view/{category}")
    public ResponseEntity<List<CommunityResponseDto>> getCategoryPost(
            @PathVariable CommunityCategory category
            ) {
        List<CommunityResponseDto> posts = communityService.getCategoryPost(category);
        return ResponseEntity.ok(posts);
    }

    //게시글 상세조회
    @GetMapping("/detail/{category}/{id}")
    public ResponseEntity<CommunityResponseDto> detailPost(
            @PathVariable CommunityCategory category,
            @PathVariable Long id
    ){

        CommunityResponseDto post = communityService.detailPost(category,id);
        return ResponseEntity.ok(post);
    }






}
