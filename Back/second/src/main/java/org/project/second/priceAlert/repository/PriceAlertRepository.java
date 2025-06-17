package org.project.second.priceAlert.repository;

import org.project.second.priceAlert.domain.PriceAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceAlertRepository extends JpaRepository<PriceAlert, Long> {
    List<PriceAlert> findByMemberIdAndIsActiveTrue(Long memberId);

    List<PriceAlert> findByIsActiveTrue();
}
