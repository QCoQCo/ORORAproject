# 부산 관광 데이터베이스 스키마 가이드

## 📋 개요

이 문서는 부산 관광 정보를 관리하는 데이터베이스의 구조를 초보자도 이해하기 쉽게 설명한 가이드입니다. 총 15개의 테이블로 구성되어 있으며, 각 테이블의 역할과 관계를 자세히 설명합니다.

## 🎯 데이터베이스를 만든 이유

### 1. **부산 관광 정보 체계적 관리**

-   부산의 16개 구/군별 관광지 정보를 체계적으로 관리
-   관광지별 상세 정보, 이미지, 평점 등을 통합 관리
-   사용자 리뷰와 평점 시스템으로 신뢰성 있는 정보 제공

### 2. **다국어 지원**

-   한국어, 영어, 일본어 등 다양한 언어로 관광 정보 제공
-   국제 관광객을 위한 접근성 향상

### 3. **사용자 경험 개선**

-   개인화된 즐겨찾기 기능
-   검색 패턴 분석을 통한 맞춤형 추천
-   조회 통계를 통한 인기 관광지 파악

### 4. **관리자 기능**

-   관리자 활동 로그 추적
-   시스템 설정 관리
-   콘텐츠 승인 및 관리

---

## 🗂️ 테이블 구조 및 설명

### 1. **regions (지역 테이블)**

**역할**: 부산 16개 구/군 정보를 저장하는 기본 테이블

| 컬럼명     | 타입        | 설명                           |
| ---------- | ----------- | ------------------------------ |
| id         | INT         | 지역 고유 ID (기본키)          |
| area_code  | INT         | 행정구역코드                   |
| name       | VARCHAR(30) | 지역명 (예: 해운대구, 중구 등) |
| created_at | TIMESTAMP   | 생성일시                       |
| updated_at | TIMESTAMP   | 수정일시                       |

**사용 예시**:

-   해운대구, 중구, 동래구 등 부산의 16개 구/군 정보
-   관광지가 어느 지역에 속하는지 구분하는 기준

---

### 2. **tourist_spots (관광지 테이블)**

**역할**: 부산의 모든 관광지 정보를 저장하는 핵심 테이블

| 컬럼명       | 타입         | 설명                                                |
| ------------ | ------------ | --------------------------------------------------- |
| id           | INT          | 관광지 고유 ID (기본키)                             |
| region_id    | INT          | 지역 ID (regions 테이블과 연결)                     |
| title        | VARCHAR(200) | 관광지명                                            |
| description  | TEXT         | 관광지 설명                                         |
| image_url    | VARCHAR(500) | 이미지 URL                                          |
| image_path   | VARCHAR(500) | 로컬 이미지 경로                                    |
| image_alt    | VARCHAR(200) | 이미지 alt 텍스트                                   |
| link_url     | VARCHAR(500) | 관련 링크 URL                                       |
| category     | ENUM         | 카테고리 (beach, mountain, culture, food, shopping) |
| is_active    | BOOLEAN      | 활성 상태                                           |
| is_verified  | BOOLEAN      | 검증 상태                                           |
| view_count   | INT          | 조회수                                              |
| rating_avg   | DECIMAL(3,2) | 평균 평점                                           |
| rating_count | INT          | 평점 개수                                           |
| created_at   | TIMESTAMP    | 생성일시                                            |
| updated_at   | TIMESTAMP    | 수정일시                                            |

**사용 예시**:

-   해운대해수욕장, 감천문화마을, 자갈치시장 등
-   각 관광지의 상세 정보, 이미지, 평점 등을 관리

---

### 3. **users (사용자 테이블)**

**역할**: 회원 및 관리자 계정 정보를 저장

| 컬럼명                   | 타입         | 설명                               |
| ------------------------ | ------------ | ---------------------------------- |
| id                       | INT          | 사용자 고유 ID (기본키)            |
| user_id                  | VARCHAR(50)  | 사용자 고유 ID                     |
| username                 | VARCHAR(100) | 사용자명                           |
| email                    | VARCHAR(200) | 이메일                             |
| password_hash            | VARCHAR(255) | 비밀번호 해시                      |
| role                     | ENUM         | 역할 (admin, vip, member)          |
| status                   | ENUM         | 상태 (active, inactive, suspended) |
| profile_image            | VARCHAR(500) | 프로필 이미지                      |
| phone_number             | VARCHAR(20)  | 전화번호                           |
| address                  | VARCHAR(300) | 주소                               |
| birth_date               | DATE         | 생년월일                           |
| gender                   | ENUM         | 성별 (male, female, other)         |
| join_date                | DATE         | 가입일                             |
| last_login               | TIMESTAMP    | 마지막 로그인                      |
| login_count              | INT          | 로그인 횟수                        |
| email_verified           | BOOLEAN      | 이메일 인증 상태                   |
| email_verification_token | VARCHAR(255) | 이메일 인증 토큰                   |
| password_reset_token     | VARCHAR(255) | 비밀번호 재설정 토큰               |
| password_reset_expires   | TIMESTAMP    | 토큰 만료 시간                     |
| created_at               | TIMESTAMP    | 생성일시                           |
| updated_at               | TIMESTAMP    | 수정일시                           |

