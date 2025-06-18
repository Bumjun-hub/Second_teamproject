package org.project.second.accountBook.repository;

import org.project.second.accountBook.domain.AccountBookImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountBookImageRepository extends JpaRepository<AccountBookImage, Long> {
}
