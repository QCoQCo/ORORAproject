-- 관광지 데이터 삽입 스크립트
-- tourist_spots 테이블에 데이터 삽입

-- 기장군 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(1, '해동 용궁사', '바다 위에 세워진 아름다운 사찰입니다. 일출 명소로도 유명하며 독특한 위치로 많은 관광객이 찾습니다.', '../../images/2025(4).jpg', '해동 용궁사 전경', '#', 'culture', TRUE, TRUE, 1250, 4.5, 89),
(1, '기장 해수욕장', '아름다운 해안 드라이브 코스로 유명한 기장의 해안선입니다. 카페와 맛집이 많아 드라이브 코스로 인기가 높습니다.', '../../images/common (33).jpg', '기장 해수욕장', '#', 'beach', TRUE, TRUE, 980, 4.2, 67),
(1, '송정해수욕장', '송정해수욕장은 모래가 곱고 산책하기에 조용하고, 파도가 있어서 서핑도 가능합니다.', '../../images/common (5).jpg', '송정해수욕장', '#', 'beach', TRUE, TRUE, 1100, 4.3, 78),
(1, '아홉산숲', '경치도 좋고 햇살 따뜻한날 산책, 나들이 좋은 곳입니다.', '../../images/common (34).jpg', '아홉산숲', '#', 'mountain', TRUE, TRUE, 650, 4.1, 45),
(1, '유정1995', '산속 뷰를 보며 즐기는 커피 한잔', '../../images/cafe02.jpg', '유정1995 카페', '#', 'food', TRUE, TRUE, 420, 4.4, 32),
(1, '곰내연밭', '연꽃 구경하기 좋은 환상적인 곳입니다.', '../../images/common (15).jpg', '곰내연밭 연꽃', '#', 'culture', TRUE, TRUE, 380, 4.0, 28);

-- 금정구 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(2, '금정산', '부산 시민들의 등산 명소로 금정산성과 범어사가 있습니다. 사계절 아름다운 자연경관을 자랑합니다.', '../../images/common (22).jpg', '금정산 전경', '#', 'mountain', TRUE, TRUE, 2100, 4.6, 156),
(2, '범어사', '금정산에 위치한 천년고찰로 부산의 대표적인 사찰입니다. 아름다운 자연경관과 함께 불교문화를 체험할 수 있습니다.', '../../images/common (23).jpg', '범어사', '#', 'culture', TRUE, TRUE, 1800, 4.5, 134),
(2, '금강공원케이블카', '탁트인 전망을 감상할 수 있는 케이블카로 부산 시내를 한눈에 볼 수 있습니다.', '../../images/common (24).jpg', '금강공원 케이블카', '#', 'culture', TRUE, TRUE, 950, 4.3, 72);

-- 해운대구 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(3, '해운대 해수욕장', '모래사장과 바다바람이 불어서 시원하고 드넓은 바다에 눈도 호강할 수 있습니다. 부산의 대표 해수욕장으로 매년 수많은 관광객이 찾는 곳입니다.', '../../images/common (3).jpg', '해운대 해수욕장', '#', 'beach', TRUE, TRUE, 3500, 4.4, 245),
(3, '부산국제영화제', 'BIFF 광장으로 불리는 영화의 거리입니다. 매년 부산국제영화제가 열리는 곳으로 유명합니다.', '../../images/common (25).jpg', 'BIFF 광장', '#', 'culture', TRUE, TRUE, 1200, 4.2, 89),
(3, '신세계 센텀시티', '세계 최대 규모의 백화점으로 기네스북에 등재된 대형 쇼핑몰입니다. 센텀시티의 랜드마크 역할을 합니다.', '../../images/common (26).jpg', '센텀시티', '#', 'shopping', TRUE, TRUE, 2800, 4.3, 198),
(3, '센텀 스파랜드', '찜질방 테마파크 같은 곳! 방마다 온도가 엄청 다양하게 있고, 방마다 인테리어도 달라서 보는 재미도 있습니다.', '../../images/common (6).jpg', '센텀 스파랜드', '#', 'culture', TRUE, TRUE, 1600, 4.1, 112),
(3, '씨라이프부산아쿠아리움', '해운대에 위치한 대형 아쿠아리움으로 다양한 해양생물을 관찰할 수 있습니다.', '../../images/2025(3).jpg', '씨라이프 아쿠아리움', '#', 'culture', TRUE, TRUE, 1900, 4.4, 145),
(3, '청사포다릿돌전망대', '청사포 해안의 아름다운 전망을 감상할 수 있는 전망대입니다.', '../../images/common (31).jpg', '청사포 다릿돌전망대', '#', 'culture', TRUE, TRUE, 750, 4.2, 56);