**사용 예시**:

-   일반 회원, VIP 회원, 관리자 구분
-   회원가입, 로그인, 프로필 관리

---

### 4. **hashtags (해시태그 테이블)**

**역할**: 관광지와 축제에 사용되는 해시태그 정보

| 컬럼명     | 타입         | 설명                 |
| ---------- | ------------ | -------------------- |
| id         | INT          | 해시태그 ID (기본키) |
| name       | VARCHAR(100) | 해시태그명           |
| created_at | TIMESTAMP    | 생성일시             |

**사용 예시**:

-   #해운대, #감천문화마을, #부산여행 등
-   관광지와 축제를 태그로 분류하여 검색 기능 향상

---

### 5. **reviews (리뷰 테이블)**

**역할**: 사용자가 작성한 관광지 리뷰 정보

| 컬럼명          | 타입         | 설명                                    |
| --------------- | ------------ | --------------------------------------- |
| id              | INT          | 리뷰 ID (기본키)                        |
| user_id         | INT          | 사용자 ID (users 테이블과 연결)         |
| tourist_spot_id | INT          | 관광지 ID (tourist_spots 테이블과 연결) |
| title           | VARCHAR(200) | 리뷰 제목                               |
| content         | TEXT         | 리뷰 내용                               |
| rating          | INT          | 평점                                    |
| is_approved     | BOOLEAN      | 승인 상태                               |
| created_at      | TIMESTAMP    | 생성일시                                |
| updated_at      | TIMESTAMP    | 수정일시                                |

**사용 예시**:

-   사용자가 관광지에 대한 후기와 평점을 작성
-   관리자가 리뷰를 승인하여 공개

---

### 6. **festivals (축제/이벤트 테이블)**

**역할**: 부산의 축제 및 이벤트 정보

| 컬럼명      | 타입         | 설명             |
| ----------- | ------------ | ---------------- |
| id          | INT          | 축제 ID (기본키) |
| title       | VARCHAR(200) | 축제명           |
| description | TEXT         | 축제 설명        |
| start_date  | DATE         | 시작일           |
| end_date    | DATE         | 종료일           |
| image_url   | VARCHAR(500) | 이미지 URL       |
| link_url    | VARCHAR(500) | 링크 URL         |
| is_active   | BOOLEAN      | 활성 상태        |
| created_at  | TIMESTAMP    | 생성일시         |
| updated_at  | TIMESTAMP    | 수정일시         |

**사용 예시**:

-   부산국제영화제, 부산불꽃축제 등
-   축제 기간과 상세 정보 관리

---

### 7. **tourist_spot_hashtags (관광지-해시태그 연결 테이블)**

**역할**: 관광지와 해시태그를 연결하는 중간 테이블

| 컬럼명          | 타입      | 설명             |
| --------------- | --------- | ---------------- |
| id              | INT       | 연결 ID (기본키) |
| tourist_spot_id | INT       | 관광지 ID        |
| hashtag_id      | INT       | 해시태그 ID      |
| created_at      | TIMESTAMP | 생성일시         |

**사용 예시**:

-   해운대해수욕장 → #해운대, #바다, #해수욕장
-   하나의 관광지에 여러 해시태그 연결 가능

---

### 8. **festival_hashtags (축제-해시태그 연결 테이블)**

**역할**: 축제와 해시태그를 연결하는 중간 테이블

| 컬럼명      | 타입      | 설명             |
| ----------- | --------- | ---------------- |
| id          | INT       | 연결 ID (기본키) |
| festival_id | INT       | 축제 ID          |
| hashtag_id  | INT       | 해시태그 ID      |
| created_at  | TIMESTAMP | 생성일시         |

**사용 예시**:

