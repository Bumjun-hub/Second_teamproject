package org.project.second.recipe.repository;

import org.project.second.recipe.domain.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    boolean existsByRecipeId(String recipeId);
    Recipe findByRecipeId(String recipeId);
}
