package org.project.second.myAsset.repository;

import org.project.second.member.domain.Member;
import org.project.second.myAsset.domain.MyAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MyAssetRepository extends JpaRepository<MyAsset, Long> {
    Optional<MyAsset> findByMember(Member loginUser);
}
