-- ============================================
-- 공통코드 스키마
-- Database: arata_busan
-- 설명: 시스템 전반에서 사용되는 공통코드를 관리하는 테이블
-- 구조: 그룹 테이블과 코드 테이블로 명확히 분리
-- ============================================

USE arata_busan;

-- ============================================
-- 1. 공통코드 그룹 테이블 (common_code_groups)
-- ============================================
-- 코드를 분류하는 그룹을 관리하는 테이블
-- 예: USER_ROLE, USER_STATUS, GENDER, SPOT_CATEGORY 등
-- 이 테이블은 코드의 카테고리를 정의합니다.
CREATE TABLE IF NOT EXISTS common_code_groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_code VARCHAR(50) NOT NULL UNIQUE ,
    group_name VARCHAR(100) NOT NULL ,
    group_name_en VARCHAR(100) ,
    group_name_jp VARCHAR(100) ,
    description TEXT ,
    is_active BOOLEAN DEFAULT TRUE ,
    sort_order INT DEFAULT 0 ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_group_code (group_code),
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ;

-- ============================================
-- 2. 공통코드 테이블 (common_codes)
-- ============================================
-- 실제 코드값들을 저장하는 테이블
-- 각 코드는 반드시 하나의 그룹에 속해야 합니다.
-- 복합키 (group_code, code)로 그룹 내에서 코드의 유일성을 보장합니다.
CREATE TABLE IF NOT EXISTS common_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_code VARCHAR(50) NOT NULL ,
    code VARCHAR(50) NOT NULL ,
    code_name VARCHAR(100) NOT NULL ,
    code_name_en VARCHAR(100) ,
    code_name_jp VARCHAR(100) ,
    description TEXT ,
    sort_order INT DEFAULT 0 ,
    is_active BOOLEAN DEFAULT TRUE ,
    extra_data JSON ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- 그룹 테이블과의 외래키 관계
    FOREIGN KEY (group_code) REFERENCES common_code_groups(group_code) ON DELETE CASCADE ON UPDATE CASCADE,
    -- 그룹 내에서 코드의 유일성 보장
    UNIQUE KEY unique_group_code (group_code, code),
    INDEX idx_group_code (group_code),
    INDEX idx_code (code),
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='공통코드 테이블';

-- ============================================
-- 3. 공통코드 그룹 초기 데이터
-- ============================================
INSERT INTO common_code_groups (group_code, group_name, group_name_en, group_name_jp, description, sort_order) VALUES
('USER_ROLE', '사용자 역할', 'User Role', 'ユーザー役割', '시스템 사용자의 권한 역할', 1),
('USER_STATUS', '사용자 상태', 'User Status', 'ユーザーステータス', '사용자 계정의 활성화 상태', 2),
('GENDER', '성별', 'Gender', '性別', '사용자의 성별 정보', 3),
('SPOT_CATEGORY', '관광지 카테고리', 'Tourist Spot Category', '観光地カテゴリー', '관광지의 분류 카테고리', 4),
('REPORT_STATUS', '신고 상태', 'Report Status', '報告ステータス', '리뷰 신고의 처리 상태', 5);

-- ============================================
-- 4. 공통코드 초기 데이터
-- ============================================

-- 4-1. 사용자 역할 (USER_ROLE)
INSERT INTO common_codes (group_code, code, code_name, code_name_en, code_name_jp, description, sort_order) VALUES
('USER_ROLE', 'ADMIN', '관리자', 'Administrator', '管理者', '시스템 관리자 권한', 1),
('USER_ROLE', 'VIP', 'VIP 회원', 'VIP Member', 'VIP会員', 'VIP 회원 권한', 2),
('USER_ROLE', 'MEMBER', '일반 회원', 'General Member', '一般会員', '일반 회원 권한', 3);

-- 4-2. 사용자 상태 (USER_STATUS)
INSERT INTO common_codes (group_code, code, code_name, code_name_en, code_name_jp, description, sort_order) VALUES
('USER_STATUS', 'ACTIVE', '활성', 'Active', 'アクティブ', '정상적으로 사용 중인 계정', 1),
('USER_STATUS', 'INACTIVE', '비활성', 'Inactive', '非アクティブ', '비활성화된 계정', 2),
('USER_STATUS', 'SUSPENDED', '정지', 'Suspended', '停止', '정지된 계정', 3);

-- 4-3. 성별 (GENDER)
INSERT INTO common_codes (group_code, code, code_name, code_name_en, code_name_jp, description, sort_order) VALUES
('GENDER', 'MALE', '남성', 'Male', '男性', '남성', 1),
('GENDER', 'FEMALE', '여성', 'Female', '女性', '여성', 2),
('GENDER', 'OTHER', '기타', 'Other', 'その他', '기타', 3);

-- 4-4. 관광지 카테고리 (SPOT_CATEGORY)
INSERT INTO common_codes (group_code, code, code_name, code_name_en, code_name_jp, description, sort_order) VALUES
('SPOT_CATEGORY', 'BEACH', '해변', 'Beach', 'ビーチ', '해변 및 바다 관련 관광지', 1),
('SPOT_CATEGORY', 'MOUNTAIN', '산', 'Mountain', '山', '산 및 등산 관련 관광지', 2),
('SPOT_CATEGORY', 'CULTURE', '문화', 'Culture', '文化', '문화재 및 역사 관련 관광지', 3),
('SPOT_CATEGORY', 'FOOD', '음식', 'Food', '食べ物', '맛집 및 음식 관련 관광지', 4),
('SPOT_CATEGORY', 'SHOPPING', '쇼핑', 'Shopping', 'ショッピング', '쇼핑몰 및 시장 관련 관광지', 5),
('SPOT_CATEGORY', 'CAFE', '카페', 'Cafe', 'カフェ', '카페 및 커피숍', 6);

