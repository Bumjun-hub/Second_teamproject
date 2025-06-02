package org.project.second.groupBuy.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.comment.domain.Comment;
import org.project.second.common.domain.BaseEntity;
import org.project.second.common.enums.GroupBuyStatus;
import org.project.second.community.domain.CommunityImage;
import org.project.second.like.domain.Like;
import org.project.second.member.domain.Member;

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

    //최대참여자
    @Column(name = "max_participants", nullable = false)
    private Integer maxParticipants;

    //최소참여자
    @Column(name = "min_participants", nullable = false)
    private Integer minParticipants;

    //현재참여자
    @Column(name = "current_participants", nullable = false)
    private Integer currentParticipants = 0;

    //최대주문수량
    @Column(name = "max_quantity", nullable = false)
    private Integer maxQuantity;

    //현재주문갯수
    @Column(name = "current_quantity", nullable = false)
    private Integer currentQuantity = 0;

    //원래가격
    @Column(nullable = false)
    private Long originalPrice;

    //할인된가격
    @Column(nullable = false)
    private Long salePrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupBuyStatus status;

    //마감일
    @Column(name = "deadline", nullable = false)
    private LocalDateTime deadline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @OneToMany(mappedBy = "groupBuy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Like> likes;

    @OneToMany(mappedBy = "groupBuy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupBuyParticipation> participations;

    @OneToMany(mappedBy = "groupBuy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders;

    @OneToMany(mappedBy = "groupBuy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupBuyImage> groupBuyImages ;

}
