package com.busan.orora.spot.service;

import com.busan.orora.hashtag.dto.HashtagDto;
import com.busan.orora.hashtag.service.HashtagService;
import com.busan.orora.region.dto.RegionDto;
import com.busan.orora.region.service.RegionService;
import com.busan.orora.review.dto.RatingStat;
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
import java.util.Set;
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
        if (spots.isEmpty()) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("regions", new HashMap<>());
            return empty;
        }

        // spotId, regionId 목록 추출
        List<Long> spotIds = spots.stream()
                .map(SpotDto::getId)
                .toList();
        Set<Long> regionIds = spots.stream()
                .map(SpotDto::getRegionId)
                .collect(Collectors.toSet());

        // 2. 배치 조회: 지역, 해시태그, 이미지, 평점
        Map<Long, RegionDto> regionsById = regionService.getAllRegions().stream()
                .filter(r -> regionIds.contains(r.getId()))
                .collect(Collectors.toMap(RegionDto::getId, r -> r));

        Map<Long, List<String>> hashtagsBySpotId = new HashMap<>();
        for (HashtagDto dto : hashtagService.getHashtagsBySpotIds(spotIds)) {
            if (dto.getTouristSpotId() == null)
                continue;
            hashtagsBySpotId
                    .computeIfAbsent(dto.getTouristSpotId(), k -> new ArrayList<>())
                    .add(dto.getName());
        }

        Map<Long, String> repImageBySpotId = new HashMap<>();
        for (SpotImageDto img : spotImageService.getRepImagesBySpotIds(spotIds)) {
            if (img.getTouristSpotId() == null)
                continue;
            // 이미지 URL 정규화 (../../images/ -> /images/)
            String imageUrl = img.getImageUrl();
            if (imageUrl != null) {
                if (imageUrl.startsWith("../../images/")) {
                    imageUrl = "/images/" + imageUrl.substring("../../images/".length());
                } else if (imageUrl.startsWith("../images/")) {
                    imageUrl = "/images/" + imageUrl.substring("../images/".length());
                } else if (!imageUrl.startsWith("/")) {
                    imageUrl = "/images/" + imageUrl;
                }
            }
            // 첫 번째 rep 이미지만 사용
            repImageBySpotId.putIfAbsent(img.getTouristSpotId(), imageUrl);
        }

        Map<Long, RatingStat> ratingBySpotId = new HashMap<>();
        for (RatingStat stat : reviewService.getRatingStatsBySpotIds(spotIds)) {
            if (stat.getTouristSpotId() != null) {
                ratingBySpotId.put(stat.getTouristSpotId(), stat);
            }
        }

        // 3. 지역별 그룹화
        Map<Integer, List<Map<String, Object>>> regionSpotsMap = new HashMap<>();
        Map<Integer, RegionDto> regionAreaCodeMap = new HashMap<>();

        for (SpotDto spot : spots) {
            RegionDto region = regionsById.get(spot.getRegionId());
            if (region == null)
                continue;

            regionAreaCodeMap.putIfAbsent(region.getAreaCode(), region);
            regionSpotsMap.computeIfAbsent(region.getAreaCode(), k -> new ArrayList<>());

            List<String> hashtags = hashtagsBySpotId.getOrDefault(spot.getId(), List.of());
            String imageUrl = repImageBySpotId.getOrDefault(spot.getId(), null);
            RatingStat ratingStat = ratingBySpotId.get(spot.getId());

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
            spotData.put("ratingAvg", ratingStat != null ? ratingStat.getRatingAvg() : 0.0);
            spotData.put("ratingCount", ratingStat != null ? ratingStat.getRatingCount() : 0);

            regionSpotsMap.get(region.getAreaCode()).add(spotData);
        }

        // 4. area_code 순서대로 정렬하여 "area01", "area02" 키 생성
        Map<String, Object> regionsMap = new LinkedHashMap<>();
        List<Integer> sortedAreaCodes = new ArrayList<>(regionSpotsMap.keySet());
        sortedAreaCodes.sort(Integer::compareTo);

        int index = 1;
        for (Integer areaCode : sortedAreaCodes) {
            RegionDto region = regionAreaCodeMap.get(areaCode);
            if (region == null)
                continue;
            String areaKey = "area" + String.format("%02d", index);

            Map<String, Object> regionData = new HashMap<>();
            regionData.put("name", region.getName());
            regionData.put("code", String.valueOf(region.getAreaCode()));
            regionData.put("spots", regionSpotsMap.get(areaCode));

            regionsMap.put(areaKey, regionData);
            index++;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("regions", regionsMap);
        return response;
    }
}
