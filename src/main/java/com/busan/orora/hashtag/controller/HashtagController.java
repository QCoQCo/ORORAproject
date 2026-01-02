package com.busan.orora.hashtag.controller;

import com.busan.orora.hashtag.dto.HashtagDto;
import com.busan.orora.hashtag.service.HashtagService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class HashtagController {

    @Autowired
    private HashtagService hashtagService;

    // 화면
    @GetMapping("/tourist-spots")
    public String getTagPage(Model model) {
        return "pages/search-place/tag";
    }

    // 데이터 전송
    @GetMapping("/api/tourist-spots")
    @ResponseBody
    public Map<String, Object> getAllHashtagsApi() {
        List<HashtagDto> hashtagDtos = hashtagService.getAllHashtags();
        
        List<Map<String, Object>> regionsList = new ArrayList<>();
        
        Map<String, Object> regionMap = new HashMap<>();
        regionMap.put("name", "전체");
        
        List<Map<String, Object>> spotsList = new ArrayList<>();
        
        for (HashtagDto dto : hashtagDtos) {
            Map<String, Object> spot = new HashMap<>();
            
            spot.put("title", dto.getName());      
            spot.put("hashtags", List.of(dto.getName())); 
            spot.put("region", "부산");               
            spot.put("description", "추천 장소입니다."); 
            
            spotsList.add(spot);
        }
        
        regionMap.put("spots", spotsList);
        regionsList.add(regionMap);
        
        Map<String, Object> response = new HashMap<>();
        response.put("regions", regionsList);
        
        return response;
    }
}
