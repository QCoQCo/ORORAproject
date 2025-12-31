package com.busan.orora.like.service;

import com.busan.orora.like.dto.SpotLikeDto;
import com.busan.orora.like.mapper.SpotLikeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
