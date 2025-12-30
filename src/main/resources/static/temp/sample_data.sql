-- 부산 관광 가이드 샘플 데이터 (공통코드 적용 버전)
-- Database: arata_busan
-- 주의: common_code_schema.sql을 먼저 실행해야 합니다!

USE arata_busan;

-- ============================================
-- 1. 지역 데이터 (4개)
-- ============================================
INSERT INTO regions (area_code, name) VALUES
(26710, '기장군'),
(26410, '금정구'),
(26440, '해운대구'),
(26290, '동래구'),
(26320, '북구'),
(26350, '강서구'),
(26530, '사상구'),
(26200, '부산진구'),
(26260, '남구'),
(26380, '사하구'),
(26230, '동구'),
(26140, '서구'),
(26110, '중구'),
(26470, '연제구'),
(26500, '수영구'),
(26170, '영도구');

-- ============================================
-- 2. 해시태그 데이터 (6개)
-- ============================================
INSERT INTO hashtags (name) VALUES
('해수욕장'),
('일출명소'),
('문화'),
('맛집'),
('쇼핑'),
('카페');

-- ============================================
-- 3. 사용자 데이터 (6개)
-- ============================================
-- 공통코드 사용: role_code (ADMIN, VIP, MEMBER), status_code (ACTIVE, INACTIVE, SUSPENDED), gender_code (MALE, FEMALE, OTHER)
INSERT INTO users (login_id, username, email, password_hash, role_code, status_code, profile_image, phone_number, address, birth_date, gender_code, join_date, last_login) VALUES
('admin', '관리자', 'admin@busan.com', '$2b$10$rQZ8K9mN2pL3qR4sT5uV6w', 'ADMIN', 'ACTIVE', NULL, '010-1234-5678', '부산광역시 해운대구', '1985-03-15', 'MALE', '2024-01-01', '2024-12-19 10:30:00'),
('user001', '홍길동', 'user001@gmail.com', '$2b$10$rQZ8K9mN2pL3qR4sT5uV6w', 'MEMBER', 'ACTIVE', NULL, '010-2345-6789', '부산광역시 중구', '1990-07-22', 'MALE', '2024-02-15', '2024-12-18 14:20:00'),
('vipuser', '김영희', 'vip@example.com', '$2b$10$rQZ8K9mN2pL3qR4sT5uV6w', 'VIP', 'ACTIVE', NULL, '010-3456-7890', '부산광역시 수영구', '1988-11-08', 'FEMALE', '2024-03-10', '2024-12-17 16:45:00'),
('testuser', '이철수', 'test@test.com', '$2b$10$rQZ8K9mN2pL3qR4sT5uV6w', 'MEMBER', 'INACTIVE', NULL, '010-4567-8901', '부산광역시 동래구', '1995-01-30', 'MALE', '2024-04-20', '2024-11-15 09:15:00'),
('suspended_user', '박민수', 'suspended@example.com', '$2b$10$rQZ8K9mN2pL3qR4sT5uV6w', 'MEMBER', 'SUSPENDED', NULL, '010-5678-9012', '부산광역시 해운대구', '1992-09-12', 'MALE', '2024-05-05', '2024-10-01 11:30:00'),
('busan_lover', '최지영', 'busan.lover@naver.com', '$2b$10$rQZ8K9mN2pL3qR4sT5uV6w', 'VIP', 'ACTIVE', NULL, '010-6789-0123', '부산광역시 수영구', '1987-04-18', 'FEMALE', '2024-06-01', '2024-12-16 13:25:00');

-- ============================================
-- 4. 관광지 데이터 (6개)
-- ============================================
-- 공통코드 사용: category_code (BEACH, MOUNTAIN, CULTURE, FOOD, SHOPPING, CAFE)
INSERT INTO tourist_spots (region_id, title, description, link_url, category_code, is_active, view_count, rating_avg, rating_count) VALUES
(1, '해운대 해수욕장', '부산의 대표 해수욕장으로 매년 수많은 관광객이 찾는 곳입니다.', 'https://www.busan.go.kr', 'BEACH', TRUE, 3500, 4.8, 245),
(2, '광안리 해수욕장', '광안대교의 아름다운 야경을 감상할 수 있는 해수욕장입니다.', 'https://www.busan.go.kr', 'BEACH', TRUE, 3200, 4.8, 245),
(3, '동래온천', '부산의 대표적인 온천지로 천연 온천수를 즐길 수 있습니다.', 'https://www.busan.go.kr', 'CULTURE', TRUE, 1200, 4.4, 87),
(4, '자갈치시장', '부산 대표 수산시장으로 신선한 해산물을 맛볼 수 있습니다.', 'https://www.busan.go.kr', 'FOOD', TRUE, 2200, 4.6, 167),
(1, '신세계 센텀시티', '세계 최대 규모의 백화점으로 기네스북에 등재된 대형 쇼핑몰입니다.', 'https://www.busan.go.kr', 'SHOPPING', TRUE, 2800, 4.4, 189),
(2, '카페리프 송정점', '송정해수욕장 뷰가 한눈에 보이는 카페입니다.', 'https://www.busan.go.kr', 'CAFE', TRUE, 320, 4.2, 24);

