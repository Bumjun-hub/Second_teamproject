package org.project.second.product.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.product.dto.ProductResponseDto;
import org.project.second.product.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/item")
public class ProductController {
    private final ProductService productService;

    @GetMapping("/search")
    public Mono<List<ProductResponseDto>> search(@RequestParam String query,
                                                 @RequestParam(defaultValue = "10") int display,
                                                 @RequestParam(defaultValue = "1") int start,
                                                 @RequestParam(defaultValue = "sim") String sort) { // 관련도 높은 순
        return productService.searchProducts(query, display, start, sort);
    }
}
