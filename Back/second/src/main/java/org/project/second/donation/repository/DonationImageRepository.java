package org.project.second.donation.repository;

import org.project.second.donation.domain.DonationImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DonationImageRepository extends JpaRepository<DonationImage, Long> {
}
