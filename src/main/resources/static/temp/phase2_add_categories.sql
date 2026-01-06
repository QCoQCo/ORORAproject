-- Phase 2: 카테고리 코드 확장
-- common_codes 테이블에 추가 카테고리 INSERT

USE arata_busan;

-- SPOT_CATEGORY 그룹에 추가 카테고리 INSERT
INSERT INTO common_codes (group_code, code, code_name, code_name_en, code_name_jp, description, sort_order) VALUES
('SPOT_CATEGORY', 'FAMILY', '가족', 'Family', '家族', '가족 여행에 적합한 관광지', 7),
('SPOT_CATEGORY', 'COUPLE', '연인', 'Couple', '恋人', '연인/커플 여행에 적합한 관광지', 8),
('SPOT_CATEGORY', 'SOLO', '혼자', 'Solo', '一人', '혼자 여행에 적합한 관광지', 9),
('SPOT_CATEGORY', 'FRIEND', '친구', 'Friend', '友達', '친구와 함께 가기 좋은 관광지', 10),
('SPOT_CATEGORY', 'ETC', '기타', 'Etc', 'その他', '기타 관광지', 11);

-- 확인 쿼리
-- SELECT * FROM common_codes WHERE group_code = 'SPOT_CATEGORY' ORDER BY sort_order;
