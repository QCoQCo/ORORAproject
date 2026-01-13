package com.busan.orora.region.mapper;

import com.busan.orora.region.dto.RegionDto;
import com.busan.orora.region.dto.SearchSpotsByRegionDto;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RegionMapper {
    List<RegionDto> findAllRegions();
    RegionDto findRegionById(Long id);
    RegionDto findRegionByAreaCode(Integer areaCode);
    
    List<SearchSpotsByRegionDto> searchSpotsByRegion(Long regionId);

    List<SearchSpotsByRegionDto> searchSpotsByRegionIds(@Param("list") List<Long> regionIds);
}
