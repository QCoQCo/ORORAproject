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

import com.busan.orora.like.service.SpotLikeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tourist-spots")
@RequiredArgsConstructor
public class SpotLikeController {

    private final SpotLikeService spotLikeService;
    
    @GetMapping("/{spotId}/like")
    public ResponseEntity<?> existsSpotLike(
            @PathVariable Long spotId,
            @RequestParam Long userId) {

        boolean liked = spotLikeService.existsSpotLike(userId, spotId);
        int likeCount = spotLikeService.countSpotLikesBySpotId(spotId);

        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("likeCount", likeCount);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{spotId}/like")
    public ResponseEntity<?> toggleSpotLike(@PathVariable Long spotId
                                            ,@RequestParam Long userId) {

        boolean liked = spotLikeService.toggleSpotLike(userId, spotId);
        int likeCount = spotLikeService.countSpotLikesBySpotId(spotId);

        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("likeCount", likeCount);

        return ResponseEntity.ok(response);
    }

}
