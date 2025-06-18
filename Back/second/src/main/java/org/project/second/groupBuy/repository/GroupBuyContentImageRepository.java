package org.project.second.groupBuy.repository;

import org.project.second.groupBuy.domain.GroupBuyContentImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupBuyContentImageRepository extends JpaRepository<GroupBuyContentImage, Long> {
}
