package org.project.second.order.repository;

import org.project.second.common.enums.OrderStatus;
import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.member.domain.Member;
import org.project.second.order.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    boolean existsByGroupBuyAndMember(GroupBuy groupBuy, Member member);
    List<Order> findByGroupBuy(GroupBuy groupBuy);
    List<Order> findByGroupBuyAndStatus(GroupBuy groupBuy, OrderStatus status);

    List<Order> findByMember(Member loginUser);
}
