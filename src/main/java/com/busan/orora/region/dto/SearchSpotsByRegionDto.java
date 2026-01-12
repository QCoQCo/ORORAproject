package com.busan.orora.region.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchSpotsByRegionDto {
    
    // region
    // private Long regionId;
    // private String regionName;

    // tourist spot
    private Long id;
    private String title;
    private String description;
    private String categoryCode;

    // image    
    private String imageUrl;

    // hashtags
    private String hashtags;
    
    // category active status (populated by service)
    private Boolean categoryActive;
}
