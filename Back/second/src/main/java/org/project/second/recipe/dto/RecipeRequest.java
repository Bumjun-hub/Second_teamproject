package org.project.second.recipe.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RecipeRequest {
    private String recipeId;
    private String recipeName;
    private String imageUrl;
}
