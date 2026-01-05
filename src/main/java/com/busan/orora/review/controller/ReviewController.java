package com.busan.orora.review.controller;

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
}
