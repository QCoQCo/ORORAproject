# 태그 검색 페이지 백엔드 작업 가이드

## 페이지 개요

태그를 기반으로 관광지를 검색하고 필터링하는 페이지입니다.

**프론트엔드 파일 위치**:

-   HTML: `src/main/resources/templates/pages/search-place/tag.html`
-   JavaScript: `src/main/resources/static/js/tag.js`
-   CSS: `src/main/resources/static/css/tag.css`

## 필요한 API 엔드포인트

### 1. 관광지 목록 조회 (태그 포함)

-   **엔드포인트**: `GET /api/tourist-spots`
-   **설명**: 모든 관광지 정보를 지역별로 그룹화하여 반환
-   **응답 형식**:

```json
{
    "regions": {
        "area01": {
            "name": "기장군",
            "code": "26710",
            "spots": [
                {
                    "id": 1,
                    "title": "해동 용궁사",
                    "description": "바다 위에 세워진 아름다운 사찰입니다.",
                    "hashtags": ["사찰", "일출명소", "바다"],
                    "imageUrl": "/images/2025(4).jpg",
                    "linkUrl": "#",
                    "category": "culture",
                    "isActive": true,
                    "viewCount": 0,
                    "ratingAvg": 0.0,
                    "ratingCount": 0
                }
            ]
        }
    }
}
```

### 2. 태그별 관광지 검색

-   **엔드포인트**: `GET /api/tourist-spots/search?tags={tag1},{tag2}&category={category}`
-   **설명**: 선택된 태그와 카테고리로 관광지 필터링
-   **쿼리 파라미터**:
    -   `tags`: 쉼표로 구분된 태그 목록 (선택)
    -   `category`: 카테고리 필터 (선택)
    -   `keyword`: 검색 키워드 (선택)
    -   `sort`: 정렬 기준 (relevance, name, region)
    -   `page`: 페이지 번호 (기본값: 0)
    -   `size`: 페이지 크기 (기본값: 12)
-   **응답 형식**:

```json
{
  "content": [...],
  "totalElements": 50,
  "totalPages": 5,
  "currentPage": 0
}
```

### 3. 인기 태그 조회

-   **엔드포인트**: `GET /api/hashtags/popular?limit=15`
-   **설명**: 사용 빈도가 높은 태그 목록 반환
-   **응답 형식**:

```json
{
    "tags": [
        {
            "id": 1,
            "name": "해수욕장",
            "count": 25
        },
        {
            "id": 2,
            "name": "일출명소",
            "count": 20
        }
    ]
}
```

### 4. 전체 태그 목록 조회

-   **엔드포인트**: `GET /api/hashtags`
-   **설명**: 모든 태그 목록 반환 (알파벳 순)
-   **응답 형식**:

```json
{
    "tags": [
        {
            "id": 1,
            "name": "가족여행",
            "count": 15
        }
    ]
}
```

## 필요한 파일 구조

### Controller

```
com.busan.orora.controller/
├── TouristSpotController.java      # 관광지 관련 API
└── HashtagController.java         # 태그 관련 API
```

### Service

```
com.busan.orora.service/
├── TouristSpotService.java        # 관광지 비즈니스 로직
└── HashtagService.java            # 태그 비즈니스 로직
```

### Repository

```
com.busan.orora.repository/
├── TouristSpotRepository.java    # 관광지 데이터 접근
├── HashtagRepository.java         # 태그 데이터 접근
└── TouristSpotHashtagRepository.java  # 관광지-태그 연결 데이터 접근
```

### Entity

```
com.busan.orora.entity/
├── TouristSpot.java               # 관광지 엔티티
├── Hashtag.java                   # 태그 엔티티
├── TouristSpotHashtag.java       # 관광지-태그 연결 엔티티
└── Region.java                    # 지역 엔티티
```

### DTO

```
com.busan.orora.dto/
├── TouristSpotResponse.java      # 관광지 응답 DTO
├── HashtagResponse.java           # 태그 응답 DTO
└── TouristSpotSearchRequest.java # 검색 요청 DTO
```

## 데이터베이스 테이블 관계

