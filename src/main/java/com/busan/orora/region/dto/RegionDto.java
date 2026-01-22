package com.busan.orora.region.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegionDto {

    private Long id;
    private Integer areaCode;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer sigunguCode;
}
