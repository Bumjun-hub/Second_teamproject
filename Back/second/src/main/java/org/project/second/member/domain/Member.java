package org.project.second.member.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.comment.domain.Comment;
import org.project.second.common.domain.BaseEntity;
import org.project.second.common.enums.SocialProvider;
import org.project.second.common.role.Role;
import org.project.second.grade.domain.Grade;

import org.project.second.community.domain.Community;
import org.project.second.donation.domain.Donation;
import org.project.second.favorite.domain.Favorite;
import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.groupBuy.domain.GroupBuyParticipation;
import org.project.second.like.domain.Like;
import org.project.second.order.domain.Order;
import org.project.second.recipe.domain.Recipe;
import org.project.second.websocket.domain.Notification;
import org.project.second.wishlist.domain.Wishlist;

import java.util.List;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // PK

    @Column(nullable = false, unique = true)
    private String username; // 유저이름

    @Column(nullable = false, unique = true)
    private String email; // 이메일

    @Column(nullable = false)
    private String password; // 비밀번호

    private String address; // 주소

    private String phone; // 휴대폰번호

    @Enumerated(EnumType.STRING)
    private SocialProvider socialProvider; // GOOGLE, KAKAO, NAVER (임시)

    private String socialId; // 소셜 제공자의 고유 ID (임시)

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "refresh_token")
    private String refreshToken;

    @Column(name = "image_url")
    private String imageUrl;

    @OneToOne(mappedBy = "member", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Grade grade;  //등급

    // CASECADE 설정
    @OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Notification> notifications;

    @OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<GroupBuy> groupBuys;

    @OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<GroupBuyParticipation> groupBuyParticipations;

    @OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Community> communities;

    @OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Comment> comments;

    @OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Like> likes;

    @OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Favorite> favorites;

    @OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Wishlist> wishlists;

    @OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Donation> donations;

    @OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Order> orders;




}
