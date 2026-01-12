package com.busan.orora.spot.mapper;

import com.busan.orora.spot.dto.SpotDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SpotMapper {
    void insertSpot(SpotDto spotDto);
    void updateSpot(SpotDto spotDto);
    void deleteSpot(@Param("id") Long id);
    List<SpotDto> findAllSpots();
    List<SpotDto> findSpotsByRegion(@Param("regionId") Long regionId);
    SpotDto findSpotById(@Param("id") Long id);
}
