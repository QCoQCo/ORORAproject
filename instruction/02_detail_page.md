# 상세 페이지 백엔드 작업 가이드

## 페이지 개요

관광지의 상세 정보를 보여주는 페이지입니다. 이미지 갤러리, 상세 설명, 해시태그, 리뷰 등을 포함합니다.

**프론트엔드 파일 위치**:

-   HTML: `src/main/resources/templates/pages/detailed/detailPage.html`
-   JavaScript: `src/main/resources/static/js/detailPage.js`
-   CSS: `src/main/resources/static/css/detailPage.css`

## 필요한 API 엔드포인트

### 1. 관광지 상세 조회

-   **엔드포인트**: `GET /api/tourist-spots/{id}`
-   **설명**: 특정 관광지의 상세 정보 조회
-   **경로 변수**: `id` - 관광지 ID
-   **쿼리 파라미터**: `title` - 관광지명 (대체 조회 방법, 선택)
-   **응답 형식**:

```json
{
    "id": 1,
    "title": "해동 용궁사",
    "description": "바다 위에 세워진 아름다운 사찰입니다.",
    "hashtags": ["사찰", "일출명소", "바다"],
    "images": [
        {
            "id": 1,
            "imageUrl": "/images/2025(4).jpg",
            "order": 1
        }
    ],
    "linkUrl": "#",
    "category": "culture",
    "region": {
        "id": 1,
        "name": "기장군",
        "areaCode": 26710
    },
    "isActive": true,
    "viewCount": 1250,
    "ratingAvg": 4.5,
    "ratingCount": 120,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 2. 관광지 조회수 증가

-   **엔드포인트**: `POST /api/tourist-spots/{id}/view`
-   **설명**: 관광지 조회 시 조회수 증가
-   **응답 형식**:

```json
{
    "success": true,
    "viewCount": 1251
}
```

### 3. 관광지 좋아요 토글

-   **엔드포인트**: `POST /api/tourist-spots/{id}/like`
-   **설명**: 관광지 좋아요 추가/제거
-   **요청 형식**:

```json
{
    "userId": 1,
    "action": "like" // 또는 "unlike"
}
```

-   **응답 형식**:

```json
{
    "success": true,
    "isLiked": true,
    "likeCount": 45
}
```

### 4. 관광지 좋아요 상태 조회

-   **엔드포인트**: `GET /api/tourist-spots/{id}/like-status?userId={userId}`
-   **설명**: 현재 사용자가 해당 관광지를 좋아요 했는지 확인
-   **응답 형식**:

```json
{
    "isLiked": true,
    "likeCount": 45
}
```

## 필요한 파일 구조

### Controller

```
com.busan.orora.controller/
└── TouristSpotController.java    # 관광지 상세 관련 API 추가
```

### Service

```
com.busan.orora.service/
└── TouristSpotService.java      # 상세 조회, 조회수, 좋아요 로직
```

### Repository

```
com.busan.orora.repository/
├── TouristSpotRepository.java        # 관광지 조회
├── TouristSpotImageRepository.java    # 이미지 조회
├── TouristSpotLikeRepository.java    # 좋아요 조회/저장
└── TouristSpotHashtagRepository.java  # 태그 조회
```

### Entity

```
com.busan.orora.entity/
├── TouristSpot.java              # 관광지 엔티티
├── TouristSpotImage.java         # 관광지 이미지 엔티티
├── TouristSpotLike.java          # 관광지 좋아요 엔티티
└── Region.java                   # 지역 엔티티
```

### DTO

```
com.busan.orora.dto/
├── TouristSpotDetailResponse.java    # 상세 정보 응답 DTO
└── TouristSpotLikeRequest.java       # 좋아요 요청 DTO
```

## 데이터베이스 테이블 관계

### 주요 테이블

-   `tourist_spots`: 관광지 기본 정보
-   `tourist_spot_images`: 관광지 이미지 (1:N)
-   `tourist_spot_hashtags`: 관광지-태그 연결 (N:M)
-   `tourist_spot_likes`: 관광지 좋아요 (N:M)
-   `regions`: 지역 정보 (N:1)

### 관계도

```
regions (1) ────< (N) tourist_spots
tourist_spots (1) ────< (N) tourist_spot_images
tourist_spots (1) ────< (N) tourist_spot_hashtags >─── (N) hashtags
tourist_spots (1) ────< (N) tourist_spot_likes >─── (N) users
```

## 연관된 다른 페이지

### 1. 태그 검색 페이지 (01_tag_page.md)

-   태그 클릭 시 태그 검색 페이지로 이동
-   URL: `/pages/search-place/tag.html?tag={tagName}`

### 2. 리뷰 페이지 (03_review_page.md)

-   상세 페이지 내에서 리뷰 섹션 표시
-   리뷰 작성, 조회, 좋아요 기능

### 3. 지역별 검색 페이지 (05_place_page.md)

-   지역 정보 클릭 시 지역별 검색 페이지로 이동

## 주요 기능

### 1. 관광지 상세 정보 표시

-   기본 정보: 제목, 설명, 지역, 카테고리
-   이미지 갤러리 (Swiper 사용)
-   해시태그 목록
-   관광지 정보 (문의, 주소, 이용시간 등)

### 2. 이미지 갤러리

-   메인 이미지와 썸네일 이미지
-   여러 이미지 슬라이드 표시
-   이미지 순서 관리 (`image_order`)

### 3. 조회수 증가

-   페이지 조회 시 자동으로 조회수 증가
-   중복 조회 방지 (세션 또는 쿠키 사용 고려)

### 4. 좋아요 기능

-   좋아요 버튼 클릭 시 토글
-   좋아요 수 표시
-   사용자별 좋아요 상태 표시

### 5. 카카오 지도 연동

-   관광지명으로 장소 검색
-   지도에 마커 표시
-   주소 정보 표시

### 6. 리뷰 섹션

-   해당 관광지의 리뷰 목록 표시
-   리뷰 작성 기능 (로그인 필요)
-   리뷰 상세 기능은 리뷰 페이지 참고

## 프론트엔드 연동 포인트

### JavaScript 파일 수정 필요

`src/main/resources/static/js/detailPage.js`의 다음 부분을 수정:

1. **데이터 로드 함수** (line 193-236):

```javascript
// 기존
const dataPath = getDataPath();
const response = await fetch(dataPath);
const data = await response.json();

