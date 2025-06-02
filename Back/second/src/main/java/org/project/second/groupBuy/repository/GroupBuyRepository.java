package org.project.second.groupBuy.repository;

import org.project.second.common.enums.GroupBuyStatus;
import org.project.second.groupBuy.domain.GroupBuy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupBuyRepository extends JpaRepository<GroupBuy, Long> {
    List<GroupBuy> findByStatus(GroupBuyStatus status);
}
