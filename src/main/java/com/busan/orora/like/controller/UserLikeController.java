package com.busan.orora.like.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.busan.orora.common.util.SessionUtil;
import com.busan.orora.like.dto.SearchSpotLikeListByUserDto;
import com.busan.orora.like.service.SpotLikeService;

import jakarta.servlet.http.HttpServletRequest;
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
    public ResponseEntity<Map<String, Object>> searchSpotLikeListByUser(@PathVariable Long userId,
            HttpServletRequest request) {

        // 마이페이지 전용 데이터이므로 본인(또는 관리자)만 조회 가능
        if (!SessionUtil.isSelf(request, userId) && !SessionUtil.isAdmin(request)) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "본인의 좋아요 목록만 조회할 수 있습니다.");
            return ResponseEntity.status(403).body(error);
        }

        List<SearchSpotLikeListByUserDto> likes = spotLikeService.searchSpotLikeListByUser(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("likes", likes);

        return ResponseEntity.ok(response);
    }

}
