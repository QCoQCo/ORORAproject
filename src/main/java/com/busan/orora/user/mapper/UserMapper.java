package com.busan.orora.user.mapper;

import com.busan.orora.user.dto.UserDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface UserMapper {
    void insertUser(UserDto userDto);
    UserDto findByLoginId(String loginId);
    int countByLoginId(String loginId);
    int countByEmail(String email);
    void updateLastLogin(@Param("id") Long id, @Param("lastLogin") LocalDateTime lastLogin);
    List<UserDto> findAllUsers();
    UserDto findById(@Param("id") Long id);
    void updateProfileImage(@Param("id") Long id, @Param("profileImage") String profileImage);
    void updateUser(UserDto userDto);
}
