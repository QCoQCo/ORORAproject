package com.busan.orora.like.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.busan.orora.like.dto.ReviewLikeDto;

@Mapper
public interface ReviewLikeMapper {
    
    // 리뷰 좋아요 추가
    int addReviewLike(ReviewLikeDto reviewLikeDto);
    
    // 리뷰 좋아요 삭제
    int deleteReviewLike(ReviewLikeDto reviewLikeDto);
    
    // 리뷰 좋아요 존재 여부 확인
    int existsReviewLike(@Param("userId") Long userId, @Param("reviewId") Long reviewId);
    
    // 리뷰 좋아요 수 조회
    int countReviewLikesByReviewId(@Param("reviewId") Long reviewId);
}
