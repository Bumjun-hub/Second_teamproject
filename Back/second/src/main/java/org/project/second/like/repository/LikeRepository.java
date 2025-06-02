package org.project.second.like.repository;

import org.project.second.like.domain.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByMember_IdAndCommunity_Id(Long id, Long id1);

    void deleteByMember_IdAndCommunity_Id(Long id, Long id1);
}
