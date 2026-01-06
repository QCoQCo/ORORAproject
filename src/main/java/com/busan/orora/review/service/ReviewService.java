package com.busan.orora.review.service;

import com.busan.orora.review.dto.RatingStat;
import com.busan.orora.review.dto.ReviewDto;
import com.busan.orora.review.mapper.ReviewMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {
    @Autowired
    private ReviewMapper reviewMapper;

    public List<Map<String, Object>> getReviewsBySpotId(Long spotId) {
        return reviewMapper.findReviewsBySpotId(spotId);
    }

    public List<ReviewDto> getReviewsByUserId(Long userId) {
        return reviewMapper.findReviewsByUserId(userId);
    }

    public ReviewDto getReviewById(Long id) {
        return reviewMapper.findReviewById(id);
    }

    /**
     * 관광지별 평균 평점 조회
     * @param spotId 관광지 ID
     * @return 평균 평점 (리뷰가 없으면 0.0)
     */
    public Double getAverageRating(Long spotId) {
        return reviewMapper.getAverageRating(spotId);
    }

    /**
     * 관광지별 평점 개수 조회
     * @param spotId 관광지 ID
     * @return 평점 개수
     */
    public Integer getRatingCount(Long spotId) {
        return reviewMapper.getRatingCount(spotId);
    }

    /**
     * 여러 관광지의 평점 통계를 한번에 조회
     */
    public List<RatingStat> getRatingStatsBySpotIds(List<Long> spotIds) {
        if (spotIds == null || spotIds.isEmpty()) {
            return List.of();
        }
        List<Map<String, Object>> rows = reviewMapper.getRatingStatsBySpotIds(spotIds);
        List<RatingStat> stats = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            Long id = row.get("touristSpotId") != null ? ((Number) row.get("touristSpotId")).longValue() : null;
            Double avg = row.get("ratingAvg") != null ? ((Number) row.get("ratingAvg")).doubleValue() : 0.0;
            Integer cnt = row.get("ratingCount") != null ? ((Number) row.get("ratingCount")).intValue() : 0;
            stats.add(new RatingStat(id, avg, cnt));
        }
        return stats;
    }
}
