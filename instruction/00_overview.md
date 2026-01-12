# 부산 관광 가이드 백엔드 개발 개요

## 프로젝트 정보

-   **프로젝트명**: 부산 관광 가이드 (arataBUSAN)
-   **프레임워크**: Spring Boot 3.5.8, Thymeleaf
-   **Java 버전**: 17
-   **데이터베이스**: MySQL
-   **프로젝트 구조**: 프론트엔드 완성, 백엔드 개발 필요

## 작업 분할

프로젝트는 여러 명이 협업할 수 있도록 페이지별로 작업을 분할합니다.

### 작업 페이지 목록

1. **태그 검색 페이지** (`01_tag_page.md`)
2. **상세 페이지** (`02_detail_page.md`)
3. **리뷰 페이지** (`03_review_page.md`)
4. **관리자 페이지** (`04_admin_page.md`)
5. **지역별 검색 페이지** (`05_place_page.md`)
6. **인증 페이지** (`06_auth_page.md`)
7. **마이페이지** (`07_mypage.md`)

## 공통 작업 사항

### 1. 데이터베이스 설정

-   데이터베이스 스키마: `src/main/resources/static/temp/new_data_schema.sql`
-   주요 테이블:
    -   `regions`: 지역 정보
    -   `tourist_spots`: 관광지 정보
    -   `tourist_spot_images`: 관광지 이미지
    -   `hashtags`: 해시태그
    -   `tourist_spot_hashtags`: 관광지-해시태그 연결
    -   `users`: 사용자 정보
    -   `reviews`: 리뷰
    -   `review_images`: 리뷰 이미지
    -   `review_comments`: 리뷰 댓글
    -   `review_likes`: 리뷰 좋아요
    -   `tourist_spot_likes`: 관광지 좋아요
    -   `review_reports`: 리뷰 신고

### 2. 공통 의존성 추가 필요

현재 `build.gradle`에 주석 처리된 의존성들을 활성화해야 합니다:

-   MySQL Connector
-   Spring Security (인증/인가)
-   MyBatis 또는 JPA (데이터베이스 접근)

### 3. 공통 패키지 구조

```
com.busan.orora/
├── controller/     # 컨트롤러
├── service/        # 비즈니스 로직
├── repository/    # 데이터 접근 계층
├── entity/         # 엔티티 클래스
├── dto/            # 데이터 전송 객체
├── config/         # 설정 클래스
└── exception/      # 예외 처리
```

### 4. API 엔드포인트 명세

상세한 API 명세는 `src/main/resources/static/temp/BACKEND_API_ENDPOINTS.md` 참고

### 5. 프론트엔드 연동 포인트

-   프론트엔드 JavaScript 파일에서 `TODO: 백엔드 연결 시 수정 필요` 주석 확인
-   JSON 파일 경로를 API 엔드포인트로 변경 필요
-   예: `../../data/busanTouristSpots.json` → `/api/tourist-spots`

## 작업 순서 권장사항

1. **인증 페이지** (06_auth_page.md) - 가장 먼저 작업 (다른 페이지에서 사용)
2. **지역별 검색 페이지** (05_place_page.md) - 기본 데이터 조회
3. **태그 검색 페이지** (01_tag_page.md) - 검색 기능
4. **상세 페이지** (02_detail_page.md) - 상세 정보 조회
5. **리뷰 페이지** (03_review_page.md) - 리뷰 CRUD
6. **마이페이지** (07_mypage.md) - 사용자별 데이터 조회
7. **관리자 페이지** (04_admin_page.md) - 관리 기능

## 주의사항

-   각 페이지 작업 시 다른 페이지와의 연관성 확인
-   API 엔드포인트는 RESTful 규칙 준수
-   에러 처리 및 예외 상황 고려
-   보안 (SQL Injection, XSS 등) 고려
-   성능 최적화 (캐싱, 인덱스 등) 고려
