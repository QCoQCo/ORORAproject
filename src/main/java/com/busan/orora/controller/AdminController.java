package com.busan.orora.controller;

import com.busan.orora.spot.dto.SpotDto;
import com.busan.orora.spot.service.SpotService;
import com.busan.orora.user.dto.UserDto;
import com.busan.orora.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    private SpotService spotService;

    @Autowired
    private UserService userService;

    // 관광지 목록 조회
    @GetMapping("/tourist-spots")
    @ResponseBody
    public Map<String, Object> getTouristSpots() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<SpotDto> spots = spotService.getAllSpots();
            response.put("success", true);
            response.put("spots", spots);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "관광지 목록을 불러오는데 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 사용자 목록 조회
    @GetMapping("/users")
    @ResponseBody
    public Map<String, Object> getUsers() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<UserDto> users = userService.getAllUsers();
            response.put("success", true);
            response.put("users", users);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "사용자 목록을 불러오는데 실패했습니다: " + e.getMessage());
        }
        return response;
    }
}
