package com.busan.orora.region.service;

import com.busan.orora.commoncode.dto.CommonCodeDto;
import com.busan.orora.commoncode.service.CommonCodeService;
import com.busan.orora.region.dto.RegionDto;
import com.busan.orora.region.dto.SearchSpotsByRegionDto;
import com.busan.orora.region.mapper.RegionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RegionService {
    @Autowired
    private RegionMapper regionMapper;

    @Autowired
    private CommonCodeService commonCodeService;

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
        List<SearchSpotsByRegionDto> spots = regionMapper.searchSpotsByRegion(regionId);
        return enrichWithCategoryActiveStatus(spots);
    }

    public List<SearchSpotsByRegionDto> searchSpotsByRegionIds(List<Integer> regionIds) {
        List<SearchSpotsByRegionDto> spots = regionMapper.searchSpotsByRegionIds(regionIds);
        return enrichWithCategoryActiveStatus(spots);
    }

    /**
     * 관광지 목록에 카테고리 활성화 상태를 추가
     */
    private List<SearchSpotsByRegionDto> enrichWithCategoryActiveStatus(List<SearchSpotsByRegionDto> spots) {
        // 카테고리 활성 상태 캐시 (SPOT_CATEGORY 코드 그룹에서)
        Map<String, Boolean> categoryActiveMap = new HashMap<>();
        List<CommonCodeDto> categoryCodes = commonCodeService.getCodesByGroupCode("SPOT_CATEGORY");
        for (CommonCodeDto code : categoryCodes) {
            categoryActiveMap.put(code.getCode(), code.getIsActive() != null && code.getIsActive());
        }

        // 각 관광지에 카테고리 활성 상태 설정
        for (SearchSpotsByRegionDto spot : spots) {
            String categoryCode = spot.getCategoryCode();
            boolean categoryActive = categoryCode == null || categoryActiveMap.getOrDefault(categoryCode, true);
            spot.setCategoryActive(categoryActive);
        }

        return spots;
    }
}
