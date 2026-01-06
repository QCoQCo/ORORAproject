package com.busan.orora.like.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.busan.orora.like.dto.SearchSpotLikeListByUserDto;
import com.busan.orora.like.service.SpotLikeService;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class SpotLikeController {
    // TODO: 관광지 좋아요 관련 API 구현

    private final SpotLikeService spotLikeService;

    @GetMapping("/{userId}/liked-spots")
    public ResponseEntity<Map<String, Object>> searchSpotLikeListByUser(@PathVariable Long userId) {

        List<SearchSpotLikeListByUserDto> likes = spotLikeService.searchSpotLikeListByUser(userId);

        return ResponseEntity.ok(
            Map.of(
                "success", true,
                "likes", likes
            )
        );
    }
    
}
