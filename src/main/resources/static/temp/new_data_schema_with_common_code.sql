-- 부산 관광 가이드 데이터베이스 스키마 (공통코드 적용 버전)
-- Database: arata_busan
CREATE DATABASE arata_busan;
USE arata_busan;

-- ============================================
-- 공통코드 테이블 (먼저 생성 필요)
-- ============================================
-- common_code_schema.sql 파일을 먼저 실행해야 함

-- 1. 지역 테이블
CREATE TABLE regions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    area_code INT NOT NULL UNIQUE,
    name VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    sigungu_code INT UNIQUE
);

-- 2. 관광지 테이블
CREATE TABLE tourist_spots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    region_id INT NOT NULL,
    title VARCHAR(80) NOT NULL,
    description TEXT,
    link_url VARCHAR(500),
    -- 변경: ENUM → VARCHAR + 공통코드 참조
    category_code VARCHAR(50) DEFAULT 'CULTURE' COMMENT '관광지 카테고리 코드 (SPOT_CATEGORY 그룹 참조)',
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
    -- 변경: 공통코드 참조 외래키 추가
    FOREIGN KEY (category_code) REFERENCES common_codes(code),
    INDEX idx_region_id (region_id),
    INDEX idx_category_code (category_code),
    INDEX idx_is_active (is_active)
);
-- 주의: rating_avg와 rating_count는 리뷰 테이블에서 계산하여 표시합니다.

-- 3. 관광지 이미지 테이블
CREATE TABLE tourist_spot_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    img_name VARCHAR(255) COMMENT '저장된 파일명',
    ori_img_name VARCHAR(255) COMMENT '원본 파일명',
    tourist_spot_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    rep_img_yn VARCHAR(1) DEFAULT 'N' COMMENT '대표 이미지 여부 (Y/N)',
    reg_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록 시간',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE,
    INDEX idx_tourist_spot_id (tourist_spot_id),
    INDEX idx_rep_img_yn (rep_img_yn)
);

-- 4. 해시태그 테이블
CREATE TABLE hashtags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 관광지-해시태그 연결 테이블
CREATE TABLE tourist_spot_hashtags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tourist_spot_id INT NOT NULL,
    hashtag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE,
    FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_spot_hashtag (tourist_spot_id, hashtag_id)
);

-- 6. 사용자 테이블
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    login_id VARCHAR(50) NOT NULL UNIQUE, -- 사용자가 직접 설정한 로그인 ID
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    -- 변경: ENUM → VARCHAR + 공통코드 참조
    role_code VARCHAR(50) DEFAULT 'MEMBER' COMMENT '사용자 역할 코드 (USER_ROLE 그룹 참조)',
    status_code VARCHAR(50) DEFAULT 'ACTIVE' COMMENT '사용자 상태 코드 (USER_STATUS 그룹 참조)',
    profile_image VARCHAR(500),
    phone_number VARCHAR(20),
    address VARCHAR(80),
    birth_date DATE,
    -- 변경: ENUM → VARCHAR + 공통코드 참조
    gender_code VARCHAR(50) COMMENT '성별 코드 (GENDER 그룹 참조)',
    join_date DATE NOT NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- 변경: 공통코드 참조 외래키 추가
    FOREIGN KEY (role_code) REFERENCES common_codes(code),
    FOREIGN KEY (status_code) REFERENCES common_codes(code),
    FOREIGN KEY (gender_code) REFERENCES common_codes(code),
    INDEX idx_login_id (login_id),
    INDEX idx_email (email),
    INDEX idx_role_code (role_code),
    INDEX idx_status_code (status_code)
);

-- 7. 리뷰 테이블
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tourist_spot_id INT NOT NULL,
    title VARCHAR(80) NOT NULL,
    content TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_tourist_spot_id (tourist_spot_id),
    INDEX idx_is_approved (is_approved),
    INDEX idx_created_at (created_at)
);

-- 8. 리뷰 이미지 테이블
CREATE TABLE review_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    review_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_order INT DEFAULT 1,
    alt_text VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);


-- 9. 관광지 좋아요 테이블
CREATE TABLE tourist_spot_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tourist_spot_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_spot_like (user_id, tourist_spot_id),
    INDEX idx_tourist_spot_id (tourist_spot_id),
    INDEX idx_user_id (user_id)
);

-- 10. 리뷰 좋아요 테이블
CREATE TABLE review_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    review_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_review_like (user_id, review_id),
    INDEX idx_review_id (review_id),
    INDEX idx_user_id (user_id)
);

-- 11. 리뷰 댓글 테이블
CREATE TABLE review_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    review_id INT NOT NULL,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    INDEX idx_review_id (review_id),
    INDEX idx_user_id (user_id)
);

-- 12. 리뷰 신고 테이블
CREATE TABLE review_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    review_id INT NOT NULL,
    reason TEXT NOT NULL,
    -- 변경: ENUM → VARCHAR + 공통코드 참조
    status_code VARCHAR(50) DEFAULT 'PENDING' COMMENT '신고 상태 코드 (REPORT_STATUS 그룹 참조)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    -- 변경: 공통코드 참조 외래키 추가
    FOREIGN KEY (status_code) REFERENCES common_codes(code),
    INDEX idx_review_id (review_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status_code (status_code),
    UNIQUE KEY unique_user_review_report (user_id, review_id)
);



-- -- 7. 축제/이벤트 테이블
-- CREATE TABLE festivals (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     title VARCHAR(80) NOT NULL,
--     description TEXT,
--     start_date DATE,
--     end_date DATE,
--     image_url VARCHAR(500),
--     link_url VARCHAR(500),
--     is_active BOOLEAN DEFAULT TRUE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );
