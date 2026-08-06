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
import com.busan.orora.like.service.SpotLikeService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tourist-spots")
@RequiredArgsConstructor
public class SpotLikeController {

    private final SpotLikeService spotLikeService;
    
    @GetMapping("/{spotId}/like")
    public ResponseEntity<?> existsSpotLike(
            @PathVariable Long spotId,
            HttpServletRequest request) {

        int likeCount = spotLikeService.countSpotLikesBySpotId(spotId);

        // 좋아요 주체는 요청 값이 아닌 세션에서 확인
        Long userId = SessionUtil.getLoginUserId(request);
        boolean liked = false;
        if (userId != null) {
            liked = spotLikeService.existsSpotLike(userId, spotId);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("likeCount", likeCount);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{spotId}/like")
    public ResponseEntity<?> toggleSpotLike(@PathVariable Long spotId
                                            ,HttpServletRequest request) {

        // 좋아요 주체는 요청 값이 아닌 세션에서 확인
        Long userId = SessionUtil.getLoginUserId(request);
        if (userId == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "로그인이 필요합니다.");
            return ResponseEntity.status(401).body(error);
        }

        boolean liked = spotLikeService.toggleSpotLike(userId, spotId);
        int likeCount = spotLikeService.countSpotLikesBySpotId(spotId);

        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("likeCount", likeCount);

        return ResponseEntity.ok(response);
    }

}
