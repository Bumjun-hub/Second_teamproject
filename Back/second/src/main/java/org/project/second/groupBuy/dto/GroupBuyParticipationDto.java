package org.project.second.groupBuy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupBuyParticipationDto {

    private Long memberId;
    private String username;
    private int quantity;
    private LocalDateTime appliedAt;

}
