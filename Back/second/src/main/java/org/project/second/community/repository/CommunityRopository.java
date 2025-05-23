package org.project.second.community.repository;

import org.project.second.community.domain.Community;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityRopository extends JpaRepository<Community, Long> {
}
