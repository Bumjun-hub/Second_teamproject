package org.project.second.myAsset.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyAssetDto {
    private Long cash;    //현금
    private Long checkCard;   //체크카드
    private Long creditCard ; //신용카드(누적사용량)
    private Long savingDeposit;  //예금
    private Long savingInstallment;  //적금
}
