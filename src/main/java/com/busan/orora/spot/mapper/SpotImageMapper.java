package com.busan.orora.spot.mapper;

import com.busan.orora.spot.dto.SpotImageDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SpotImageMapper {
    List<SpotImageDto> findImagesBySpotId(@Param("spotId") Long spotId);
    List<SpotImageDto> findRepImagesBySpotIds(@Param("spotIds") List<Long> spotIds);
    SpotImageDto findImageById(@Param("id") Long id);
    void insertImage(SpotImageDto imageDto);
    void deleteImage(@Param("id") Long id);
    void deleteImagesBySpotId(@Param("spotId") Long spotId);
    void resetRepImages(@Param("spotId") Long spotId);
    void setRepImage(@Param("id") Long id);
}