-   부산국제영화제 → #영화제, #부산, #문화
-   하나의 축제에 여러 해시태그 연결 가능

---

### 9. **admin_logs (관리자 로그 테이블)**

**역할**: 관리자의 모든 활동을 추적하는 로그 테이블

| 컬럼명        | 타입         | 설명                               |
| ------------- | ------------ | ---------------------------------- |
| id            | INT          | 로그 ID (기본키)                   |
| admin_user_id | INT          | 관리자 사용자 ID                   |
| action        | VARCHAR(100) | 액션 (예: create, update, delete)  |
| target_type   | VARCHAR(50)  | 대상 타입 (예: tourist_spot, user) |
| target_id     | INT          | 대상 ID                            |
| details       | JSON         | 상세 정보                          |
| ip_address    | VARCHAR(45)  | IP 주소                            |
| created_at    | TIMESTAMP    | 생성일시                           |

**사용 예시**:

-   관리자가 관광지 정보를 수정한 기록
-   보안 및 감사 목적으로 사용

---

### 10. **system_settings (시스템 설정 테이블)**

**역할**: 애플리케이션의 설정값들을 저장

| 컬럼명        | 타입         | 설명             |
| ------------- | ------------ | ---------------- |
| id            | INT          | 설정 ID (기본키) |
| setting_key   | VARCHAR(100) | 설정 키          |
| setting_value | TEXT         | 설정 값          |
| description   | VARCHAR(300) | 설명             |
| created_at    | TIMESTAMP    | 생성일시         |
| updated_at    | TIMESTAMP    | 수정일시         |

**사용 예시**:

-   사이트 제목, 메인 배너 이미지, 이메일 설정 등
-   관리자가 웹사이트 설정을 변경할 때 사용

---

### 11. **tourist_spot_views (관광지 조회 기록 테이블)**

**역할**: 관광지 조회 통계를 위한 로그 테이블

| 컬럼명          | 타입         | 설명                 |
| --------------- | ------------ | -------------------- |
| id              | INT          | 조회 ID (기본키)     |
| tourist_spot_id | INT          | 관광지 ID            |
| user_id         | INT          | 사용자 ID (선택사항) |
| ip_address      | VARCHAR(45)  | IP 주소              |
| user_agent      | TEXT         | 사용자 에이전트      |
| referrer        | VARCHAR(500) | 리퍼러               |
| created_at      | TIMESTAMP    | 생성일시             |

**사용 예시**:

-   어떤 관광지가 가장 많이 조회되는지 분석
-   사용자 행동 패턴 분석

---

### 12. **favorites (즐겨찾기 테이블)**

**역할**: 사용자가 즐겨찾기한 관광지 정보

| 컬럼명          | 타입      | 설명                 |
| --------------- | --------- | -------------------- |
| id              | INT       | 즐겨찾기 ID (기본키) |
| user_id         | INT       | 사용자 ID            |
| tourist_spot_id | INT       | 관광지 ID            |
| created_at      | TIMESTAMP | 생성일시             |

**사용 예시**:

-   사용자가 관심 있는 관광지를 즐겨찾기에 추가
-   개인화된 관광지 추천 기능

---

### 13. **search_logs (검색 기록 테이블)**

**역할**: 사용자의 검색 패턴을 분석하기 위한 로그

| 컬럼명        | 타입         | 설명                                       |
| ------------- | ------------ | ------------------------------------------ |
| id            | INT          | 검색 로그 ID (기본키)                      |
| user_id       | INT          | 사용자 ID (선택사항)                       |
| search_query  | VARCHAR(200) | 검색 쿼리                                  |
| search_type   | ENUM         | 검색 타입 (keyword, tag, category, region) |
| results_count | INT          | 결과 개수                                  |
| ip_address    | VARCHAR(45)  | IP 주소                                    |
| created_at    | TIMESTAMP    | 생성일시                                   |

**사용 예시**:

-   "해운대" 검색 시 어떤 결과가 나왔는지 기록
-   검색 개선을 위한 데이터 수집

---

### 14. **image_metadata (이미지 메타데이터 테이블)**

**역할**: 관광지 이미지의 상세 정보를 저장

