package com.busan.orora.user.dto;

/*
CREATE TABLE user_profile_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    img_name VARCHAR(255) COMMENT '저장된 파일명',
    ori_img_name VARCHAR(255) COMMENT '원본 파일명',
    user_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    reg_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록 시간',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
*/
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileImageDto {
    private Long id;
    private String imgName;
    private String oriImgName;
    private Long userId;
    private String imageUrl;
    private LocalDateTime regTime;
    private LocalDateTime updateTime;
}
