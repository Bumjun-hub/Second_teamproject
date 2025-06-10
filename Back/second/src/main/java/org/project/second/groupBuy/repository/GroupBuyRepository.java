package org.project.second.groupBuy.repository;

import org.project.second.common.enums.GroupBuyStatus;
import org.project.second.groupBuy.domain.GroupBuy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface GroupBuyRepository extends JpaRepository<GroupBuy, Long> {
    List<GroupBuy> findByStatus(GroupBuyStatus status);

    List<GroupBuy> findByDeadlineBeforeAndStatus(LocalDateTime now, GroupBuyStatus groupBuyStatus);
}
