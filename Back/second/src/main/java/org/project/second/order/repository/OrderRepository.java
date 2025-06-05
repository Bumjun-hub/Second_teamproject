package org.project.second.order.repository;

import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.member.domain.Member;
import org.project.second.order.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    boolean existsByGroupBuyAndMember(GroupBuy groupBuy, Member member);
}
