package org.project.second.recipe.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RecipeRequest {
    String recipeId;
    String recipeName;
    String imageUrl;
}
