package com.busan.orora.like.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.busan.orora.like.service.ReviewLikeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewLikeController {

    private final ReviewLikeService reviewLikeService;

    /**
     * 리뷰 좋아요 상태 조회
     * GET /api/reviews/{reviewId}/like?userId={userId}
     */
    @GetMapping("/{reviewId}/like")
    public ResponseEntity<?> getReviewLikeStatus(
            @PathVariable Long reviewId,
            @RequestParam Long userId) {

        boolean liked = reviewLikeService.existsReviewLike(userId, reviewId);
        int likeCount = reviewLikeService.countReviewLikesByReviewId(reviewId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("liked", liked);
        response.put("likeCount", likeCount);

        return ResponseEntity.ok(response);
    }

    /**
     * 리뷰 좋아요 토글
     * POST /api/reviews/{reviewId}/like?userId={userId}
     */
    @PostMapping("/{reviewId}/like")
    public ResponseEntity<?> toggleReviewLike(
            @PathVariable Long reviewId,
            @RequestParam Long userId) {

        boolean liked = reviewLikeService.toggleReviewLike(userId, reviewId);
        int likeCount = reviewLikeService.countReviewLikesByReviewId(reviewId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("liked", liked);
        response.put("likeCount", likeCount);

        return ResponseEntity.ok(response);
    }
}
