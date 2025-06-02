package org.project.second.groupBuy.repository;

import org.project.second.groupBuy.domain.GroupBuyParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupBuyParticipationRepository extends JpaRepository<GroupBuyParticipation, Long> {
}
