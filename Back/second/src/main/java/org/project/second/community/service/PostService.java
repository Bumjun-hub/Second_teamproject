package org.project.second.community.service;

import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.project.second.community.domain.Community;
import org.project.second.community.dto.PostDto;
import org.project.second.community.repository.PostRopository;
import org.project.second.member.domain.Member;
import org.project.second.member.repository.MemberRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Builder
public class PostService {
    
    private final PostRopository postRopository;
    private final MemberRepository memberRepository;


    public void createPost(PostDto postDto) {
        Member dummyMember = memberRepository.findById(1L)
                .orElseThrow(() -> new IllegalArgumentException("사용자없음"));

        Community community = Community.builder()
                .title(postDto.getTitle())
                .content(postDto.getContent())
                .category(postDto.getCategory())
                .member(dummyMember)
                .viewCount(0L)
                .isDeleted(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                        .build();
        postRopository.save(community);

    }
}
