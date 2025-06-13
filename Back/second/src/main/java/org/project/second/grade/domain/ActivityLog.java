package org.project.second.grade.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.common.enums.ActivityType;
import org.project.second.member.domain.Member;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivityLog {

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

    @Column(nullable = false)
    private LocalDate date;

}
