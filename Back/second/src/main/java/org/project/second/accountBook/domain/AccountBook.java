package org.project.second.accountBook.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.common.domain.BaseEntity;
import org.project.second.common.enums.ExpenseCategory;
import org.project.second.common.enums.IncomeCategory;
import org.project.second.common.enums.MoneyMethod;
import org.project.second.common.enums.RecordType;
import org.project.second.member.domain.Member;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountBook extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Long amount;  //금액

    @Column(nullable = true)
    private String memo; //메모

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecordType recordType;  // 수입, 지출

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MoneyMethod moneyMethod;  // 수단

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private IncomeCategory incomeCategory; // 수입항목

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private ExpenseCategory expenseCategory; // 지출항목

    @Column(nullable = false)
    private  boolean isRepeat; // 반복항목

    @OneToMany(mappedBy = "accountBook", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AccountBookImage> accountBookImages;  // 이미지

}
