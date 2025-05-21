package org.project.second.member.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // PK

    @Column(nullable = false, unique = true)
    private String email; // 이메일

    @Column(nullable = false)
    private String password; // 비밀번호

    @Column(nullable = false)
    private String username; // 유저이름

    @Column(nullable = false)
    private String address; // 주소

    @Column(nullable = false)
    private String phone; // 휴대폰번호

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
