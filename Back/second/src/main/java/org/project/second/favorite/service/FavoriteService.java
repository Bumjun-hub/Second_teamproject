package org.project.second.favorite.service;

import lombok.RequiredArgsConstructor;
import org.project.second.favorite.dto.FavoriteRequest;
import org.project.second.member.domain.Member;
import org.project.second.favorite.domain.Favorite;
import org.project.second.recipe.domain.Recipe;
import org.project.second.favorite.repository.FavoriteRepository;
import org.project.second.recipe.repository.RecipeRepository;
import org.project.second.recipe.service.RecipeService;
import org.project.second.wishlist.service.WishlistService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final WishlistService wishlistService;
    private final RecipeService recipeService;
    private final RecipeRepository recipeRepository;

    @Transactional
    public void addFavorite(Member m, FavoriteRequest request) {
        wishlistService.validateMember(m);

        if (request == null)
            throw new IllegalArgumentException("레시피의 ID가 유효하지 않습니다.");

        Recipe recipe = recipeService.ensureRecipe(request.getRecipeId(), request.getRecipeName(), request.getImageUrl());
        if (recipe == null) {
            throw new IllegalStateException("Failed to create or retrieve recipe");
        }

        if (favoriteRepository.existsByMember_IdAndRecipe_RecipeId(m.getId(), recipe.getRecipeId())) {
            throw new IllegalArgumentException("이미 즐겨찾기 되어 있는 레시피입니다.");
        }

        Favorite favorite = Favorite.builder()
                .member(m)
                .recipe(recipe)
                .build();
        favoriteRepository.save(favorite);
    }


    @Transactional
    public void removeFavorite(Member m, String recipeId) {
        wishlistService.validateMember(m);
        if (recipeId == null || recipeId.trim().isEmpty())
            throw new IllegalArgumentException("레시피의 ID가 유효하지 않습니다.");

        Recipe recipe = recipeRepository.findByRecipeId(recipeId);
        if(recipe == null) {
            throw new IllegalArgumentException("즐겨찾기에 없는 레시피 입니다.");
        }

        if(!favoriteRepository.existsByMember_IdAndRecipe_RecipeId(m.getId(), recipe.getRecipeId())) {
            throw new IllegalArgumentException("즐겨찾기에 등록된 레시피가 아닙니다.");
        }
        favoriteRepository.deleteByMember_IdAndRecipe_RecipeId(m.getId(),recipe.getRecipeId());

        // Recipe 참조 확인 및 삭제
//        if (!favoriteRepository.existsByRecipe_Id(recipe.getId()) &&
//                !likeRepository.existsByRecipe_Id(recipe.getId()) &&
//                !commentRepository.existsByRecipe_Id(recipe.getId()) &&
//                !recipeViewHistoryRepository.existsByRecipe_Id(recipe.getId())) {
//            recipeRepository.deleteById(recipe.getId());
//        }
    }

}
