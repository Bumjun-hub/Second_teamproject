package org.project.second.comment.repository;

import org.project.second.comment.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByCommunity_IdAndIsDeletedFalse(Long postId);

    List<Comment> findByGroupBuy_IdAndIsDeletedFalse(Long postId);

    boolean existsByRecipe_Id(Long id);

    List<Comment> findByRecipe_RecipeIdAndIsDeletedFalse(String recipeId);
}
