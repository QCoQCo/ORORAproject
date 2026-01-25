-- 부산 관광 가이드 데이터베이스 스키마
-- Database: arata_busan
-- 
-- 주의: 이 스키마는 공통코드 테이블(common_code_groups, common_codes)을 사용합니다.
-- 공통코드 테이블 스키마는 common_code_schema.sql 파일을 참조하세요.
-- ENUM 대신 VARCHAR로 코드값을 저장하며, 공통코드 테이블의 코드값을 참조합니다.
-- 
CREATE DATABASE arata_busan;
USE arata_busan;

-- 1. 지역 테이블
CREATE TABLE regions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    area_code INT NOT NULL UNIQUE,
    name VARCHAR(30) NOT NULL,
    sigungu_code INT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. 관광지 테이블
CREATE TABLE tourist_spots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    region_id INT NOT NULL,
    title VARCHAR(80) NOT NULL,
    description TEXT,
    link_url VARCHAR(500),
    category_code VARCHAR(50) DEFAULT 'CULTURE' COMMENT '관광지 카테고리 코드 (SPOT_CATEGORY 그룹 참조)',
    latitude DECIMAL(10, 8) COMMENT '위도 (카카오맵 위치 정보)',
    longitude DECIMAL(11, 8) COMMENT '경도 (카카오맵 위치 정보)',
    address VARCHAR(80) COMMENT '주소',
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
    INDEX idx_region_id (region_id),
    INDEX idx_category_code (category_code),
    INDEX idx_is_active (is_active),
    INDEX idx_latitude_longitude (latitude, longitude)
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
    role_code VARCHAR(50) DEFAULT 'MEMBER' COMMENT '사용자 역할 코드 (USER_ROLE 그룹 참조)',
    status_code VARCHAR(50) DEFAULT 'ACTIVE' COMMENT '사용자 상태 코드 (USER_STATUS 그룹 참조)',
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

-- 6-1. 사용자 프로필 이미지 테이블
CREATE TABLE user_profile_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    img_name VARCHAR(255) COMMENT '저장된 파일명',
    ori_img_name VARCHAR(255) COMMENT '원본 파일명',
    user_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    reg_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록 시간',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
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
    status_code VARCHAR(50) DEFAULT 'PENDING' COMMENT '신고 상태 코드 (REPORT_STATUS 그룹 참조)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    INDEX idx_review_id (review_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status_code (status_code),
    UNIQUE KEY unique_user_review_report (user_id, review_id)
);

