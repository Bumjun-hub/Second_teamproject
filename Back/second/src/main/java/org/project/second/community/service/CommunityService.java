package org.project.second.community.service;

import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.project.second.community.domain.Community;
import org.project.second.community.dto.CommunityDto;
import org.project.second.community.repository.CommunityRopository;
import org.project.second.member.domain.Member;
import org.project.second.member.repository.MemberRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.nio.channels.AcceptPendingException;

@Service
@RequiredArgsConstructor
@Builder
public class CommunityService {
    
    private final CommunityRopository communityRopository;
    private final MemberRepository memberRepository;

    public void validateMember(Member loginUser) {
        Member foundMember = memberRepository.findById(loginUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("해당사용자가 존재하지 않습니다"));

        if (!foundMember.getEmail().equals(loginUser.getEmail())) {
            throw new AccessDeniedException("사용자 정보가 일치하지 않습니다.");
        }
    }


    public void createPost(CommunityDto communityDto, Member loginUser) {
        validateMember(loginUser);
        Community community = Community.builder()
                .title(communityDto.getTitle())
                .content(communityDto.getContent())
                .category(communityDto.getCategory())
                .member(loginUser)
                .isDeleted(false)
                        .build();
        communityRopository.save(community);

    }
}
