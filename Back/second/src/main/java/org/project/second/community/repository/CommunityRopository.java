package org.project.second.community.repository;

import org.project.second.common.enums.CommunityCategory;
import org.project.second.community.domain.Community;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityRopository extends JpaRepository<Community, Long> {
    List<Community> findByCategoryAndIsDeletedFalse(CommunityCategory category);

    Community findByIdAndCategoryAndIsDeletedFalse(Long id, CommunityCategory category);
}
