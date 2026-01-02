package com.busan.orora.region.service;

import com.busan.orora.region.dto.RegionDto;
import com.busan.orora.region.dto.SearchSpotsByRegionDto;
import com.busan.orora.region.mapper.RegionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RegionService {
    @Autowired
    private RegionMapper regionMapper;

    public List<RegionDto> getAllRegions() {
        return regionMapper.findAllRegions();
    }

    public RegionDto getRegionById(Long id) {
        return regionMapper.findRegionById(id);
    }

    public RegionDto getRegionByAreaCode(Integer areaCode) {
        return regionMapper.findRegionByAreaCode(areaCode);
    }

    public List<SearchSpotsByRegionDto> searchSpotsByRegion(Long regionId) {
        

        return regionMapper.searchSpotsByRegion(regionId);
    };

    public List<SearchSpotsByRegionDto> searchSpotsByRegionIds(List<Long> regionIds) {
        return regionMapper.searchSpotsByRegionIds(regionIds);
    };
}
