package com.busan.orora.common.util;

import com.busan.orora.user.dto.UserDto;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

/**
 * 세션에 저장된 로그인 사용자 정보를 꺼내는 공통 유틸.
 * 요청 파라미터로 전달된 userId는 위조가 가능하므로,
 * 신원이 필요한 API는 반드시 이 유틸을 통해 사용자 ID를 얻어야 합니다.
 */
public final class SessionUtil {

    public static final String LOGIN_USER = "loggedInUser";

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
     * 현재 로그인한 사용자가 관리자인지 확인합니다.
     */
    public static boolean isAdmin(HttpServletRequest request) {
        UserDto user = getLoginUser(request);
        return user != null && "ADMIN".equals(user.getRoleCode());
    }
}
