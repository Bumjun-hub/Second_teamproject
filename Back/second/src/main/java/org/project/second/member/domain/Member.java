package org.project.second.member.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.common.domain.BaseEntity;
import org.project.second.common.enums.SocialProvider;
import org.project.second.common.role.Role;

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
}
