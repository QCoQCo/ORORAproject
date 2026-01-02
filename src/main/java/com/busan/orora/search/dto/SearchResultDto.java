package com.busan.orora.search.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDto {
    private String type; // "spot", "review", "hashtag", "comment"
    private Long id;
    private String title;
    private String content;
    private String description;
    private String linkUrl;
    private Long touristSpotId;
    private String touristSpotTitle;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;
    private Integer rating;
    private String hashtagName;
    private Long reviewId;
    private String reviewTitle;
}