-- 13. 관광지 & 사진 추가 신청 테이블
CREATE TABLE spot_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '신청자 ID',
    tourist_spot_id INT COMMENT '관광지 ID (사진 추가 신청 및 관광지 정보 수정 신청의 경우 필수, 관광지 추가 신청의 경우 NULL)',
    request_type VARCHAR(20) NOT NULL COMMENT '신청 유형: photo(사진 추가), spot(관광지 추가), edit(관광지 정보 수정)',
    
    -- 사진 관련 필드 (사진 추가 신청 시 사용)
    image_url VARCHAR(500) COMMENT '신청한 사진 URL (사진 추가 신청의 경우 필수)',
    img_name VARCHAR(255) COMMENT '저장된 파일명',
    ori_img_name VARCHAR(255) COMMENT '원본 파일명',
    
    -- 관광지 추가 신청 관련 필드 (관광지 추가 신청 시 사용)
    spot_title VARCHAR(80) COMMENT '관광지명 (관광지 추가 신청의 경우 필수)',
    region_id INT COMMENT '지역 ID (관광지 추가 신청의 경우 필수)',
    link_url VARCHAR(500) COMMENT '링크 URL (관광지 추가 신청의 경우)',
    hashtags TEXT COMMENT '해시태그 (쉼표로 구분, 관광지 추가 신청의 경우)',
    
    -- 위치 정보 필드 (관광지 추가 신청 시 사용)
    latitude DECIMAL(10, 8) COMMENT '위도 (카카오맵 위치 정보)',
    longitude DECIMAL(11, 8) COMMENT '경도 (카카오맵 위치 정보)',
    address VARCHAR(200) COMMENT '주소',
    
    -- 공통 필드
    description TEXT COMMENT '신청 설명',
    status VARCHAR(50) DEFAULT 'pending' COMMENT '신청 상태: pending(대기중), approved(승인됨), rejected(거부됨)',
    reject_reason TEXT COMMENT '거부 사유 (거부된 경우)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE SET NULL,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_tourist_spot_id (tourist_spot_id),
    INDEX idx_region_id (region_id),
    INDEX idx_request_type (request_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- 14. 리뷰 댓글 신고 테이블
CREATE TABLE comment_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    comment_id INT NOT NULL,
    reason TEXT NOT NULL,
    status_code VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES review_comments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_comment_report (user_id, comment_id),
    INDEX idx_comment_id (comment_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status_code (status_code)
);

-- 만들었던 테이블 지우는 명령어
DROP TABLE IF EXISTS regions;
DROP TABLE IF EXISTS tourist_spots;
DROP TABLE IF EXISTS tourist_spot_images;
DROP TABLE IF EXISTS hashtags;
DROP TABLE IF EXISTS tourist_spot_hashtags;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_profile_images;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS review_likes;
DROP TABLE IF EXISTS review_comments;
DROP TABLE IF EXISTS review_reports;
DROP TABLE IF EXISTS review_images;
DROP TABLE IF EXISTS tourist_spot_likes;
DROP TABLE IF EXISTS spot_requests;

ALTER TABLE regions MODIFY COLUMN sigungu_code INT UNIQUE AFTER name;

-- 기존 테이블에 위도/경도 필드 추가 (이미 테이블이 존재하는 경우)
ALTER TABLE tourist_spots 
ADD COLUMN latitude DECIMAL(10, 8) COMMENT '위도 (카카오맵 위치 정보)' AFTER category_code,
ADD COLUMN longitude DECIMAL(11, 8) COMMENT '경도 (카카오맵 위치 정보)' AFTER latitude;

ALTER TABLE tourist_spots MODIFY COLUMN latitude DECIMAL(10, 8) COMMENT '위도 (카카오맵 위치 정보)' AFTER category_code;
ALTER TABLE tourist_spots MODIFY COLUMN longitude DECIMAL(11, 8) COMMENT '경도 (카카오맵 위치 정보)' AFTER latitude;
ALTER TABLE tourist_spots MODIFY COLUMN address VARCHAR(80) COMMENT '주소' AFTER longitude;

DESCRIBE tourist_spots;

-- 위도/경도 인덱스 추가
ALTER TABLE tourist_spots ADD INDEX idx_latitude_longitude (latitude, longitude);

-- spot_requests 테이블에 위치 정보 컬럼 추가 (관광지 추가 신청 시 사용)
ALTER TABLE spot_requests 
ADD COLUMN latitude DECIMAL(10, 8) COMMENT '위도 (카카오맵 위치 정보)' AFTER hashtags,
ADD COLUMN longitude DECIMAL(11, 8) COMMENT '경도 (카카오맵 위치 정보)' AFTER latitude,
ADD COLUMN address VARCHAR(200) COMMENT '주소' AFTER longitude;

ALTER TABLE spot_requests MODIFY COLUMN latitude DECIMAL(10, 8) COMMENT '위도 (카카오맵 위치 정보)' AFTER hashtags;
ALTER TABLE spot_requests MODIFY COLUMN longitude DECIMAL(11, 8) COMMENT '경도 (카카오맵 위치 정보)' AFTER latitude;
ALTER TABLE spot_requests MODIFY COLUMN address VARCHAR(200) COMMENT '주소' AFTER longitude;


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

-- ============================================
-- 공통코드 테이블 스키마
-- ============================================
-- 이 스키마를 실행하기 전에 common_code_schema.sql 파일을 먼저 실행하여
-- common_code_groups와 common_codes 테이블을 생성해야 합니다.
-- 
-- 사용되는 공통코드 그룹:
-- - USER_ROLE: 사용자 역할 (ADMIN, VIP, MEMBER)
-- - USER_STATUS: 사용자 상태 (ACTIVE, INACTIVE, SUSPENDED)
-- - GENDER: 성별 (MALE, FEMALE, OTHER)
-- - SPOT_CATEGORY: 관광지 카테고리 (BEACH, MOUNTAIN, CULTURE, FOOD, SHOPPING, CAFE)
-- - REPORT_STATUS: 신고 상태 (PENDING, REVIEWED, RESOLVED, DISMISSED)
-- - REQUEST_STATUS: 신청 상태 (PENDING, APPROVED, REJECTED) - spot_requests 테이블에서 사용