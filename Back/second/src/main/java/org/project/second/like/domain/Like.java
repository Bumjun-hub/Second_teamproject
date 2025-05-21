package org.project.second.like.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.common.enums.PostType;
import org.project.second.member.domain.Member;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"member_id", "post_id", "post_type"})
})

public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    private Long postId;
    private PostType postType;

    private LocalDateTime createdAt;
}
