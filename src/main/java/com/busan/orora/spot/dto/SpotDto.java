package com.busan.orora.spot.dto;

/*
CREATE TABLE tourist_spots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    region_id INT NOT NULL,
    title VARCHAR(80) NOT NULL,
    description TEXT,
    link_url VARCHAR(500),
    category_code VARCHAR(50) DEFAULT 'CULTURE' COMMENT '관광지 카테고리 코드 (SPOT_CATEGORY 그룹 참조)',
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
    INDEX idx_region_id (region_id),
    INDEX idx_category_code (category_code),
    INDEX idx_is_active (is_active)
);  
*/
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpotDto {
    private Long id;
    private Long regionId;
    private String title;
    private String description;
    private String linkUrl;
    private String categoryCode;
    private Boolean isActive;
    private Integer viewCount;
    private Double ratingAvg;
    private Integer ratingCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
