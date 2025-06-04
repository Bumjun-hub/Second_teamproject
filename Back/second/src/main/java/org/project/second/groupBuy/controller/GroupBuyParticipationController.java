package org.project.second.groupBuy.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.groupBuy.dto.GroupBuyParticipationDto;
import org.project.second.groupBuy.dto.GroupBuyResponseDto;
import org.project.second.groupBuy.service.GroupBuyParticipationService;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groupBuy")
public class GroupBuyParticipationController {

    private final GroupBuyParticipationService groupBuyParticipationService;

    //신청하기
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

    //관리자만 신청리스트 보기
    @GetMapping("/admin/{groupBuyId}/applyList")
    public ResponseEntity<List<GroupBuyParticipationDto>> getApplyList(
            @PathVariable Long groupBuyId
    ){
        List<GroupBuyParticipationDto> applyList =
                groupBuyParticipationService.getApplyList(groupBuyId);
        return ResponseEntity.ok(applyList);
    }

    //신청취소하기
    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<String> cancelApply (
            @PathVariable("id") Long groupBuyId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Member member = userDetails.getMember();
        groupBuyParticipationService.cancelApply(groupBuyId, member);
        return ResponseEntity.ok("신청이 취소되었습니다");
    }

    //내 신청목록만 보기
    @GetMapping("/myPage/apply")
    public ResponseEntity<List<GroupBuyResponseDto>> myParticipationList(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        Member member = userDetails.getMember();
        List<GroupBuyResponseDto> participationList
                = groupBuyParticipationService.myParticipationList(member);
        return ResponseEntity.ok(participationList);
    }


}
