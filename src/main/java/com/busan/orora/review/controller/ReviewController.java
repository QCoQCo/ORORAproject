package com.busan.orora.review.controller;

import com.busan.orora.review.dto.ReviewDto;
import com.busan.orora.review.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    /**
     * 관광지별 리뷰 목록 조회
     * GET /api/reviews?touristSpotId={spotId}
     */
    @GetMapping("/reviews")
    @ResponseBody
    public Map<String, Object> getReviewsBySpotId(@RequestParam Long touristSpotId) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Map<String, Object>> reviews = reviewService.getReviewsBySpotId(touristSpotId);

            response.put("success", true);
            response.put("content", reviews);
            response.put("totalElements", reviews.size());
            response.put("totalPages", 1);
            response.put("currentPage", 0);

            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "리뷰를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
            return response;
        }
    }

    /**
     * 리뷰 작성
     * POST /api/reviews
     * 요청 본문: { "touristSpotId": 1, "title": "제목", "content": "내용", "rating": 5, "userId": 1 }
     */
    @PostMapping("/reviews")
    @ResponseBody
    public Map<String, Object> createReview(@RequestBody Map<String, Object> requestBody) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 요청 본문에서 데이터 추출
            Long userId = null;
            if (requestBody.containsKey("userId")) {
                Object userIdObj = requestBody.get("userId");
                if (userIdObj instanceof Number) {
                    userId = ((Number) userIdObj).longValue();
                } else if (userIdObj instanceof String) {
                    userId = Long.parseLong((String) userIdObj);
                }
            }

            Long touristSpotId = null;
            if (requestBody.containsKey("touristSpotId")) {
                Object spotIdObj = requestBody.get("touristSpotId");
                if (spotIdObj instanceof Number) {
                    touristSpotId = ((Number) spotIdObj).longValue();
                } else if (spotIdObj instanceof String) {
                    touristSpotId = Long.parseLong((String) spotIdObj);
                }
            }

            String title = (String) requestBody.get("title");
            String content = (String) requestBody.get("content");
            Integer rating = null;
            if (requestBody.containsKey("rating")) {
                Object ratingObj = requestBody.get("rating");
                if (ratingObj instanceof Number) {
                    rating = ((Number) ratingObj).intValue();
                } else if (ratingObj instanceof String) {
                    rating = Integer.parseInt((String) ratingObj);
                }
            }

            // 유효성 검사
            if (userId == null) {
                response.put("success", false);
                response.put("message", "사용자 ID가 필요합니다.");
                return response;
            }
            if (touristSpotId == null) {
                response.put("success", false);
                response.put("message", "관광지 ID가 필요합니다.");
                return response;
            }
            if (title == null || title.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "제목을 입력해주세요.");
                return response;
            }
            if (content == null || content.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "내용을 입력해주세요.");
                return response;
            }
            if (rating == null || rating < 1 || rating > 5) {
                response.put("success", false);
                response.put("message", "평점은 1~5 사이의 값이어야 합니다.");
                return response;
            }

            // ReviewDto 생성
            ReviewDto reviewDto = new ReviewDto();
            reviewDto.setUserId(userId);
            reviewDto.setTouristSpotId(touristSpotId);
            reviewDto.setTitle(title.trim());
            reviewDto.setContent(content.trim());
            reviewDto.setRating(rating);
            reviewDto.setIsApproved(true);

            // 리뷰 생성
            ReviewDto createdReview = reviewService.createReview(reviewDto);

            response.put("success", true);
            response.put("message", "리뷰가 성공적으로 등록되었습니다.");
            response.put("review", createdReview);

            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "리뷰 작성 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
            return response;
        }
    }
}
