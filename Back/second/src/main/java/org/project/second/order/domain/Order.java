package org.project.second.order.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.common.domain.BaseEntity;
import org.project.second.common.enums.OrderStatus;
import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.member.domain.Member;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "orders")
public class Order extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "groupBuy_id", nullable = false)
    private GroupBuy groupBuy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String phone;

    @Column(name = "payment_name", nullable = false)
    private String paymentName;  //입금자명(사용자)

    @Column(name = "payment_bank", nullable = false)
    private String paymentBank;  //입금음행(사용자)

    @Column(name = "account_holder_name", nullable = false)
    private String accountHolderName = "homit";                     //예금주명

    @Column(name = "virtual_account", nullable = false)
    private String virtualAccount = "1234-5678-9012";   //입금받을계좌번호(관리자)

    @Column(name = "bank_name", nullable = false)
    private String bankName = "TestBank";  //입금할은행이름(관리자)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

}
