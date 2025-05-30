package org.project.second.groupBuy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.second.common.enums.GroupBuyStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupBuyResponseDto {
    private Long id;
    private GroupBuyStatus status;
    private String username;
    private String title;
    private String description;
    private String content;
    private Integer maxQuantity;
    private Integer currentQuantity;
    private Long originalPrice;
    private Long salePrice;
    private LocalDateTime deadline;
    private List<String> imgUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
