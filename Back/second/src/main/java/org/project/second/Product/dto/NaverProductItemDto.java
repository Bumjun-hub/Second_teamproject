package org.project.second.Product.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class NaverProductItemDto { //하위 DTO == 단일 데이터 DTO
    private String title;
    private String link;
    private String image;
    private String lprice;
    private String productId;
    private String category1;
    private String category2;
    private String category3;
    private String category4;
}