| 컬럼명          | 타입         | 설명                          |
| --------------- | ------------ | ----------------------------- |
| id              | INT          | 이미지 메타데이터 ID (기본키) |
| tourist_spot_id | INT          | 관광지 ID                     |
| image_path      | VARCHAR(500) | 이미지 경로                   |
| image_url       | VARCHAR(500) | 이미지 URL                    |
| file_size       | INT          | 파일 크기                     |
| width           | INT          | 이미지 너비                   |
| height          | INT          | 이미지 높이                   |
| format          | VARCHAR(10)  | 이미지 형식                   |
| alt_text        | VARCHAR(200) | alt 텍스트                    |
| is_primary      | BOOLEAN      | 대표 이미지 여부              |
| upload_date     | TIMESTAMP    | 업로드 날짜                   |

**사용 예시**:

-   관광지별 여러 이미지 관리
-   이미지 최적화 및 SEO를 위한 메타데이터

---

### 15. **translations (다국어 지원 테이블)**

**역할**: 다국어 번역 데이터를 저장

| 컬럼명          | 타입        | 설명                   |
| --------------- | ----------- | ---------------------- |
| id              | INT         | 번역 ID (기본키)       |
| table_name      | VARCHAR(50) | 테이블명               |
| record_id       | INT         | 레코드 ID              |
| field_name      | VARCHAR(50) | 필드명                 |
| language_code   | VARCHAR(5)  | 언어 코드 (ko, en, jp) |
| translated_text | TEXT        | 번역된 텍스트          |
| created_at      | TIMESTAMP   | 생성일시               |
| updated_at      | TIMESTAMP   | 수정일시               |

**사용 예시**:

-   관광지명을 한국어, 영어, 일본어로 번역
-   국제 관광객을 위한 다국어 지원

---

## 🔗 테이블 간 관계

### 주요 관계도

```
regions (1) ←→ (N) tourist_spots
tourist_spots (1) ←→ (N) reviews
users (1) ←→ (N) reviews
tourist_spots (1) ←→ (N) tourist_spot_hashtags
hashtags (1) ←→ (N) tourist_spot_hashtags
festivals (1) ←→ (N) festival_hashtags
hashtags (1) ←→ (N) festival_hashtags
users (1) ←→ (N) favorites
tourist_spots (1) ←→ (N) favorites
```

### 관계 설명

-   **1:N 관계**: 하나의 레코드가 여러 개의 관련 레코드를 가질 수 있음
-   **중간 테이블**: 다대다 관계를 처리하기 위한 연결 테이블
-   **외래키**: 다른 테이블의 기본키를 참조하는 키

---

## 💡 실제 사용 예시

### 1. **관광지 검색 기능**

```sql
-- 해운대구의 해수욕장 카테고리 관광지 검색
SELECT ts.*, r.name as region_name
FROM tourist_spots ts
JOIN regions r ON ts.region_id = r.id
WHERE r.name = '해운대구' AND ts.category = 'beach';
```

### 2. **인기 관광지 조회**

```sql
-- 조회수가 많은 관광지 상위 10개
SELECT title, view_count, rating_avg
FROM tourist_spots
ORDER BY view_count DESC
LIMIT 10;
```

### 3. **사용자별 즐겨찾기 목록**

```sql
-- 특정 사용자의 즐겨찾기 목록
SELECT ts.title, ts.description, f.created_at
FROM favorites f
JOIN tourist_spots ts ON f.tourist_spot_id = ts.id
WHERE f.user_id = 1;
```

---

## 🚀 확장 가능성

### 1. **추가 기능**

-   실시간 채팅 기능
-   관광지 예약 시스템
-   소셜 로그인 연동
-   모바일 앱 API

### 2. **성능 최적화**

-   인덱스 추가
-   캐싱 시스템 도입
-   데이터베이스 파티셔닝

### 3. **보안 강화**

-   데이터 암호화
-   접근 권한 세분화
-   감사 로그 강화

---

## 📚 학습 포인트

### 초보자를 위한 핵심 개념

1. **기본키(Primary Key)**: 각 테이블의 고유 식별자
2. **외래키(Foreign Key)**: 다른 테이블과의 연결고리
3. **정규화**: 데이터 중복을 줄이는 설계 방법
4. **관계**: 테이블 간의 연결 방식

### 데이터베이스 설계 원칙

1. **일관성**: 데이터의 정확성과 일관성 유지
2. **무결성**: 데이터의 완전성 보장
3. **확장성**: 향후 기능 추가에 대비한 설계
4. **성능**: 효율적인 데이터 조회를 위한 최적화

---

이 데이터베이스 스키마는 부산 관광 정보를 체계적으로 관리하고, 사용자에게 최적의 경험을 제공하기 위해 설계되었습니다. 각 테이블의 역할과 관계를 이해하면, 더 나은 관광 정보 서비스를 구축할 수 있습니다.
