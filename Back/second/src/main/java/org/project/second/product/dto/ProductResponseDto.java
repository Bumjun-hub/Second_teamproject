package org.project.second.product.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProductResponseDto {
    private String naverProductId;
    private String name;
    private String url;
    private Double price;
    private String imageUrl;
    private String category1;
    private String category2;
    private String category3;
    private String category4;
}
