package com.busan.orora.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import com.busan.orora.user.mapper.UserMapper;
import org.springframework.stereotype.Service;
import com.busan.orora.user.dto.UserDto;

@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;

    public void insertUser(UserDto userDto) {
        userMapper.insertUser(userDto);
    }

}
