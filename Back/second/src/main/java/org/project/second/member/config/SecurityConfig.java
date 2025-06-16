package org.project.second.member.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.project.second.member.service.CustomUserDetailsService;
import org.project.second.security.JwtAuthenticationEntryPoint;
import org.project.second.security.JwtAuthenticationFilter;
import org.project.second.socialAuth.service.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/signup", "/api/login").permitAll()
                        .requestMatchers("/api/logout/", "/api/deletion").authenticated()
                        .requestMatchers("/api/groupBuy/admin/**").hasRole("ADMIN") // 공동구매
                        .requestMatchers("/api/groupBuy/view/**", "/api/groupBuy/detail/**").permitAll()
                        .requestMatchers("/api/groupBuy/**").authenticated()
                        .requestMatchers("/api/item/search", "/api/recipe/**","/api/favorite/count/**", "/api/comment/list/**", "/api/likes/count/**").permitAll() // 쇼핑, 레시피, 즐찾, 댓글, 라이크
                        .requestMatchers("/api/wishflist/**", "/api/favorite/**", "/api/comment/**", "/api/likes/**").authenticated()
                        .requestMatchers("/api/community/view/**","/api/community/detail/**", "api/donation/view/**" ).permitAll() // 커뮤니티, 나눔
                        .requestMatchers("/api/community/**", "api/donation/**").authenticated()
                        .requestMatchers("/api/order/admin/**").hasRole("ADMIN") // 주문
                        .requestMatchers("/api/order/**").authenticated()
                        .requestMatchers("/api/notifications/**").authenticated()
                        .requestMatchers("/uploads/**", "/static/**","/profileimages/**").permitAll() // 이미지 경로
                        .requestMatchers("/login/oauth2/**", "/api/auth/**", "/oauth2/**").permitAll() // social login api 허용
                        .requestMatchers("/api/refresh", "/api/mypage/**").authenticated()
                        .requestMatchers("/ws/**").authenticated()// 웹소켓 엔드포인트 허용
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService)
                        ) // 커스텀 OAuth2 사용자 서비스
                        .successHandler((request, response, authentication) -> {
                            if (authentication == null || !authentication.isAuthenticated()) {
                                log.error("인증 실패: Null 이거나 인증되지 않음");
                                response.sendError(HttpStatus.UNAUTHORIZED.value(), "인증 객체가 없거나 인증되지 않았습니다.");
                                return;
                            }
                            log.info("Principal: {}", authentication.getPrincipal());

                            // 로그인 성공 시 JWT 토큰 생성 및 쿠키 세팅
                            DefaultOAuth2User oAuth2User = (DefaultOAuth2User) authentication.getPrincipal();
                            String email = oAuth2User.getAttribute("email");


                            // JWT 생성
                            String accessToken = jwtAuthenticationFilter.getJwtProvider().generateAccessToken(authentication);
                            String refreshToken = jwtAuthenticationFilter.getJwtProvider().generateRefreshToken(authentication);

                            // 쿠키 세팅 (HttpOnly, Secure 옵션 꼭 넣기)
                            jwtAuthenticationFilter.getJwtProvider().setTokensInCookies(response, accessToken, refreshToken);

                            // 로그 출력
                            log.info("OAuth2 로그인 성공 - 이메일: {}", email);

                            // 클라이언트(프론트)로 리다이렉트
                            response.sendRedirect("http://localhost:3000");
                        })
                        .failureHandler((request, response, exception) -> {
                            log.error("OAuth2 login failed: {}", exception.getMessage());
                            response.sendError(HttpStatus.UNAUTHORIZED.value(), "OAuth2 login failed");
                        })
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .userDetailsService(customUserDetailsService); // 유저 조회 인터페이스 설정

        return http.build();
    }

    @Bean //AuthenticationManager : 실제 유저 인증 처리, AuthenticationConfiguration : 상위 객체 // 자동 사용됨
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager(); // AuthenticationManager 꺼내서 사용 ->  DaoAuthenticationProvider 자동 사용
    }

    //AuthenticationManager는 UserDetailsService를 통해 사용자 정보를 확인하고,
    //PasswordEncoder로 비밀번호 검증을 합니다

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
