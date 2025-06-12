package org.project.second.like.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.common.domain.BaseEntity;
import org.project.second.community.domain.Community;
import org.project.second.donation.domain.Donation;
import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.member.domain.Member;
import org.project.second.recipe.domain.Recipe;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"member_id", "community_id"}),
        @UniqueConstraint(columnNames = {"member_id", "groupBuy_id"})
})

public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = true)
    private Community community;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = true)
    private Donation donation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "groupBuy_id", nullable = true)
    private GroupBuy groupBuy;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt; // 생성일
}
