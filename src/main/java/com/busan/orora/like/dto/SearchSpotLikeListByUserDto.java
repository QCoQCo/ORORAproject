package com.busan.orora.like.dto;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchSpotLikeListByUserDto {
    private Long spotId;
    private String title;
    private String description;
    private LocalDateTime likedAt;
}
