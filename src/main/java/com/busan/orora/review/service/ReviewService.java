package com.busan.orora.review.service;

import com.busan.orora.review.dto.ReviewDto;
import com.busan.orora.review.mapper.ReviewMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReviewService {
    @Autowired
    private ReviewMapper reviewMapper;

    public List<ReviewDto> getReviewsBySpotId(Long spotId) {
        return reviewMapper.findReviewsBySpotId(spotId);
    }

    public List<ReviewDto> getReviewsByUserId(Long userId) {
        return reviewMapper.findReviewsByUserId(userId);
    }

    public ReviewDto getReviewById(Long id) {
        return reviewMapper.findReviewById(id);
    }
}
