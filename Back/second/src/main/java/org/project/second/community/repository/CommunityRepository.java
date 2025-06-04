package org.project.second.community.repository;

import org.project.second.comment.domain.Comment;
import org.project.second.common.enums.CommunityCategory;
import org.project.second.community.domain.Community;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityRepository extends JpaRepository<Community, Long> {
    List<Community> findByCategoryAndIsDeletedFalse(CommunityCategory category);

    Community findByIdAndCategoryAndIsDeletedFalse(Long id, CommunityCategory category);
}
