package org.project.second.community.repository;

import org.project.second.community.domain.Community;
import org.project.second.community.domain.CommunityImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityImageRepository extends JpaRepository<CommunityImage, Long> {

    List<CommunityImage> findByCommunity(Community post);
}
