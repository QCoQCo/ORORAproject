package com.busan.orora.config;

import com.busan.orora.user.dto.UserDto;
import com.busan.orora.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import java.util.Collections;
import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserService userService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String loginTypeCode = getLoginTypeCode(registrationId);

        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = getEmail(attributes, registrationId);
        String username = getUsername(attributes, registrationId);

        // 사용자 생성 또는 업데이트
        UserDto user = userService.createOrUpdateSocialUser(email, username, loginTypeCode);

        // 세션에 사용자 정보 저장
        try {
            ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (requestAttributes != null) {
                HttpServletRequest request = requestAttributes.getRequest();
                HttpSession session = request.getSession();
                session.setAttribute("loggedInUser", user);
            }
        } catch (Exception e) {
            // 세션 저장 실패 시 로그만 남기고 계속 진행
            // 로그인은 성공했으므로 예외를 무시
        }

        // 권한 설정
        String role = user.getRoleCode() != null ? user.getRoleCode() : "MEMBER";
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

        return new DefaultOAuth2User(
                Collections.singleton(authority),
                attributes,
                getUsernameAttributeName(registrationId));
    }

    private String getLoginTypeCode(String registrationId) {
        if ("kakao".equalsIgnoreCase(registrationId)) {
            return "KAK";
        } else if ("google".equalsIgnoreCase(registrationId)) {
            return "GOO";
        }
        return "NOR";
    }

    private String getEmail(Map<String, Object> attributes, String registrationId) {
        if ("kakao".equalsIgnoreCase(registrationId)) {
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            if (kakaoAccount != null) {
                String email = (String) kakaoAccount.get("email");
                // 카카오는 이메일 권한이 없을 수 있으므로, 이메일이 없으면 카카오 ID로 임시 이메일 생성
                if (email != null && !email.trim().isEmpty()) {
                    return email;
                }
            }
            // 이메일이 없으면 카카오 ID를 사용하여 임시 이메일 생성
            Object kakaoId = attributes.get("id");
            if (kakaoId != null) {
                return "kakao_" + kakaoId.toString() + "@kakao.local";
            }
            // ID도 없으면 타임스탬프 기반 임시 이메일
            return "kakao_" + System.currentTimeMillis() + "@kakao.local";
        } else if ("google".equalsIgnoreCase(registrationId)) {
            return (String) attributes.get("email");
        }
        return null;
    }

    private String getUsername(Map<String, Object> attributes, String registrationId) {
        if ("kakao".equalsIgnoreCase(registrationId)) {
            Map<String, Object> properties = (Map<String, Object>) attributes.get("properties");
            if (properties != null) {
                String nickname = (String) properties.get("nickname");
                if (nickname != null && !nickname.isEmpty()) {
                    return nickname;
                }
            }
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            if (kakaoAccount != null) {
                String email = (String) kakaoAccount.get("email");
                if (email != null) {
                    return email.split("@")[0];
                }
            }
            return "카카오사용자";
        } else if ("google".equalsIgnoreCase(registrationId)) {
            String name = (String) attributes.get("name");
            if (name != null && !name.isEmpty()) {
                return name;
            }
            String email = (String) attributes.get("email");
            if (email != null) {
                return email.split("@")[0];
            }
            return "구글사용자";
        }
        return "사용자";
    }

    private String getUsernameAttributeName(String registrationId) {
        if ("kakao".equalsIgnoreCase(registrationId)) {
            return "id";
        } else if ("google".equalsIgnoreCase(registrationId)) {
            return "sub";
        }
        return "id";
    }
}
