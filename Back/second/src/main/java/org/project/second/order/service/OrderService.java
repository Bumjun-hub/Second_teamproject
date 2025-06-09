package org.project.second.order.service;

import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.OrderStatus;
import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.groupBuy.repository.GroupBuyParticipationRepository;
import org.project.second.groupBuy.repository.GroupBuyRepository;
import org.project.second.member.domain.Member;
import org.project.second.order.domain.Order;
import org.project.second.order.dto.OrderDto;
import org.project.second.order.dto.OrderResponseDto;
import org.project.second.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final GroupBuyRepository groupBuyRepository;
    private final GroupBuyParticipationRepository groupBuyParticipationRepository;

    //구매order
    public void createOrder(Long groupBuyId, OrderDto orderDto, Member loginUser) {
        validateLogin(loginUser);
        GroupBuy groupBuy = validatepost(groupBuyId);
        validateParticipation(groupBuy, loginUser);
        validateOrder(groupBuy, loginUser);

        Long totalAmount = orderDto.getQuantity() * groupBuy.getSalePrice();

        Order orders = Order.builder()
                .groupBuy(groupBuy)
                .member(loginUser)
                .quantity(orderDto.getQuantity())
                .totalAmount(totalAmount)
                .address(orderDto.getAddress())
                .phone(orderDto.getPhone())
                .paymentName(orderDto.getPaymentName())
                .paymentBank(orderDto.getPaymentBank())
                .accountHolderName("homit")
                .virtualAccount("1234-5678-9012")
                .bankName("TestBank")
                .status(OrderStatus.PENDING)
                .build();
        orderRepository.save(orders);
    }

    //주문자 조회
    public List<OrderResponseDto> getOrders(Long groupBuyId , OrderStatus status) {
        GroupBuy groupBuy = validatepost(groupBuyId);

        List<Order> orders;
        if(status != null) {
            orders = orderRepository.findByGroupBuyAndStatus(groupBuy, status);
        } else {
            orders = orderRepository.findByGroupBuy(groupBuy);
        }

        return orders.stream().map(order -> new OrderResponseDto(
                order.getId(),
                order.getGroupBuy().getId(),
                order.getMember().getUsername(),
                order.getQuantity(),
                order.getTotalAmount(),
                order.getAddress(),
                order.getPhone(),
                order.getPaymentName(),
                order.getPaymentBank(),
                order.getStatus()
        ))
                .collect(Collectors.toList());
    }


    public GroupBuy validatepost (Long groupBuyId) {
        return groupBuyRepository.findById(groupBuyId)
                .orElseThrow(() -> new IllegalArgumentException("해당공동구매가 없습니다"));
    }

    public void validateLogin(Member member){
        if (member == null) {
            throw new IllegalArgumentException("로그인이 필요한 기능입니다.");
        }
    }

    //공동구매 신청 여부
    public void validateParticipation(GroupBuy groupBuy, Member member) {
        boolean applied = groupBuyParticipationRepository.existsByGroupBuyAndMember(groupBuy, member);
        if (!applied) {
            throw new IllegalArgumentException("공동구매를 신청하지 않은 사용자는 주문할 수 없습니다");
        }
    }

    //중복주문 방지(한사람당 1번)
    public void validateOrder(GroupBuy groupBuy, Member member) {
        boolean order = orderRepository.existsByGroupBuyAndMember(groupBuy, member);
        if (order) {
            throw new IllegalArgumentException("이미 주문을 완료했습니다");
        }
    }


}
