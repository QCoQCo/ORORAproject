package com.busan.orora.user.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.busan.orora.user.dto.UserDto;
import com.busan.orora.user.mapper.UserMapper;

/**
 * 프로필 수정 검증과 정지 계정의 소셜 로그인 차단 테스트
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    @Test
    void 다른_사용자가_쓰는_이메일로는_프로필을_수정할_수_없다() {
        when(userMapper.findById(1L)).thenReturn(user("me@test.com"));
        when(userMapper.countByEmail("other@test.com")).thenReturn(1);

        IllegalArgumentException e = assertThrows(IllegalArgumentException.class,
                () -> userService.updateUserProfile(1L, profile("홍길동", "other@test.com"), null));

        assertEquals("이미 사용 중인 이메일입니다.", e.getMessage());
        verify(userMapper, never()).updateUser(any());
    }

    @Test
    void 이메일을_바꾸지_않으면_중복_검사_없이_수정된다() throws Exception {
        when(userMapper.findById(1L)).thenReturn(user("me@test.com"));

        userService.updateUserProfile(1L, profile("새이름", "ME@test.com"), null);

        verify(userMapper, never()).countByEmail(any());
        verify(userMapper).updateUser(any());
    }

    @Test
    void 이름이_비어_있으면_수정할_수_없다() {
        when(userMapper.findById(1L)).thenReturn(user("me@test.com"));

        assertThrows(IllegalArgumentException.class,
                () -> userService.updateUserProfile(1L, profile(" ", "me@test.com"), null));
        verify(userMapper, never()).updateUser(any());
    }

    @Test
    void 정지된_계정은_소셜_로그인할_수_없다() {
        when(userMapper.findStatusByEmail("me@test.com")).thenReturn("SUSPENDED");

        assertThrows(IllegalStateException.class,
                () -> userService.createOrUpdateSocialUser("me@test.com", "홍길동", "GOO", "123"));
        verify(userMapper, never()).insertUser(any());
    }

    private UserDto user(String email) {
        UserDto user = new UserDto();
        user.setId(1L);
        user.setUsername("홍길동");
        user.setEmail(email);
        return user;
    }

    private UserDto profile(String username, String email) {
        UserDto dto = new UserDto();
        dto.setUsername(username);
        dto.setEmail(email);
        return dto;
    }
}
