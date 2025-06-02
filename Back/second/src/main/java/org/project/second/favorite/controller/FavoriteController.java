package org.project.second.favorite.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.project.second.favorite.dto.FavoriteRequest;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.project.second.product.dto.MessageResponse;
import org.project.second.favorite.service.FavoriteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

}
