package com.busan.orora.user.mapper;

import com.busan.orora.user.dto.UserDto;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
    void insertUser(UserDto userDto);
}
