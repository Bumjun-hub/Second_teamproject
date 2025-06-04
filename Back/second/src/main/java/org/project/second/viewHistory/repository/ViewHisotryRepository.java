package org.project.second.viewHistory.repository;

import org.project.second.viewHistory.domain.RecipeViewHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ViewHisotryRepository extends JpaRepository<RecipeViewHistory, Long> {
    boolean existsByRecipe_Id(Long id);
}