-- ============================================
-- 5. 관광지 이미지 데이터 (5개)
-- ============================================
INSERT INTO tourist_spot_images (tourist_spot_id, image_url) VALUES
(1, '../../images/haeundae-beach-1.jpg'),
(1, '../../images/haeundae-beach-2.jpg'),
(2, '../../images/gwangalli-beach-1.jpg'),
(3, '../../images/dongnae-onsen-1.jpg'),
(4, '../../images/jagalchi-market-1.jpg');

-- ============================================
-- 6. 관광지-해시태그 연결 데이터 (5개)
-- ============================================
INSERT INTO tourist_spot_hashtags (tourist_spot_id, hashtag_id) VALUES
(1, 1), -- 해운대 해수욕장 - 해수욕장
(1, 2), -- 해운대 해수욕장 - 일출명소
(2, 1), -- 광안리 해수욕장 - 해수욕장
(4, 4), -- 자갈치시장 - 맛집
(5, 5); -- 신세계 센텀시티 - 쇼핑

-- ============================================
-- 7. 리뷰 데이터 (5개)
-- ============================================
INSERT INTO reviews (user_id, tourist_spot_id, title, content, rating, is_approved) VALUES
(2, 1, '일출이 정말 아름다워요!', '해운대 해수욕장에서 본 일출이 정말 환상적이었어요. 새벽에 가면 더욱 아름다운 경치를 볼 수 있습니다.', 5, TRUE),
(3, 2, '야경이 환상적이에요', '광안대교 야경이 정말 아름다워요. 특히 저녁 시간대에 가면 더욱 멋진 풍경을 볼 수 있습니다.', 5, TRUE),
(4, 3, '온천이 정말 좋아요', '동래온천에서 피로를 풀었어요. 천연 온천수라서 몸이 정말 편해졌습니다.', 4, TRUE),
(5, 4, '신선한 해산물 맛집', '자갈치시장에서 먹은 회가 정말 신선했어요. 가격도 합리적이고 다양한 해산물을 맛볼 수 있어서 좋았습니다.', 4, TRUE),
(6, 5, '쇼핑하기 좋은 곳', '센텀시티 백화점이 정말 넓어요. 다양한 브랜드가 있어서 쇼핑하기 좋습니다.', 4, TRUE);

-- ============================================
-- 8. 리뷰 이미지 데이터 (4개)
-- ============================================
INSERT INTO review_images (review_id, image_url, image_order, alt_text) VALUES
(1, '../../images/reviews/haeundae-sunrise-1.jpg', 1, '해운대 해수욕장 일출 풍경'),
(1, '../../images/reviews/haeundae-sunrise-2.jpg', 2, '일출과 함께한 해운대'),
(2, '../../images/reviews/gwangalli-night-1.jpg', 1, '광안대교 야경'),
(4, '../../images/reviews/jagalchi-seafood-1.jpg', 1, '자갈치시장 해산물');

-- ============================================
-- 9. 관광지 좋아요 데이터 (5개)
-- ============================================
INSERT INTO tourist_spot_likes (user_id, tourist_spot_id) VALUES
(2, 1),
(3, 2),
(4, 3),
(5, 4),
(6, 5);

-- ============================================
-- 10. 리뷰 좋아요 데이터 (5개)
-- ============================================
INSERT INTO review_likes (user_id, review_id) VALUES
(3, 1),
(4, 1),
(5, 2),
(6, 2),
(2, 3);

-- ============================================
-- 11. 리뷰 댓글 데이터 (5개)
-- ============================================
INSERT INTO review_comments (user_id, review_id, content, is_approved) VALUES
(3, 1, '저도 일출 보러 가봤는데 정말 환상적이었어요!', TRUE),
(4, 1, '새벽에 가는 게 힘들긴 하지만 정말 가치 있는 경험이에요.', TRUE),
(5, 2, '광안대교 야경 정말 멋져요!', TRUE),
(6, 2, '데이트 코스로 완벽하겠네요.', TRUE),
(2, 3, '온천 정말 좋죠!', TRUE);

-- ============================================
-- 12. 리뷰 신고 데이터 (4개)
-- ============================================
-- 공통코드 사용: status_code (PENDING, REVIEWED, RESOLVED, DISMISSED)
INSERT INTO review_reports (user_id, review_id, reason, status_code) VALUES
(1, 1, '부적절한 내용이 포함되어 있습니다.', 'PENDING'),
(2, 2, '스팸성 리뷰로 의심됩니다.', 'REVIEWED'),
(3, 3, '허위 정보가 포함되어 있습니다.', 'RESOLVED'),
(4, 4, '욕설이 포함되어 있습니다.', 'DISMISSED');

-- ============================================
-- 테스트용 조회 쿼리
-- ============================================
SELECT * FROM regions;
SELECT * FROM hashtags;
SELECT * FROM users;
SELECT * FROM tourist_spots;
SELECT * FROM tourist_spot_images;
SELECT * FROM tourist_spot_hashtags;
SELECT * FROM reviews;
SELECT * FROM review_images;
SELECT * FROM tourist_spot_likes;

-- ============================================
-- 테스트용 복잡한 조회 쿼리
-- ============================================
SELECT * FROM tourist_spots WHERE region_id = 1;