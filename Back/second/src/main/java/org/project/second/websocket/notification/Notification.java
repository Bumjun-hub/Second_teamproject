package org.project.second.websocket.notification;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.common.domain.BaseEntity;
import org.project.second.common.enums.NotificationType;
import org.project.second.community.domain.Community;
import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.member.domain.Member;
import org.project.second.recipe.domain.Recipe;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Notification extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = true)
    private Community community;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "groupBuy_id", nullable = true)
    private GroupBuy groupBuy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = true)
    private Recipe recipe;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

}