-- 4-5. 신고 상태 (REPORT_STATUS)
INSERT INTO common_codes (group_code, code, code_name, code_name_en, code_name_jp, description, sort_order) VALUES
('REPORT_STATUS', 'PENDING', '대기중', 'Pending', '保留中', '신고 접수 후 대기 중인 상태', 1),
('REPORT_STATUS', 'REVIEWED', '검토중', 'Reviewed', '検討中', '관리자가 검토 중인 상태', 2),
('REPORT_STATUS', 'RESOLVED', '처리완료', 'Resolved', '処理完了', '신고가 처리되어 완료된 상태', 3),
('REPORT_STATUS', 'DISMISSED', '기각', 'Dismissed', '却下', '신고가 기각된 상태', 4);

-- ============================================
-- 5. 유용한 조회 쿼리 예시
-- ============================================

-- 5-1. 특정 그룹의 활성화된 코드 목록 조회 (한국어)
-- SELECT code, code_name 
-- FROM common_codes 
-- WHERE group_code = 'USER_ROLE' 
--   AND is_active = TRUE 
-- ORDER BY sort_order;

-- 5-2. 특정 그룹의 활성화된 코드 목록 조회 (영어)
-- SELECT code, code_name_en as code_name 
-- FROM common_codes 
-- WHERE group_code = 'USER_ROLE' 
--   AND is_active = TRUE 
-- ORDER BY sort_order;

-- 5-3. 특정 그룹의 활성화된 코드 목록 조회 (일본어)
-- SELECT code, code_name_jp as code_name 
-- FROM common_codes 
-- WHERE group_code = 'USER_ROLE' 
--   AND is_active = TRUE 
-- ORDER BY sort_order;

-- 5-4. 코드명으로 코드값 찾기
-- SELECT code 
-- FROM common_codes 
-- WHERE group_code = 'USER_ROLE' 
--   AND code_name = '관리자';

-- 5-5. 모든 활성화된 코드 그룹 목록
-- SELECT group_code, group_name, description 
-- FROM common_code_groups 
-- WHERE is_active = TRUE 
-- ORDER BY sort_order;

-- ============================================
-- 6. 테이블 관계 설명
-- ============================================
-- 
-- 1. common_code_groups (그룹 테이블)
--    - 코드의 카테고리를 정의합니다.
--    - 예: USER_ROLE, USER_STATUS, GENDER 등
--    - group_code가 PRIMARY KEY 역할을 합니다.
-- 
-- 2. common_codes (코드 테이블)
--    - 실제 코드값들을 저장합니다.
--    - 각 코드는 반드시 하나의 그룹에 속해야 합니다.
--    - (group_code, code) 복합키로 그룹 내에서 코드의 유일성을 보장합니다.
--    - group_code는 common_code_groups.group_code를 참조합니다.
-- 
-- 3. 다른 테이블과의 관계
--    - users.role_code -> common_codes.code (단, group_code = 'USER_ROLE')
--    - users.status_code -> common_codes.code (단, group_code = 'USER_STATUS')
--    - users.gender_code -> common_codes.code (단, group_code = 'GENDER')
--    - tourist_spots.category_code -> common_codes.code (단, group_code = 'SPOT_CATEGORY')
--    - review_reports.status_code -> common_codes.code (단, group_code = 'REPORT_STATUS')
-- 
-- 주의: MySQL의 제약으로 인해 복합 외래키를 직접 설정할 수 없으므로,
--      애플리케이션 레벨에서 group_code를 함께 확인해야 합니다.
-- 
-- ============================================
-- 7. 기존 테이블과의 연동을 위한 마이그레이션 가이드
-- ============================================
-- 
-- 기존 ENUM 컬럼을 공통코드로 변경하려면:
-- 
-- 1. 공통코드 테이블 생성 및 초기 데이터 삽입
--    - 이 스키마 파일을 먼저 실행합니다.
-- 
-- 2. 기존 테이블에 새 컬럼 추가 (예: role_code VARCHAR(50))
--    ALTER TABLE users ADD COLUMN role_code VARCHAR(50) DEFAULT 'MEMBER';
-- 
-- 3. 기존 데이터 마이그레이션
--    UPDATE users SET role_code = 'ADMIN' WHERE role = 'admin';
--    UPDATE users SET role_code = 'VIP' WHERE role = 'vip';
--    UPDATE users SET role_code = 'MEMBER' WHERE role = 'member';
-- 
-- 4. 외래키 추가 (선택사항 - MySQL 제약으로 인해 복합키 불가)
--    -- 단일 컬럼 외래키만 가능 (code만 참조)
--    -- ALTER TABLE users ADD FOREIGN KEY (role_code) REFERENCES common_codes(code);
--    -- 주의: 이 경우 group_code를 함께 확인하는 트리거나 애플리케이션 로직이 필요합니다.
-- 
-- 5. 기존 ENUM 컬럼 삭제 (선택사항)
--    ALTER TABLE users DROP COLUMN role;
-- 
-- ============================================
-- 8. 참고사항
-- ============================================
-- 
-- - 이 스키마는 그룹 테이블과 코드 테이블로 명확히 분리되어 있습니다.
-- - common_code_groups: 코드의 카테고리 정의
-- - common_codes: 실제 코드값 저장
-- - 두 테이블은 group_code를 통해 연결됩니다.
-- 
-- - 다른 테이블에서 코드를 참조할 때는 common_codes.code를 참조하되,
--   애플리케이션 레벨에서 적절한 group_code를 함께 확인해야 합니다.
-- 
-- ============================================


TRUNCATE TABLE common_code_groups;
TRUNCATE TABLE common_codes;

DROP TABLE common_code_groups;
DROP TABLE common_codes;