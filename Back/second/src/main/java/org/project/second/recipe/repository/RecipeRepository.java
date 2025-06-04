package org.project.second.recipe.repository;

import org.project.second.recipe.domain.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    boolean existsByRecipeId(String recipeId);
    Optional<Recipe> findByRecipeId(String recipeId);
}
