package org.project.second.security;

import jakarta.annotation.Nullable;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        // HttpServletRequest 추상화된 HTTP 요청객체 , ServletServerHttpRequest 부모 객체(실제 서블릿 환경)
        HttpServletRequest servletRequest = ((ServletServerHttpRequest) request).getServletRequest();
        String token = jwtAuthenticationFilter.getTokenFromCookies(servletRequest);

        if (token != null && jwtAuthenticationFilter.getJwtProvider().validateAccessToken(token)) {
            String username = jwtAuthenticationFilter.getJwtProvider().getUsernameFromToken(token, true);
            UserDetails userDetails = jwtAuthenticationFilter.getUserDetailsService().loadUserByUsername(username);
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            attributes.put("user", authentication);
        } else {
            throw new SecurityException("Invalid or missing JWT token");
        }
        return true; // handshake 진행 허용(연결허용)
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, @Nullable Exception exception) {
        // 핸드 세이크 후 실행
        log.info("JWT Handshake completed");
    }

}
