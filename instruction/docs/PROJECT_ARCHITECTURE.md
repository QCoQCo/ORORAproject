# ORORA 프로젝트 아키텍처 및 데이터 플로우

## 1. 프로젝트 개요

ORORA는 **부산 관광지(지역/태그/테마/통합 검색)**, **관광지 상세**, **리뷰/댓글/좋아요**, **관광지/사진 추가 신청**, **관리자 관리 화면**을 제공하는 Spring Boot 기반 웹 애플리케이션입니다.

### 기술 스택
- **프레임워크**: Spring Boot `3.5.9`
- **언어**: Java `17`
- **빌드**: Gradle
- **DB**: MySQL
- **퍼시스턴스**: MyBatis `3.0.5` (Mapper Interface + XML)
- **뷰**: Thymeleaf + Layout Dialect
- **보안**: Spring Security + OAuth2 Client(카카오/구글)
- **로깅**: Log4j2 (+ log4jdbc)
- **기타**: dotenv-java, Validation, Lombok, DevTools

## 2. 디렉토리 구조(핵심)

### 2.1 백엔드 패키지 구조
`src/main/java/com/busan/orora/` 하위가 ORORA의 도메인 패키지입니다.

```
com/busan/orora/
├── OroraApplication.java
├── config/                # Security/OAuth2/WebMvc 설정
├── controller/            # 관리자 API, 페이지 라우팅(PageController)
├── common/                # 파일 업로드 공통(FileService 등)
├── commoncode/            # 공통코드(코드그룹/코드) 관리
├── user/                  # 로그인/회원가입/프로필
├── spot/                  # 관광지/이미지/신청(spot_requests)
├── region/                # 지역 조회
├── hashtag/               # 해시태그 조회
├── review/                # 리뷰/댓글/신고
├── like/                  # 관광지/리뷰 좋아요
└── search/                # 통합 검색
```

### 2.2 리소스 구조

```
src/main/resources/
├── application.yaml
├── mybatis-config.xml
├── mapper/                # MyBatis XML (userMapper.xml, spotMapper.xml 등)
├── templates/             # Thymeleaf 템플릿
│   ├── layouts/layout.html
│   ├── components/        # header/footer/list-item 등 공용 컴포넌트
│   └── pages/             # 실제 화면(page) 템플릿
└── static/                # css/js/images/lang 등 정적 리소스
```

## 3. 아키텍처 패턴

### 3.1 레이어드 아키텍처
프로젝트는 일반적인 **Controller → Service → Mapper → DB** 구조를 따릅니다.

- **Controller**: HTTP 요청 처리(REST API, 페이지 라우팅)
- **Service**: 비즈니스 로직/트랜잭션
- **Mapper(XML)**: SQL 및 결과 매핑

### 3.2 도메인 단위 모듈화
기능 중심으로 `spot`, `review`, `user`, `admin(commoncode 포함)` 등으로 분리되어 있으며, 각 도메인은 `controller/dto/mapper/service` 형태를 가집니다.

## 4. 라우팅(페이지) 구조

페이지 라우팅은 주로 `com.busan.orora.controller.PageController`에서 처리합니다.

- **메인**: `GET /`, `GET /index`
- **검색**: `GET /pages/search-place/place|tag|theme|search`
- **상세**: `GET /pages/detailed/detailed?id={spotId}`
- **로그인/회원가입**: `GET /pages/login/*`
- **마이페이지**: `GET /pages/mypage/mypage`
- **타인 프로필**: `GET /pages/profile/{userId}` → 템플릿은 `pages/mypage/mypage.html`을 재사용(리뷰 탭만 노출)
- **관리자**: `GET /pages/admin/management` → `pages/admin/admin.html`

## 5. 보안/인증

보안 설정은 `com.busan.orora.config.SecurityConfig`에 정의됩니다.

- **세션 기반 인증**: 기본적으로 세션을 사용합니다.
- **정적 리소스 허용**: `/css/**`, `/js/**`, `/images/**`, `/lang/**` 등
- **공개 페이지 허용**: `/pages/**` (페이지 자체는 공개)
- **공개 API 허용(대표)**:
  - `GET /api/tourist-spots/**` (관광지 조회)
  - `GET /api/reviews` (리뷰 조회)
  - `GET /api/regions/**`, `GET /api/tag-spots`, `GET /api/search/**`
  - `POST /api/auth/**` (로그인/회원가입/로그아웃 등)
