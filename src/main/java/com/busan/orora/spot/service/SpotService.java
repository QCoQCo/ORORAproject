package com.busan.orora.spot.service;

import com.busan.orora.hashtag.dto.HashtagDto;
import com.busan.orora.hashtag.service.HashtagService;
import com.busan.orora.region.dto.RegionDto;
import com.busan.orora.region.service.RegionService;
import com.busan.orora.review.service.ReviewService;
import com.busan.orora.spot.dto.SpotDto;
import com.busan.orora.spot.dto.SpotImageDto;
import com.busan.orora.spot.mapper.SpotMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SpotService {
    @Autowired
    private SpotMapper spotMapper;

    @Autowired
    private RegionService regionService;

    @Autowired
    private HashtagService hashtagService;

    @Autowired
    private SpotImageService spotImageService;

    @Autowired
    private ReviewService reviewService;

    public List<SpotDto> getAllSpots() {
        return spotMapper.findAllSpots();
    }

    public List<SpotDto> getSpotsByRegion(Long regionId) {
        return spotMapper.findSpotsByRegion(regionId);
    }

    public SpotDto getSpotById(Long id) {
        return spotMapper.findSpotById(id);
    }

    @Transactional
    public SpotDto addSpot(SpotDto spotDto) {
        if (spotDto.getViewCount() == null) {
            spotDto.setViewCount(0);
        }
        if (spotDto.getIsActive() == null) {
            spotDto.setIsActive(true);
        }
        spotMapper.insertSpot(spotDto);
        return spotDto;
    }

    @Transactional
    public SpotDto updateSpot(SpotDto spotDto) {
        spotMapper.updateSpot(spotDto);
        return spotMapper.findSpotById(spotDto.getId());
    }

    @Transactional
    public void deleteSpot(Long id) {
        spotMapper.deleteSpot(id);
    }

    /**
     * 모든 활성화된 관광지를 지역별로 그룹화하여 반환
     * 
     * @return 지역별로 그룹화된 관광지 데이터
     */
    public Map<String, Object> getAllSpotsGroupedByRegion() {
        // 1. 모든 활성화된 Spot 조회
        List<SpotDto> spots = spotMapper.findAllSpots();

        // 2. 각 Spot에 추가 정보 조회 및 그룹화
        // 먼저 region별로 그룹화하기 위한 임시 맵 (area_code -> region 정보)
        Map<Integer, RegionDto> regionMap = new HashMap<>();
        Map<Integer, List<Map<String, Object>>> regionSpotsMap = new HashMap<>();

        for (SpotDto spot : spots) {
            // 2-1. Region 정보 조회
            RegionDto region = regionService.getRegionById(spot.getRegionId());
            if (region == null) {
                continue; // 지역 정보가 없으면 건너뛰기
            }

            // region 정보 저장
            if (!regionMap.containsKey(region.getAreaCode())) {
                regionMap.put(region.getAreaCode(), region);
                regionSpotsMap.put(region.getAreaCode(), new ArrayList<>());
            }

            // 2-2. Hashtag 목록 조회
            List<HashtagDto> hashtagDtos = hashtagService.getHashtagsBySpotId(spot.getId());
            List<String> hashtags = hashtagDtos.stream()
                    .map(HashtagDto::getName)
                    .collect(Collectors.toList());

            // 2-3. 대표 이미지 URL 조회
            List<SpotImageDto> images = spotImageService.getImagesBySpotId(spot.getId());
            String imageUrl = images.stream()
                    .filter(img -> "Y".equals(img.getRepImgYn()))
                    .findFirst()
                    .map(SpotImageDto::getImageUrl)
                    .orElse(null);

            // 2-4. 평점 정보 조회
            Double ratingAvg = reviewService.getAverageRating(spot.getId());
            Integer ratingCount = reviewService.getRatingCount(spot.getId());

            // 2-5. Spot 데이터 구성
            Map<String, Object> spotData = new HashMap<>();
            spotData.put("id", spot.getId());
            spotData.put("title", spot.getTitle());
            spotData.put("description", spot.getDescription());
            spotData.put("hashtags", hashtags);
            spotData.put("imageUrl", imageUrl);
            spotData.put("linkUrl", spot.getLinkUrl());
            spotData.put("category", spot.getCategoryCode());
            spotData.put("isActive", spot.getIsActive());
            spotData.put("viewCount", spot.getViewCount());
            spotData.put("ratingAvg", ratingAvg != null ? ratingAvg : 0.0);
            spotData.put("ratingCount", ratingCount != null ? ratingCount : 0);

            // 2-6. Region별로 그룹화
            regionSpotsMap.get(region.getAreaCode()).add(spotData);
        }

        // 3. area_code 순서대로 정렬하여 "area01", "area02" 형식의 키로 변환
        Map<String, Object> regionsMap = new LinkedHashMap<>();
        List<Integer> sortedAreaCodes = new ArrayList<>(regionMap.keySet());
        sortedAreaCodes.sort(Integer::compareTo);

        int index = 1;
        for (Integer areaCode : sortedAreaCodes) {
            RegionDto region = regionMap.get(areaCode);
            String areaKey = "area" + String.format("%02d", index);

            Map<String, Object> regionData = new HashMap<>();
            regionData.put("name", region.getName());
            regionData.put("code", String.valueOf(region.getAreaCode()));
            regionData.put("spots", regionSpotsMap.get(areaCode));

            regionsMap.put(areaKey, regionData);
            index++;
        }

        // 4. 응답 형식에 맞게 변환
        Map<String, Object> response = new HashMap<>();
        response.put("regions", regionsMap);

        return response;
    }
}
