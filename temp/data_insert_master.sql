-- 부산 관광 가이드 데이터베이스 전체 데이터 삽입 마스터 스크립트
-- 실행 순서: 스키마 생성 → 기본 데이터 삽입 → 관계 데이터 삽입

-- ===========================================
-- 1. 데이터베이스 및 테이블 생성
-- ===========================================
-- database_schema.sql 파일을 먼저 실행하세요

-- ===========================================
-- 2. 기본 데이터 삽입 (순서 중요)
-- ===========================================

-- 2-1. 지역 데이터 삽입
SOURCE data_insert_regions.sql;

-- 2-2. 해시태그 데이터 삽입
SOURCE data_insert_hashtags.sql;

-- 2-3. 사용자 데이터 삽입
SOURCE data_insert_users.sql;

-- 2-4. 관광지 데이터 삽입
SOURCE data_insert_tourist_spots.sql;

-- 2-5. 축제 데이터 삽입
SOURCE data_insert_festivals.sql;

-- ===========================================
-- 3. 관계 데이터 삽입
-- ===========================================

-- 3-1. 관광지-해시태그 연결 데이터 삽입
SOURCE data_insert_tourist_spot_hashtags.sql;

-- 3-2. 리뷰 데이터 삽입
SOURCE data_insert_reviews.sql;

-- 3-3. 다국어 번역 데이터 삽입
SOURCE data_insert_translations.sql;

-- ===========================================
-- 4. 데이터 삽입 완료 확인
-- ===========================================

-- 데이터 삽입 결과 확인
SELECT 'Regions' as table_name, COUNT(*) as count FROM regions
UNION ALL
SELECT 'Hashtags', COUNT(*) FROM hashtags
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Tourist Spots', COUNT(*) FROM tourist_spots
UNION ALL
SELECT 'Festivals', COUNT(*) FROM festivals
UNION ALL
SELECT 'Tourist Spot Hashtags', COUNT(*) FROM tourist_spot_hashtags
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'Translations', COUNT(*) FROM translations;

-- ===========================================
-- 5. 샘플 데이터 조회
-- ===========================================

-- 관광지와 해시태그 조회
SELECT 
    ts.title as '관광지명',
    r.name as '지역',
    GROUP_CONCAT(h.name SEPARATOR ', ') as '해시태그'
FROM tourist_spots ts
JOIN regions r ON ts.region_id = r.id
LEFT JOIN tourist_spot_hashtags tsh ON ts.id = tsh.tourist_spot_id
LEFT JOIN hashtags h ON tsh.hashtag_id = h.id
GROUP BY ts.id, ts.title, r.name
LIMIT 10;

-- 리뷰와 평점 조회
SELECT 
    ts.title as '관광지명',
    u.username as '사용자명',
    r.title as '리뷰제목',
    r.rating as '평점',
    r.created_at as '작성일'
FROM reviews r
JOIN tourist_spots ts ON r.tourist_spot_id = ts.id
JOIN users u ON r.user_id = u.id
ORDER BY r.created_at DESC
LIMIT 10;

-- 축제 정보 조회
SELECT 
    title as '축제명',
    description as '설명',
    start_date as '시작일',
    end_date as '종료일',
    is_active as '활성상태'
FROM festivals
ORDER BY start_date;

-- 다국어 번역 조회
SELECT 
    table_name as '테이블명',
    field_name as '필드명',
    language_code as '언어코드',
    translated_text as '번역텍스트'
FROM translations
WHERE table_name = 'tourist_spots'
LIMIT 10;

-- ===========================================
-- 6. 인덱스 및 성능 최적화 확인
-- ===========================================

-- 인덱스 사용 통계 확인
SHOW INDEX FROM tourist_spots;
SHOW INDEX FROM reviews;
SHOW INDEX FROM users;

-- ===========================================
-- 7. 데이터 무결성 확인
-- ===========================================

-- 외래키 제약조건 확인
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = 'arata_busan'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- ===========================================
-- 완료 메시지
-- ===========================================
SELECT '데이터 삽입이 완료되었습니다!' as message;
