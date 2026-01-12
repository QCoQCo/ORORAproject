package com.busan.orora.region.controller;

import org.springframework.web.bind.annotation.RestController;

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

    // JSON API
    // @GetMapping("/{regionId}/spots")
    // public List<SearchSpotsByRegionDto> getSpots(@PathVariable Long regionId) {
    //     return regionService.searchSpotsByRegion(regionId);
    // }

    @GetMapping("/spots")
    public ResponseEntity<List<SearchSpotsByRegionDto>> getSpotsByRegions(
            @RequestParam("regionIds") List<Integer> regionIds
    ) {
        return ResponseEntity.ok(
            regionService.searchSpotsByRegionIds(regionIds)
        );
    }

    // 모든 지역 목록 조회
    @GetMapping
    public ResponseEntity<List<com.busan.orora.region.dto.RegionDto>> getAllRegions() {
        return ResponseEntity.ok(regionService.getAllRegions());
    }
    
    
}