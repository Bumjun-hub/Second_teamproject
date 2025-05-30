package org.project.second.wishlist.service;

import lombok.RequiredArgsConstructor;
import org.project.second.product.domain.Product;
import org.project.second.product.dto.NaverProductItemDto;
import org.project.second.product.service.ProductService;
import org.project.second.wishlist.domain.Wishlist;
import org.project.second.product.dto.ProductResponseDto;
import org.project.second.wishlist.dto.WishlistRequestDto;
import org.project.second.wishlist.repository.WishlistRepository;
import org.project.second.member.domain.Member;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final ProductService productService;

    @Transactional
    public ProductResponseDto addToWishlist(WishlistRequestDto requestDto, Member member) {
        validateMember(member);

        if (requestDto.getNaverProductId() == null || requestDto.getNaverProductId().trim().isEmpty()) {
            throw new IllegalArgumentException("naverProductId가 유효하지 않습니다.");
        }

        Product product = productService.findProductByNaverProductId(requestDto.getNaverProductId());
        if (product == null) {
            NaverProductItemDto ItemDto = NaverProductItemDto.builder()
                    .productId(requestDto.getNaverProductId())
                    .title(requestDto.getName())
                    .link(requestDto.getUrl())
                    .lprice(requestDto.getPrice().toString())
                    .image(requestDto.getImageUrl())
                    .category1(requestDto.getCategory1())
                    .category2(requestDto.getCategory2())
                    .category3(requestDto.getCategory3())
                    .category4(requestDto.getCategory4())
                    .build();
            product = productService.saveProduct(ItemDto);
        }

        if (product == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "상품 저장에 실패했습니다.");
        }

        if (wishlistRepository.existsByMemberAndProduct(member, product)) {
            throw new RuntimeException("이미 위시리스트에 존재하는 상품입니다.");
        }
        Wishlist wishlist = Wishlist.builder()
                .member(member)
                .product(product)
                .build();
        wishlistRepository.save(wishlist);

        return productService.toProductResponseDto(product);
    }

    @Transactional
    public ProductResponseDto deleteWishlist(String naverProductId, Member member) {
        validateMember(member);

        Product product = productService.findProductByNaverProductId(naverProductId);
        if (product == null) {
            throw new RuntimeException("상품을 찾을 수 없습니다: " + naverProductId);
        }

        Wishlist wishlist = wishlistRepository.findByMemberAndProduct(member, product)
                .orElseThrow(() -> new RuntimeException("위시리스트에 해당 상품이 없습니다."));
        wishlistRepository.delete(wishlist);

        return productService.toProductResponseDto(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getWishlist(Member member) {
        validateMember(member);

        return wishlistRepository.findByMember(member).stream()
                .map(Wishlist::getProduct)
                .map(productService::toProductResponseDto)
                .toList();
    }

    @Transactional
    public void removeUnusedProduct(String naverProductId) {
        if (naverProductId == null || naverProductId.trim().isEmpty()) {
            throw new IllegalArgumentException("naverProductId가 유효하지 않습니다.");
        }

        // Wishlist에 해당 상품이 있는지 확인
        boolean isInWishlist = wishlistRepository.existsByProduct_NaverProductId(naverProductId);

        if (!isInWishlist) {
            Product product = productService.findProductByNaverProductId(naverProductId);
            if (product != null) {
                productService.deleteProduct(product); // ProductService에 삭제 메서드 추가 필요
            }
        }
    }

    @Transactional(readOnly = true)
    public boolean existsInAnyWishlist(String naverProductId) {
        if (naverProductId == null || naverProductId.trim().isEmpty()) {
            throw new IllegalArgumentException("naverProductId가 유효하지 않습니다.");
        }
        return wishlistRepository.existsByProduct_NaverProductId(naverProductId);
    }

    public void validateMember(Member member) {
        if (member == null) {
            throw new IllegalArgumentException("로그인된 사용자가 없습니다.");
        }
    }

}
