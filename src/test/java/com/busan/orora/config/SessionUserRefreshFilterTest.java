package com.busan.orora.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

import com.busan.orora.common.util.SessionUtil;
import com.busan.orora.user.dto.UserDto;
import com.busan.orora.user.service.UserService;

/**
 * 세션 사용자 상태(정지·권한 변경)를 매 요청마다 DB와 맞추는 필터 테스트
 */
@ExtendWith(MockitoExtension.class)
class SessionUserRefreshFilterTest {

    @Mock
    private UserService userService;

    private SessionUserRefreshFilter filter;
    private MockFilterChain chain;

    @BeforeEach
    void setUp() {
        filter = new SessionUserRefreshFilter(userService);
        chain = new MockFilterChain();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void 정지된_계정은_세션이_끊기고_요청은_비로그인으로_계속된다() throws Exception {
        MockHttpSession session = new MockHttpSession();
        MockHttpServletRequest request = loggedInRequest("/api/reviews", session, user("MEMBER", "ACTIVE"));
        when(userService.getUserById(1L)).thenReturn(user("MEMBER", "SUSPENDED"));

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        assertTrue(session.isInvalid());
        assertNotNull(chain.getRequest(), "요청은 다음 필터로 계속 진행되어야 합니다.");
    }

    @Test
    void 삭제된_계정은_세션이_끊긴다() throws Exception {
        MockHttpSession session = new MockHttpSession();
        MockHttpServletRequest request = loggedInRequest("/pages/mypage/mypage", session, user("MEMBER", "ACTIVE"));
        when(userService.getUserById(1L)).thenReturn(null);

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        assertTrue(session.isInvalid());
    }

    @Test
    void 권한이_바뀌면_세션_사용자와_인증_권한이_갱신된다() throws Exception {
        MockHttpSession session = new MockHttpSession();
        MockHttpServletRequest request = loggedInRequest("/api/admin/users", session, user("ADMIN", "ACTIVE"));
        when(userService.getUserById(1L)).thenReturn(user("MEMBER", "ACTIVE"));

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        assertFalse(session.isInvalid());
        assertEquals("MEMBER", ((UserDto) session.getAttribute(SessionUtil.LOGIN_USER)).getRoleCode());
        SecurityContext saved = (SecurityContext) session
                .getAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
        assertTrue(saved.getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MEMBER")));
        assertTrue(SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test
    void 회원_시점인_관리자의_권한이_회수되면_회원_시점도_해제된다() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(SessionUtil.VIEW_AS_MEMBER, true);
        MockHttpServletRequest request = loggedInRequest("/api/reviews", session, user("ADMIN", "ACTIVE"));
        when(userService.getUserById(1L)).thenReturn(user("MEMBER", "ACTIVE"));

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        assertNull(session.getAttribute(SessionUtil.VIEW_AS_MEMBER));
    }

    @Test
    void 회원_시점인_관리자는_권한이_그대로면_회원_시점이_유지된다() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(SessionUtil.VIEW_AS_MEMBER, true);
        MockHttpServletRequest request = loggedInRequest("/api/reviews", session, user("ADMIN", "ACTIVE"));
        when(userService.getUserById(1L)).thenReturn(user("ADMIN", "ACTIVE"));

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        assertEquals(true, session.getAttribute(SessionUtil.VIEW_AS_MEMBER));
    }

    @Test
    void 변경이_없으면_세션을_그대로_둔다() throws Exception {
        MockHttpSession session = new MockHttpSession();
        UserDto sessionUser = user("MEMBER", "ACTIVE");
        MockHttpServletRequest request = loggedInRequest("/api/reviews", session, sessionUser);
        when(userService.getUserById(1L)).thenReturn(user("MEMBER", "ACTIVE"));

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        assertSame(sessionUser, session.getAttribute(SessionUtil.LOGIN_USER));
        assertNull(session.getAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY));
    }

    @Test
    void 정적_리소스_요청은_DB를_조회하지_않는다() throws Exception {
        MockHttpServletRequest request = loggedInRequest("/css/index.css", new MockHttpSession(),
                user("MEMBER", "ACTIVE"));

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        verifyNoInteractions(userService);
        assertNotNull(chain.getRequest());
    }

    @Test
    void 비로그인_요청은_DB를_조회하지_않는다() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/reviews");

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        verifyNoInteractions(userService);
    }

    @Test
    void 상태_조회에_실패해도_요청은_계속된다() throws Exception {
        MockHttpSession session = new MockHttpSession();
        MockHttpServletRequest request = loggedInRequest("/api/reviews", session, user("MEMBER", "ACTIVE"));
        when(userService.getUserById(1L)).thenThrow(new RuntimeException("DB 연결 실패"));

        filter.doFilter(request, new MockHttpServletResponse(), chain);

        assertFalse(session.isInvalid());
        assertNotNull(chain.getRequest());
    }

    private UserDto user(String roleCode, String statusCode) {
        UserDto user = new UserDto();
        user.setId(1L);
        user.setLoginId("tester");
        user.setRoleCode(roleCode);
        user.setStatusCode(statusCode);
        return user;
    }

    private MockHttpServletRequest loggedInRequest(String uri, MockHttpSession session, UserDto user) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", uri);
        session.setAttribute(SessionUtil.LOGIN_USER, user);
        request.setSession(session);
        return request;
    }
}
