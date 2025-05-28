package org.project.second.Product.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class NaverSearchResponse { //상위 DTO
    private List<NaverProductItemDto> items;
}
