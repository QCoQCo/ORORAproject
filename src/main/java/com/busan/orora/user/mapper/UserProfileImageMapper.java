package com.busan.orora.user.mapper;

import com.busan.orora.user.dto.UserProfileImageDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface UserProfileImageMapper {
    List<UserProfileImageDto> findImagesByUserId(@Param("userId") Long userId);
    UserProfileImageDto findRepImageByUserId(@Param("userId") Long userId);
    void insertImage(UserProfileImageDto imageDto);
    void deleteImage(@Param("id") Long id);
    void deleteImagesByUserId(@Param("userId") Long userId);
}
