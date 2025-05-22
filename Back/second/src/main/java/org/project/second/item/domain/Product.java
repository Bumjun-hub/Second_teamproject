package org.project.second.item.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.common.domain.BaseEntity;

@Entity
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {"naver_product_id"})
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Product extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "naver_product_id", nullable = false, unique = true)
    private String naverProductId;

    @Column(nullable = false)
    private String name;

    private String url;

    private Double price;

    @Column(name = "image_url")
    private String imageUrl;

    private String category;
}
