package org.project.second.grade.repository;

import org.project.second.grade.domain.Grade;
import org.project.second.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    Optional<Grade> findByMember(Member member);
}
