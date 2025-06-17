package org.project.second.priceAlert.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.member.domain.Member;
import org.project.second.product.domain.Product;
import org.project.second.websocket.domain.Notification;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PriceAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String keyword; // 검색 키워드

    @Column(nullable = false)
    private Double targetPrice; // 타겟 가격
    private Double lastLowestPrice; // 마지막 최저가
    private LocalDateTime lastCheckedAt; // 마지막 확인 시간
    private boolean isActive; // 알림 활성화 여부
    private String lastNotifiedProductId; // 마지막 알림 상품 ID
    private LocalDateTime lastNotifiedAt; // 마지막 알림 시간

    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @OneToMany(mappedBy = "priceAlert", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> notifications;
}
