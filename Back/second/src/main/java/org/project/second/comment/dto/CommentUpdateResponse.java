package org.project.second.comment.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class CommentUpdateResponse {
    private Long commentId;
    private String content;
    private String username;
    private LocalDateTime createdAt;
}
