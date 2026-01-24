-- ============================================
-- 로그인 타입 컬럼 추가 마이그레이션
-- Database: arata_busan
-- 설명: users 테이블에 login_type_code 컬럼 추가
-- ============================================

USE arata_busan;

-- 1. users 테이블에 login_type_code 컬럼 추가
ALTER TABLE users 
ADD COLUMN login_type_code VARCHAR(50) DEFAULT 'NOR' 
COMMENT '로그인 타입 코드 (LOGIN_TYPE 그룹 참조)' 
AFTER password_hash;

-- 2. 기존 데이터는 모두 일반 회원가입(NOR)으로 설정
UPDATE users SET login_type_code = 'NOR' WHERE login_type_code IS NULL;

-- 3. 인덱스 추가
ALTER TABLE users ADD INDEX idx_login_type_code (login_type_code);

-- 4. 외래키 추가 (선택사항 - 공통코드 참조)
-- 주의: MySQL의 제약으로 인해 복합키 외래키는 불가능하므로,
-- 애플리케이션 레벨에서 group_code를 함께 확인해야 합니다.
-- ALTER TABLE users ADD FOREIGN KEY (login_type_code) REFERENCES common_codes(code);

-- ============================================
-- 롤백 스크립트 (필요시 사용)
-- ============================================
-- ALTER TABLE users DROP FOREIGN KEY users_ibfk_X; -- 외래키가 있다면
-- ALTER TABLE users DROP INDEX idx_login_type_code;
-- ALTER TABLE users DROP COLUMN login_type_code;
