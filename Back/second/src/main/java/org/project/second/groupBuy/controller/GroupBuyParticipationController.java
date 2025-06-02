package org.project.second.groupBuy.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.groupBuy.domain.GroupBuyParticipation;
import org.project.second.groupBuy.service.GroupBuyParticipationService;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groupBuy")
public class GroupBuyParticipationController {

    private final GroupBuyParticipationService groupBuyParticipationService;

    @PostMapping("/{id}/apply")
    public ResponseEntity<String> getApply(
            @PathVariable("id") Long groupBuyId,
            @AuthenticationPrincipal CustomUserDetails userDetails
            ) {
        Member member = userDetails.getMember();
        int quantity = 1;
        groupBuyParticipationService.getApply(groupBuyId, member, quantity);
        return ResponseEntity.ok("신청완료");
    }

}
