package org.project.second.common.role;

import jakarta.persistence.*;
import org.project.second.common.domain.BaseEntity;

@Entity
public class Role extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, unique = true)
    private String name;
}
