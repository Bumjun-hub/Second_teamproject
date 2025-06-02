package org.project.second.recipe.controller;

import lombok.AllArgsConstructor;
import org.project.second.favorite.dto.FavoriteRequest;
import org.project.second.product.dto.MessageResponse;
import org.project.second.recipe.service.RecipeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/recipe")
@AllArgsConstructor
public class RecipeController {
    private final RecipeService recipeService;

    @PostMapping("/add")
    public ResponseEntity<MessageResponse> ensureRecipe(@RequestBody FavoriteRequest request) {
        recipeService.ensureRecipe(request.getRecipeId(), request.getRecipeName(), request.getImageUrl());
        return ResponseEntity.ok().body(new MessageResponse("Recipe added successfully"));
    }
}
