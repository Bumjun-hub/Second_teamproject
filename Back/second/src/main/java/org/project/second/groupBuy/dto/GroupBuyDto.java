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
    private String productUrl;              //제품링크
    private Integer maxParticipants;        //최대참여자
    private Integer minParticipants;        //최소참여자
    private Integer currentParticipants;    //현재참여자
    private Integer maxQuantity;            //최대주문수량
    private Long originalPrice;
    private Long salePrice;
    private LocalDateTime deadline;
}
