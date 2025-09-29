-- 다국어 번역 데이터 삽입 스크립트
-- translations 테이블에 데이터 삽입

-- 영어 번역 데이터 (일부 주요 항목만 포함)
INSERT INTO translations (table_name, record_id, field_name, language_code, translated_text, created_at, updated_at) VALUES
('tourist_spots', 1, 'title', 'en', 'Haedong Yonggungsa Temple', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 1, 'description', 'en', 'A beautiful temple built on the sea. Famous as a sunrise spot, it attracts many tourists due to its unique location.', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 2, 'title', 'en', 'Gijang Beach', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 2, 'description', 'en', 'Famous for its beautiful coastal drive course in Gijang. Popular as a drive course with many cafes and restaurants.', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 8, 'title', 'en', 'Haeundae Beach', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 8, 'description', 'en', 'A wide sandy beach with cool sea breeze. Busan''s representative beach that attracts countless tourists every year.', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 35, 'title', 'en', 'Gamcheon Culture Village', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 35, 'description', 'en', 'Colorful houses harmoniously arranged against the backdrop of Busan''s clear sea, like a village from a fairy tale. Known as Busan''s Machu Picchu.', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 42, 'title', 'en', 'Gwangalli Beach', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 42, 'description', 'en', 'Beautiful Gwangalli sea view 🌊🌅 Recommended even for solo travelers. A beach where you can enjoy the beautiful night view of Gwangandaegyo Bridge.', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 44, 'title', 'en', 'Taejongdae', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 44, 'description', 'en', 'Busan''s representative tourist destination famous for its scenic beauty. The sea view from the lighthouse and observatory is spectacular.', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),

-- 일본어 번역 데이터 (일부 주요 항목만 포함)
('tourist_spots', 1, 'title', 'jp', '海東龍宮寺', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 1, 'description', 'jp', '海の上に建てられた美しい寺院です。日の出の名所としても有名で、独特な位置で多くの観光客が訪れます。', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 2, 'title', 'jp', '機張海水浴場', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 2, 'description', 'jp', '美しい海岸ドライブコースで有名な機張の海岸線です。カフェとレストランが多く、ドライブコースとして人気が高いです。', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 8, 'title', 'jp', '海雲台海水浴場', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 8, 'description', 'jp', '砂浜と海風が吹いて涼しく、広々とした海で目も楽しめます。釜山の代表的な海水浴場で、毎年多くの観光客が訪れます。', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 35, 'title', 'jp', '甘川文化村', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 35, 'description', 'jp', '正面には釜山の清らかな海、後ろには調和よく調和された建物が童話の中の村のようです。釜山のマチュピチュと呼ばれるカラフルな文化村です。', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 42, 'title', 'jp', '広安里海水浴場', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 42, 'description', 'jp', '美しい広安里の海の景色🌊🌅 一人旅にもおすすめの場所です。広安大橋の美しい夜景を楽しめる海水浴場です。', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 44, 'title', 'jp', '太宗台', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('tourist_spots', 44, 'description', 'jp', '釜山の代表的な観光地で絶景で有名です。灯台と展望台から見る海の風景は壮観です。', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),

-- 축제 번역 데이터
('festivals', 1, 'title', 'en', 'Busan Family Festival', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('festivals', 1, 'description', 'en', 'A festival that families can enjoy together', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('festivals', 1, 'title', 'jp', '釜山家族祭り', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('festivals', 1, 'description', 'jp', '家族が一緒に楽しめる祭り', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('festivals', 2, 'title', 'en', 'Busan International Magic Festival', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('festivals', 2, 'description', 'en', 'An annual magic festival where you can enjoy various magic performances', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('festivals', 2, 'title', 'jp', '釜山国際マジックフェスティバル', '2024-12-01 00:00:00', '2024-12-01 00:00:00'),
('festivals', 2, 'description', 'jp', '毎年開催されるマジック祭りで、様々なマジック公演を楽しめます', '2024-12-01 00:00:00', '2024-12-01 00:00:00');
