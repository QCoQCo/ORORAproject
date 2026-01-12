package com.busan.orora.like.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.busan.orora.like.dto.ReviewLikeDto;
import com.busan.orora.like.mapper.ReviewLikeMapper;

@Service
public class ReviewLikeService {
    
    @Autowired
    private ReviewLikeMapper reviewLikeMapper;

    // 리뷰 좋아요 존재 여부 확인
    public boolean existsReviewLike(Long userId, Long reviewId) {
        return reviewLikeMapper.existsReviewLike(userId, reviewId) > 0;
    }

    // 리뷰 좋아요 추가
    public int addReviewLike(ReviewLikeDto reviewLikeDto) {
        return reviewLikeMapper.addReviewLike(reviewLikeDto);
    }

    // 리뷰 좋아요 삭제
    public int deleteReviewLike(ReviewLikeDto reviewLikeDto) {
        return reviewLikeMapper.deleteReviewLike(reviewLikeDto);
    }

    // 리뷰 좋아요 토글
    @Transactional
    public boolean toggleReviewLike(Long userId, Long reviewId) {
        ReviewLikeDto dto = new ReviewLikeDto(userId, reviewId);

        if (existsReviewLike(userId, reviewId)) {
            deleteReviewLike(dto);
            return false; // 좋아요 취소
        } else {
            addReviewLike(dto);
            return true; // 좋아요 추가
        }
    }

    // 리뷰 좋아요 수 조회
    public int countReviewLikesByReviewId(Long reviewId) {
        Integer count = reviewLikeMapper.countReviewLikesByReviewId(reviewId);
        return count != null ? count : 0;
    }
}
