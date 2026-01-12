package com.busan.orora.commoncode.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/*
CREATE TABLE common_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_code VARCHAR(50) NOT NULL COMMENT '코드 그룹 식별자',
    code VARCHAR(50) NOT NULL COMMENT '코드값 (예: ADMIN, MEMBER)',
    code_name VARCHAR(100) NOT NULL COMMENT '코드명 (한국어 표시용)',
    code_name_en VARCHAR(100) COMMENT '코드명 (영어)',
    code_name_jp VARCHAR(100) COMMENT '코드명 (일본어)',
    description TEXT COMMENT '코드 상세 설명',
    sort_order INT DEFAULT 0 COMMENT '정렬 순서',
    is_active BOOLEAN DEFAULT TRUE COMMENT '사용 여부',
    extra_data JSON COMMENT '추가 데이터 (JSON 형식)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_code) REFERENCES common_code_groups(group_code) ON DELETE CASCADE,
    UNIQUE KEY unique_group_code (group_code, code)
);
*/
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommonCodeDto {
    private Long id;
    private String groupCode;
    private String code;
    private String codeName;
    private String codeNameEn;
    private String codeNameJp;
    private String description;
    private Integer sortOrder;
    private Boolean isActive;
    private String extraData; // JSON 문자열로 저장
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
