package com.busan.orora.like.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewLikeDto {
    private Long userId;
    private Long reviewId;
}
