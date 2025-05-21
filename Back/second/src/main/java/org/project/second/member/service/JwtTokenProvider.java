package org.project.second.member.service;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private final Key accessKey; // 액세스 토큰 서명용 키
    private final Key refreshKey; // 리프레시 토큰 서명용 키
    private final long accessTokenValidity = 15 * 60 * 1000; // 15분 * 60초 * 1000 밀리세컨
    private final long refreshTokenValidity = 7 * 24 * 60 * 60 * 1000; // 7일

    // 생성자 : application.yml에서 시크릿 키 주입
    public JwtTokenProvider(
            @Value("${jwt.access.secret}") String accessSecret,
            @Value("${jwt.refresh.secret}") String refreshSecret) {
        this.accessKey = Keys.hmacShaKeyFor(accessSecret.getBytes()); // 액세스 토큰용 키
        this.refreshKey = Keys.hmacShaKeyFor(refreshSecret.getBytes()); // 리프레시 토큰용 키
    }

    // 액세스 토큰 생성
    public String generateAccessToken(Authentication authentication) {
        String username = authentication.getName(); // 인증된 사용자의 이름
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

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(refreshKey, SignatureAlgorithm.HS512)
                .compact();
    }

    // 토큰을 쿠키에 저장
    public void setTokensInCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        Cookie accessCookie = new Cookie("access_token", accessToken);
        accessCookie.setHttpOnly(true); // 자바스크립트 접근 방지
        accessCookie.setSecure(true); // HTTPS에서만 전송
        accessCookie.setPath("/"); // 전체 경로에서 유효
        accessCookie.setMaxAge((int) (accessTokenValidity / 1000)); // 쿠키 만료 시간
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);
        refreshCookie.setPath("/api/refresh"); // 리프레시 엔드포인트에서만 사용
        refreshCookie.setMaxAge((int) (refreshTokenValidity / 1000));
        response.addCookie(refreshCookie);
    }

    // 액세스 토큰 검증
    public boolean validateAccessToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(accessKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false; // 토큰이 유효하지 않거나 만료됨
        }
    }

    // 리프레시 토큰 검증
    public boolean validateRefreshToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(refreshKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
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
}
