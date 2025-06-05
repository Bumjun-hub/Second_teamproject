package org.project.second.comment.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.project.second.common.enums.CommentEntityType;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class CommentListResponse {
    private Long id; // 댓글 PK
    private CommentEntityType entityType; // 게시글 타입 (공구, 커뮤, 레시피)
    private String postId; // 게시글 PK, 레시피의 경우에는 외부 API ID
    private String content;
    private String username;
    private String profileImage; // 프로필 이미지 받는거 추가
    private LocalDateTime createdAt;
}
