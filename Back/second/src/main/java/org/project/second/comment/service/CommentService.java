package org.project.second.comment.service;

import lombok.RequiredArgsConstructor;
import org.project.second.comment.domain.Comment;
import org.project.second.comment.dto.*;
import org.project.second.comment.repository.CommentRepository;
import org.project.second.common.enums.CommentEntityType;
import org.project.second.community.domain.Community;
import org.project.second.community.repository.CommunityRepository;
import org.project.second.groupBuy.domain.GroupBuy;
import org.project.second.groupBuy.repository.GroupBuyRepository;
import org.project.second.member.domain.Member;
import org.project.second.recipe.domain.Recipe;
import org.project.second.recipe.repository.RecipeRepository;
import org.project.second.recipe.service.RecipeService;
import org.project.second.wishlist.service.WishlistService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import static java.lang.Long.parseLong;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final WishlistService wishlistService;
    private final CommunityRepository communityRepository;
    private final GroupBuyRepository groupBuyRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeService recipeService;

    @Transactional
    public CommentResponse createComment(Member m, CommentRequest request) {
        if (request.getContent() == null) {
            throw new IllegalArgumentException("댓글 내용이 비어있습니다.");
        }

        wishlistService.validateMember(m);

        Comment comment = Comment.builder()
                .member(m)
                .content(request.getContent())
                .build();

        switch (request.getEntityType()) {
            case COMMUNITY:
                Long communityId = parseLong(request.getPostId());
                Community community = communityRepository.findById(communityId)
                        .orElseThrow(() -> new IllegalArgumentException("게시글 번호가 유효하지 않습니다."));
                comment.setCommunity(community);
                break;
            case GROUPBUY:
                Long groupBuyId = parseLong(request.getPostId());
                GroupBuy groupBuy = groupBuyRepository.findById(groupBuyId)
                        .orElseThrow(() -> new IllegalArgumentException("공동구매 게시글 번호가 유효하지 않습니다."));
                comment.setGroupBuy(groupBuy);
                break;
            case RECIPE:
                String recipeId = request.getPostId();
                Recipe recipe = recipeRepository.findByRecipeId(recipeId)
                        .orElseGet(() -> recipeService.ensureRecipe(recipeId, request.getRecipeName(), request.getImageUrl()));
                comment.setRecipe(recipe);
                break;
                default:
                    throw new IllegalArgumentException("게시글 타입이 유효하지 않습니다" + request.getEntityType());
        }
        commentRepository.save(comment);

        return CommentResponse.builder()
                .id(comment.getId())
                .entityType(request.getEntityType())
                .postId(request.getPostId())
                .content(comment.getContent())
                .username(m.getUsername())
                .createdAt(comment.getCreatedAt())
                .build();
    }


    @Transactional
    public void deleteComment(Member m, Long commentId) {
        wishlistService.validateMember(m);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("작성된 댓글이 없습니다."));
        if (!comment.getMember().getId().equals(m.getId())) {
            throw new IllegalArgumentException("댓글 작성자만 삭제가 가능합니다.");
        }
        comment.setIsDeleted(true);
        commentRepository.save(comment);
    }


    public CommentUpdateResponse updateComment(Member m, CommentUpdateRequest request) {
        wishlistService.validateMember(m);
        if (request.getContent() == null) {
            throw new IllegalArgumentException("댓글 내용이 비어있습니다.");
        }

        Comment comment = commentRepository.findById(request.getCommentId())
                .orElseThrow(() -> new IllegalArgumentException("작성된 댓글이 없습니다."));
        if (!comment.getMember().getId().equals(m.getId())) {
            throw new IllegalArgumentException("댓글 작성자만 수정이 가능합니다.");
        }
        if (comment.getIsDeleted()) {
            throw new IllegalArgumentException("삭제된 댓글을 수정할 수 없습니다.");
        }
        comment.setContent(request.getContent());
        commentRepository.save(comment);

        return CommentUpdateResponse.builder()
                .commentId(comment.getId())
                .content(comment.getContent())
                .username(m.getUsername())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<CommentListResponse> getListComment(CommentEntityType entityType, String postId) {
        List<Comment> commentList;
        switch (entityType) {
            case COMMUNITY:
                Long communityId = parseLong(postId);
                commentList = commentRepository.findByCommunity_IdAndIsDeletedFalse(communityId);
                break;
            case GROUPBUY:
                Long groupBuyId = parseLong(postId);
                commentList = commentRepository.findByGroupBuy_IdAndIsDeletedFalse(groupBuyId);
                break;
            case RECIPE:
                String recipeId = postId;
                commentList = commentRepository.findByRecipe_RecipeIdAndIsDeletedFalse(recipeId);
                break;
            default:
                throw new IllegalArgumentException("게시글 타입이 유효하지 않습니다" + entityType);
        }
        return commentList.stream()
                .map(comment -> CommentListResponse.builder()
                        .id(comment.getId())
                        .entityType(entityType)
                        .postId(postId)
                        .content(comment.getContent())
                        .username(comment.getMember().getUsername())
                        .createdAt(comment.getCreatedAt())
                        .profileImage(comment.getMember().getImageUrl()) 
                        .build())
                .collect(Collectors.toList());
    }

}
