package org.project.second.donation.repository;

import org.project.second.common.enums.DonationCategory;
import org.project.second.donation.domain.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    List<Donation> findByCategoryAndIsDeleteFalse(DonationCategory category);
}
