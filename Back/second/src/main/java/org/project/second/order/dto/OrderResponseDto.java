package org.project.second.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.second.common.enums.OrderStatus;
import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.member.domain.Member;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDto {
    private Long id;
    private Long groupBuyId;
    private String username;
    private Integer quantity;
    private Long totalAmount;
    private String address;
    private String phone;
    private String paymentName;  //입금자명(사용자)
    private String paymentBank;  //입금음행(사용자)
    private OrderStatus status;
}
