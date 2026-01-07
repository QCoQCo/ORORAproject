package com.busan.orora.like.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.busan.orora.like.dto.SearchSpotLikeListByUserDto;
import com.busan.orora.like.service.SpotLikeService;

import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserLikeController {

    private final SpotLikeService spotLikeService;

    // 마이페이지 좋아요 한 관광지 목록
    @GetMapping("/{userId}/liked-spots")
    public ResponseEntity<Map<String, Object>> searchSpotLikeListByUser(@PathVariable Long userId) {

        List<SearchSpotLikeListByUserDto> likes = spotLikeService.searchSpotLikeListByUser(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("likes", likes);

        return ResponseEntity.ok(response);
    }

}
