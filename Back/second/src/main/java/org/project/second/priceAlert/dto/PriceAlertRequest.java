package org.project.second.priceAlert.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PriceAlertRequest {
    private String keyword;
    private Double targetPrice;
}
