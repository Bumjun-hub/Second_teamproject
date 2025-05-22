package org.project.second.groupBuy.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.comment.domain.Comment;
import org.project.second.common.domain.BaseEntity;
import org.project.second.common.enums.GroupBuyStatus;
import org.project.second.like.domain.Like;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GroupBuy extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // PK

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "max_quantity", nullable = false)
    private Integer maxQuantity;

    @Column(name = "current_quantity", nullable = false)
    private Integer currentQuantity = 0;

    @Column(nullable = false)
    private Long price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupBuyStatus status;

    @Column(name = "deadline", nullable = false)
    private LocalDateTime deadline;

    @OneToMany(mappedBy = "groupBuy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Like> likes;

    @OneToMany(mappedBy = "groupBuy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupBuyParticipation> participations;

    @OneToMany(mappedBy = "groupBuy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders;


}
