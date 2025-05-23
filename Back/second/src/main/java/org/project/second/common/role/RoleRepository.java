package org.project.second.common.role;

import lombok.*;
import org.hibernate.sql.ast.tree.expression.JdbcParameter;
import org.project.second.common.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
