package com.busan.orora.config;

import com.busan.orora.common.util.SessionUtil;
import com.busan.orora.user.dto.UserDto;
import com.busan.orora.user.service.UserService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

/**
 * 세션에 저장된 로그인 사용자 정보를 매 요청마다 DB의 최신 상태와 맞추는 필터.
 *
 * - 계정이 삭제되었거나 ACTIVE가 아니면(정지·비활성화) 세션을 끊고 비로그인 상태로 처리
 * - 권한(role_code)이 바뀌었으면 세션 사용자 정보와 Spring Security 권한을 갱신
 *
 * Spring Security 필터 체인에서 세션의 인증 정보를 읽은 직후, 권한 검사 전에 실행됩니다.
 * (SecurityConfig에서 등록. @Component로 등록하면 서블릿 필터로 한 번 더 실행되므로 사용하지 않음)
 */
public class SessionUserRefreshFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(SessionUserRefreshFilter.class);

    /** 정적 리소스 요청은 DB 조회 없이 통과 */
    private static final List<String> STATIC_PATH_PREFIXES = List.of(
            "/css/", "/js/", "/images/", "/upload/", "/lang/", "/favicon");

    private final UserService userService;

    public SessionUserRefreshFilter(UserService userService) {
        this.userService = userService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return STATIC_PATH_PREFIXES.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        UserDto sessionUser = SessionUtil.getLoginUser(request);
        if (sessionUser != null && sessionUser.getId() != null) {
            try {
                refreshSessionUser(request.getSession(false), sessionUser);
            } catch (RuntimeException e) {
                // DB 조회 실패 등으로 상태를 확인하지 못해도 요청 자체는 계속 처리
                logger.warn("세션 사용자 상태 확인 실패: userId={}", sessionUser.getId(), e);
            }
        }
        filterChain.doFilter(request, response);
    }

    private void refreshSessionUser(HttpSession session, UserDto sessionUser) {
        UserDto latestUser = userService.getUserById(sessionUser.getId());

        if (latestUser == null || !"ACTIVE".equals(latestUser.getStatusCode())) {
            // 삭제·정지·비활성화된 계정: 세션을 끊고 이번 요청도 비로그인 상태로 처리
            session.invalidate();
            SecurityContextHolder.clearContext();
            return;
        }

        if (!Objects.equals(latestUser.getRoleCode(), sessionUser.getRoleCode())) {
            // 권한이 바뀐 계정: 세션 사용자 정보와 인증 권한을 최신 값으로 갱신
            session.setAttribute(SessionUtil.LOGIN_USER, latestUser);
            if (!"ADMIN".equals(latestUser.getRoleCode())) {
                // 관리자가 아니게 되면 회원 시점 상태도 해제
                session.removeAttribute(SessionUtil.VIEW_AS_MEMBER);
            }
            SessionUtil.saveAuthentication(session, latestUser);
        }
    }
}
