package org.project.second.order.dto;

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
    private String address;      //주소
    private String phone;        //전화번호
    private String paymentName;  //입금자명(사용자)
    private String paymentBank;  //입금음행(사용자)
}
