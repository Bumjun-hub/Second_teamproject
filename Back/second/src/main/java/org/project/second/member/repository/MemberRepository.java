package org.project.second.member.repository;

import org.project.second.common.enums.SocialProvider;
import org.project.second.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Optional<Member> findByEmailAndSocialProvider(String email, SocialProvider socialProvider);

    boolean existsByEmailAndSocialProvider(String email, SocialProvider socialProvider);

    boolean existsBySocialIdAndSocialProvider(String socialId, SocialProvider socialProvider);
}
