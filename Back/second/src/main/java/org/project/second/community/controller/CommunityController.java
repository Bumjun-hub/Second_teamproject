package org.project.second.community.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.CommunityCategory;
import org.project.second.community.dto.CommunityDto;
import org.project.second.community.dto.CommunityResponseDto;
import org.project.second.community.service.CommunityService;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class CommunityController {

    private final CommunityService communityService;

    //게시글 작성
    @PostMapping("/community")
    public ResponseEntity<String> createPost(
            @RequestBody CommunityDto communityDto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (communityDto.getTitle() == null || communityDto.getTitle().isBlank()) {
            throw new IllegalArgumentException("제목을 입력하세요");
        }
        if (communityDto.getContent() == null || communityDto.getContent().isBlank()) {
            throw new IllegalArgumentException("내용을 입력하세요");
        }
        Member loginUser = userDetails.getMember(); // 로그인 사용자 정보 꺼내기
        communityService.createPost(communityDto, loginUser); // 서비스로 넘김
        return ResponseEntity.status(HttpStatus.CREATED).body("게시글이 작성되었습니다");
    }

    //게시글 수정
    @PutMapping ("/community/{id}")
    public ResponseEntity<String> updatePost(
            @PathVariable Long id,
            @RequestBody CommunityDto communityDto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (communityDto.getTitle() == null || communityDto.getTitle().isBlank()) {
            throw new IllegalArgumentException("제목을 입력하세요");
        }
        if (communityDto.getContent() == null || communityDto.getContent().isBlank()) {
            throw new IllegalArgumentException("내용을 입력하세요");
        }
        Member loginUser = userDetails.getMember();
        communityService.updatePost(id, communityDto, loginUser);
        return ResponseEntity.status(HttpStatus.OK).body("게시글이 수정되었습니다");
    }

    //게시글 삭제
    @DeleteMapping ("/community/{id}")
        public ResponseEntity<String> deletePost(
                @PathVariable Long id,
                @AuthenticationPrincipal CustomUserDetails userDetails
                ) {
        Member loginUser = userDetails.getMember();
        communityService.deletePost(id, loginUser);
        return ResponseEntity.status(HttpStatus.OK).body("게시글이 삭제되었습니다");
    }

    //게시글 전체조회
    @GetMapping("/community/{category}")
    public ResponseEntity<List<CommunityResponseDto>> getCategoryPost(
            @PathVariable CommunityCategory category
            ) {
        List<CommunityResponseDto> posts = communityService.getCategoryPost(category);
        return ResponseEntity.ok(posts);
    }

    //게시글 상세조회
    @GetMapping("/community/{category}/{id}")
    public ResponseEntity<CommunityResponseDto> detailPost(
            @PathVariable CommunityCategory category,
            @PathVariable Long id
    ){
        CommunityResponseDto post = communityService.detailPost(category,id);
        return ResponseEntity.ok(post);
    }





}
