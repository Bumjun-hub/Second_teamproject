package org.project.second.groupBuy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {

    private Integer quantity;    //구매할갯수(최대넘으면안됨)
    private Long totalAmount;    //수량에따른가격
    private String address;      //주소
    private String phone;        //전화번호
    private String virtualAccount = "1234-5678-9012";
    private String bankName = "TestBank";

}