### 주요 테이블

-   `tourist_spots`: 관광지 기본 정보
-   `hashtags`: 태그 정보
-   `tourist_spot_hashtags`: 관광지-태그 다대다 관계
-   `regions`: 지역 정보
-   `tourist_spot_images`: 관광지 이미지

### 관계도

```
regions (1) ────< (N) tourist_spots
tourist_spots (N) ────< (N) tourist_spot_hashtags >─── (N) hashtags
tourist_spots (1) ────< (N) tourist_spot_images
```

## 연관된 다른 페이지

### 1. 상세 페이지 (02_detail_page.md)

-   태그 검색 결과에서 관광지 클릭 시 상세 페이지로 이동
-   URL: `/pages/detailed/detailed.html?title={title}` 또는 `/api/tourist-spots/{id}`

### 2. 지역별 검색 페이지 (05_place_page.md)

-   같은 관광지 데이터를 사용하지만 필터링 방식이 다름
-   태그 페이지는 태그 기반, 지역 페이지는 지역 기반

## 주요 기능

### 1. 태그 추출 및 표시

-   모든 관광지의 태그를 추출하여 인기 태그와 전체 태그로 분류
-   태그별 사용 빈도 계산

### 2. 태그 기반 필터링

-   하나 이상의 태그 선택 가능
-   선택된 태그를 가진 관광지만 표시
-   AND 조건 (선택된 모든 태그를 가진 관광지)

### 3. 카테고리 필터링

-   카테고리: 관광명소, 자연/공원, 문화/역사, 먹거리/시장, 액티비티, 쇼핑, 휴식/힐링
-   태그 기반으로 카테고리 매칭

### 4. 검색 기능

-   키워드로 관광지명, 설명, 태그, 지역 검색

### 5. 정렬 기능

-   관련도순: 선택된 태그와의 일치도
-   이름순: 관광지명 알파벳 순
-   지역순: 지역명 순

### 6. 페이지네이션

-   한 페이지에 12개씩 표시
-   더보기 버튼으로 추가 로드

## 프론트엔드 연동 포인트

### JavaScript 파일 수정 필요

`src/main/resources/static/js/tag.js`의 다음 부분을 수정:

1. **데이터 로드 함수** (line 38-75):

```javascript
// 기존
const response = await fetch('../../data/busanTouristSpots.json');

// 변경 후
const response = await fetch('/api/tourist-spots');
```

2. **태그 검색 함수** (line 212-253):

```javascript
// 기존: 클라이언트 사이드 필터링
// 변경 후: 서버 사이드 필터링으로 변경
// GET /api/tourist-spots/search?tags={tags}&category={category}&keyword={keyword}
```

## 주의사항

1. **성능 최적화**

    - 태그 목록은 캐싱 고려 (변경 빈도가 낮음)
    - 대량의 관광지 데이터 조회 시 페이지네이션 필수
    - 인덱스: `hashtags.name`, `tourist_spot_hashtags.tourist_spot_id`, `tourist_spot_hashtags.hashtag_id`

2. **태그 매칭 로직**

    - 태그는 대소문자 구분 없이 매칭
    - 부분 일치 지원 (검색 키워드)

3. **카테고리 매칭**

    - 태그 기반으로 카테고리를 추론하므로 정확도가 떨어질 수 있음
    - DB에 `category` 컬럼이 있으므로 이를 우선 사용

4. **데이터 일관성**

    - 태그는 `#` 기호 없이 저장됨 (프론트엔드에서 표시 시 추가)
    - 태그 이름은 중복 방지 (UNIQUE 제약)

5. **에러 처리**
    - 태그가 없는 관광지 처리
    - 검색 결과가 없을 때 빈 배열 반환
    - 잘못된 카테고리 값 처리

## 테스트 케이스

1. 전체 관광지 목록 조회
2. 태그 선택 시 필터링
3. 여러 태그 동시 선택
4. 카테고리 필터 적용
5. 검색 키워드로 필터링
6. 정렬 기능 테스트
7. 페이지네이션 테스트
8. 인기 태그 조회
9. 전체 태그 조회
