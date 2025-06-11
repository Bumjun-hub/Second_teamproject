package org.project.second.order.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.OrderStatus;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.project.second.order.dto.OrderDto;
import org.project.second.order.dto.OrderResponseDto;
import org.project.second.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/order")
public class OrderController {

    private final OrderService orderService;

    //order작성
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

    //주문자 조회(관리자)
    @GetMapping("/admin/{groupBuyId}/order")
    public ResponseEntity<List<OrderResponseDto>> getOrders(
            @PathVariable Long groupBuyId,
            @RequestParam(required = false)OrderStatus status
    ){
        List<OrderResponseDto> orderList = orderService.getOrders(groupBuyId,status);
        return ResponseEntity.ok(orderList);
    }

    //상세조회(관리자)
    @GetMapping("/admin/order/{orderId}")
    public ResponseEntity<OrderResponseDto> detailOrders(
            @PathVariable Long orderId
    ) {
        OrderResponseDto dto = orderService.detailOrders(orderId);
        return ResponseEntity.ok(dto);
    }

    //주문조회(사용자)
    @GetMapping("/myPage/order")
    public ResponseEntity<List<OrderResponseDto>> getMyOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
            Member loginUser = userDetails.getMember();
            List<OrderResponseDto> orders = orderService.getMyOrder(loginUser);
            return ResponseEntity.ok(orders);
    }

    //상세조회(사용자)
    @GetMapping("/myPage/order/{orderId}")
    public ResponseEntity<OrderResponseDto> detailMyOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long orderId
    ){
        Member loginUser = userDetails.getMember();
        OrderResponseDto dto = orderService.detailMyOrder(orderId, loginUser);
        return ResponseEntity.ok(dto);
    }


    //상태변경(관리자)
    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {
        orderService.updateStatus(orderId, status);
        return ResponseEntity.ok("주문상태가 업데이트 되었습니다");
    }



}
