-- 부산 관광 가이드 데이터베이스 스키마
-- Database: arata_busan
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
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    image_path VARCHAR(500), -- 로컬 이미지 경로 (우선순위)
    image_alt VARCHAR(200), -- 접근성을 위한 alt 텍스트
    link_url VARCHAR(500),
    category ENUM('beach', 'mountain', 'culture', 'food', 'shopping') DEFAULT 'culture',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE, -- 관리자 검증 상태
    view_count INT DEFAULT 0, -- 조회수
    rating_avg DECIMAL(3,2) DEFAULT 0.00, -- 평균 평점
    rating_count INT DEFAULT 0, -- 평점 개수
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
    INDEX idx_region (region_id),
    INDEX idx_category (category),
    INDEX idx_active (is_active),
    INDEX idx_verified (is_verified),
    INDEX idx_view_count (view_count),
    INDEX idx_rating (rating_avg)
);

-- 3. 해시태그 테이블
CREATE TABLE hashtags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 관광지-해시태그 연결 테이블
CREATE TABLE tourist_spot_hashtags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tourist_spot_id INT NOT NULL,
    hashtag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE,
    FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_spot_hashtag (tourist_spot_id, hashtag_id)
);

-- 5. 사용자 테이블
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'vip', 'member') DEFAULT 'member',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    profile_image VARCHAR(500),
    phone_number VARCHAR(20),
    address VARCHAR(300),
    birth_date DATE,
    gender ENUM('male', 'female', 'other'),
    join_date DATE NOT NULL,
    last_login TIMESTAMP NULL,
    login_count INT DEFAULT 0, -- 로그인 횟수
    email_verified BOOLEAN DEFAULT FALSE, -- 이메일 인증 상태
    email_verification_token VARCHAR(255), -- 이메일 인증 토큰
    password_reset_token VARCHAR(255), -- 비밀번호 재설정 토큰
    password_reset_expires TIMESTAMP NULL, -- 토큰 만료 시간
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_email_verified (email_verified)
);

-- 6. 리뷰 테이블
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tourist_spot_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_spot (tourist_spot_id),
    INDEX idx_rating (rating),
    INDEX idx_approved (is_approved)
);

-- 7. 축제/이벤트 테이블
CREATE TABLE festivals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    image_url VARCHAR(500),
    link_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dates (start_date, end_date),
    INDEX idx_active (is_active)
);

-- 8. 축제-해시태그 연결 테이블
CREATE TABLE festival_hashtags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    festival_id INT NOT NULL,
    hashtag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (festival_id) REFERENCES festivals(id) ON DELETE CASCADE,
    FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_festival_hashtag (festival_id, hashtag_id)
);

-- 9. 관리자 로그 테이블
CREATE TABLE admin_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INT,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin (admin_user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);

-- 10. 시스템 설정 테이블
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 11. 관광지 조회 기록 테이블
CREATE TABLE tourist_spot_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tourist_spot_id INT NOT NULL,
    user_id INT NULL, -- NULL이면 비회원 조회
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_spot (tourist_spot_id),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
);

-- 12. 즐겨찾기 테이블
CREATE TABLE favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tourist_spot_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_spot (user_id, tourist_spot_id),
    INDEX idx_user (user_id),
    INDEX idx_spot (tourist_spot_id)
);

-- 13. 검색 기록 테이블
CREATE TABLE search_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL, -- NULL이면 비회원 검색
    search_query VARCHAR(200) NOT NULL,
    search_type ENUM('keyword', 'tag', 'category', 'region') DEFAULT 'keyword',
    results_count INT DEFAULT 0,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_query (search_query),
    INDEX idx_type (search_type),
    INDEX idx_created (created_at)
);

-- 14. 이미지 메타데이터 테이블
CREATE TABLE image_metadata (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tourist_spot_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    image_url VARCHAR(500),
    file_size INT, -- 파일 크기 (바이트)
    width INT, -- 이미지 너비
    height INT, -- 이미지 높이
    format VARCHAR(10), -- 이미지 형식 (jpg, png, gif 등)
    alt_text VARCHAR(200), -- 접근성 텍스트
    is_primary BOOLEAN DEFAULT FALSE, -- 대표 이미지 여부
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE,
    INDEX idx_spot (tourist_spot_id),
    INDEX idx_primary (is_primary)
);

-- 15. 다국어 지원 테이블
CREATE TABLE translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(50) NOT NULL, -- 테이블명
    record_id INT NOT NULL, -- 레코드 ID
    field_name VARCHAR(50) NOT NULL, -- 필드명
    language_code VARCHAR(5) NOT NULL, -- 언어 코드 (ko, en, jp)
    translated_text TEXT NOT NULL, -- 번역된 텍스트
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_translation (table_name, record_id, field_name, language_code),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_language (language_code)
);


