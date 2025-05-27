package org.project.second.member.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.project.second.member.dto.*;
import org.project.second.security.JwtProvider;
import org.project.second.member.service.MemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
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
        SignupResponse u = memberService.insert(signupRequest);

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
    public ResponseEntity<LogoutResponse> logout(HttpServletResponse response) {
        jwtProvider.clearTokensInCookies(response);
        return ResponseEntity.ok(new LogoutResponse("로그아웃 성공"));
    }

    @DeleteMapping("deletion")
    public ResponseEntity<String> deleteMember(@AuthenticationPrincipal CustomUserDetails userDetails, HttpServletResponse response) {
        Member member = userDetails.getMember();
        memberService.deleteMember(member);
        jwtProvider.clearTokensInCookies(response);
        return ResponseEntity.ok("계정이 정상적으로 삭제되었습니다.");
    }

    @PutMapping("changedPwd")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal CustomUserDetails userDetails,
                                            @RequestBody ChangedPwdRequest pwdRequest,  HttpServletResponse response) {
        try{
            Member member = userDetails.getMember();
            Member updatedMember = memberService.changedPwd(member, pwdRequest);

            CustomUserDetails updatedUserDetails = new CustomUserDetails(updatedMember);

            // 토큰 재 생성을 위해 Authentication 재설정
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    updatedUserDetails, null, updatedUserDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            jwtProvider.clearTokensInCookies(response);
            String newAccessToken = jwtProvider.generateAccessToken(authentication);
            String newRefreshToken = jwtProvider.generateRefreshToken(authentication);
            jwtProvider.setTokensInCookies(response, newAccessToken, newRefreshToken);

            return ResponseEntity.ok(new ChangedPwdResponse("비밀번호 변경 성공", updatedMember.getEmail()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("서버 오류가 발생했습니다."));
        }
    }

    @GetMapping("/mypage")
    public ResponseEntity<MypageResponse> mypageInfo(@AuthenticationPrincipal CustomUserDetails userDetails) {
        MypageResponse mypageResponse = memberService.mypageInfo(userDetails.getMember());
        return ResponseEntity.ok(mypageResponse);
    }

    @PutMapping("/mypage/editProfile")
    public ResponseEntity<?> editProfile(@AuthenticationPrincipal CustomUserDetails userDetails,
                                         @RequestBody EditProfileRequest editProfileRequest, HttpServletResponse response) {
        try {
            Member member = userDetails.getMember();
            Member updatedMember = memberService.editProfile(member, editProfileRequest);

            CustomUserDetails updatedUserDetails = new CustomUserDetails(updatedMember);

            // 토큰 재 생성을 위해 Authentication 재설정
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    updatedUserDetails, null, updatedUserDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            jwtProvider.clearTokensInCookies(response);
            String newAccessToken = jwtProvider.generateAccessToken(authentication);
            String newRefreshToken = jwtProvider.generateRefreshToken(authentication);
            jwtProvider.setTokensInCookies(response, newAccessToken, newRefreshToken);

            return ResponseEntity.ok(new EditProfileResponse("프로필 변경 완료", updatedMember.getUsername(), updatedMember.getEmail(), updatedMember.getPhone(), updatedMember.getAddress()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("서버 오류가 발생했습니다."));
        }
    }

    @GetMapping("/profile/getimages")
    public ResponseEntity<List<String>> getImages() throws IOException {
        List<String> images = memberService.getProfileImages();
        return ResponseEntity.ok(images);
    }

    @PostMapping("/profile/upload")
    public ResponseEntity<?> uploadProfileImage(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                     @RequestBody ProfileImageRequest profileImageRequest, HttpServletResponse response) {
        try {
            Member m = userDetails.getMember();
            memberService.uploadProfileImage(profileImageRequest.getProfile_imageName(), m.getId());
            return ResponseEntity.ok("프로필 이미지가 저장되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("프로필 이미지 업로드 실패"));
        }
    }


}
