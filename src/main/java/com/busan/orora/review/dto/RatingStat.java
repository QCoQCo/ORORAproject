package com.busan.orora.review.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingStat {
    private Long touristSpotId;
    private Double ratingAvg;
    private Integer ratingCount;
}
