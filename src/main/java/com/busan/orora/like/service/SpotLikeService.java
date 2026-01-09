package com.busan.orora.like.service;

import com.busan.orora.like.dto.SearchSpotLikeListByUserDto;
import com.busan.orora.like.dto.SpotLikeDto;
import com.busan.orora.like.mapper.SpotLikeMapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SpotLikeService {
    @Autowired
    private SpotLikeMapper spotLikeMapper;

    public boolean isLiked(Long userId, Long spotId) {
        return spotLikeMapper.findLikeByUserAndSpot(userId, spotId) != null;
    }

    public int getLikeCount(Long spotId) {
        return spotLikeMapper.countLikesBySpotId(spotId);
    }

    public int addSpotLike(SpotLikeDto likeDto) {
        return spotLikeMapper.addSpotLike(likeDto);
    };

    public int deleteSpotLike(SpotLikeDto likeDto) {
        return spotLikeMapper.deleteSpotLike(likeDto);
    };

    public boolean existsSpotLike(Long userId, Long spotId) {
        return spotLikeMapper.existsSpotLike(userId, spotId) > 0;
    }

    @Transactional
    public boolean toggleSpotLike(Long userId, Long spotId) {

        SpotLikeDto dto = new SpotLikeDto(userId, spotId);

        if (existsSpotLike(userId, spotId)) {
            deleteSpotLike(dto);
            return false; // 좋아요 취소
        } else {
            addSpotLike(dto);
            return true; // 좋아요 추가
        }
    }

    public List<SearchSpotLikeListByUserDto> searchSpotLikeListByUser(Long userId) {
        return spotLikeMapper.searchSpotLikeListByUser(userId);
    };

    public int countSpotLikesBySpotId(Long spotId) {
        Integer count = spotLikeMapper.countSpotLikesBySpotId(spotId);
        return count != null ? count : 0;
    };
}
