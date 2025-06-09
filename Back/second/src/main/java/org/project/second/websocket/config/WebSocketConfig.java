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

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
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
                            throw new AccessDeniedException("Invalid JWT token");
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