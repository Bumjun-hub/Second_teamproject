package org.project.second.favorite.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.project.second.favorite.dto.FavoriteListResponse;
import org.project.second.favorite.dto.FavoriteRemoveRequest;
import org.project.second.favorite.dto.FavoriteRequest;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.project.second.product.dto.MessageResponse;
import org.project.second.favorite.service.FavoriteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorite")
@RequiredArgsConstructor
public class FavoriteController {
    private final FavoriteService favoriteService;

    @PostMapping("/add")
    public ResponseEntity<MessageResponse> addFavorite(@AuthenticationPrincipal CustomUserDetails userDetails,
                                         @Valid @RequestBody FavoriteRequest request) {
        try {
            Member m = userDetails.getMember();
            favoriteService.addFavorite(m, request);
            return ResponseEntity.ok(new MessageResponse("즐겨찾기에 추가 되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse("즐겨찾기 추가 실패"));
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity<MessageResponse> removeFavorite(@AuthenticationPrincipal CustomUserDetails userDetails
                                                        , @Valid @RequestBody FavoriteRemoveRequest request) {
        try {
            Member m = userDetails.getMember();
            favoriteService.removeFavorite(m, request.getRecipeId());
            return ResponseEntity.ok(new MessageResponse("즐겨찾기 삭제 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("서버 오류 발생"));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<FavoriteListResponse>> getFavorites(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Member m = userDetails.getMember();
        List<FavoriteListResponse> list = favoriteService.getFavorite(m);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/count/{recipeId}")
    public ResponseEntity<Long> getFavoriteCount(@PathVariable String recipeId) {
        long count = favoriteService.getFavoriteCount(recipeId);
                return ResponseEntity.ok(count);
    }

}