// 변경 후
const urlParams = new URLSearchParams(window.location.search);
const spotId = urlParams.get('id') || urlParams.get('spotId');
const response = await fetch(`/api/tourist-spots/${spotId}`);
const spot = await response.json();
```

2. **조회수 증가** (페이지 로드 시):

```javascript
// 페이지 로드 후
fetch(`/api/tourist-spots/${spotId}/view`, { method: 'POST' });
```

3. **좋아요 기능** (line 122-126):

```javascript
// 기존: 클라이언트 사이드 토글
// 변경 후
async function toggleLike(spotId, userId) {
    const response = await fetch(`/api/tourist-spots/${spotId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'like' }),
    });
    const result = await response.json();
    // UI 업데이트
}
```

## 주의사항

1. **성능 최적화**

    - 이미지 목록은 별도 조회 또는 JOIN으로 한 번에 조회
    - 태그 목록도 JOIN으로 한 번에 조회
    - 조회수 증가는 비동기 처리 고려

2. **이미지 처리**

    - 이미지가 없는 경우 기본 이미지 표시
    - 이미지 순서(`image_order`)에 따라 정렬
    - 이미지 URL 유효성 검증

3. **조회수 중복 방지**

    - 같은 사용자가 여러 번 조회해도 1회만 카운트
    - 세션 또는 쿠키 사용
    - 또는 IP + 시간 기반 제한

4. **좋아요 기능**

    - 사용자 인증 필요
    - 중복 좋아요 방지 (UNIQUE 제약)
    - 좋아요 수는 실시간 업데이트

5. **에러 처리**

    - 존재하지 않는 관광지 ID 처리 (404)
    - 관광지명으로 조회 시 여러 결과 처리
    - 이미지 로드 실패 처리

6. **보안**
    - SQL Injection 방지
    - XSS 방지 (설명, 제목 등)
    - 권한 확인 (비활성화된 관광지 접근 제한)

## 테스트 케이스

1. 관광지 ID로 상세 정보 조회
2. 관광지명으로 상세 정보 조회
3. 이미지 목록 조회
4. 태그 목록 조회
5. 조회수 증가 테스트
6. 좋아요 추가/제거
7. 좋아요 상태 조회
8. 존재하지 않는 관광지 조회 (404)
9. 비활성화된 관광지 조회 (403 또는 404)
