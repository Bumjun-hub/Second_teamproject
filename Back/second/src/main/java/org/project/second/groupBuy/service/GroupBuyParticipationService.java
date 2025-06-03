package org.project.second.groupBuy.service;

import lombok.RequiredArgsConstructor;
import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.groupBuy.repository.GroupBuyParticipationRepository;
import org.project.second.groupBuy.repository.GroupBuyRepository;
import org.project.second.member.domain.Member;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GroupBuyParticipationService {

    private final GroupBuyRepository groupBuyRepository;
    private final GroupBuyParticipationRepository groupBuyParticipationRepository;

    public void getApply(Long groupBuyId, Member member, int quantity) {
        GroupBuy groupBuy = groupBuyRepository.findById(groupBuyId)
                .orElseThrow(() -> new IllegalArgumentException("해당 공동구매가 없습니다"));

        if (member == null) {
            throw new IllegalArgumentException("로그인이 필요한 기능입니다.");
        }
        // 사람이 중복되면 안돼!
        if ()

    }






}
