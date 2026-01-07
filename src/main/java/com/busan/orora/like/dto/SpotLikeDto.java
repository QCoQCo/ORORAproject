package com.busan.orora.like.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpotLikeDto {
    private Long userId;
    private Long touristSpotId;
}
