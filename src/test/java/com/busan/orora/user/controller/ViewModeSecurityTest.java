package com.busan.orora.user.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.busan.orora.common.util.SessionUtil;
import com.busan.orora.user.dto.UserDto;
import com.busan.orora.user.service.UserService;

import jakarta.servlet.Filter;

/**
 * 회원 시점 전환 통합 테스트.
 * 실제 Spring Security 필터 체인을 통과시켜, 회원 시점에서 관리자 권한이 실제로 막히는지와
 * 관리자가 아닌 사용자는 권한을 얻을 수 없는지 확인합니다.
 */
@SpringBootTest
class ViewModeSecurityTest {

    private static final String ADMIN_API = "/api/admin/users";

    @Autowired
    private WebApplicationContext context;

    @Autowired
    @Qualifier("springSecurityFilterChain")
    private Filter springSecurityFilterChain;

    @MockitoBean
    private UserService userService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).addFilters(springSecurityFilterChain).build();
    }

    @Test
    void 관리자가_회원_시점으로_전환하면_관리자_API가_막히고_되돌리면_다시_열린다() throws Exception {
        UserDto admin = user("ADMIN");
        MockHttpSession session = loggedInSession(admin);
        when(userService.getUserById(1L)).thenReturn(admin);
        when(userService.getAllUsers()).thenReturn(List.of());

        mockMvc.perform(get(ADMIN_API).session(session)).andExpect(status().isOk());

        changeViewMode(session, true)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.roleCode").value("MEMBER"))
                .andExpect(jsonPath("$.user.adminAccount").value(true))
                .andExpect(jsonPath("$.user.viewAsMember").value(true));

        mockMvc.perform(get(ADMIN_API).session(session)).andExpect(status().isForbidden());

        // 회원 시점이어도 세션의 실제 권한은 그대로이고, DB 변경도 없어야 함
        assertEquals("ADMIN", ((UserDto) session.getAttribute(SessionUtil.LOGIN_USER)).getRoleCode());
        verify(userService, never()).updateUser(any(), any());

        changeViewMode(session, false)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.roleCode").value("ADMIN"))
                .andExpect(jsonPath("$.user.viewAsMember").value(false));

        mockMvc.perform(get(ADMIN_API).session(session)).andExpect(status().isOk());
    }

    @Test
    void 회원_시점에서는_로그인_상태_응답도_회원으로_나온다() throws Exception {
        UserDto admin = user("ADMIN");
        MockHttpSession session = loggedInSession(admin);
        when(userService.getUserById(1L)).thenReturn(admin);

        changeViewMode(session, true).andExpect(status().isOk());

        mockMvc.perform(get("/api/auth/check").session(session))
                .andExpect(jsonPath("$.user.roleCode").value("MEMBER"))
                .andExpect(jsonPath("$.user.adminAccount").value(true))
                .andExpect(jsonPath("$.user.viewAsMember").value(true));
    }

    @Test
    void 일반_회원은_시점을_전환할_수_없고_관리자_API도_쓸_수_없다() throws Exception {
        UserDto member = user("MEMBER");
        MockHttpSession session = loggedInSession(member);
        when(userService.getUserById(1L)).thenReturn(member);

        changeViewMode(session, false)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));

        mockMvc.perform(get(ADMIN_API).session(session)).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/auth/check").session(session))
                .andExpect(jsonPath("$.user.roleCode").value("MEMBER"))
                .andExpect(jsonPath("$.user.adminAccount").value(false));
    }

    @Test
    void 예전_Role_변경_API는_더_이상_권한을_바꾸지_못한다() throws Exception {
        UserDto member = user("MEMBER");
        MockHttpSession session = loggedInSession(member);
        when(userService.getUserById(1L)).thenReturn(member);

        mockMvc.perform(post("/api/users/me/role").session(session)
                .contentType(MediaType.APPLICATION_JSON).content("{\"roleCode\":\"ADMIN\"}"));

        mockMvc.perform(get(ADMIN_API).session(session)).andExpect(status().isForbidden());
        assertEquals("MEMBER", ((UserDto) session.getAttribute(SessionUtil.LOGIN_USER)).getRoleCode());
    }

    private ResultActions changeViewMode(MockHttpSession session, boolean viewAsMember) throws Exception {
        return mockMvc.perform(post("/api/users/me/view-mode").session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"viewAsMember\":" + viewAsMember + "}"));
    }

    private UserDto user(String roleCode) {
        UserDto user = new UserDto();
        user.setId(1L);
        user.setLoginId("tester");
        user.setRoleCode(roleCode);
        user.setStatusCode("ACTIVE");
        return user;
    }

    private MockHttpSession loggedInSession(UserDto user) {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(SessionUtil.LOGIN_USER, user);
        SessionUtil.saveAuthentication(session, user);
        return session;
    }
}
