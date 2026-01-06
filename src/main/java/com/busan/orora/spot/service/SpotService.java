package com.busan.orora.spot.service;

import com.busan.orora.spot.dto.SpotDto;
import com.busan.orora.spot.mapper.SpotMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class SpotService {
    @Autowired
    private SpotMapper spotMapper;

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
}
