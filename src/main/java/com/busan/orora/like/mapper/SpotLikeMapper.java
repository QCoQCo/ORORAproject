package com.busan.orora.like.mapper;

import com.busan.orora.like.dto.SearchSpotLikeListByUserDto;
import com.busan.orora.like.dto.SpotLikeDto;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SpotLikeMapper {
    int addSpotLike(SpotLikeDto likeDto);
    int deleteSpotLike(SpotLikeDto likeDto);
    int existsSpotLike(@Param("userId") Long userId, @Param("spotId") Long spotId);
    List<SearchSpotLikeListByUserDto> searchSpotLikeListByUser(@Param("userId") Long userId);
    Integer countSpotLikesBySpotId(@Param("spotId") Long spotId);
}
