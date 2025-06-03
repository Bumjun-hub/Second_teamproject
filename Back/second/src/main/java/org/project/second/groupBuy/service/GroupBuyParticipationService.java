package org.project.second.groupBuy.service;

import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.GroupBuyStatus;
import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.groupBuy.domain.GroupBuyParticipation;
import org.project.second.groupBuy.dto.GroupBuyParticipationDto;
import org.project.second.groupBuy.dto.GroupBuyResponseDto;
import org.project.second.groupBuy.repository.GroupBuyParticipationRepository;
import org.project.second.groupBuy.repository.GroupBuyRepository;
import org.project.second.member.domain.Member;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupBuyParticipationService {

    private final GroupBuyRepository groupBuyRepository;
    private final GroupBuyParticipationRepository groupBuyParticipationRepository;

    public void getApply(Long groupBuyId, Member member, int quantity) {
        //공동구매가 있는지
        GroupBuy groupBuy = validatepost(groupBuyId);
        //로그인 했는지
        validateLogin(member);
        //중복신청방지
        if (groupBuyParticipationRepository.existsByGroupBuyAndMember(groupBuy, member)) {
            throw new IllegalArgumentException("이미 신청한 공동구매 입니다");
        }
        //상태별 -> 마감, 인원다참
        if (groupBuy.getStatus() == GroupBuyStatus.CLOSED) {
            throw new IllegalArgumentException("마감된 공동구매 입니다");
        }
        if (groupBuy.getStatus() == GroupBuyStatus.COMPLETED) {
            throw new IllegalArgumentException("이미 인원이 모두 찼습니다");
        }

        GroupBuyParticipation groupBuyParticipation = GroupBuyParticipation.builder()
                .groupBuy(groupBuy)
                .member(member)
                .quantity(quantity)
                .build();
        groupBuyParticipationRepository.save(groupBuyParticipation);

        // 신청하기 누르면 1씩 증가
        int updateParticipations = groupBuy.getCurrentParticipants() +1;
        groupBuy.setCurrentParticipants(updateParticipations);

        //신청인원이 max인원이 되면 completed 해라
        if (updateParticipations >= groupBuy.getMaxParticipants()) {
            groupBuy.setStatus(GroupBuyStatus.COMPLETED);
        }
        // 날짜가 맞으면 closed해라
        if (groupBuy.getDeadline().isBefore(LocalDateTime.now()) &&
        groupBuy.getStatus() == GroupBuyStatus.OPEN) {
            groupBuy.setStatus(GroupBuyStatus.CLOSED);
        }


    }

    //신청한사람목록보기(관리자용)
    public List<GroupBuyParticipationDto> getApplyList(Long groupBuyId) {
        //게시글이 있는지
        GroupBuy groupBuy = validatepost(groupBuyId);

        List<GroupBuyParticipation> participationList
                = groupBuyParticipationRepository.findByGroupBuy(groupBuy);

        return  participationList.stream().map(participation -> new GroupBuyParticipationDto(
                participation.getMember().getId(),
                participation.getMember().getUsername(),
                participation.getQuantity(),
                participation.getCreatedAt()
        ))
                .collect(Collectors.toList());

    }

    //신청취소
    public void cancelApply(Long groupBuyId, Member member) {
        validateLogin(member);
        GroupBuy groupBuy = validatepost(groupBuyId);
        GroupBuyParticipation participation = groupBuyParticipationRepository
                .findByGroupBuyAndMember(groupBuy, member)
                .orElseThrow(() -> new IllegalArgumentException("신청내역이 없습니다"));
        if (LocalDateTime.now().isAfter(groupBuy.getDeadline())){
            throw new IllegalArgumentException("마감일 이후에는 신청을 취소할 수 없습니다");
        }

        groupBuyParticipationRepository.delete(participation);
    }

    //내 신청목록만 보기
    public List<GroupBuyResponseDto>pationList(Member member) {
        List<GroupBuyParticipation> participationList
                = groupBuyParticipationRepository.findByMember(member);

        return participationList.stream().map(participation -> {
            GroupBuy groupBuy = participation.getGroupBuy();
            return GroupBuyResponseDto.from(groupBuy);
        })


    }



    public GroupBuy validatepost (Long groupBuyId) {
        return groupBuyRepository.findById(groupBuyId)
                .orElseThrow(() -> new IllegalArgumentException("해당공동구매가 없습니다"));
    }

    public void validateLogin(Member member){
        if (member == null) {
            throw new IllegalArgumentException("로그인이 필요한 기능입니다.");
        }
    }



}
