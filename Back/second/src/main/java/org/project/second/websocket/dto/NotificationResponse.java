package org.project.second.websocket.dto;

import lombok.*;
import org.project.second.common.enums.NotificationType;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String content;
    private Long communityId;
    private Long groupBuyId;
    private Long recipeId;
    private Long priceAlertId;
    private String category;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
