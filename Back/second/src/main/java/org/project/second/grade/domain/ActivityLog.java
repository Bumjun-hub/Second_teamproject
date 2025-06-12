package org.project.second.grade.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.common.domain.BaseEntity;
import org.project.second.common.enums.ActivityType;
import org.project.second.member.domain.Member;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivityLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType activityType;

    @Column(nullable = false)
    private int score;

}
