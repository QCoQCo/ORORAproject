package com.busan.orora.review.mapper;

import com.busan.orora.review.dto.ReviewDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ReviewMapper {
    List<ReviewDto> findReviewsBySpotId(@Param("spotId") Long spotId);
    List<ReviewDto> findReviewsByUserId(@Param("userId") Long userId);
    ReviewDto findReviewById(@Param("id") Long id);
    void insertReview(ReviewDto reviewDto);
    void updateReview(ReviewDto reviewDto);
    void deleteReview(@Param("id") Long id);
}
