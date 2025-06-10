package org.project.second.websocket.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.project.second.common.enums.NotificationType;
import org.project.second.community.domain.Community;
import org.project.second.groupBuy.domain.GroupBuy;


import org.project.second.groupBuy.domain.GroupBuyParticipation;
import org.project.second.groupBuy.repository.GroupBuyParticipationRepository;
import org.project.second.groupBuy.repository.GroupBuyRepository;
import org.project.second.member.domain.Member;
import org.project.second.member.repository.MemberRepository;
import org.project.second.recipe.domain.Recipe;
import org.project.second.websocket.domain.Notification;
import org.project.second.websocket.dto.NotificationResponse;
import org.project.second.websocket.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final MemberRepository memberRepository;
    private final GroupBuyParticipationRepository groupBuyParticipationRepository;
    private final GroupBuyRepository groupBuyRepository;

    @Transactional
    public void createAndSendNotification(Member m, NotificationType type, String content,
                                          Community community, GroupBuy groupBuy, Recipe recipe) {
        // DB에 저장
        Notification notification = Notification.builder()
                .member(m)
                .type(type)
                .content(content)
                .community(community)
                .groupBuy(groupBuy)
                .recipe(recipe)
                .build();
        notificationRepository.save(notification);

        NotificationResponse response = NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .content(notification.getContent())
                .communityId(community != null ? community.getId() : null)
                .groupBuyId(groupBuy != null ? groupBuy.getId() : null)
                .recipeId(recipe != null ? recipe.getId() : null)
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();

        // 사용자별 알람 전송
        log.info("🔔 {}에게 알림 전송: {}", m.getUsername(), content);
        messagingTemplate.convertAndSendToUser(
                m.getEmail()
                ,"/topic/notification"
                ,response);
    }

    // 공동구매 오픈 알림 (모든 사용자)
    @Transactional
    public void sendGruopBuyOpenToAll(GroupBuy groupBuy, String content) {
        // 모든 회원 조회
        List<Member> members = memberRepository.findAll();

        // 사용자별 알람 전송
        log.info("🔔 {}공동구매 오픈 알림 전송: {}", groupBuy.getTitle(), content);
        for (Member member : members) {
            createAndSendNotification(member, NotificationType.GROUP_BUY_OPEN, content, null, groupBuy, null);
        }
    }

    @Transactional
    public void sendGruopBuyCloseToParticipants(Long groupBuyId, String content) {
        GroupBuy groupBuy = groupBuyRepository.findById(groupBuyId)
                .orElseThrow(() -> new RuntimeException("유효하지 않은 공동구매 게시글 번호입니다."));
        List<Member> participants = groupBuyParticipationRepository.findByGroupBuyId(groupBuyId)
                .stream()
                .map(GroupBuyParticipation::getMember)
                .collect(Collectors.toList());

        // 사용자별 알람 전송
        log.info("🔔 {}공동구매 인원미달 종료 알림 전송: {}", groupBuy.getTitle(), content);
        for (Member participant : participants) {
            createAndSendNotification(participant, NotificationType.GROUP_BUY_CLOSED, content, null, groupBuy, null);
        }
    }

    @Transactional
    public void sendGruopBuyCompletedToParticipants(Long groupBuyId, String content) {
        GroupBuy groupBuy = groupBuyRepository.findById(groupBuyId)
                .orElseThrow(() -> new RuntimeException("유효하지 않은 공동구매 게시글 번호입니다."));
        List<Member> participants = groupBuyParticipationRepository.findByGroupBuyId(groupBuyId)
                .stream()
                .map(GroupBuyParticipation::getMember)
                .collect(Collectors.toList());

        // 사용자별 알람 전송
        log.info("🔔 {}공동구매 마감 알림 전송: {}", groupBuy.getTitle(), content);
        for (Member participant : participants) {
            createAndSendNotification(participant, NotificationType.GROUP_BUY_COMPLETED, content, null, groupBuy, null);
        }
    }



}
