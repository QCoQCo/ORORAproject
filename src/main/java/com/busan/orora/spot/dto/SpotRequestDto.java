package com.busan.orora.spot.dto;

/*
CREATE TABLE spot_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '신청자 ID',
    tourist_spot_id INT COMMENT '관광지 ID (사진 추가 신청의 경우 필수, 관광지 추가 신청의 경우 NULL)',
    request_type VARCHAR(20) NOT NULL COMMENT '신청 유형: photo(사진 추가), spot(관광지 추가)',
    
    -- 사진 관련 필드 (사진 추가 신청 시 사용)
    image_url VARCHAR(500) COMMENT '신청한 사진 URL (사진 추가 신청의 경우 필수)',
    img_name VARCHAR(255) COMMENT '저장된 파일명',
    ori_img_name VARCHAR(255) COMMENT '원본 파일명',
    
    -- 관광지 추가 신청 관련 필드 (관광지 추가 신청 시 사용)
    spot_title VARCHAR(80) COMMENT '관광지명 (관광지 추가 신청의 경우 필수)',
    region_id INT COMMENT '지역 ID (관광지 추가 신청의 경우 필수)',
    link_url VARCHAR(500) COMMENT '링크 URL (관광지 추가 신청의 경우)',
    hashtags TEXT COMMENT '해시태그 (쉼표로 구분, 관광지 추가 신청의 경우)',
    
    -- 공통 필드
    description TEXT COMMENT '신청 설명',
    status VARCHAR(50) DEFAULT 'pending' COMMENT '신청 상태: pending(대기중), approved(승인됨), rejected(거부됨)',
    reject_reason TEXT COMMENT '거부 사유 (거부된 경우)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE SET NULL,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL
);
*/
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpotRequestDto {
    private Long id;
    private Long userId;
    private Long touristSpotId;
    private String requestType; // 'photo' or 'spot'

    // 사진 관련 필드
    private String imageUrl;
    private String imgName;
    private String oriImgName;

    // 관광지 추가 신청 관련 필드
    private String spotTitle;
    private Long regionId;
    private String linkUrl;
    private String hashtags; // 쉼표로 구분된 해시태그 문자열
    
    // 위치 정보 필드 (관광지 추가 신청 시 사용)
    private Double latitude;  // 위도
    private Double longitude; // 경도
    private String address;   // 주소

    // 공통 필드
    private String description;
    private String status; // 'pending', 'approved', 'rejected'
    private String rejectReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 조인된 데이터 (관리자 페이지에서 사용)
    private String applicantName; // users.username
    private String applicantId; // users.login_id
    private String spotName; // tourist_spots.title
    private String regionName; // regions.name
}
