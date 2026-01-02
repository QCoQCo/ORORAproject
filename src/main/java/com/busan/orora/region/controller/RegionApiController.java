package com.busan.orora.region.controller;

import org.springframework.web.bind.annotation.RestController;

import com.busan.orora.region.dto.SearchSpotsByRegionDto;
import com.busan.orora.region.service.RegionService;


import org.springframework.ui.Model;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/api/regions")
public class RegionApiController {

    private final RegionService regionService;

    public RegionApiController(RegionService regionService) {
        this.regionService = regionService;
    }

    // ✅ JSON API
    @GetMapping("/{regionId}/spots")
    public List<SearchSpotsByRegionDto> getSpots(@PathVariable Long regionId) {
        return regionService.searchSpotsByRegion(regionId);
    }
}