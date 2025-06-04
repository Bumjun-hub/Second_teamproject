package org.project.second.recipe.service;

import lombok.AllArgsConstructor;
import org.project.second.member.domain.Member;
import org.project.second.recipe.domain.Recipe;
import org.project.second.recipe.dto.RecipeResponse;
import org.project.second.recipe.repository.RecipeRepository;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class RecipeService {
    private final RecipeRepository recipeRepository;

    public Recipe ensureRecipe(String recipe_Id, String recipe_Name, String image_Url) {
        if (recipe_Id == null || recipe_Id.trim().isEmpty()
            || recipe_Name == null || recipe_Name.trim().isEmpty()
            || image_Url == null || image_Url.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid recipe data");
        }

        return recipeRepository.findByRecipeId(recipe_Id)
                .orElseGet(() -> {
                    Recipe recipe = Recipe.builder()
                            .recipeId(recipe_Id)
                            .recipeName(recipe_Name)
                            .imageUrl(image_Url)
                            .build();
                    return recipeRepository.save(recipe);
                });
    }
}
