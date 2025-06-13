package org.project.second.order.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.ActivityType;
import org.project.second.common.enums.GroupBuyStatus;
import org.project.second.common.enums.OrderStatus;
import org.project.second.grade.service.GradeService;
import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.groupBuy.domain.GroupBuyParticipation;
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

    private final GroupBuyParticipationRepository groupBuyParticipationRepository;
    private final OrderRepository orderRepository;
    private final GroupBuyRepository groupBuyRepository;
    private final GradeService gradeService;

    // 주문(=신청)
    @Transactional
    public void createOrder(Long groupBuyId, OrderDto orderDto, Member loginUser) {
        validateLogin(loginUser);
        GroupBuy groupBuy = validatepost(groupBuyId);

        // 중복 주문(신청) 방지
        if (orderRepository.existsByGroupBuyAndMember(groupBuy, loginUser)) {
            throw new IllegalArgumentException("이미 신청하였습니다.");
        }
        // 모집 마감 체크
        if (groupBuy.getStatus() != GroupBuyStatus.OPEN) {
            throw new IllegalStateException("모집이 마감되었습니다.");
        }
        if (groupBuy.getCurrentParticipants() >= groupBuy.getMaxParticipants()) {
            throw new IllegalStateException("최대 인원 초과");
        }

        // 주문 생성 및 저장
        Long totalAmount = orderDto.getQuantity() * groupBuy.getSalePrice();
        Order order = Order.builder()
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
                .bankName("농협")
                .status(OrderStatus.PENDING)
                .build();
        orderRepository.save(order);

        // 등급점수추가
        gradeService.addScore(loginUser, ActivityType.ORDER);

        // 참여자 저장

        GroupBuyParticipation participation = GroupBuyParticipation.builder()
                .groupBuy(groupBuy)
                .member(loginUser)
                .quantity(orderDto.getQuantity())
                .build();
        groupBuyParticipationRepository.save(participation);

        // 참여자수 증가 & 상태 변경
        groupBuy.setCurrentParticipants(groupBuy.getCurrentParticipants() + 1);
        if (groupBuy.getCurrentParticipants() >= groupBuy.getMaxParticipants()) {
            groupBuy.setStatus(GroupBuyStatus.COMPLETED);
        }
    }

    // 주문 취소(=참여 취소)
    @Transactional
    public void cancelOrder(Long orderId, Member loginUser) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문이 존재하지 않습니다."));

        // 본인 주문만 취소 가능
        if (!order.getMember().getId().equals(loginUser.getId())) {
            throw new AccessDeniedException("본인의 주문만 취소할 수 있습니다.");
        }



        GroupBuy groupBuy = order.getGroupBuy();

        groupBuyParticipationRepository.deleteByGroupBuyAndMember(groupBuy, loginUser);

        // 주문 삭제 (또는 status=OrderStatus.CANCELLED로 변경해도 무방)
        orderRepository.delete(order);

        // 참여자수 감소
        int newCount = Math.max(0, groupBuy.getCurrentParticipants() - 1);
        groupBuy.setCurrentParticipants(newCount);

        // 모집상태 복구(완료 → 모집중)
        if (groupBuy.getStatus() == GroupBuyStatus.COMPLETED &&
                newCount < groupBuy.getMaxParticipants()) {
            groupBuy.setStatus(GroupBuyStatus.OPEN);
        }
    }

    // 주문자(참여자) 리스트 조회
    @Transactional
    public List<OrderResponseDto> getOrders(Long groupBuyId, OrderStatus status) {
        GroupBuy groupBuy = validatepost(groupBuyId);

        List<Order> orders = (status != null)
                ? orderRepository.findByGroupBuyAndStatus(groupBuy, status)
                : orderRepository.findByGroupBuy(groupBuy);

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
        )).collect(Collectors.toList());
    }

    // 주문 상세조회(관리자)
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

    // 내 주문(참여) 목록
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
        )).collect(Collectors.toList());
    }

    // 내 주문 상세조회
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

    // 주문 상태 변경
    @Transactional
    public void updateStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다"));
        order.setStatus(status);
    }

    //== 유틸 메서드 ==//
    public GroupBuy validatepost(Long groupBuyId) {
        return groupBuyRepository.findById(groupBuyId)
                .orElseThrow(() -> new IllegalArgumentException("해당공동구매가 없습니다"));
    }

    public void validateLogin(Member member) {
        if (member == null) {
            throw new IllegalArgumentException("로그인이 필요한 기능입니다.");
        }
    }

    // 중복 주문 방지
    public void validateOrder(GroupBuy groupBuy, Member member) {
        boolean order = orderRepository.existsByGroupBuyAndMember(groupBuy, member);
        if (order) {
            throw new IllegalArgumentException("이미 주문을 완료했습니다");
        }
    }

    // 주문유무
    public Order validateOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("해당 주문이 존재하지 않습니다"));
    }
}
