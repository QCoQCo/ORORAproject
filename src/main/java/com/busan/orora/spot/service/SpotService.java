package com.busan.orora.spot.service;

import com.busan.orora.spot.dto.SpotDto;
import com.busan.orora.spot.mapper.SpotMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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
}
