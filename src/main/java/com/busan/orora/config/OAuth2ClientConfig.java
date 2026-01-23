package com.busan.orora.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

@Configuration
public class OAuth2ClientConfig {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2ClientConfig.class);

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        List<ClientRegistration> registrations = new ArrayList<>();

        // System Property에서 직접 읽기 (OroraApplication에서 설정됨)
        String kakaoClientId = System.getProperty("KAKAO_CLIENT_ID", "");
        String kakaoClientSecret = System.getProperty("KAKAO_CLIENT_SECRET", "");
        String kakaoRedirectUri = System.getProperty("KAKAO_REDIRECT_URI",
                "http://localhost:8080/login/oauth2/code/kakao");

        String googleClientId = System.getProperty("GOOGLE_CLIENT_ID", "");
        String googleClientSecret = System.getProperty("GOOGLE_CLIENT_SECRET", "");
        String googleRedirectUri = System.getProperty("GOOGLE_REDIRECT_URI",
                "http://localhost:8080/login/oauth2/code/google");

        // 카카오 클라이언트 등록
        if (kakaoClientId != null && !kakaoClientId.trim().isEmpty()) {
            logger.info("Registering Kakao OAuth2 client: {}",
                    kakaoClientId.substring(0, Math.min(10, kakaoClientId.length())) + "...");
            ClientRegistration kakaoRegistration = ClientRegistration
                    .withRegistrationId("kakao")
                    .clientId(kakaoClientId)
                    .clientSecret(
                            kakaoClientSecret != null && !kakaoClientSecret.trim().isEmpty() ? kakaoClientSecret : "")
                    .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                    .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                    .redirectUri(kakaoRedirectUri)
                    .authorizationUri("https://kauth.kakao.com/oauth/authorize")
                    .tokenUri("https://kauth.kakao.com/oauth/token")
                    .userInfoUri("https://kapi.kakao.com/v2/user/me")
                    .userNameAttributeName("id")
                    .clientName("Kakao")
                    .build();
            registrations.add(kakaoRegistration);
        } else {
            logger.warn("Kakao OAuth2 client-id is empty. Skipping registration.");
        }

        // 구글 클라이언트 등록
        if (googleClientId != null && !googleClientId.trim().isEmpty()) {
            logger.info("Registering Google OAuth2 client: {}",
                    googleClientId.substring(0, Math.min(20, googleClientId.length())) + "...");
            ClientRegistration googleRegistration = ClientRegistration
                    .withRegistrationId("google")
                    .clientId(googleClientId)
                    .clientSecret(
                            googleClientSecret != null && !googleClientSecret.trim().isEmpty() ? googleClientSecret
                                    : "")
                    .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                    .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                    .redirectUri(googleRedirectUri)
                    .scope("email", "profile")
                    .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                    .tokenUri("https://www.googleapis.com/oauth2/v4/token")
                    .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
                    .userNameAttributeName("sub")
                    .clientName("Google")
                    .build();
            registrations.add(googleRegistration);
        } else {
            logger.warn("Google OAuth2 client-id is empty. Skipping registration.");
        }

        if (registrations.isEmpty()) {
            logger.warn("No OAuth2 clients registered. Creating empty ClientRegistrationRepository.");
            // InMemoryClientRegistrationRepository는 빈 리스트를 허용하지 않으므로
            // 빈 구현체를 반환하여 Spring Security의 요구사항을 만족시킴
            return new EmptyClientRegistrationRepository();
        }

        logger.info("OAuth2 ClientRegistrationRepository created with {} client(s).", registrations.size());
        return new InMemoryClientRegistrationRepository(registrations);
    }

    /**
     * OAuth2 클라이언트가 없을 때 사용하는 빈 ClientRegistrationRepository 구현체
     * Spring Security의 자동 설정 요구사항을 만족시키기 위해 필요함
     */
    private static class EmptyClientRegistrationRepository implements ClientRegistrationRepository, Iterable<ClientRegistration> {
        @Override
        public ClientRegistration findByRegistrationId(String registrationId) {
            return null;
        }

        @Override
        public Iterator<ClientRegistration> iterator() {
            return Collections.emptyIterator();
        }
    }
}
