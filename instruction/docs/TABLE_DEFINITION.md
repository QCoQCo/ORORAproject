# 부산 관광 가이드 데이터베이스 테이블 정의서

**데이터베이스명**: arata_busan  
**작성일**: 2024  
**버전**: 2.0

---

## 문서 반영 사항 (2026-01-25)

- **사용자 프로필(타인) 보기 기능 추가**: `/pages/profile/{userId}` (뷰 라우팅)
- **DB 스키마 변경 없음**: 이번 기능은 화면/JS/페이지 라우팅 변경이며, 테이블/컬럼 변경은 없습니다.

## 중요 사항

이 스키마는 **공통코드 테이블(common_code_groups, common_codes)**을 사용합니다.

-   ENUM 대신 VARCHAR로 코드값을 저장하며, 공통코드 테이블의 코드값을 참조합니다.
-   공통코드 테이블 스키마는 `common_code_schema.sql` 파일을 참조하세요.
-   이 스키마를 실행하기 전에 공통코드 테이블을 먼저 생성해야 합니다.

---

## 목차

1. [regions - 지역 테이블](#1-regions---지역-테이블)
2. [tourist_spots - 관광지 테이블](#2-tourist_spots---관광지-테이블)
3. [tourist_spot_images - 관광지 이미지 테이블](#3-tourist_spot_images---관광지-이미지-테이블)
4. [hashtags - 해시태그 테이블](#4-hashtags---해시태그-테이블)
5. [tourist_spot_hashtags - 관광지-해시태그 연결 테이블](#5-tourist_spot_hashtags---관광지-해시태그-연결-테이블)
6. [users - 사용자 테이블](#6-users---사용자-테이블)
7. [reviews - 리뷰 테이블](#7-reviews---리뷰-테이블)
8. [review_images - 리뷰 이미지 테이블](#8-review_images---리뷰-이미지-테이블)
9. [tourist_spot_likes - 관광지 좋아요 테이블](#9-tourist_spot_likes---관광지-좋아요-테이블)
10. [review_likes - 리뷰 좋아요 테이블](#10-review_likes---리뷰-좋아요-테이블)
11. [review_comments - 리뷰 댓글 테이블](#11-review_comments---리뷰-댓글-테이블)
12. [review_reports - 리뷰 신고 테이블](#12-review_reports---리뷰-신고-테이블)

---

## 1. regions - 지역 테이블

### 개요

부산의 지역 정보를 저장하는 테이블입니다.

### 컬럼 정의

| 컬럼명     | 데이터 타입 | 제약조건                    | 기본값                                        | 설명               |
| ---------- | ----------- | --------------------------- | --------------------------------------------- | ------------------ |
| id         | INT         | PRIMARY KEY, AUTO_INCREMENT | -                                             | 지역 고유 식별자   |
| area_code  | INT         | NOT NULL, UNIQUE            | -                                             | 지역 코드 (고유값) |
| name       | VARCHAR(30) | NOT NULL                    | -                                             | 지역명             |
| created_at | TIMESTAMP   | -                           | CURRENT_TIMESTAMP                             | 생성일시           |
| updated_at | TIMESTAMP   | -                           | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 수정일시           |

### 인덱스

-   PRIMARY KEY: id
-   UNIQUE: area_code

### 외래키 관계

-   없음 (최상위 테이블)

### 참조 관계

-   `tourist_spots.region_id` → `regions.id` (CASCADE)

---

## 2. tourist_spots - 관광지 테이블

### 개요

부산의 관광지 정보를 저장하는 핵심 테이블입니다.

### 컬럼 정의

| 컬럼명        | 데이터 타입  | 제약조건                    | 기본값                                        | 설명                                                                                           |
| ------------- | ------------ | --------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| id            | INT          | PRIMARY KEY, AUTO_INCREMENT | -                                             | 관광지 고유 식별자                                                                             |
| region_id     | INT          | NOT NULL, FOREIGN KEY       | -                                             | 지역 ID (regions.id 참조)                                                                      |
| title         | VARCHAR(80)  | NOT NULL                    | -                                             | 관광지 제목                                                                                    |
| description   | TEXT         | NULL                        | -                                             | 관광지 설명                                                                                    |
| link_url      | VARCHAR(500) | NULL                        | -                                             | 관련 링크 URL                                                                                  |
| category_code | VARCHAR(50)  | -                           | 'CULTURE'                                     | 관광지 카테고리 코드 (SPOT_CATEGORY 그룹 참조: BEACH, MOUNTAIN, CULTURE, FOOD, SHOPPING, CAFE) |
| is_active     | BOOLEAN      | -                           | TRUE                                          | 활성화 여부                                                                                    |
| view_count    | INT          | -                           | 0                                             | 조회수                                                                                         |
| rating_avg    | DECIMAL(3,2) | -                           | 0.00                                          | 평균 평점 (소수점 2자리)                                                                       |
| rating_count  | INT          | -                           | 0                                             | 평점 개수                                                                                      |
| created_at    | TIMESTAMP    | -                           | CURRENT_TIMESTAMP                             | 생성일시                                                                                       |
| updated_at    | TIMESTAMP    | -                           | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 수정일시                                                                                       |

### 인덱스

-   PRIMARY KEY: id
-   INDEX: idx_region_id (region_id)
-   INDEX: idx_category_code (category_code)
-   INDEX: idx_is_active (is_active)

### 외래키 관계

-   `region_id` → `regions.id` (ON DELETE CASCADE)

### 참조 관계

-   `tourist_spot_images.tourist_spot_id` → `tourist_spots.id` (CASCADE)
-   `tourist_spot_hashtags.tourist_spot_id` → `tourist_spots.id` (CASCADE)
-   `tourist_spot_likes.tourist_spot_id` → `tourist_spots.id` (CASCADE)
-   `reviews.tourist_spot_id` → `tourist_spots.id` (CASCADE)

---

## 3. tourist_spot_images - 관광지 이미지 테이블

### 개요

관광지에 등록된 이미지 정보를 저장하는 테이블입니다.

### 컬럼 정의

| 컬럼명          | 데이터 타입  | 제약조건                    | 기본값            | 설명                              |
| --------------- | ------------ | --------------------------- | ----------------- | --------------------------------- |
| id              | INT          | PRIMARY KEY, AUTO_INCREMENT | -                 | 이미지 고유 식별자                |
| tourist_spot_id | INT          | NOT NULL, FOREIGN KEY       | -                 | 관광지 ID (tourist_spots.id 참조) |
| image_url       | VARCHAR(500) | NOT NULL                    | -                 | 이미지 URL                        |
| created_at      | TIMESTAMP    | -                           | CURRENT_TIMESTAMP | 생성일시                          |

### 인덱스

-   PRIMARY KEY: id

### 외래키 관계

-   `tourist_spot_id` → `tourist_spots.id` (ON DELETE CASCADE)

### 참조 관계

-   없음

---

## 4. hashtags - 해시태그 테이블

### 개요

시스템에서 사용되는 해시태그 정보를 저장하는 테이블입니다.

### 컬럼 정의

| 컬럼명     | 데이터 타입 | 제약조건                    | 기본값            | 설명                 |
| ---------- | ----------- | --------------------------- | ----------------- | -------------------- |
| id         | INT         | PRIMARY KEY, AUTO_INCREMENT | -                 | 해시태그 고유 식별자 |
| name       | VARCHAR(50) | NOT NULL, UNIQUE            | -                 | 해시태그명 (고유값)  |
| created_at | TIMESTAMP   | -                           | CURRENT_TIMESTAMP | 생성일시             |

### 인덱스

-   PRIMARY KEY: id
-   UNIQUE: name

### 외래키 관계

-   없음

### 참조 관계

-   `tourist_spot_hashtags.hashtag_id` → `hashtags.id` (CASCADE)

---

## 5. tourist_spot_hashtags - 관광지-해시태그 연결 테이블

### 개요

관광지와 해시태그의 다대다 관계를 관리하는 연결 테이블입니다.

### 컬럼 정의

| 컬럼명          | 데이터 타입 | 제약조건                    | 기본값            | 설명                              |
| --------------- | ----------- | --------------------------- | ----------------- | --------------------------------- |
| id              | INT         | PRIMARY KEY, AUTO_INCREMENT | -                 | 연결 고유 식별자                  |
| tourist_spot_id | INT         | NOT NULL, FOREIGN KEY       | -                 | 관광지 ID (tourist_spots.id 참조) |
| hashtag_id      | INT         | NOT NULL, FOREIGN KEY       | -                 | 해시태그 ID (hashtags.id 참조)    |
| created_at      | TIMESTAMP   | -                           | CURRENT_TIMESTAMP | 생성일시                          |

### 인덱스

-   PRIMARY KEY: id
-   UNIQUE: unique_spot_hashtag (tourist_spot_id, hashtag_id)

### 외래키 관계

-   `tourist_spot_id` → `tourist_spots.id` (ON DELETE CASCADE)
-   `hashtag_id` → `hashtags.id` (ON DELETE CASCADE)

### 참조 관계

-   없음

### 비고

-   동일한 관광지에 동일한 해시태그는 중복 등록 불가 (UNIQUE 제약)

---

## 6. users - 사용자 테이블

### 개요

시스템 사용자 정보를 저장하는 테이블입니다.

### 컬럼 정의

| 컬럼명        | 데이터 타입  | 제약조건                    | 기본값                                        | 설명                                                                  |
| ------------- | ------------ | --------------------------- | --------------------------------------------- | --------------------------------------------------------------------- |
| id            | INT          | PRIMARY KEY, AUTO_INCREMENT | -                                             | 사용자 고유 식별자                                                    |
| login_id      | VARCHAR(50)  | NOT NULL, UNIQUE            | -                                             | 사용자가 직접 설정한 로그인 ID                                        |
| username      | VARCHAR(50)  | NOT NULL                    | -                                             | 사용자명                                                              |
| email         | VARCHAR(255) | NOT NULL, UNIQUE            | -                                             | 이메일 주소 (고유값)                                                  |
| password_hash | VARCHAR(255) | NOT NULL                    | -                                             | 비밀번호 해시값                                                       |
| role_code     | VARCHAR(50)  | -                           | 'MEMBER'                                      | 사용자 역할 코드 (USER_ROLE 그룹 참조: ADMIN, VIP, MEMBER)            |
| status_code   | VARCHAR(50)  | -                           | 'ACTIVE'                                      | 사용자 상태 코드 (USER_STATUS 그룹 참조: ACTIVE, INACTIVE, SUSPENDED) |
| profile_image | VARCHAR(500) | NULL                        | -                                             | 프로필 이미지 URL                                                     |
| phone_number  | VARCHAR(20)  | NULL                        | -                                             | 전화번호                                                              |
| address       | VARCHAR(80)  | NULL                        | -                                             | 주소                                                                  |
| birth_date    | DATE         | NULL                        | -                                             | 생년월일                                                              |
| gender_code   | VARCHAR(50)  | NULL                        | -                                             | 성별 코드 (GENDER 그룹 참조: MALE, FEMALE, OTHER)                     |
| join_date     | DATE         | NOT NULL                    | -                                             | 가입일                                                                |
| last_login    | TIMESTAMP    | NULL                        | -                                             | 마지막 로그인 일시                                                    |
| created_at    | TIMESTAMP    | -                           | CURRENT_TIMESTAMP                             | 생성일시                                                              |
| updated_at    | TIMESTAMP    | -                           | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 수정일시                                                              |

### 인덱스

-   PRIMARY KEY: id
-   UNIQUE: login_id
-   UNIQUE: email
-   INDEX: idx_login_id (login_id)
-   INDEX: idx_email (email)
-   INDEX: idx_role_code (role_code)
-   INDEX: idx_status_code (status_code)
-   INDEX: idx_gender_code (gender_code)

### 외래키 관계

-   없음

### 참조 관계

-   `reviews.user_id` → `users.id` (CASCADE)
-   `tourist_spot_likes.user_id` → `users.id` (CASCADE)
-   `review_likes.user_id` → `users.id` (CASCADE)
-   `review_comments.user_id` → `users.id` (CASCADE)
-   `review_reports.user_id` → `users.id` (CASCADE)

---

## 7. reviews - 리뷰 테이블

### 개요

사용자가 작성한 관광지 리뷰 정보를 저장하는 테이블입니다.

### 컬럼 정의

| 컬럼명          | 데이터 타입 | 제약조건                    | 기본값                                        | 설명                              |
| --------------- | ----------- | --------------------------- | --------------------------------------------- | --------------------------------- |
| id              | INT         | PRIMARY KEY, AUTO_INCREMENT | -                                             | 리뷰 고유 식별자                  |
| user_id         | INT         | NOT NULL, FOREIGN KEY       | -                                             | 작성자 ID (users.id 참조)         |
| tourist_spot_id | INT         | NOT NULL, FOREIGN KEY       | -                                             | 관광지 ID (tourist_spots.id 참조) |
| title           | VARCHAR(80) | NOT NULL                    | -                                             | 리뷰 제목                         |
| content         | TEXT        | NOT NULL                    | -                                             | 리뷰 내용                         |
| rating          | INT         | NOT NULL, CHECK (1~5)       | -                                             | 평점 (1~5점)                      |
| is_approved     | BOOLEAN     | -                           | TRUE                                          | 승인 여부                         |
| created_at      | TIMESTAMP   | -                           | CURRENT_TIMESTAMP                             | 생성일시                          |
| updated_at      | TIMESTAMP   | -                           | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 수정일시                          |

### 인덱스

-   PRIMARY KEY: id
-   INDEX: idx_user_id (user_id)
-   INDEX: idx_tourist_spot_id (tourist_spot_id)
-   INDEX: idx_is_approved (is_approved)
-   INDEX: idx_created_at (created_at)

### 외래키 관계

-   `user_id` → `users.id` (ON DELETE CASCADE)
-   `tourist_spot_id` → `tourist_spots.id` (ON DELETE CASCADE)

### 참조 관계

-   `review_images.review_id` → `reviews.id` (CASCADE)
-   `review_likes.review_id` → `reviews.id` (CASCADE)
-   `review_comments.review_id` → `reviews.id` (CASCADE)
-   `review_reports.review_id` → `reviews.id` (CASCADE)

---

## 8. review_images - 리뷰 이미지 테이블

### 개요

리뷰에 첨부된 이미지 정보를 저장하는 테이블입니다.

### 컬럼 정의

| 컬럼명      | 데이터 타입  | 제약조건                    | 기본값            | 설명                      |
| ----------- | ------------ | --------------------------- | ----------------- | ------------------------- |
| id          | INT          | PRIMARY KEY, AUTO_INCREMENT | -                 | 이미지 고유 식별자        |
| review_id   | INT          | NOT NULL, FOREIGN KEY       | -                 | 리뷰 ID (reviews.id 참조) |
| image_url   | VARCHAR(500) | NOT NULL                    | -                 | 이미지 URL                |
| image_order | INT          | -                           | 1                 | 이미지 순서               |
| alt_text    | VARCHAR(100) | NULL                        | -                 | 이미지 대체 텍스트        |
| created_at  | TIMESTAMP    | -                           | CURRENT_TIMESTAMP | 생성일시                  |

### 인덱스

-   PRIMARY KEY: id

### 외래키 관계

-   `review_id` → `reviews.id` (ON DELETE CASCADE)

### 참조 관계

-   없음

---

## 9. tourist_spot_likes - 관광지 좋아요 테이블

### 개요

사용자가 관광지에 누른 좋아요 정보를 저장하는 테이블입니다.

### 컬럼 정의

| 컬럼명          | 데이터 타입 | 제약조건                    | 기본값            | 설명                              |
| --------------- | ----------- | --------------------------- | ----------------- | --------------------------------- |
| id              | INT         | PRIMARY KEY, AUTO_INCREMENT | -                 | 좋아요 고유 식별자                |
| user_id         | INT         | NOT NULL, FOREIGN KEY       | -                 | 사용자 ID (users.id 참조)         |
| tourist_spot_id | INT         | NOT NULL, FOREIGN KEY       | -                 | 관광지 ID (tourist_spots.id 참조) |
| created_at      | TIMESTAMP   | -                           | CURRENT_TIMESTAMP | 생성일시                          |

### 인덱스

-   PRIMARY KEY: id
-   UNIQUE: unique_user_spot_like (user_id, tourist_spot_id)
-   INDEX: idx_tourist_spot_id (tourist_spot_id)
-   INDEX: idx_user_id (user_id)

### 외래키 관계

-   `user_id` → `users.id` (ON DELETE CASCADE)
-   `tourist_spot_id` → `tourist_spots.id` (ON DELETE CASCADE)

### 참조 관계

-   없음

### 비고

-   동일한 사용자가 동일한 관광지에 중복 좋아요 불가 (UNIQUE 제약)

---

## 10. review_likes - 리뷰 좋아요 테이블

### 개요

사용자가 리뷰에 누른 좋아요 정보를 저장하는 테이블입니다.

### 컬럼 정의

| 컬럼명     | 데이터 타입 | 제약조건                    | 기본값            | 설명                      |
| ---------- | ----------- | --------------------------- | ----------------- | ------------------------- |
| id         | INT         | PRIMARY KEY, AUTO_INCREMENT | -                 | 좋아요 고유 식별자        |
| user_id    | INT         | NOT NULL, FOREIGN KEY       | -                 | 사용자 ID (users.id 참조) |
| review_id  | INT         | NOT NULL, FOREIGN KEY       | -                 | 리뷰 ID (reviews.id 참조) |
| created_at | TIMESTAMP   | -                           | CURRENT_TIMESTAMP | 생성일시                  |

### 인덱스

-   PRIMARY KEY: id
-   UNIQUE: unique_user_review_like (user_id, review_id)
-   INDEX: idx_review_id (review_id)
-   INDEX: idx_user_id (user_id)

### 외래키 관계

-   `user_id` → `users.id` (ON DELETE CASCADE)
-   `review_id` → `reviews.id` (ON DELETE CASCADE)

### 참조 관계

-   없음

### 비고

-   동일한 사용자가 동일한 리뷰에 중복 좋아요 불가 (UNIQUE 제약)

---

## 11. review_comments - 리뷰 댓글 테이블

### 개요

리뷰에 작성된 댓글 정보를 저장하는 테이블입니다.

### 컬럼 정의

| 컬럼명      | 데이터 타입 | 제약조건                    | 기본값                                        | 설명                      |
| ----------- | ----------- | --------------------------- | --------------------------------------------- | ------------------------- |
| id          | INT         | PRIMARY KEY, AUTO_INCREMENT | -                                             | 댓글 고유 식별자          |
| user_id     | INT         | NOT NULL, FOREIGN KEY       | -                                             | 작성자 ID (users.id 참조) |
| review_id   | INT         | NOT NULL, FOREIGN KEY       | -                                             | 리뷰 ID (reviews.id 참조) |
| content     | TEXT        | NOT NULL                    | -                                             | 댓글 내용                 |
| is_approved | BOOLEAN     | -                           | TRUE                                          | 승인 여부                 |
| created_at  | TIMESTAMP   | -                           | CURRENT_TIMESTAMP                             | 생성일시                  |
| updated_at  | TIMESTAMP   | -                           | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 수정일시                  |

### 인덱스

-   PRIMARY KEY: id
-   INDEX: idx_review_id (review_id)
-   INDEX: idx_user_id (user_id)

### 외래키 관계

-   `user_id` → `users.id` (ON DELETE CASCADE)
-   `review_id` → `reviews.id` (ON DELETE CASCADE)

### 참조 관계

-   없음

---

## 12. review_reports - 리뷰 신고 테이블

### 개요

사용자가 리뷰를 신고한 정보를 저장하는 테이블입니다.

### 컬럼 정의

| 컬럼명      | 데이터 타입 | 제약조건                    | 기본값                                        | 설명                                                                             |
| ----------- | ----------- | --------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| id          | INT         | PRIMARY KEY, AUTO_INCREMENT | -                                             | 신고 고유 식별자                                                                 |
| user_id     | INT         | NOT NULL, FOREIGN KEY       | -                                             | 신고자 ID (users.id 참조)                                                        |
| review_id   | INT         | NOT NULL, FOREIGN KEY       | -                                             | 신고된 리뷰 ID (reviews.id 참조)                                                 |
| reason      | TEXT        | NOT NULL                    | -                                             | 신고 사유                                                                        |
| status_code | VARCHAR(50) | -                           | 'PENDING'                                     | 신고 상태 코드 (REPORT_STATUS 그룹 참조: PENDING, REVIEWED, RESOLVED, DISMISSED) |
| created_at  | TIMESTAMP   | -                           | CURRENT_TIMESTAMP                             | 생성일시                                                                         |
| updated_at  | TIMESTAMP   | -                           | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 수정일시                                                                         |

### 인덱스

-   PRIMARY KEY: id
-   UNIQUE: unique_user_review_report (user_id, review_id)
-   INDEX: idx_review_id (review_id)
-   INDEX: idx_user_id (user_id)
-   INDEX: idx_status_code (status_code)

### 외래키 관계

-   `user_id` → `users.id` (ON DELETE CASCADE)
-   `review_id` → `reviews.id` (ON DELETE CASCADE)

### 참조 관계

-   없음

### 비고

-   동일한 사용자가 동일한 리뷰에 중복 신고 불가 (UNIQUE 제약)

---

## 테이블 관계도

```
regions (1) ──< (N) tourist_spots (1) ──< (N) tourist_spot_images
                                 │
                                 │ (1)
                                 │
                                 └──< (N) tourist_spot_hashtags (N) >── (1) hashtags
                                 │
                                 │ (1)
                                 │
                                 └──< (N) tourist_spot_likes (N) >── (1) users
                                 │
                                 │ (1)
                                 │
                                 └──< (N) reviews (1) ──< (N) review_images
                                      │
                                      │ (1)
                                      │
                                      ├──< (N) review_likes (N) >── (1) users
                                      │
                                      ├──< (N) review_comments (N) >── (1) users
                                      │
                                      └──< (N) review_reports (N) >── (1) users
```

---

## 주요 비즈니스 규칙

1. **CASCADE 삭제 정책**: 모든 외래키 관계는 ON DELETE CASCADE로 설정되어 있어, 부모 레코드 삭제 시 관련 자식 레코드도 자동 삭제됩니다.

2. **중복 방지**:

    - 사용자는 동일한 관광지에 한 번만 좋아요 가능
    - 사용자는 동일한 리뷰에 한 번만 좋아요 가능
    - 사용자는 동일한 리뷰에 한 번만 신고 가능
    - 관광지-해시태그 연결은 중복 불가

3. **평점 시스템**:

    - 리뷰 평점은 1~5점 사이의 정수값만 허용
    - 관광지의 평균 평점(rating_avg)과 평점 개수(rating_count)는 별도 관리 필요

4. **승인 시스템**:

    - 리뷰와 댓글은 기본적으로 승인 상태(is_approved = TRUE)
    - 관리자에 의한 승인/비승인 관리 가능

5. **공통코드 시스템**:
    - 이 데이터베이스는 공통코드 테이블(common_code_groups, common_codes)을 사용합니다.
    - ENUM 대신 VARCHAR로 코드값을 저장하며, 공통코드 테이블의 코드값을 참조합니다.
    - 사용되는 공통코드 그룹:
        - USER_ROLE: 사용자 역할 (ADMIN, VIP, MEMBER)
        - USER_STATUS: 사용자 상태 (ACTIVE, INACTIVE, SUSPENDED)
        - GENDER: 성별 (MALE, FEMALE, OTHER)
        - SPOT_CATEGORY: 관광지 카테고리 (BEACH, MOUNTAIN, CULTURE, FOOD, SHOPPING, CAFE)
        - REPORT_STATUS: 신고 상태 (PENDING, REVIEWED, RESOLVED, DISMISSED)

---

## 데이터 타입 요약

-   **INT**: 정수형 (식별자, 카운트 등)
-   **VARCHAR(n)**: 가변 길이 문자열 (최대 n자)
-   **TEXT**: 긴 텍스트 (설명, 내용 등)
-   **BOOLEAN**: 논리값 (TRUE/FALSE)
-   **DECIMAL(p,s)**: 고정 소수점 (p: 전체 자릿수, s: 소수점 자릿수)
-   **DATE**: 날짜 (YYYY-MM-DD)
-   **TIMESTAMP**: 날짜와 시간

**참고**: 이 스키마는 공통코드 시스템을 사용하므로, ENUM 대신 VARCHAR로 코드값을 저장합니다. 코드값은 공통코드 테이블(common_code_groups, common_codes)의 코드값을 참조합니다.

---

## 인덱스 전략

1. **PRIMARY KEY**: 모든 테이블의 id 컬럼
2. **UNIQUE**: 중복 방지가 필요한 컬럼 (email, login_id, area_code 등)
3. **FOREIGN KEY 인덱스**: 조인 성능 향상을 위한 외래키 컬럼 인덱스
4. **검색 최적화 인덱스**: 자주 검색되는 컬럼 (category_code, status_code, is_approved 등)
5. **복합 UNIQUE**: 중복 방지가 필요한 복합 키 (user_id + tourist_spot_id 등)
