package org.project.second.like.controller;

import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.project.second.common.enums.LikeEntityType;
import org.project.second.like.service.LikeService;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.project.second.product.dto.MessageResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;

    @PostMapping("/{entityType}/{postId}")
    public ResponseEntity<MessageResponse> toggleLike(@PathVariable LikeEntityType entityType,
                                                      @PathVariable Long postId,
                                                      @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Member m = userDetails.getMember();
            String type = entityType.name();
            likeService.toggleLike(m, type, postId);
            return ResponseEntity.ok(new MessageResponse("좋아요 토글 완료"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("좋아요 토글 실패 " + e.getMessage()));
        }
    }

    @GetMapping("/count/{entityType}/{postId}")
    public ResponseEntity<?> getLikeCount(@PathVariable LikeEntityType entityType,
                                                        @PathVariable Long postId) {
        try {
            String type = entityType.name();
            long count = likeService.getLikeCount(type, postId);
            return ResponseEntity.ok(count);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("좋아요 조회 실패" + e.getMessage()));
        }
    }



}
