package org.project.second.groupBuy.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.project.second.common.enums.GroupBuyStatus;
import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.groupBuy.repository.GroupBuyRepository;
import org.project.second.groupBuy.service.GroupBuyService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class GroupBuyScheduler {
    private final GroupBuyRepository groupBuyRepository;
    private final GroupBuyService groupBuyService;

    @Scheduled(fixedRate = 60000) // 1분
    public void checkExpiredGroupBuys() {
        log.info("마감된 공동구매 체크 시작");
        List<GroupBuy> expiredGroupBuys = groupBuyRepository.findByDeadlineBeforeAndStatus(LocalDateTime.now(), GroupBuyStatus.OPEN);

        for (GroupBuy groupBuy : expiredGroupBuys) {
            log.info("마감 처리: 공동구매 ID {}, 제목 {}", groupBuy.getId(), groupBuy.getTitle());
            
            if (groupBuy.getCurrentParticipants() >= groupBuy.getMaxParticipants()) {
                log.info("스케줄러 도중 이미 정원 도달된 공동구매 ID {} 발견", groupBuy.getId());
            } else if (groupBuy.getCurrentParticipants() >= groupBuy.getMinParticipants()) {
                groupBuyService.completedGroupBuy(groupBuy.getId());
                log.info("최소인원 충족으로 공동구매 ID {} 제목 {} " +"Completed 처리 완료", groupBuy.getId(),groupBuy.getTitle());
            } else {
                groupBuyService.closeGroupBuy(groupBuy.getId());
                log.info("공동구매 CLOSED 처리 완료");
            }

        }
    }
}
