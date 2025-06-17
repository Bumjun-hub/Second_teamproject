package org.project.second.priceAlert.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.project.second.member.domain.Member;
import org.project.second.member.repository.MemberRepository;
import org.project.second.priceAlert.domain.PriceAlert;
import org.project.second.priceAlert.dto.PriceAlertRequest;
import org.project.second.priceAlert.dto.PriceAlertResponse;
import org.project.second.priceAlert.repository.PriceAlertRepository;
import org.project.second.product.dto.NaverProductItemDto;
import org.project.second.product.service.ProductService;
import org.project.second.websocket.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;


import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PriceAlertService {
    private final PriceAlertRepository priceAlertRepository;
    private final MemberRepository memberRepository;
    private final NotificationService notificationService;
    private final ProductService productService;

    // 알림 설정 등록
    @Transactional
    public PriceAlertResponse createPriceAlert(Member m, PriceAlertRequest request) {
        Member member = memberRepository.findById(m.getId())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 회원입니다."));

        if(request.getKeyword() == null || request.getKeyword().isEmpty()) {
            throw new IllegalArgumentException("키워드는 필수 입력 사항입니다.");
        }


        if (request.getTargetPrice() == null || request.getTargetPrice() <= 0) {
            throw new IllegalArgumentException("유효하지 않은 타겟 가격입니다.");
        }

        PriceAlert priceAlert = PriceAlert.builder()
                .keyword(request.getKeyword())
                .targetPrice(request.getTargetPrice())
                .isActive(true)
                .member(member)
                .lastCheckedAt(LocalDateTime.now())
                .build();

        PriceAlert saved = priceAlertRepository.save(priceAlert);
        return toPriceAlertResponseDto(saved);
    }

    // 사용자 알림 설정 조회
    @Transactional
    public List<PriceAlertResponse> getMemberPriceAlerts(Member m) {
        List<PriceAlert> alerts = priceAlertRepository.findByMemberIdAndIsActiveTrue(m.getId());
        return alerts.stream()
                .map(this::toPriceAlertResponseDto)
                .collect(Collectors.toList());
    }

    // 알림 설정 삭제
    @Transactional
    public void deletePriceAlert(Long alertId, Member m) {
        PriceAlert alert = priceAlertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("알림 설정이 안되어 있는 상품입니다."));

        if(!alert.getMember().getId().equals(m.getId())) {
            throw new SecurityException("알림 설정한 회원만이 알림 삭제를 할 수 있습니다.");
        }

        alert.setActive(false);
        priceAlertRepository.save(alert);
    }

    // 주기적 최저가 모니터링
    @Scheduled(fixedRate = 3600000) // 1시간 == (cron = "0 0 * * * ?") 초 분 시 일 월 요일
    @Transactional
    public void monitorPriceAlerts() {
        List<PriceAlert> activeAlerts = priceAlertRepository.findByIsActiveTrue();
        for (PriceAlert alert : activeAlerts) {
            checkPriceAndNotify(alert).subscribe(); // WebFlux 환경에서는 Mono나 Flux는 subscribe() 하지 않으면 실제 실행되지 않음. (실행)
        }
    }

    // 개별 알림 가격 확인 및 알림
    public Mono<Void> checkPriceAndNotify(PriceAlert alert) {
        return productService.getNaverProducts(alert.getKeyword(), 10, 1, "sim")
                .flatMap(response -> {
                    if (response.getItems().isEmpty()) {
                        return Mono.empty();
                    }

                    // 최저가 상품 찾기
                    NaverProductItemDto lowestPriceItem = response.getItems().stream()
                            .min(Comparator.comparingDouble(item -> item.getLprice() != null ? Double.parseDouble(item.getLprice()) : Double.MAX_VALUE))
                            .orElse(null);

                    if (lowestPriceItem == null) {
                        return Mono.empty();
                    }

                    double currentLowestPrice = lowestPriceItem.getLprice() != null ? Double.parseDouble(lowestPriceItem.getLprice()) : Double.MAX_VALUE;
                    double lastLowestPrice = alert.getLastLowestPrice() != null ? alert.getLastLowestPrice() : Double.MAX_VALUE;

                    // 조건: 타겟 가격 이하 또는 이전 최저가보다 낮음
                    if (currentLowestPrice <= alert.getTargetPrice() || currentLowestPrice < lastLowestPrice) {

                        return productService.saveProductAsync(lowestPriceItem)
                                .flatMap(product ->
                                     notificationService.sendPriceAlertNotification(alert, product, currentLowestPrice)
                                            .then(Mono.fromRunnable(() -> {
                                                alert.setLastLowestPrice(currentLowestPrice);
                                                alert.setLastCheckedAt(LocalDateTime.now());
                                                alert.setLastNotifiedProductId(lowestPriceItem.getProductId());
                                                alert.setLastNotifiedAt(LocalDateTime.now());
                                                alert.setProduct(product);
                                                priceAlertRepository.save(alert);
                                            }))
                                        );
                    }

                    // 조건 미달일 경우 최저가 업데이트, Mono.defer() : subscribeOn까지 실행 지연 / Mono.just : 객체를 Mono<객체>로 변환
                    return Mono.defer(() -> Mono.just(priceAlertRepository.save(alert)))
                            .doOnNext(saved -> {
                                alert.setLastLowestPrice(currentLowestPrice);
                                alert.setLastCheckedAt(LocalDateTime.now());
                            })
                            .then()
                            .subscribeOn(Schedulers.boundedElastic()); // 별도 쓰레드 실행
                })
                .onErrorResume(e -> {
                    log.error("Error checking price for alert {}: {}", alert.getId(), e.getMessage());
                    return Mono.empty();
                });
    }


    private PriceAlertResponse toPriceAlertResponseDto(PriceAlert alert) {
        return PriceAlertResponse.builder()
                .id(alert.getId())
                .keyword(alert.getKeyword())
                .targetPrice(alert.getTargetPrice())
                .lastLowestPrice(alert.getLastLowestPrice())
                .lastCheckedAt(alert.getLastCheckedAt())
                .isActive(alert.isActive())
                .lastNotifiedProductId(alert.getLastNotifiedProductId())
                .lastNotifiedAt(alert.getLastNotifiedAt())
                .build();
    }

}
