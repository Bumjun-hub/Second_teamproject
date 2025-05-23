package org.project.second.member.service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.RoleName;
import org.project.second.common.role.Role;
import org.project.second.common.role.RoleRepository;
import org.project.second.member.domain.Member;
import org.project.second.member.dto.SignupRequest;
import org.project.second.member.repository.MemberRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    public SignupRequest insert(@Valid SignupRequest signupRequest) {
        // String security : 이메일 중복 체크
        if (memberRepository.existsByEmail(signupRequest.getEmail())){
            throw new IllegalArgumentException("이미 존재하는 이메일 입니다.");
        }

        // String security : 유저네임 중복 체크
        if (memberRepository.existsByUsername(signupRequest.getUsername())){
            throw new IllegalArgumentException("이미 존재하는 유저네임 입니다.");
        }

        if (!signupRequest.getPassword().equals(signupRequest.getConfirmPassword())) {
            throw new IllegalArgumentException("입력하신 비밀번호가 서로 일치하지 않습니다.");
        }

        String enPass = passwordEncoder.encode(signupRequest.getPassword());

        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new IllegalArgumentException("기본 USER 역할이 DB에 없습니다."));

        Member member = Member.builder()
                .email(signupRequest.getEmail())
                .password(enPass) // 요청 데이터 자체가 아닌 암호화 후 설정
                .username(signupRequest.getUsername())
                .address(signupRequest.getAddress())
                .phone(signupRequest.getPhone())
                .role(userRole)
                .build();

        Member savedMember = memberRepository.save(member);

        return SignupRequest.builder()
                .email(savedMember.getEmail())
                .password(savedMember.getPassword())
                .username(savedMember.getUsername())
                .address(savedMember.getAddress())
                .phone(savedMember.getPhone())
                .build();
    }
}
