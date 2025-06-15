package org.project.second.grade.repository;

import org.project.second.common.enums.ActivityType;
import org.project.second.grade.domain.ActivityLog;
import org.project.second.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    Optional<ActivityLog> findByMemberAndActivityTypeAndDate(Member member, ActivityType activityType, LocalDate today);
}
