package org.project.second.priceAlert.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class PriceAlertResponse {
    private Long id;
    private String keyword;
    private Double targetPrice;
    private Double lastLowestPrice;
    private LocalDateTime lastCheckedAt;
    private boolean isActive;
    private String lastNotifiedProductId;
    private LocalDateTime lastNotifiedAt;
}
