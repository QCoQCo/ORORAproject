package com.busan.orora.review.mapper;

import com.busan.orora.review.dto.ReviewDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Map;

@Mapper
public interface ReviewMapper {
    List<Map<String, Object>> findReviewsBySpotId(@Param("spotId") Long spotId);

    List<ReviewDto> findReviewsByUserId(@Param("userId") Long userId);

    ReviewDto findReviewById(@Param("id") Long id);

    void insertReview(ReviewDto reviewDto);

    void updateReview(ReviewDto reviewDto);

    void deleteReview(@Param("id") Long id);

    Double getAverageRating(@Param("spotId") Long spotId);

    Integer getRatingCount(@Param("spotId") Long spotId);
}
