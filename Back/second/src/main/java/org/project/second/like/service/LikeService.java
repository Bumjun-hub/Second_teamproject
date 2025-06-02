package org.project.second.like.service;

import lombok.RequiredArgsConstructor;
import org.project.second.community.domain.Community;
import org.project.second.community.repository.CommunityRepository;
import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.like.domain.Like;
import org.project.second.like.repository.LikeRepository;
import org.project.second.member.domain.Member;
import org.project.second.member.repository.MemberRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final MemberRepository memberRepository;
    private final CommunityRepository communityRepository;


    public void toggleLike(Member m, String type, Long postId) {
        Member member = memberRepository.findByEmail(m.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("유저 정보를 찾을 수 없습니다."));

        switch (type.toUpperCase()) {
            case "COMMUNITY":
                Community community = communityRepository.findById(postId)
                        .orElseThrow(() -> new IllegalArgumentException("없는 커뮤니티 글 번호 입니다."));
                if (likeRepository.existsByMember_IdAndCommunity_Id(m.getId(), community.getId())) {
                    likeRepository.deleteByMember_IdAndCommunity_Id(m.getId(), community.getId());
                }  else {
                    Like like = Like.builder()
                                    .member(m)
                                    .community(community)
                                .build();
                    likeRepository.save(like);
                }
                break;
            case "GROUPBUY" :
//                GroupBuy groupBuy =

        }
    }
}
