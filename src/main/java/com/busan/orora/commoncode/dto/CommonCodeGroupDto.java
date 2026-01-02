package com.busan.orora.commoncode.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/*
CREATE TABLE common_code_groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_code VARCHAR(50) NOT NULL UNIQUE COMMENT '코드 그룹 식별자 (예: USER_ROLE)',
    group_name VARCHAR(100) NOT NULL COMMENT '코드 그룹명 (한국어)',
    group_name_en VARCHAR(100) COMMENT '코드 그룹명 (영어)',
    group_name_jp VARCHAR(100) COMMENT '코드 그룹명 (일본어)',
    description TEXT COMMENT '그룹 설명',
    is_active BOOLEAN DEFAULT TRUE COMMENT '사용 여부',
    sort_order INT DEFAULT 0 COMMENT '정렬 순서',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
*/
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommonCodeGroupDto {
    private Long id;
    private String groupCode;
    private String groupName;
    private String groupNameEn;
    private String groupNameJp;
    private String description;
    private Boolean isActive;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
