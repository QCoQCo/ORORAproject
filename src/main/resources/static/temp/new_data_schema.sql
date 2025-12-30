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

-- 3. 관광지 이미지 테이블
CREATE TABLE tourist_spot_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tourist_spot_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE
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

-- 만들었던 테이블 지우는 명령어
DROP TABLE IF EXISTS regions;
DROP TABLE IF EXISTS tourist_spots;
DROP TABLE IF EXISTS tourist_spot_images;
DROP TABLE IF EXISTS hashtags;
DROP TABLE IF EXISTS tourist_spot_hashtags;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS review_likes;
DROP TABLE IF EXISTS review_comments;
DROP TABLE IF EXISTS review_reports;
DROP TABLE IF EXISTS review_images;
DROP TABLE IF EXISTS tourist_spot_likes;


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
