package org.project.second.member.service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.project.second.common.enums.RoleName;
import org.project.second.common.role.Role;
import org.project.second.common.role.RoleRepository;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.project.second.member.dto.*;
import org.project.second.member.repository.MemberRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    public SignupResponse insert(@Valid SignupRequest signupRequest) {
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

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
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

        return SignupResponse.builder()
                .email(savedMember.getEmail())
                .build();
    }


    public void deleteMember(Member member) {
        memberRepository.delete(member);
    }

    public Member changedPwd(Member member, ChangedPwdRequest pwdRequest) {
        Optional<Member> OpUser = memberRepository.findByEmail(member.getEmail());

        if (OpUser.isPresent()) {
            Member m = OpUser.get();

            if (!passwordEncoder.matches(pwdRequest.getOldPassword(), m.getPassword())) {
                throw new IllegalArgumentException("기존 비밀번호가 일치하지 않습니다.");
            }

            if (!pwdRequest.getNewPassword().equals(pwdRequest.getConfirmPassword())) {
                throw new IllegalArgumentException("새 비밀번호가 일치하지 않습니다.");
            }

            String enPass = passwordEncoder.encode(pwdRequest.getNewPassword());
            m.setPassword(enPass);

            memberRepository.save(m);

            return m;
        }
        throw new IllegalArgumentException("등록되어 있지 않은 이메일입니다.");

    }

    public MypageResponse mypageInfo(Member member) {
        return  memberRepository.findById(member.getId())
                .map(m -> new MypageResponse(m.getEmail(), m.getUsername()))
                .orElseThrow(() -> new RuntimeException("해당 회원을 찾을 수 없습니다."));
    }

    public Member editProfile(Member member, EditProfileRequest editProfileRequest) {
        Optional<Member> OpUser = memberRepository.findByEmail(member.getEmail());
        if (OpUser.isPresent()) {
            Member m = OpUser.get();
            if (memberRepository.existsByUsername(editProfileRequest.getName())) {
                throw new IllegalArgumentException("이미 존재하는 유저네임 입니다.");
            }

            Member updatedMember = Member.builder()
                    .email(editProfileRequest.getEmail())
                    .username(editProfileRequest.getName())
                    .address(editProfileRequest.getAddress())
                    .phone(editProfileRequest.getPhone())
                    .build();

            return memberRepository.save(updatedMember);
        }
        throw new IllegalArgumentException("등록되어 있지 않은 이메일입니다.");
    }

}
