package com.busan.orora.hashtag.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/*
CREATE TABLE hashtags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
*/
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HashtagDto {
    private Long id;
    private String name;
    private LocalDateTime createdAt;
    // 여기서부터 작성
    private String imageUrl;
    private String title;
    private String description;
    private String hashtagList;
    private String regionsName;
}