- **인증 필요**:
  - `/api/admin/**`, `/pages/admin/**`
  - 그 외 `/api/**` (리뷰 작성/좋아요/신청 등)
- **OAuth2 로그인(옵션)**: 설정이 존재할 때만 활성화되며 로그인 페이지는 `/pages/login/login` 입니다.

## 6. 파일 업로드/서빙 구조

### 6.1 저장 경로 설정
`application.yaml`의 `file.upload.*Location`을 사용합니다.

- `file.upload.spotImgLocation`: 관광지/신청 이미지 저장 폴더
- `file.upload.profileImgLocation`: 프로필 이미지 저장 폴더
- `file.upload.reviewImgLocation`: 리뷰 이미지 저장 폴더

기본값은 프로젝트 루트 기준의 상대 경로(`upload/spots`, `upload/profiles`, `upload/reviews`)이며, 운영 환경에서는 절대 경로로 변경 가능합니다.

### 6.2 이미지 URL 서빙
`com.busan.orora.config.WebMvcConfig`에서 업로드 폴더를 다음 URL로 매핑합니다.

- 관광지 이미지: `/images/upload/spots/**`
- 프로필 이미지: `/images/upload/profiles/**`
- 리뷰 이미지: `/images/upload/reviews/**`

또한 레거시 파일을 위해 프로젝트 루트의 `upload/*` 폴더도 폴백 경로로 함께 등록합니다.

## 7. 주요 데이터 플로우(대표 시나리오)

### 7.1 테마/지역/태그 검색(관광지 목록)
1) 사용자가 `GET /pages/search-place/theme`(또는 place/tag) 접속  
2) 프론트 JS가 `GET /api/tourist-spots` 호출  
3) `SpotService.getAllSpotsGroupedByRegion()`이 관광지를 조회하고,
   - 지역/대표이미지/해시태그/평점 통계를 배치 조회하여 조합  
4) 응답은 다음 형태를 가집니다:
   - 최상위: `{ "regions": { "area01": { name, code, spots: [...] }, ... } }`

### 7.2 관광지 상세
1) 사용자가 `GET /pages/detailed/detailed?id={spotId}` 접속  
2) 프론트 JS가 `GET /api/tourist-spots/{id}` 호출  
3) 서버는 카테고리 활성 여부를 확인하고(비활성 카테고리는 ADMIN만 접근),
   조회수 증가 후 이미지/해시태그/지역 정보를 포함해 반환  

### 7.3 리뷰/댓글/신고
- 리뷰 조회: `GET /api/reviews?touristSpotId={id}&userId={optional}`
- 리뷰 작성/수정/삭제: `POST/PUT/DELETE /api/reviews`
- 댓글: `GET/POST /api/reviews/{reviewId}/comments`, `PUT/DELETE /api/comments/{commentId}`
- 신고: `POST /api/reviews/{reviewId}/report`, `POST /api/comments/{commentId}/report`

### 7.4 관광지/사진 추가 신청(사용자)
- 사진 추가 신청: `POST /api/spot-requests/photo` (이미지 업로드)
- 관광지 추가 신청: `POST /api/spot-requests/spot` (단일/다중 이미지 업로드 가능)
- 정보 수정 요청: `POST /api/spot-requests/edit`
- 신청 취소: `DELETE /api/spot-requests/{requestId}?userId={userId}`

### 7.5 관리자 플로우(요약)
- 관광지/사용자/공통코드/신청/신고 관리는 `GET /pages/admin/management` + `/api/admin/**` 조합으로 동작합니다.

## 8. 문서 위치 안내

- **API 명세**: `instruction/docs/API_SPECIFICATION.md`
- **DB 정의**: `instruction/docs/TABLE_DEFINITION.md`
- **메뉴 구조**: `instruction/docs/MENU_STRUCTURE.md`
- **테마 페이지 구현 가이드**: `instruction/THEME_PAGE_SETUP.md` (docs 폴더 밖)

---

**마지막 갱신**: 2026-01-26