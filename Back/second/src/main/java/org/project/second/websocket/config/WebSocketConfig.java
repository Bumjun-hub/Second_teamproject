package org.project.second.websocket.config;
import lombok.AllArgsConstructor;
import org.project.second.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker // WebSocket 메시지 브로커 활성화
@AllArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;


    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue"); // /topic으로 구독하는 메시지를 보냄
        config.setApplicationDestinationPrefixes("/app"); // 클라이언트 *요청* prefix (메세지 접두사)
        config.setUserDestinationPrefix("/topic/user"); // 사용자별 메시지
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws") // WebSocket *연결* endpoint
                .setAllowedOriginPatterns("*") // 모든 출처(CORS) 허용
                .withSockJS(); // 브라우저가 WebSocket을 지원하지 않을 때 SockJS fallback 지원
    }

    @Override //configureClientInboundChannel : 클라이언트가 서버로 보내는 메시지를 처리하는 채널을 설정하는 메서드
    public void configureClientInboundChannel(ChannelRegistration registration) { //ChannelRegistration : 채널의 동작을 커스터마이징하는 설정 객체
        registration.interceptors(new ChannelInterceptor() { // ChannelInterceptor : 메시지가 채널로 들어가기 전에 가로채서 원하는 작업(예: 인증 확인)을 수행
            @Override // preSend : 서버에 들어가기 전에 호출
            public Message<?> preSend(Message<?> message, MessageChannel channel) { // Message : 클라이언트가 서버로 보내는 메세지 객체, STOMP 메시지는 명령(CONNECT, SEND 등), 헤더, 본문을 포함
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message); // StompHeaderAccessor : 헤더 리딩, JWT 토큰 꺼낼 떄 사용
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String token = accessor.getFirstNativeHeader("Authorization");
                    if (token != null && token.startsWith("Bearer ")) {
                        token = token.substring(7);
                        if (jwtAuthenticationFilter.getJwtProvider().validateAccessToken(token)) {
                            String username = jwtAuthenticationFilter.getJwtProvider().getUsernameFromToken(token, true);
                            UserDetails userDetails = jwtAuthenticationFilter.getUserDetailsService().loadUserByUsername(username);
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                            accessor.setUser(authentication);
                        } else {
                            throw new AccessDeniedException("Invalid JWT token"); // 인증, 권한 없을 때 예외처리
                        }
                    } else {
                        throw new AccessDeniedException("JWT token required");
                    }
                }
                return message;
            }
        });
    }


}