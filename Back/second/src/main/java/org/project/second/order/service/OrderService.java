package org.project.second.order.service;

import jakarta.transaction.Transactional;
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
import org.springframework.security.access.AccessDeniedException;
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
    @Transactional
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
    @Transactional
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

    //상세조회(관리자)
    @Transactional
    public OrderResponseDto detailOrders(Long orderId) {
        Order order = validateOrder(orderId);

        return new OrderResponseDto(
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
        );
    }

    //주문조회(사용자)
    @Transactional
    public List<OrderResponseDto> getMyOrder(Member loginUser) {
        List<Order> orders = orderRepository.findByMember(loginUser);
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

    //상세조회(사용자)
    @Transactional
    public OrderResponseDto detailMyOrder(Long orderId, Member loginUser) {
        Order order = validateOrder(orderId);
        if (!order.getMember().getId().equals(loginUser.getId())) {
            throw new AccessDeniedException("본인의 주문만 조회할 수 있습니다");
        }
        return new OrderResponseDto(
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
        );
    }

    //주문상태변경
    @Transactional
    public void updateStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(()-> new IllegalArgumentException("주문을 찾을 수 없습니다"));
        order.setStatus(status);
    }


    //예외처리
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

    //주문유무
    public Order validateOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("해당 주문이 존재하지 않습니다"));
    }

}
