package org.project.second.groupBuy.repository;

import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.groupBuy.domain.GroupBuyParticipation;
import org.project.second.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupBuyParticipationRepository extends JpaRepository<GroupBuyParticipation, Long> {
    boolean existsByGroupBuyAndMember(GroupBuy groupBuy, Member member);

    List<GroupBuyParticipation> findByGroupBuy(GroupBuy groupBuy);

    Optional<GroupBuyParticipation> findByGroupBuyAndMember(GroupBuy groupBuy, Member member);

    List<GroupBuyParticipation> findByMember(Member member);

    List<Member> findByGroupBuy_Id(Long groupBuyId);

    List<GroupBuyParticipation> findByGroupBuyId(Long groupBuyId);
}
