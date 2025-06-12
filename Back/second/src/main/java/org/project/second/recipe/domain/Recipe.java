package org.project.second.recipe.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.comment.domain.Comment;
import org.project.second.common.domain.BaseEntity;
import org.project.second.favorite.domain.Favorite;
import org.project.second.websocket.domain.Notification;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recipe extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // PK

    @Column(name = "recipe_id", nullable = false, unique = true)
    private String recipeId; // 외부 API ID 키

    @Column(name = "recipe_name", nullable = false, length = 255)
    private String recipeName;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Favorite> favorites;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> notifications;



}
