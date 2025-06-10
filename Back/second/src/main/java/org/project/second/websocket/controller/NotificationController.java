package org.project.second.websocket.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.project.second.product.dto.MessageResponse;
import org.project.second.websocket.domain.Notification;
import org.project.second.websocket.dto.NotificationResponse;
import org.project.second.websocket.repository.NotificationRepository;
import org.project.second.wishlist.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationRepository notificationRepository;
    private final WishlistService wishlistService;
    
    //내 알림 전부 조회
    @GetMapping("/get")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Member m = userDetails.getMember();
        wishlistService.validateMember(m);

        List<NotificationResponse> responses = notificationRepository.findByMemberId(m.getId())
                .stream()
                .map(notifications ->  NotificationResponse.builder()
                            .id(notifications.getId())
                            .type(notifications.getType())
                            .content(notifications.getContent())
                            .communityId(notifications.getCommunity() != null ? notifications.getCommunity().getId() : null)
                            .groupBuyId(notifications.getGroupBuy() != null ? notifications.getGroupBuy().getId() : null)
                            .recipeId(notifications.getRecipe() != null ? notifications.getRecipe().getId() : null)
                            .isRead(notifications.getIsRead())
                            .createdAt(notifications.getCreatedAt())
                            .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }
    
    // 읽지 않은 알림 총 갯수
    @GetMapping("/count/unread")
    public Long countUnread(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Member m = userDetails.getMember();
        wishlistService.validateMember(m);
        return notificationRepository.countByMemberIdAndIsReadFalse(m.getId());
    }
    
    // 읽음 처리
    @PostMapping("/{id}/read")
    public ResponseEntity<MessageResponse> markAsRead(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        Member m = userDetails.getMember();
        wishlistService.validateMember(m);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("알림 없음"));

        if (!notification.getMember().getId().equals(m.getId())) {
            throw new AccessDeniedException("다른 사람의 알림을 수정할 수 없습니다.");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);

        return ResponseEntity.ok(new MessageResponse("알람 읽음처리 완료"));
    }



}
