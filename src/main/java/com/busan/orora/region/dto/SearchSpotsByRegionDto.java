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

    // image    
    private String imageUrl;

    // hashtags
    private String hashtags;
}
