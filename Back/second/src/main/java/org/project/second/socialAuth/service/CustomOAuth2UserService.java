package org.project.second.socialAuth.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.project.second.common.enums.RoleName;
import org.project.second.common.role.Role;
import org.project.second.common.role.RoleRepository;
import org.project.second.member.domain.Member;
import org.project.second.member.repository.MemberRepository;
import org.project.second.socialAuth.dto.OAuthAttributesDto;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final MemberRepository memberRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional         // OAuth2UserRequest : OAuth2 로그인 성공한 후 받아온 요청객체(ClientRegistration, AccessToken) / spring security가 자동전달
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        log.info("loadUser 호출");
        OAuth2User oAuth2User = super.loadUser(userRequest); // 부모의 기존 loadUser 메서드 : userRequest를 이용해 구글 api에 사용자 정보 요청
        String registrationId = userRequest.getClientRegistration().getRegistrationId(); // OAuth 공급자 확인 (yml : google)
        String userNameAttributeName = userRequest.getClientRegistration() // yml에 설정한 공급자 정보
                                        .getProviderDetails() // 토큰, 유저정보, provider 상세정보
                                        .getUserInfoEndpoint() // 사용자 정보 요청 엔드포인트
                                        .getUserNameAttributeName(); // 유저 고유 ID
        OAuthAttributesDto attributes = OAuthAttributesDto.of(registrationId, userNameAttributeName, oAuth2User.getAttributes());
        log.info("Processing Google login for email: {}", attributes.getEmail());

        Member member = saveOrUpdate(attributes);

        // 이 단계에서 이 정보를 스프링 시큐리티에 반환해주면 스프링 시큐리티에서 자동으로 DefaultOAuth2User 들어있는 정보를 기반으로 Context에 인증정보 저장
        return new DefaultOAuth2User( // 보통 principle, credential, authority 순이지만 여기서는 security가 정한 authority, attributes, attributekey 순으로 넣어야함
                Collections.singleton(new SimpleGrantedAuthority(member.getRole().getName().name())),
                attributes.getAttributes(), // 사용자 정보
                attributes.getNameAttributeKey() // 고유 ID
        );
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
