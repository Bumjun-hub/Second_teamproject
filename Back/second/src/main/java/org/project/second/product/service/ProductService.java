package org.project.second.product.service;

import lombok.RequiredArgsConstructor;
import org.project.second.product.domain.Product;
import org.project.second.product.dto.NaverProductItemDto;
import org.project.second.product.dto.NaverSearchResponse;
import org.project.second.product.dto.ProductResponseDto;
import org.project.second.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final WebClient webClient;


    // 네이버 쇼핑 API 호출, 원본 응답 반환
    public Mono<NaverSearchResponse> getNaverProducts(String query, int display, int start, String sort) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/search/shop.json")
                        .queryParam("query", query)
                        .queryParam("display", display)
                        .queryParam("start", start)
                        .queryParam("sort", sort)
                        .build())
                .retrieve() // HTTP 요청 실행
                .bodyToMono(NaverSearchResponse.class) // 역직렬화 : JSON응답 -> 객체 저장, items 배열로 들어옴
                .onErrorResume(e -> Mono.just(new NaverSearchResponse()));
    }

    // 클라이언트 응답용 검색 메서드
    public Mono<List<ProductResponseDto>> searchProducts(String query, int display, int start, String sort) {
        return getNaverProducts(query, display, start, sort)
                .map(response -> response.getItems().stream() //steam() : 반복문
                        .map(item -> toProductResponseDto(item)) // map() : 값 넣기(키:값)
                        .collect(Collectors.toList()))
                .switchIfEmpty(Mono.just(List.of())); // 값이 안들어올 경우 빈 List 반환
    }


    @Transactional
    public Product findProductByNaverProductId(String naverProductId) {
        if (naverProductId == null || naverProductId.trim().isEmpty()) {
            throw new IllegalArgumentException("naverProductId 값이 넘어오지 않았습니다.");
        }

        return  productRepository.findByNaverProductId(naverProductId).orElse(null);
    }

    @Transactional
    public Product saveProduct(NaverProductItemDto item) {
        if (item == null || item.getProductId() == null || item.getProductId().trim().isEmpty()) {
            throw new IllegalArgumentException("들어온 값이 null이건 없습니다.");
        }

        return productRepository.findByNaverProductId(item.getProductId())
                .orElseGet(() -> {
                    Product product = Product.builder()
                            .naverProductId(item.getProductId())
                            .name(item.getTitle())
                            .url(item.getLink())
                            .price(item.getLprice() != null ? Double.valueOf(item.getLprice()) : 0.0)
                            .imageUrl(item.getImage())
                            .category1(item.getCategory1())
                            .category2(item.getCategory2())
                            .category3(item.getCategory3())
                            .category4(item.getCategory4())
                            .build();
                    return productRepository.save(product);
                });
    }

    //NaverProductItemDto용
    public ProductResponseDto toProductResponseDto(NaverProductItemDto item) {
        return ProductResponseDto.builder()
                .naverProductId(item.getProductId())
                .name(item.getTitle())
                .url(item.getLink())
                .price(item.getLprice() != null ? Double.valueOf(item.getLprice()) : 0.0)
                .imageUrl(item.getImage())
                .category1(item.getCategory1())
                .category2(item.getCategory2())
                .category3(item.getCategory3())
                .category4(item.getCategory4())
                .build();
    }

    // Product용 메서드 추가
    public ProductResponseDto toProductResponseDto(Product product) {
        return ProductResponseDto.builder()
                .naverProductId(product.getNaverProductId())
                .name(product.getName())
                .url(product.getUrl())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .category1(product.getCategory1())
                .category2(product.getCategory2())
                .category3(product.getCategory3())
                .category4(product.getCategory4())
                .build();
    }

    @Transactional
    public void deleteProduct(Product product) {
        if (product == null || product.getNaverProductId() == null) {
            throw new IllegalArgumentException("삭제할 상품이 유효하지 않습니다.");
        }
        productRepository.delete(product);
    }

}
