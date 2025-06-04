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
    private String productUrl;              //제품링크
    private Integer maxParticipants;        //최대참여자
    private Integer minParticipants;        //최소참여자
    private Integer currentParticipants;    //현재참여자
    private Integer maxQuantity;            //최대주문수량
    private Integer currentQuantity;        //현재주문수량(관리자용)
    private Long originalPrice;
    private Long salePrice;
    private LocalDateTime deadline;
    private List<String> imgUrls;
    private List<Long> imgIds;
    private Long likes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> participants;

}
