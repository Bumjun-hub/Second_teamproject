package org.project.second.Product.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.Product.dto.MessageResponse;
import org.project.second.Product.dto.ProductResponseDto;
import org.project.second.Product.service.WishlistService;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {
    private final WishlistService wishlistService;

    @PostMapping("/add/{naverProductId}")
    public ResponseEntity<MessageResponse> addWishlist(@PathVariable String naverProductId,
                                             @AuthenticationPrincipal CustomUserDetails userDetails) {
        Member member = userDetails.getMember();
        wishlistService.addToWishlist(naverProductId, member);
        return ResponseEntity.ok(new MessageResponse("위시리스트에 상품이 추가되었습니다. 성공"));
    }

    @DeleteMapping("/delete/{naverProductId}")
    public ResponseEntity<MessageResponse> deleteWishlist(@PathVariable String naverProductId,
                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        Member member = userDetails.getMember();
        wishlistService.deleteWishlist(naverProductId, member);
        return ResponseEntity.ok(new MessageResponse("위시리스트에 상품이 삭제되었습니다."));
    }

    @GetMapping("/getlist")
    public ResponseEntity<List<ProductResponseDto>> getWishlist(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Member member = userDetails.getMember();
        List<ProductResponseDto> wishlist = wishlistService.getWishlist(member);
        return ResponseEntity.ok(wishlist);
    }
}