-- Delete Database
DROP DATABASE arata_busan;


-- 초기 데이터 삽입 스크립트

-- 1. 지역 데이터 삽입
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

-- 2. 해시태그 데이터 삽입 (name 필드에는 # 기호 없이 태그명만 저장)
INSERT INTO hashtags (name) VALUES
('사찰'), ('일출명소'), ('바다'), ('기장'), ('불교문화'),
('포토스팟'), ('가족여행'), ('무료관람'), ('주차가능'), ('실외'),
('해수욕장'), ('드라이브'), ('카페거리'), ('데이트코스'), ('바다뷰'),
('로맨틱'), ('사진촬영'), ('커플여행'), ('서핑'), ('모래사장'),
('산책'), ('조용'), ('파도'), ('여름'), ('식물원'),
('수목원'), ('경치'), ('나들이'), ('무료'), ('카페'),
('디저트'), ('산속뷰'), ('커피'), ('힐링'), ('자연'),
('연꽃'), ('환상적'), ('꽃구경'), ('등산'), ('범어사'),
('산'), ('하이킹'), ('운동'), ('천년고찰'), ('역사'),
('전통'), ('명상'), ('케이블카'), ('전망'), ('부산시내'),
('유료'), ('교통편리'), ('부산대표명소'), ('해수욕'), ('BIFF'),
('영화'), ('문화거리'), ('쇼핑'), ('먹거리'), ('축제'),
('문화'), ('센텀시티'), ('쇼핑몰'), ('기네스북'), ('백화점'),
('브랜드'), ('실내'), ('에어컨'), ('고급'), ('찜질방'),
('테마파크'), ('온천'), ('겨울'), ('아쿠아리움'), ('해양생물'),
('교육'), ('체험'), ('청사포'), ('다릿돌전망대'), ('일출'),
('온천'), ('휴식'), ('건강'), ('동래읍성'), ('문화재'),
('역사체험'), ('허심청'), ('돔형태'), ('유리천장'), ('채광'),
('전통시장'), ('농산물'), ('저렴'), ('로컬푸드'), ('장보기'),
('현지문화'), ('야경'), ('전망'), ('로맨틱'), ('공항'),
('교통'), ('관문'), ('여행시작'), ('면세점'), ('대중교통'),
('습지공원'), ('생태관광'), ('철새'), ('낙동강'), ('생태체험'),
('다대포'), ('꿈의낙조분수'), ('일몰'), ('분수쇼'), ('자전거도로'),
('낙동강변'), ('시민'), ('지하상가'), ('패션'), ('액세서리'),
('젊은이'), ('부평깡통시장'), ('야시장'), ('야간'), ('로컬푸드'),
('전포카페거리'), ('핫플레이스'), ('커피'), ('맛집'), ('트렌디'),
('분위기'), ('부산가족축제'), ('체험'), ('놀이'), ('아이'),
('부모'), ('함께'), ('즐거움'), ('UN기념공원'), ('평화'),
('전쟁기념'), ('조용'), ('성찰'), ('이기대공원'), ('해안절벽'),
('산책로'), ('절경'), ('일몰'), ('오륙도'), ('섬'),
('스카이워크'), ('해맞이공원'), ('선착장'), ('아미르공원'), ('공원'),
('부산국제매직페스티벌'), ('마술'), ('연중행사'), ('남천녹차팥빙수'), ('팥빙수'),
('녹차'), ('달콤'), ('부산바다축제'), ('물놀이'), ('해변'),
('몰운대'), ('낙동강하구'), ('전망대'), ('부산항'), ('시내전망'),
('야간'), ('송도해수욕장'), ('구름다리'), ('케이블카'), ('감천문화마을'),
('마추픽추'), ('벽화마을'), ('인스타그램'), ('계단'), ('예술'),
('송도해상케이블카'), ('탁트인경치'), ('서구'), ('송도달집축제'), ('달집'),
('불축제'), ('따뜻'), ('자갈치시장'), ('해산물'), ('회'),
('구이'), ('찜'), ('국제시장'), ('부산특미'), ('씨앗호떡'),
('비빔당면'), ('로컬'), ('용두산공원'), ('부산타워'), ('시내중심가'),
('관광'), ('온천천'), ('시민공원'), ('자전거'), ('도심공원'),
('연산동'), ('맛집거리'), ('미식'), ('음식점'), ('다양한음식'),
('광안리'), ('광안대교'), ('조명'), ('드라이브'), ('연의양과'),
('광안리라떼'), ('여유'), ('부산요트투어'), ('요트베이'), ('요트'),
('투어'), ('예약필요'), ('특별체험'), ('서프마린'), ('패들보드'),
('바다체험'), ('수상스포츠'), ('스노잉클라우드'), ('애견동반'), ('펫프렌들리'),
('데이오프데이'), ('우유빙수'), ('빙수'), ('뱅커'), ('조용'),
('마리솔'), ('특색'), ('개성'), ('한잔의풀내음'), ('향기'),
('특별'), ('차'), ('모티버'), ('트렌디'), ('젊은'),
('까사부사노'), ('테라스'), ('바람'), ('더빌리지샵'), ('빌리지'),
('컨셉'), ('패치킹'), ('소품샵'), ('패션잡화'), ('액세서리'),
('브랜드'), ('파도블'), ('메이크웨이브'), ('바다테마'), ('독특'),
('선물'), ('인테리어'), ('이티비티샵'), ('편집샵'), ('소품'),
('다양'), ('오다'), ('감성'), ('오프데이헤븐샵'), ('휴식테마'),
('페이퍼가든'), ('종이'), ('문구'), ('본점'), ('창작'),
('코지모지'), ('아늑'), ('오유아이'), ('독특'), ('아이템'),
('창작'), ('광안리어방축제'), ('봄축제'), ('어방'), ('지역축제'),
('부산세계시민축제'), ('세계'), ('시민'), ('국제'), ('다문화'),
('문화교류'), ('평화'), ('화합'), ('태종대'), ('절경'),
('등대'), ('바다풍경'), ('흰여울문화마을'), ('영화촬영지'), ('포토존'),
('국립해양박물관'), ('박물관'), ('해양'), ('전시'), ('영도맥주축제'),
('맥주'), ('영도'), ('시원'), ('성인'), ('음료'),
('페스티벌'), ('키스포츠페스티벌'), ('국제'), ('스포츠'), ('체험'),
('참여'), ('건강'), ('라라라페스티벌'), ('음악'), ('가을'),
('공연'), ('콘서트'), ('부산국제코미디페스티벌'), ('코미디'), ('웃음'),
('유머'), ('재미'), ('글로벌 영도커피페스티벌'), ('먹거리'), ('봄');

-- 3. 기본 관리자 계정 생성
INSERT INTO users (user_id, username, email, password_hash, role, status, phone_number, address, birth_date, gender, join_date) VALUES
('admin', '관리자', 'admin@aratabusan.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active', '010-1234-5678', '부산광역시 해운대구', '1985-03-15', 'male', '2024-01-01');

-- 4. 시스템 설정 초기값
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('site_name', '아라타부산', '사이트 이름'),
('site_description', '새로운 부산을 발견하다', '사이트 설명'),
('default_language', 'ko', '기본 언어'),
('max_review_length', '1000', '리뷰 최대 길이'),
('review_approval_required', 'false', '리뷰 승인 필요 여부'),
('max_upload_size', '5242880', '최대 업로드 크기 (바이트)'),
('allowed_image_types', 'jpg,jpeg,png,gif,webp', '허용된 이미지 타입'),
('maintenance_mode', 'false', '유지보수 모드'),
('registration_enabled', 'true', '회원가입 허용'),
('email_verification_required', 'false', '이메일 인증 필요 여부'),
('max_image_width', '1920', '이미지 최대 너비'),
('max_image_height', '1080', '이미지 최대 높이'),
('thumbnail_width', '300', '썸네일 너비'),
('thumbnail_height', '200', '썸네일 높이'),
('search_results_per_page', '12', '검색 결과 페이지당 개수'),
('popular_tags_count', '15', '인기 태그 표시 개수'),
('cache_duration', '3600', '캐시 지속 시간 (초)'),
('analytics_enabled', 'true', '분석 도구 사용 여부'),
('social_login_enabled', 'false', '소셜 로그인 사용 여부'),
('api_rate_limit', '1000', 'API 요청 제한 (시간당)'),
('backup_frequency', 'daily', '백업 빈도'),
('max_favorites_per_user', '50', '사용자당 최대 즐겨찾기 개수'),
('auto_approve_reviews', 'true', '리뷰 자동 승인 여부'),
('enable_user_reviews', 'true', '사용자 리뷰 기능 활성화'),
('enable_favorites', 'true', '즐겨찾기 기능 활성화'),
('enable_search_logs', 'true', '검색 로그 기록 여부'),
('enable_view_tracking', 'true', '조회수 추적 여부');
