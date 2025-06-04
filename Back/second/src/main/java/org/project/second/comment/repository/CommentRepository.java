package org.project.second.comment.repository;

import org.project.second.comment.domain.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    @EntityGraph(attributePaths = {"member"}) // JPA가 댓글을 조회할때 해당 댓글의 작성자도 한번에 함께 가져오게 해줌
    List<Comment> findByCommunity_IdAndIsDeletedFalse(Long postId);
    @EntityGraph(attributePaths = {"member"})
    List<Comment> findByGroupBuy_IdAndIsDeletedFalse(Long postId);

    boolean existsByRecipe_Id(Long id);
    @EntityGraph(attributePaths = {"member"})
    List<Comment> findByRecipe_RecipeIdAndIsDeletedFalse(String recipeId);
}
