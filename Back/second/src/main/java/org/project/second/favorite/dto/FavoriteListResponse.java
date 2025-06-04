package org.project.second.favorite.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class FavoriteListResponse {
    private String recipeId;
    private String recipeName;
    private String imageUrl;
}