-- 동래구 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(4, '동래온천', '부산의 대표적인 온천지로 천연 온천수를 즐길 수 있습니다. 피로 회복과 휴식에 좋습니다.', '../../images/common (27).jpg', '동래온천', '#', 'culture', TRUE, TRUE, 1400, 4.3, 98),
(4, '동래읍성', '조선시대 동래부의 중심지였던 곳으로 역사적 가치가 높습니다. 전통 문화를 체험할 수 있습니다.', '../../images/2025(8).jpg', '동래읍성', '#', 'culture', TRUE, TRUE, 850, 4.1, 63),
(4, '허심청', '채광이 좋은 돔형태 유리천장이 있는 온천! 가족과 같이 가기 좋은 곳입니다.', '../../images/common (7).jpg', '허심청 온천', '#', 'culture', TRUE, TRUE, 920, 4.2, 71);

-- 북구 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(5, '구포시장', '부산 북구의 대표 전통시장입니다. 신선한 농산물과 다양한 먹거리를 저렴한 가격에 즐길 수 있습니다.', '../../images/2025(9).jpg', '구포시장', '#', 'food', TRUE, TRUE, 680, 4.0, 48),
(5, '만덕고개누리길전망테크', '야경하기 좋은 곳입니다.', '../../images/common (20).jpg', '만덕고개 전망대', '#', 'culture', TRUE, TRUE, 420, 3.9, 31);

-- 강서구 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(6, '김해공항', '부산의 관문 역할을 하는 김해국제공항입니다. 교통의 요충지로 많은 여행객들이 이용합니다.', '../../images/2025(11).jpg', '김해공항', '#', 'culture', TRUE, TRUE, 500, 3.8, 25),
(6, '강서습지생태공원', '낙동강 하구에 위치한 생태공원으로 다양한 철새와 습지 생물을 관찰할 수 있습니다.', '../../images/2025(10).jpg', '강서습지생태공원', '#', 'mountain', TRUE, TRUE, 580, 4.1, 42),
(6, '다대포 꿈의 낙조분수', '아름다운 일몰과 함께 즐기는 분수쇼로 유명한 곳입니다.', '../../images/2025(12).jpg', '다대포 꿈의 낙조분수', '#', 'culture', TRUE, TRUE, 720, 4.3, 54);

-- 사상구 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(7, '삼락생태공원', '낙동강변에 위치한 대규모 생태공원입니다. 자전거 도로와 산책로가 잘 조성되어 있어 시민들의 휴식 공간으로 인기가 높습니다.', '../../images/2025(13).jpg', '삼락생태공원', '#', 'mountain', TRUE, TRUE, 890, 4.2, 67),
(7, '대천천 누리길', '자연과 함께하는 산책로로 힐링하기 좋은 곳입니다.', '../../images/2025(2).jpg', '대천천 누리길', '#', 'mountain', TRUE, TRUE, 450, 3.9, 33);

-- 부산진구 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(8, '서면 지하상가', '부산 최대의 지하상가로 패션, 액세서리, 먹거리 등을 저렴한 가격에 구매할 수 있습니다.', '../../images/2025(14).jpg', '서면 지하상가', '#', 'shopping', TRUE, TRUE, 1200, 4.1, 89),
(8, '부평깡통시장', '야시장으로 유명한 전통시장입니다. 저렴한 가격에 다양한 먹거리를 즐길 수 있어 젊은 층에게 인기가 높습니다.', '../../images/2025(15).jpg', '부평깡통시장', '#', 'food', TRUE, TRUE, 980, 4.2, 74),
(8, '전포카페거리', '다양한 카페와 맛집이 모여있는 젊은이들의 핫플레이스입니다.', '../../images/2025(16).jpg', '전포카페거리', '#', 'food', TRUE, TRUE, 1100, 4.3, 82);

-- 남구 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(9, 'UN기념공원', '한국전쟁 참전 UN군 전사자들을 기리는 공원입니다. 평화와 희생을 되새길 수 있는 의미 있는 장소입니다.', '../../images/2025(17).jpg', 'UN기념공원', '#', 'culture', TRUE, TRUE, 650, 4.0, 47),
(9, '이기대공원', '해안 절벽을 따라 조성된 공원으로 아름다운 바다 전망을 감상할 수 있습니다. 산책로가 잘 조성되어 있습니다.', '../../images/common (30).jpg', '이기대공원', '#', 'mountain', TRUE, TRUE, 850, 4.3, 64),
(9, '오륙도', '오륙도(방패섬, 솔섬, 수리섬, 송곳섬, 굴섬, 등대섬(밭섬)) 인근 오륙도선착장, 오륙도스카이워크, 오륙도해맞이공원 등 구경할 수 있는 곳입니다.', '../../images/common (19).jpg', '오륙도', '#', 'culture', TRUE, TRUE, 1200, 4.4, 91),
(9, '부산 아미르공원', '남구에 위치한 아름다운 공원으로 시민들의 휴식공간입니다.', '../../images/2025(1).jpg', '아미르공원', '#', 'mountain', TRUE, TRUE, 420, 3.8, 31);

