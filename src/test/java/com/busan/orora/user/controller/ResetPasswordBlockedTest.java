package com.busan.orora.user.controller;

import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.matchesPattern;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.busan.orora.user.service.UserService;

import jakarta.servlet.Filter;

/**
 * 이메일 인증 도입 전까지 비밀번호 재설정이 막혀 있는지 확인합니다.
 * 실제 Spring Security 필터 체인을 통과시켜, 로그인하지 않은 사용자 기준으로 확인합니다.
 */
@SpringBootTest
class ResetPasswordBlockedTest {

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
    void 아이디와_새_비밀번호를_보내도_비밀번호를_바꾸지_않는다() throws Exception {
        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"loginId\":\"admin\",\"newPassword\":\"newpassword1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("비밀번호 재설정 기능을 일시적으로 이용할 수 없습니다."));

        verifyNoInteractions(userService);
    }

    @Test
    void 재설정_화면은_입력을_막고_안내_문구를_보여_준다() throws Exception {
        mockMvc.perform(get("/pages/login/reset-password"))
                .andExpect(status().isOk())
                .andExpect(content().string(allOf(
                        containsString("비밀번호 재설정 기능을 일시적으로 이용할 수 없습니다."),
                        matchesPattern("(?s).*id=\"loginId\"\\s+disabled.*"),
                        matchesPattern("(?s).*id=\"newPassword\"\\s+disabled.*"),
                        matchesPattern("(?s).*id=\"confirmPassword\"\\s+disabled.*"),
                        matchesPattern("(?s).*id=\"resetPasswordBtn\"\\s+disabled.*"))));
    }
}
