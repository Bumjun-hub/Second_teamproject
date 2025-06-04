package org.project.second.comment.dto;

import lombok.Getter;
import lombok.Setter;
import org.project.second.common.enums.CommentEntityType;

@Getter
@Setter
public class CommentUpdateRequest {
    private Long commentId;
    private String content;
}
