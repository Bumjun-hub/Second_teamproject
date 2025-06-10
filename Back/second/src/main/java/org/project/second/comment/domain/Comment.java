package org.project.second.comment.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.common.domain.BaseEntity;
import org.project.second.community.domain.Community;
import org.project.second.donation.domain.Donation;
import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.member.domain.Member;
import org.project.second.recipe.domain.Recipe;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String content;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = true)
    private Community community;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = true)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "groupBuy_id", nullable = true)
    private GroupBuy groupBuy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = true)
    private Donation donation;

}
