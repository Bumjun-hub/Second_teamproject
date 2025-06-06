package org.project.second.donation.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.comment.domain.Comment;
import org.project.second.common.domain.BaseEntity;
import org.project.second.common.enums.DonationCategory;
import org.project.second.common.enums.DonationStatus;
import org.project.second.community.domain.CommunityImage;
import org.project.second.member.domain.Member;

import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Donation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    private Member member;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationCategory donationCategory;

    @Column(nullable = false)
    private String province;     //도

    @Column(nullable = false)
    private  String city;        //시

    @Column(nullable = false)
    private  String district;    //구

    @Column(nullable = false)
    private String neighborhood; //동

    @Column(nullable = false)
    private Long price;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "view_count", columnDefinition = "BIGINT DEFAULT 0")
    @Builder.Default
    private Long viewCount = 0L;

    @OneToMany(mappedBy = "donation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;

    @OneToMany(mappedBy = "donation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DonationImage> donationImages;

}
