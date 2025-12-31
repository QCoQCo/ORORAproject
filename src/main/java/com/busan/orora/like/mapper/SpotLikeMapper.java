package com.busan.orora.like.mapper;

import com.busan.orora.like.dto.SpotLikeDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SpotLikeMapper {
    SpotLikeDto findLikeByUserAndSpot(@Param("userId") Long userId, @Param("spotId") Long spotId);
    int countLikesBySpotId(@Param("spotId") Long spotId);
    void insertLike(SpotLikeDto likeDto);
    void deleteLike(@Param("userId") Long userId, @Param("spotId") Long spotId);
}
