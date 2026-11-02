package com.busan.orora.common.util;

import com.busan.orora.user.dto.UserDto;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

/**
 * 세션에 저장된 로그인 사용자 정보를 꺼내는 공통 유틸.
 * 요청 파라미터로 전달된 userId는 위조가 가능하므로,
 * 신원이 필요한 API는 반드시 이 유틸을 통해 사용자 ID를 얻어야 합니다.
 */
public final class SessionUtil {

    public static final String LOGIN_USER = "loggedInUser";

    /** 관리자가 실제 권한을 바꾸지 않고 회원 시점으로 보는 중인지 나타내는 세션 값 */
    public static final String VIEW_AS_MEMBER = "viewAsMember";

    private SessionUtil() {
    }

    /**
     * 현재 로그인한 사용자를 반환합니다. 로그인 상태가 아니면 null.
     */
    public static UserDto getLoginUser(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        Object user = session.getAttribute(LOGIN_USER);
        return user instanceof UserDto userDto ? userDto : null;
    }

    /**
     * 현재 로그인한 사용자의 ID를 반환합니다. 로그인 상태가 아니면 null.
     */
    public static Long getLoginUserId(HttpServletRequest request) {
        UserDto user = getLoginUser(request);
        return user != null ? user.getId() : null;
    }

    /**
     * 현재 로그인한 사용자가 대상 사용자 본인인지 확인합니다.
     */
    public static boolean isSelf(HttpServletRequest request, Long targetUserId) {
        Long loginUserId = getLoginUserId(request);
        return loginUserId != null && loginUserId.equals(targetUserId);
    }

    /**
     * 현재 관리자 권한이 적용되는 사용자인지 확인합니다.
     * 관리자 계정이라도 회원 시점으로 보는 중이면 false입니다.
     */
    public static boolean isAdmin(HttpServletRequest request) {
        return isAdminAccount(request) && !isViewAsMember(request);
    }

    /**
     * 로그인한 계정의 실제 권한이 관리자인지 확인합니다. (회원 시점 여부와 무관)
     */
    public static boolean isAdminAccount(HttpServletRequest request) {
        UserDto user = getLoginUser(request);
        return user != null && "ADMIN".equals(user.getRoleCode());
    }

    /**
     * 관리자 계정이 회원 시점으로 보는 중인지 확인합니다.
     */
    public static boolean isViewAsMember(HttpServletRequest request) {
        return isAdminAccount(request)
                && Boolean.TRUE.equals(request.getSession(false).getAttribute(VIEW_AS_MEMBER));
    }

    /**
     * 사용자의 권한으로 Spring Security 인증 정보를 만들어
     * 현재 요청과 세션(다음 요청에서도 유지되도록)에 저장합니다.
     * 관리자 계정이 회원 시점으로 보는 중이면 MEMBER 권한을 적용합니다.
     */
    public static void saveAuthentication(HttpSession session, UserDto user) {
        String roleCode = user.getRoleCode() != null ? user.getRoleCode() : "MEMBER";
        if ("ADMIN".equals(roleCode) && Boolean.TRUE.equals(session.getAttribute(VIEW_AS_MEMBER))) {
            roleCode = "MEMBER";
        }
        UserDetails userDetails = User.builder()
                .username(user.getLoginId())
                .password("") // 비밀번호는 인증 후이므로 필요 없음
                .authorities(new SimpleGrantedAuthority("ROLE_" + roleCode))
                .build();

        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
        SecurityContextHolder.setContext(securityContext);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);
    }
}
