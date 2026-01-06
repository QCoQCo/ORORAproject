package com.busan.orora.spot.controller;

import com.busan.orora.hashtag.dto.HashtagDto;
import com.busan.orora.hashtag.service.HashtagService;
import com.busan.orora.region.dto.RegionDto;
import com.busan.orora.region.service.RegionService;
import com.busan.orora.spot.dto.SpotDto;
import com.busan.orora.spot.dto.SpotImageDto;
import com.busan.orora.spot.service.SpotImageService;
import com.busan.orora.spot.service.SpotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class SpotController {
    
    @Autowired
    private SpotService spotService;
    
    @Autowired
    private SpotImageService spotImageService;
    
    @Autowired
    private HashtagService hashtagService;
    
    @Autowired
    private RegionService regionService;

    /**
     * 관광지 상세 정보 조회
     * @param id 관광지 ID
     * @return 관광지 상세 정보 (이미지, 해시태그, 지역 정보 포함)
     */
    @GetMapping("/tourist-spots/{id}")
    public ResponseEntity<Map<String, Object>> getTouristSpotDetail(@PathVariable Long id) {
        try {
            // 1. 관광지 기본 정보 조회
            SpotDto spot = spotService.getSpotById(id);
            if (spot == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            // 2. 이미지 목록 조회
            List<SpotImageDto> images = spotImageService.getImagesBySpotId(id);
            
            // 3. 해시태그 목록 조회
            List<HashtagDto> hashtags = hashtagService.getHashtagsBySpotId(id);
            
            // 4. 지역 정보 조회
            RegionDto region = null;
            if (spot.getRegionId() != null) {
                region = regionService.getRegionById(spot.getRegionId());
            }

            // 5. 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("id", spot.getId());
            response.put("title", spot.getTitle());
            response.put("description", spot.getDescription());
            response.put("linkUrl", spot.getLinkUrl());
            response.put("categoryCode", spot.getCategoryCode());
            response.put("isActive", spot.getIsActive());
            response.put("viewCount", spot.getViewCount());
            response.put("createdAt", spot.getCreatedAt());
            response.put("updatedAt", spot.getUpdatedAt());

            // 이미지 배열 구성 (프론트엔드에서 기대하는 형식)
            List<Map<String, Object>> imageList = images.stream()
                .map(img -> {
                    Map<String, Object> imgMap = new HashMap<>();
                    imgMap.put("id", img.getId());
                    imgMap.put("imageUrl", img.getImageUrl());
                    imgMap.put("order", img.getRegTime() != null ? img.getRegTime().toString() : "");
                    return imgMap;
                })
                .collect(Collectors.toList());
            response.put("images", imageList);

            // 해시태그 배열 구성 (이름만 추출)
            List<String> hashtagNames = hashtags.stream()
                .map(HashtagDto::getName)
                .collect(Collectors.toList());
            response.put("hashtags", hashtagNames);

            // 지역 정보 구성
            if (region != null) {
                Map<String, Object> regionMap = new HashMap<>();
                regionMap.put("id", region.getId());
                regionMap.put("name", region.getName());
                regionMap.put("areaCode", region.getAreaCode());
                response.put("region", regionMap);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 모든 활성화된 관광지를 지역별로 그룹화하여 조회
     * @return 지역별로 그룹화된 관광지 데이터
     */
    @GetMapping("/tourist-spots")
    public ResponseEntity<Map<String, Object>> getAllSpotsByRegion() {
        try {
            Map<String, Object> result = spotService.getAllSpotsGroupedByRegion();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

