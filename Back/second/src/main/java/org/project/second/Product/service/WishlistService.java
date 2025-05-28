package org.project.second.Product.service;

import lombok.RequiredArgsConstructor;
import org.project.second.Product.domain.Product;
import org.project.second.Product.domain.Wishlist;
import org.project.second.Product.dto.ProductResponseDto;
import org.project.second.Product.repository.WishlistRepository;
import org.project.second.member.domain.Member;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final ProductService productService;

    @Transactional
    public void addToWishlist(String naverProductId, Member member) {
        validateMember(member);

        Product product = productService.findOrSaveProduct(naverProductId);
        if (product == null) {
            throw new RuntimeException("상품을 찾을 수 없습니다: " + naverProductId);
        }

        if (wishlistRepository.existsByMemberAndProduct(member, product)) {
            throw new RuntimeException("이미 위시리스트에 존재하는 상품입니다.");
        }
        Wishlist wishlist = Wishlist.builder()
                .member(member)
                .product(product)
                .build();
        wishlistRepository.save(wishlist);
    }

    @Transactional
    public void deleteWishlist(String naverProductId, Member member) {
        validateMember(member);

        Product product = productService.findOrSaveProduct(naverProductId);
        if (product == null) {
            throw new RuntimeException("상품을 찾을 수 없습니다: " + naverProductId);
        }

        Wishlist wishlist = wishlistRepository.findByMemberAndProduct(member, product)
                .orElseThrow(() -> new RuntimeException("위시리스트에 해당 상품이 없습니다."));
        wishlistRepository.delete(wishlist);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getWishlist(Member member) {
        validateMember(member);

        return wishlistRepository.findByMember(member).stream()
                .map(Wishlist::getProduct)
                .map(productService::toProductResponseDto)
                .toList();
    }

    public void validateMember(Member member) {
        if (member == null) {
            throw new IllegalArgumentException("로그인된 사용자가 없습니다.");
        }
    }


}
