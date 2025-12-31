package com.busan.orora.spot.dto;

/*
CREATE TABLE tourist_spot_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    img_name VARCHAR(255) COMMENT '저장된 파일명',
    ori_img_name VARCHAR(255) COMMENT '원본 파일명',
    tourist_spot_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    rep_img_yn VARCHAR(1) DEFAULT 'N' COMMENT '대표 이미지 여부 (Y/N)',
    reg_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록 시간',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE
);
*/
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpotImageDto {
    private Long id;
    private String imgName;
    private String oriImgName;
    private Long touristSpotId;
    private String imageUrl;
    private String repImgYn;
    private LocalDateTime regTime;
    private LocalDateTime updateTime;
}
