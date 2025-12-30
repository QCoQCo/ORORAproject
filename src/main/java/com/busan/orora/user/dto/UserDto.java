package com.busan.orora.user.dto;

/*
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    login_id VARCHAR(50) NOT NULL UNIQUE, -- 사용자가 직접 설정한 로그인 ID
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_code VARCHAR(50) DEFAULT 'MEMBER' COMMENT '사용자 역할 코드 (USER_ROLE 그룹 참조)',
    status_code VARCHAR(50) DEFAULT 'ACTIVE' COMMENT '사용자 상태 코드 (USER_STATUS 그룹 참조)',
    profile_image VARCHAR(500),
    phone_number VARCHAR(20),
    address VARCHAR(80),
    birth_date DATE,
    gender_code VARCHAR(50) COMMENT '성별 코드 (GENDER 그룹 참조)',
    join_date DATE NOT NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_login_id (login_id),
    INDEX idx_email (email),
    INDEX idx_role_code (role_code),
    INDEX idx_status_code (status_code),
    INDEX idx_gender_code (gender_code)
);
*/

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String loginId;
    private String username;
    private String email;
    private String passwordHash;
    private String roleCode;
    private String statusCode;
    private String profileImage;
    private String phoneNumber;
    private String address;
    private LocalDateTime birthDate;
    private String genderCode;
    private LocalDateTime joinDate;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
