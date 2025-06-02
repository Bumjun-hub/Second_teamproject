package org.project.second.favorite.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.common.domain.BaseEntity;
import org.project.second.member.domain.Member;
import org.project.second.recipe.domain.Recipe;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "recipe_id"}))
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Favorite extends BaseEntity {
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
