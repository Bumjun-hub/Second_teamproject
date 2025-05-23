package org.project.second.community.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.community.dto.CommunityDto;
import org.project.second.community.service.CommunityService;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping("/community")
    public ResponseEntity<String> createPost(
            @RequestBody CommunityDto communityDto,
            @AuthenticationPrincipal CustomUserDetails userDetails){
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


}
