-- 데이터베이스 스키마 수정 쿼리
-- Database: arata_busan
-- 실행 전 백업 권장

USE arata_busan;

-- ============================================
-- 1. tourist_spots 테이블 수정
-- ============================================
-- rating_avg와 rating_count 컬럼 제거 (리뷰 테이블에서 계산)
ALTER TABLE tourist_spots 
DROP COLUMN rating_avg,
DROP COLUMN rating_count;

-- ============================================
-- 2. tourist_spot_images 테이블 수정
-- ============================================
-- 기존 created_at 컬럼을 reg_time으로 변경하고 update_time 추가
-- 먼저 created_at을 reg_time으로 변경
ALTER TABLE tourist_spot_images 
CHANGE COLUMN created_at reg_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 새 컬럼들 추가
ALTER TABLE tourist_spot_images 
ADD COLUMN img_name VARCHAR(255) AFTER id,
ADD COLUMN ori_img_name VARCHAR(255) AFTER img_name,
ADD COLUMN rep_img_yn VARCHAR(1) DEFAULT 'N' AFTER image_url,
ADD COLUMN update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER reg_time;

-- 인덱스 추가 (대표 이미지 조회 최적화)
ALTER TABLE tourist_spot_images 
ADD INDEX idx_rep_img_yn (rep_img_yn);

-- ============================================
-- 확인 쿼리
-- ============================================
-- DESCRIBE tourist_spots;
-- DESCRIBE tourist_spot_images;


-- 관광지 테이블 비우는 쿼리
TRUNCATE TABLE tourist_spots;

SELECT * FROM tourist_spots;

-- 이미지 테이블 비우는 쿼리
TRUNCATE TABLE tourist_spot_images;

SELECT * FROM tourist_spot_images;