-- 사하구 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(10, '다대포해수욕장', '부산바다축제 부산의 바다를 테마로 한 여름 축제', '../../images/sandbeach.jpg', '다대포해수욕장', '#', 'beach', TRUE, TRUE, 1100, 4.2, 78),
(10, '몰운대', '낙동강 하구와 남해를 조망할 수 있는 절경 명소입니다. 일몰 감상 포인트로 유명합니다.', '../../images/2025(19).jpg', '몰운대', '#', 'mountain', TRUE, TRUE, 750, 4.3, 56);

-- 동구 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(11, '동구 전망대', '부산항과 부산 시내를 한눈에 볼 수 있는 전망대입니다. 야경이 특히 아름다운 곳으로 유명합니다.', '../../images/2025(18).jpg', '동구 전망대', '#', 'culture', TRUE, TRUE, 580, 4.1, 43);

-- 서구 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(12, '송도해수욕장', '부산 최초의 해수욕장으로 역사가 깊습니다. 송도구름산책로와 송도용궁구름다리가 유명합니다.', '../../images/common (36).jpg', '송도해수욕장', '#', 'beach', TRUE, TRUE, 1300, 4.2, 95),
(12, '감천문화마을', '정면으로는 청량한 부산의 바다, 뒤로는 조화롭게 어우러진 건물들이 마치 동화 속 마을 같습니다. 부산의 마추픽추라 불리는 알록달록한 문화마을입니다.', '../../images/common (10).jpg', '감천문화마을', '#', 'culture', TRUE, TRUE, 2500, 4.5, 189),
(12, '송도해상케이블카', '탁트인 바다를 감상하며, 시원한 경치를 즐길수 있어요.', '../../images/common (9).jpg', '송도해상케이블카', '#', 'culture', TRUE, TRUE, 1800, 4.4, 134);

-- 중구 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(13, '자갈치시장', '부산 대표 수산시장으로 신선한 해산물을 맛볼 수 있습니다. 회, 구이, 찜 등 다양한 해산물 요리를 즐길 수 있습니다.', '../../images/common (29).jpg', '자갈치시장', '#', 'food', TRUE, TRUE, 1600, 4.3, 118),
(13, '국제시장', '부산의 전통시장으로 다양한 먹거리와 볼거리가 있습니다. 씨앗호떡, 비빔당면 등 부산 특미를 맛볼 수 있습니다.', '../../images/2025(23).jpg', '국제시장', '#', 'food', TRUE, TRUE, 1400, 4.2, 102),
(13, '용두산공원', '부산타워가 있는 시내 중심가의 공원입니다. 부산 시내 전경을 한눈에 볼 수 있습니다.', '../../images/2025(24).jpg', '용두산공원', '#', 'culture', TRUE, TRUE, 1200, 4.1, 89);

-- 연제구 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(14, '온천천 시민공원', '도심 속 자연을 느낄 수 있는 시민공원입니다. 산책로와 자전거 도로가 잘 조성되어 있어 시민들의 쉼터 역할을 합니다.', '../../images/2025(25).jpg', '온천천 시민공원', '#', 'mountain', TRUE, TRUE, 680, 4.0, 51),
(14, '연산동 맛집거리', '연제구의 대표 맛집 거리입니다. 다양한 음식점과 카페가 밀집되어 있어 미식가들에게 인기가 높습니다.', '../../images/2025(26).jpg', '연산동 맛집거리', '#', 'food', TRUE, TRUE, 920, 4.2, 69);

-- 수영구 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(15, '광안리 해수욕장', '아름다운 광안리 바다뷰 🌊🌅 혼자 여행하기에도 좋은 장소로 추천합니다. 광안대교의 아름다운 야경을 감상할 수 있는 해수욕장입니다.', '../../images/common (4).jpg', '광안리 해수욕장', '#', 'beach', TRUE, TRUE, 2800, 4.4, 201),
(15, '광안대교', '부산의 랜드마크인 아름다운 다리입니다. 밤에는 화려한 조명으로 더욱 아름다운 모습을 보여줍니다.', '../../images/fireworks.jpg', '광안대교', '#', 'culture', TRUE, TRUE, 2200, 4.5, 167);

-- 영도구 관광지
INSERT INTO tourist_spots (region_id, title, description, image_path, image_alt, link_url, category, is_active, is_verified, view_count, rating_avg, rating_count) VALUES
(16, '태종대', '부산의 대표 관광지로 절경으로 유명합니다. 등대와 전망대에서 바라보는 바다 풍경이 장관입니다.', '../../images/rock.jpg', '태종대', '#', 'mountain', TRUE, TRUE, 1500, 4.4, 112),
(16, '흰여울문화마을', '흰여울문화마을은 정말 힐링하러 오기 딱 좋은 곳이에요! 바다를 배경으로 한 아름다운 문화마을입니다.', '../../images/common (8).jpg', '흰여울문화마을', '#', 'culture', TRUE, TRUE, 1800, 4.3, 134),
(16, '국립 해양박물관', '해양 관련 전시와 체험을 할 수 있는 박물관입니다.', '../../images/2025(7).jpg', '국립해양박물관', '#', 'culture', TRUE, TRUE, 950, 4.1, 71);
