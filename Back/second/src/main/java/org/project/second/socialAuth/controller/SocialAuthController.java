package org.project.second.socialAuth.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.project.second.member.domain.Member;
import org.project.second.member.repository.MemberRepository;
import org.project.second.security.JwtProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class SocialAuthController {
    private final MemberRepository memberRepository;
    private final JwtProvider jwtProvider;

    @GetMapping("/check")
    public String checkAuthentication(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            return "Authenticated";
        }
        throw new RuntimeException("Not authenticated");
    }

    @GetMapping("/login/success")
    public void handleLoginSuccess(Authentication authentication, HttpServletResponse response) throws IOException {
        if (authentication == null || !authentication.isAuthenticated()) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "컨트롤러 authentication 인증 객체 추출 실패");
            return;
        }

        // authentication.getPrincipal() 호출하면 서비스에서 return한 DefaultOAuth2User
        DefaultOAuth2User oAuth2User = (DefaultOAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("유효하지 않은 유저입니다."));

        // JWT 생성
        String accessToken = jwtProvider.generateAccessTokenForSocial(authentication);
        String refreshToken = jwtProvider.generateRefreshTokenForSocial(authentication);

        // 쿠키 설정
        jwtProvider.setTokensInCookies(response, accessToken, refreshToken);

        // 리다이렉트
        response.sendRedirect("http://localhost:3000");
    }

}
