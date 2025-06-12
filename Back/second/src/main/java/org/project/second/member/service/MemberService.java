package org.project.second.member.service;

import jakarta.transaction.Transactional;
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
import org.project.second.socialAuth.dto.OAuthAttributesDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @Value("${file.profile-images-dir}")
    private String profileImagesDir;

    private static final List<String> ALLOWED_IMAGES = Arrays.asList(
            "profile1.png", "profile2.png", "profile3.png", "profile4.png", "profile5.png",
            "profile6.png", "profile7.png", "profile8.png", "profile9.png", "profile10.png",
            "profile11.png", "profile12.png"
    );

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
                .map(m -> new MypageResponse(m.getEmail(), m.getUsername(), m.getPhone(), m.getAddress(), m.getImageUrl()))
                .orElseThrow(() -> new RuntimeException("해당 회원을 찾을 수 없습니다."));
    }

    public Member editProfile(Member member, EditProfileRequest editProfileRequest) {
        Optional<Member> OpUser = memberRepository.findByEmail(member.getEmail());
        if (OpUser.isPresent()) {
            Member m = OpUser.get();
            if (!editProfileRequest.getName().equals(m.getUsername())
                    && memberRepository.existsByUsername(editProfileRequest.getName())) {
                throw new IllegalArgumentException("이미 존재하는 유저네임 입니다.");
            }

            Member updatedMember = Member.builder()
                    .id(m.getId())
                    .email(editProfileRequest.getEmail())
                    .password(m.getPassword())
                    .username(editProfileRequest.getName())
                    .address(editProfileRequest.getAddress())
                    .phone(editProfileRequest.getPhone())
                    .imageUrl(m.getImageUrl())
                    .role(m.getRole())
                    .build();

            return memberRepository.save(updatedMember);
        }
        throw new IllegalArgumentException("등록되어 있지 않은 이메일입니다.");
    }

    public List<String> getProfileImages() throws IOException {
        // 패턴을 이용해 클래스패스(classpath)에 있는 리소스들(파일 등)을 찾는 데 사용 : classpath:/static/images/*.png
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        //Resource는 스프링에서 지원하는 추상화된 파일 객체
        Resource[] resources = resolver.getResources("classpath:" + profileImagesDir.trim() + "/*.png");
        return Arrays.stream(resources)
                .map(resource -> "/profileimages/" + resource.getFilename())
                .filter(path -> ALLOWED_IMAGES.contains(path.substring(path.lastIndexOf("/") + 1)))
                .collect(Collectors.toList());
    }

    public void uploadProfileImage(String profileImageName, Long memberId) {
        if (!ALLOWED_IMAGES.contains(profileImageName)) {
            throw new IllegalArgumentException("유효하지 않은 이미지입니다.");
        }

        Member m = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));

        m.setImageUrl("/profileimages/" + profileImageName);
        memberRepository.save(m);
    }

    public ResponseEntity<String> getRoleInfo(Member m) {
        Optional<Member> opUser =  memberRepository.findById(m.getId());
        if (opUser.isPresent()) {
            Member member = opUser.get();
            String role = member.getRole().getName().name();
            return ResponseEntity.ok(role);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 회원을 찾을 수 없습니다.");
        }

    }

    public boolean checkPassword(Member m, String password) {
       Optional<Member>  opUser = memberRepository.findById(m.getId());
       if (opUser.isPresent()) {
           Member member = opUser.get();

           if (!passwordEncoder.matches(password, member.getPassword())) {
               throw new IllegalArgumentException("비밀번호가 일치하지 않습니다");
           }

           return true;
       }
        return false;
    }

    @Transactional
    public Member saveOrUpdate(OAuthAttributesDto attributes) {
        Optional<Member> opUser = memberRepository.findByEmailAndSocialProvider(attributes.getEmail(), attributes.getSocialProvider());
        if (opUser.isPresent()) {
            Member existingMember = opUser.get();
            existingMember.setUsername(attributes.getName());
            return memberRepository.save(existingMember);
        } else {
            if (memberRepository.existsByEmailAndSocialProvider(attributes.getEmail(), attributes.getSocialProvider())) {
                throw new IllegalArgumentException("이미 존재하는 이메일 입니다.");
            }

            // String security : 유저네임 중복 체크
            if (memberRepository.existsBySocialIdAndSocialProvider(attributes.getNameAttributeKey(), attributes.getSocialProvider())) {
                throw new IllegalArgumentException("이미 존재하는 소셜 고유 ID 입니다.");
            }

            Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                    .orElseThrow(() -> new IllegalArgumentException("기본 USER 역할이 DB에 없습니다."));
            String enPass = passwordEncoder.encode(UUID.randomUUID().toString());

            Member newMember = Member.builder()
                    .username(attributes.getName())
                    .email(attributes.getEmail())
                    .password(enPass)
                    .socialProvider(attributes.getSocialProvider())
                    .socialId(attributes.getNameAttributeKey())
                    .role(userRole)
                    .build();
            return memberRepository.save(newMember);
        }
    }

}
