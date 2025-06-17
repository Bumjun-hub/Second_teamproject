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
    private Long cash = 0L;    //현금
    private Long checkCard = 0L;   //체크카드
    private Long creditCard = 0L; //신용카드(누적사용량)
    private Long savingDeposit = 0L;  //예금
    private Long savingInstallment = 0L;  //적금
}
