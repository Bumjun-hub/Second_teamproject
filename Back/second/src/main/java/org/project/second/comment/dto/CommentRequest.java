package org.project.second.comment.dto;

import lombok.Getter;
import lombok.Setter;
import org.project.second.common.enums.CommentEntityType;

@Getter
@Setter
public class CommentRequest {
    private CommentEntityType entityType;
    private String postId; // 레시피는 레시피 외부 API 키
    private String content;
    private String recipeName; // 레시피 댓글 작성의 경우 필요함
    private String imageUrl; // 레시피 댓글 작성의 경우 필요함
}
