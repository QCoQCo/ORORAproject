package com.busan.orora.region.controller;

import org.springframework.web.bind.annotation.RestController;

import com.busan.orora.region.dto.RegionDto;
import com.busan.orora.region.dto.SearchSpotsByRegionDto;
import com.busan.orora.region.service.RegionService;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/api/regions")
public class RegionController {

    private final RegionService regionService;

    public RegionController(RegionService regionService) {
        this.regionService = regionService;
    }

    // 전체 지역구 목록 조회
    @GetMapping
    public ResponseEntity<List<RegionDto>> getAllRegions() {
        return ResponseEntity.ok(regionService.getAllRegions());
    }

    // 선택한 지역구들의 관광지 목록 조회
    @GetMapping("/spots")
    public ResponseEntity<List<SearchSpotsByRegionDto>> getSpotsByRegions(
        @RequestParam("regionIds") List<Long> regionIds) {
        return ResponseEntity.ok(
            regionService.searchSpotsByRegionIds(regionIds)
        );
    }
    
}