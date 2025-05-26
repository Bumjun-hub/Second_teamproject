package org.project.second.member.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.project.second.member.dto.LoginRequest;
import org.project.second.member.dto.LoginResponse;
import org.project.second.member.dto.SignupRequest;
import org.project.second.security.JwtProvider;
import org.project.second.member.service.MemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;
    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;  // JWT 생성 및 검증 유틸

    //Valid : null 값 유효성 체크 자동
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@Valid @RequestBody SignupRequest signupRequest) {
        SignupRequest u = memberService.insert(signupRequest);

        Map<String, String> response = new HashMap<>();
        response.put("message", "회원가입 성공");
        response.put("email", u.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword());

        try{
            Authentication authentication = authenticationManager.authenticate(token);

            // ✅ 인증 정보 SecurityContext에 저장
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            String accessToken = jwtProvider.generateAccessToken(authentication);
            String refreshToken = jwtProvider.generateRefreshToken(authentication);
            jwtProvider.setTokensInCookies(response, accessToken, refreshToken);

            return ResponseEntity.ok(new LoginResponse("로그인 성공", authentication.getName()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(".이메일 또는 비밀번호가 유효하지 않습니다.", loginRequest.getEmail()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = jwtProvider.getRefreshTokenFromCookies(request);
        if (refreshToken != null && jwtProvider.validateRefreshToken(refreshToken)) {
            String username = jwtProvider.getUsernameFromToken(refreshToken, false);
            Authentication authentication = new UsernamePasswordAuthenticationToken(username, null, null);
            String newAccessToken = jwtProvider.generateAccessToken(authentication);
            jwtProvider.setTokensInCookies(response, newAccessToken, refreshToken);
            return ResponseEntity.ok(Map.of("message", "Access Token이 재발행 되었습니다."));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Refresh Token이 유효하지 않습니다."));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String,String>> logout(HttpServletResponse response) {
        jwtProvider.clearTokensInCookies(response);
        return ResponseEntity.ok(Map.of("message", "로그아웃 되었습니다."));
    }

}
