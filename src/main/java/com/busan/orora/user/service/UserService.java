package com.busan.orora.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import com.busan.orora.user.mapper.UserMapper;
import org.springframework.stereotype.Service;
import com.busan.orora.user.dto.UserDto;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;
    
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public void insertUser(UserDto userDto, String rawPassword) {
        // 비밀번호 암호화
        userDto.setPasswordHash(passwordEncoder.encode(rawPassword));
        
        // 기본값 설정
        if (userDto.getRoleCode() == null || userDto.getRoleCode().isEmpty()) {
            userDto.setRoleCode("MEMBER");
        }
        if (userDto.getStatusCode() == null || userDto.getStatusCode().isEmpty()) {
            userDto.setStatusCode("ACTIVE");
        }
        if (userDto.getJoinDate() == null) {
            userDto.setJoinDate(LocalDateTime.now());
        }
        
        userMapper.insertUser(userDto);
    }

    public UserDto login(String loginId, String password) {
        UserDto user = userMapper.findByLoginId(loginId);
        
        if (user != null && passwordEncoder.matches(password, user.getPasswordHash())) {
            // 마지막 로그인 시간 업데이트
            user.setLastLogin(LocalDateTime.now());
            userMapper.updateLastLogin(user.getId(), user.getLastLogin());
            return user;
        }
        
        return null;
    }

    public boolean isLoginIdExists(String loginId) {
        return userMapper.countByLoginId(loginId) > 0;
    }

    public boolean isEmailExists(String email) {
        return userMapper.countByEmail(email) > 0;
    }

    public List<UserDto> getAllUsers() {
        return userMapper.findAllUsers();
    }
}
