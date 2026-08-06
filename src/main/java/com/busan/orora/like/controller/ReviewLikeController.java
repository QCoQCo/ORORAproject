package com.busan.orora.like.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.busan.orora.common.util.SessionUtil;
import com.busan.orora.like.service.ReviewLikeService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewLikeController {

    private final ReviewLikeService reviewLikeService;

    /**
     * 리뷰 좋아요 상태 조회
     * GET /api/reviews/{reviewId}/like
     */
    @GetMapping("/{reviewId}/like")
    public ResponseEntity<?> getReviewLikeStatus(
            @PathVariable Long reviewId,
            HttpServletRequest request) {

        // 좋아요 주체는 요청 값이 아닌 세션에서 확인
        Long userId = SessionUtil.getLoginUserId(request);
        boolean liked = userId != null && reviewLikeService.existsReviewLike(userId, reviewId);
        int likeCount = reviewLikeService.countReviewLikesByReviewId(reviewId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("liked", liked);
        response.put("likeCount", likeCount);

        return ResponseEntity.ok(response);
    }

    /**
     * 리뷰 좋아요 토글
     * POST /api/reviews/{reviewId}/like
     */
    @PostMapping("/{reviewId}/like")
    public ResponseEntity<?> toggleReviewLike(
            @PathVariable Long reviewId,
            HttpServletRequest request) {

        // 좋아요 주체는 요청 값이 아닌 세션에서 확인
        Long userId = SessionUtil.getLoginUserId(request);
        if (userId == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "로그인이 필요합니다.");
            return ResponseEntity.status(401).body(error);
        }

        boolean liked = reviewLikeService.toggleReviewLike(userId, reviewId);
        int likeCount = reviewLikeService.countReviewLikesByReviewId(reviewId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("liked", liked);
        response.put("likeCount", likeCount);

        return ResponseEntity.ok(response);
    }
}
