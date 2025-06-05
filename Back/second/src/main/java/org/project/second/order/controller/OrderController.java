package org.project.second.order.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.project.second.order.dto.OrderDto;
import org.project.second.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/order")
public class OrderController {

    private final OrderService orderService;

    //order하기 -> test완룡!!
    @PostMapping("/{groupBuyId}")
    public ResponseEntity<String> createOrder(
            @PathVariable Long groupBuyId,
            @RequestBody OrderDto orderDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
            ){
        Member loginUser = userDetails.getMember();
        orderService.createOrder(groupBuyId, orderDto,loginUser);
        return ResponseEntity.ok("주문이 완료되었습니다");
    }

}
