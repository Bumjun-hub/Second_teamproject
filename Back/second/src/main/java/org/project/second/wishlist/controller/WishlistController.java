package org.project.second.wishlist.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.product.dto.MessageResponse;
import org.project.second.product.dto.ProductResponseDto;
import org.project.second.wishlist.dto.WishlistRequestDto;
import org.project.second.wishlist.service.WishlistService;
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

    @PostMapping("/add")
    public ResponseEntity<MessageResponse> addWishlist(@RequestBody WishlistRequestDto requestDto,
                                                       @AuthenticationPrincipal CustomUserDetails userDetails) {

        Member member = userDetails.getMember();
        wishlistService.addToWishlist(requestDto, member);
        return ResponseEntity.ok(new MessageResponse("위시리스트에 상품이 추가되었습니다. 성공"));
    }

    @DeleteMapping("/delete/{naverProductId}")
    public ResponseEntity<MessageResponse> deleteWishlist(@PathVariable String naverProductId,
                                                @AuthenticationPrincipal CustomUserDetails userDetails) {


        Member member = userDetails.getMember();
        wishlistService.deleteWishlist(naverProductId, member);

        boolean isUnused = !wishlistService.existsInAnyWishlist(naverProductId);
        if (isUnused) {
            wishlistService.removeUnusedProduct(naverProductId);
            return ResponseEntity.ok(new MessageResponse("위시리스트에서 상품이 삭제되었으며, 미사용 상품이 DB에서 제거되었습니다."));
        }

        return ResponseEntity.ok(new MessageResponse("위시리스트에 상품이 삭제되었습니다."));
    }

    @GetMapping("/getlist")
    public ResponseEntity<List<ProductResponseDto>> getWishlist(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Member member = userDetails.getMember();
        List<ProductResponseDto> wishlist = wishlistService.getWishlist(member);
        return ResponseEntity.ok(wishlist);
    }

}
