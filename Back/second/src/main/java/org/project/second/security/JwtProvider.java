package org.project.second.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.project.second.member.domain.Member;
import org.project.second.member.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpHeaders;


import java.security.Key;
import java.util.Date;

@Component
public class JwtProvider {
    private final MemberRepository memberRepository;
    private final Key accessKey; // 액세스 토큰 서명용 키
    private final Key refreshKey; // 리프레시 토큰 서명용 키
    private final long accessTokenValidity = 15 * 60 * 1000; // 15분 * 60초 * 1000 밀리세컨
    private final long refreshTokenValidity = 7 * 24 * 60 * 60 * 1000; // 7일

    // 생성자 : application.yml에서 시크릿 키 주입
    public JwtProvider(
            @Value("${jwt.access.secret}") String accessSecret,
            @Value("${jwt.refresh.secret}") String refreshSecret, MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
        byte[] accessKeyBytes = Decoders.BASE64.decode(accessSecret);
        byte[] refreshKeyBytes = Decoders.BASE64.decode(refreshSecret);

        this.accessKey = Keys.hmacShaKeyFor(accessKeyBytes); // 액세스 토큰용 키
        this.refreshKey = Keys.hmacShaKeyFor(refreshKeyBytes); // 리프레시 토큰용 키
    }

    // 액세스 토큰 생성
    public String generateAccessToken(Authentication authentication) {
        String username = authentication.getName(); // 인증된 사용자의 이름(로그인 시 인증수단 == 이메일)
        Date now = new Date(); // 현재 시간
        Date expiryDate = new Date(now.getTime() + accessTokenValidity); // 만료 시간

        return Jwts.builder()
                .setSubject(username) // 토큰의 주체(사용자 이름)
                .setIssuedAt(now) // 발행 시간
                .setExpiration(expiryDate) // 만료 시간
                .signWith(accessKey, SignatureAlgorithm.HS512) // 서명 (HS512 알고리즘)
                .compact(); // 토큰 생성
    }

    // 리프레시 토큰 생성
    public String generateRefreshToken(Authentication authentication) {
        String username = authentication.getName();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenValidity);

        String token = Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(refreshKey, SignatureAlgorithm.HS512)
                .compact();

        //DB에 저장
        Member member = memberRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
        member.setRefreshToken(token);
        memberRepository.save(member);

        return token;
    }

    // 소셜 로그인 전용 액세스 토큰 생성
    public String generateAccessTokenForSocial(Authentication authentication) {
        DefaultOAuth2User oAuth2User = (DefaultOAuth2User) authentication.getPrincipal();
        String username = oAuth2User.getAttribute("email");
        Date now = new Date(); // 현재 시간
        Date expiryDate = new Date(now.getTime() + accessTokenValidity); // 만료 시간

        return Jwts.builder()
                .setSubject(username) // 토큰의 주체(사용자 이름)
                .setIssuedAt(now) // 발행 시간
                .setExpiration(expiryDate) // 만료 시간
                .signWith(accessKey, SignatureAlgorithm.HS512) // 서명 (HS512 알고리즘)
                .compact(); // 토큰 생성
    }

    // 소셜 로그인 전용 리프레시 토큰 생성
    public String generateRefreshTokenForSocial(Authentication authentication) {
        DefaultOAuth2User oAuth2User = (DefaultOAuth2User) authentication.getPrincipal();
        String username = oAuth2User.getAttribute("email");
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenValidity);

        String token =  Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(refreshKey, SignatureAlgorithm.HS512)
                .compact();

        //DB에 저장
        Member member = memberRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
        member.setRefreshToken(token);
        memberRepository.save(member);

        return token;
    }

    // 토큰을 쿠키에 저장
    // JwtProvider.java의 setTokensInCookies 메서드 수정
    public void setTokensInCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        // ✅ 개발 환경용 설정 (HTTP + localhost)
        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
                .httpOnly(true)
                .secure(false) // HTTP에서 사용
                .sameSite("Strict") // ✅ Strict로 변경 (같은 도메인에서만)
                .path("/")
                .maxAge((int) (accessTokenValidity / 1000))
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict") // ✅ Strict로 변경
                .path("/api/refresh")
                .maxAge((int) (refreshTokenValidity / 1000))
                .build();

        response.setHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    }

// ✅ 프로덕션 환경용 설정 예시 (HTTPS 사용 시)
/*
public void setTokensInCookiesForProduction(HttpServletResponse response, String accessToken, String refreshToken) {
    ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
            .httpOnly(true)
            .secure(true) // HTTPS에서만
            .sameSite("None") // 크로스 도메인 허용
            .path("/")
            .maxAge((int) (accessTokenValidity / 1000))
            .build();

    ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
            .httpOnly(true)
            .secure(true)
            .sameSite("None")
            .path("/api/refresh")
            .maxAge((int) (refreshTokenValidity / 1000))
            .build();

    response.setHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
    response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
}
*/

    // 쿠키에서 refresh 토큰 가져오기
    public String getRefreshTokenFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refresh_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    // 액세스 토큰 검증
    public boolean validateAccessToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(accessKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("[JWT Provider] 토큰 만료됨");
        } catch (UnsupportedJwtException e) {
            System.out.println("[JWT Provider] 지원하지 않는 토큰 형식");
        } catch (MalformedJwtException e) {
            System.out.println("[JWT Provider] 토큰 형식 오류");
        } catch (SignatureException e) {
            System.out.println("[JWT Provider] 서명 오류");
        } catch (Exception e) {
            System.out.println("[JWT Provider] 기타 오류: " + e.getMessage());
        }
        return false;

        // catch (JwtException | IllegalArgumentException e) {
        // return false; // 토큰이 유효하지 않거나 만료됨
        //}

    }

    // 리프레시 토큰 검증 d
    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(refreshKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String username = claims.getSubject();
            Member member = memberRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

            return token.equals(member.getRefreshToken()); // 저장된 토큰과 비교
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // 토큰에서 사용자 이름 추출
    public String getUsernameFromToken(String token, boolean isAccessToken) {
        Key key = isAccessToken ? accessKey : refreshKey;
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public void clearTokensInCookies(HttpServletResponse response) {
        // 쿠키에 저장된 JWT 토큰을 삭제하는 방식
        Cookie accessTokenCookie = new Cookie("access_token", null);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(false);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(0);  //  0초 => 삭제
        response.addCookie(accessTokenCookie);

        Cookie refreshTokenCookie = new Cookie("refresh_token", null);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(false);
        refreshTokenCookie.setPath("/api/refresh");
        refreshTokenCookie.setMaxAge(0);
        response.addCookie(refreshTokenCookie);
    }

}
