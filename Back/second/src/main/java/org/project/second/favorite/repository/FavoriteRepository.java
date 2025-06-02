package org.project.second.favorite.repository;

import org.project.second.favorite.domain.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    boolean existsByMember_IdAndRecipe_RecipeId(Long id, String recipeId);
    void deleteByMember_IdAndRecipe_RecipeId(Long id, String recipeId);

    boolean existsByRecipe_Id(Long id);
}
