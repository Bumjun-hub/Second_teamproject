package org.project.second.websocket.repository;

import org.project.second.websocket.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByMemberId(Long id);

    Long countByMemberIdAndIsReadFalse(Long id);
}
