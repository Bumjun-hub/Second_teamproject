package org.project.second.myAsset.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.common.domain.BaseEntity;
import org.project.second.member.domain.Member;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MyAsset extends BaseEntity {

    @Id
    @GeneratedValue
    private Long id;

    @OneToOne
    @JoinColumn(name = "member_id", nullable = false, unique = true)
    private Member member;

    @Column(nullable = false)
    private Long cash = 0L;    //현금

    @Column(nullable = false)
    private Long checkCard = 0L;   //체크카드

    @Column(nullable = false)
    private Long creditCard = 0L; //신용카드(누적사용량)

    @Column(nullable = false)
    private Long savingDeposit = 0L;  //예금

    @Column(nullable = false)
    private Long savingInstallment = 0L;  //적금

}
