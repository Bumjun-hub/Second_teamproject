package org.project.second.common.role;

import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.RoleName;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleDataInitializer implements CommandLineRunner {
    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.findByName(RoleName.ROLE_USER).isEmpty()) {
            roleRepository.save(Role.builder().name(RoleName.ROLE_USER).build());
            System.out.println("기본 USER 역할이 DB에 없어 새로 생성했습니다.");
        }
        if (roleRepository.findByName(RoleName.ROLE_ADMIN).isEmpty()) {
            roleRepository.save(Role.builder().name(RoleName.ROLE_ADMIN).build());
            System.out.println("기본 ADMIN 역할이 DB에 없어 새로 생성했습니다.");
        }
    }
}
