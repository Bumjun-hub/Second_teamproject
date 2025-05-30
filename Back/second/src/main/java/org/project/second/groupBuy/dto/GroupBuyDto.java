package org.project.second.groupBuy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.second.common.enums.GroupBuyStatus;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupBuyDto {

    private GroupBuyStatus status;
    private String title;
    private String description;
    private String content;
    private Integer maxQuantity;
    private Long originalPrice;
    private Long salePrice;
    private LocalDateTime deadline;
}
