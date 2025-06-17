package org.project.second.accountBook.repository;

import org.project.second.accountBook.domain.AccountBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountBookRepository extends JpaRepository<AccountBook, Long> {
}
