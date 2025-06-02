package org.project.second.viewHistory.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.project.second.common.domain.BaseEntity;
import org.project.second.member.domain.Member;
import org.project.second.recipe.domain.Recipe;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RecipeViewHistory extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

}
