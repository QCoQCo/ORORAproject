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

    // 데이터 전송 (태그 검색용 별도 엔드포인트)
    @GetMapping("/api/tag-spots")
    @ResponseBody
    public Map<String, Object> getAllHashtagsApi() {
        List<HashtagDto> hashtagDtos = hashtagService.getAllHashtags();
        List<HashtagDto> spotHashtags = hashtagService.getTouristSpotHashtags();
        
        
        Map<String, List<Map<String, Object>>> groupingMap = new HashMap<>();
        

        for (HashtagDto dto : spotHashtags) {
            Map<String, Object> spot = new HashMap<>();

            String hashtagsImages = dto.getImageUrl();
            if (hashtagsImages != null && !hashtagsImages.isEmpty()) {
                String[] imgArray = hashtagsImages.split(", ");
                spot.put("imageUrl", imgArray);
            } else {
                spot.put("imageUrl", "/default-image.png");
            }
            spot.put("imageUrl", dto.getImageUrl());
            spot.put("id", dto.getId());
            spot.put("title", dto.getTitle());      
            spot.put("description", dto.getDescription()); 
            
            if (dto.getHashtagList() != null && !dto.getHashtagList().isEmpty()) {
                spot.put("hashtags", dto.getHashtagList().split(", "));
            } else {
                spot.put("hashtags", new String[]{});
            }
            
            String regionName = (dto.getRegionsName() != null) ? dto.getRegionsName() : "기타";

            if (!groupingMap.containsKey(regionName)) {
                groupingMap.put(regionName, new ArrayList<>());
            }
            groupingMap.get(regionName).add(spot);    
        }
        
        List<Map<String, Object>> regionsList = new ArrayList<>();

        for (String rName : groupingMap.keySet()) {
            Map<String, Object> regionData = new HashMap<>();
            regionData.put("name", rName);
            regionData.put("spots", groupingMap.get(rName));
            regionsList.add(regionData);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("allHashtags", hashtagDtos);
        response.put("regions", regionsList);
        
        return response;
    }
}
