package org.project.second.favorite.repository;

import org.project.second.favorite.domain.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    boolean existsByMember_IdAndRecipe_RecipeId(Long id, String recipeId);
    void deleteByMember_IdAndRecipe_RecipeId(Long id, String recipeId);

    boolean existsByRecipe_Id(Long id);

    List<Favorite> findByMember_Id(Long id);

    long countByRecipe_RecipeId(String recipeRecipeId);
}
