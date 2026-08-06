package com.busan.orora.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Autowired(required = false)
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired(required = false)
    private ClientRegistrationRepository clientRegistrationRepository;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // CSRF 비활성화 (세션 기반 인증 사용 시 필요)
                .authorizeHttpRequests(auth -> auth
                        // 정적 리소스 허용
                        .requestMatchers("/css/**", "/js/**", "/images/**", "/upload/**", "/lang/**").permitAll()
                        // 관리자 영역은 ADMIN 권한 필요
                        // (아래 permitAll 규칙보다 먼저 선언해야 함: 먼저 일치하는 규칙이 적용됨)
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/admin/**", "/pages/admin/**").hasRole("ADMIN")
                        // 페이지 허용
                        .requestMatchers("/", "/login/**", "/signup/**").permitAll()
                        .requestMatchers("/pages/login/**").permitAll()
                        .requestMatchers("/pages/**").permitAll()
                        // OAuth2 허용
                        .requestMatchers("/oauth2/**").permitAll()
                        // 공개 API 허용 (조회만 허용, 쓰기 요청은 아래 authenticated 규칙을 따름)
                        .requestMatchers("/api/auth/**").permitAll() // 인증 관련 API
                        .requestMatchers(HttpMethod.GET, "/api/regions/**").permitAll() // 지역 API
                        .requestMatchers(HttpMethod.GET, "/api/tag-spots").permitAll() // 해시태그 API
                        .requestMatchers(HttpMethod.GET, "/api/tourist-spots/**").permitAll() // 관광지 조회 API
                        .requestMatchers(HttpMethod.GET, "/api/reviews").permitAll() // 리뷰 조회 API (GET)
                        .requestMatchers(HttpMethod.GET, "/api/reviews/*/comments").permitAll() // 리뷰 댓글 조회 API (GET)
                        .requestMatchers(HttpMethod.GET, "/api/public/**").permitAll() // 공개 프로필/공개 데이터 API (GET)
                        .requestMatchers(HttpMethod.GET, "/api/users/*/reviews").permitAll() // 사용자 작성 리뷰 조회 (GET)
                        .requestMatchers(HttpMethod.GET, "/api/users/*/liked-reviews").permitAll() // 사용자 좋아요 누른 리뷰 조회 (GET)
                        .requestMatchers(HttpMethod.GET, "/api/search/**").permitAll() // 검색 API
                        // 나머지 API는 인증 필요 (리뷰 작성, 좋아요 등)
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().authenticated());

        // OAuth2 로그인 설정
        // ClientRegistrationRepository가 있을 때만 OAuth2 로그인 활성화
        if (clientRegistrationRepository != null) {
            logger.info("OAuth2 ClientRegistrationRepository found. Enabling OAuth2 login.");
            try {
                boolean hasKakao = clientRegistrationRepository.findByRegistrationId("kakao") != null;
                boolean hasGoogle = clientRegistrationRepository.findByRegistrationId("google") != null;
                logger.info("Registered OAuth2 clients: {} {}", 
                    hasKakao ? "kakao" : "", hasGoogle ? "google" : "");
            } catch (Exception e) {
                logger.debug("Error checking registered clients", e);
            }
            http.oauth2Login(oauth2 -> {
                oauth2.loginPage("/pages/login/login");
                oauth2.successHandler(authenticationSuccessHandler());
                if (customOAuth2UserService != null) {
                    oauth2.userInfoEndpoint(userInfo -> userInfo
                            .userService(customOAuth2UserService));
                }
            });
        } else {
            logger.warn("OAuth2 ClientRegistrationRepository not found. OAuth2 login is disabled.");
        }

        http.sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false));

        return http.build();
    }

    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler() {
        SimpleUrlAuthenticationSuccessHandler handler = new SimpleUrlAuthenticationSuccessHandler();
        handler.setDefaultTargetUrl("/");
        handler.setUseReferer(false);
        return handler;
    }
}
