# 테마 검색 페이지 (theme.html) 작동을 위한 필수 파일 및 코드 정리

## 페이지 개요

테마별로 관광지를 검색하고 필터링하는 페이지입니다.

**프론트엔드 파일 위치**:

-   HTML: `src/main/resources/templates/pages/search-place/theme.html`
-   JavaScript: `src/main/resources/static/js/theme.js`
-   CSS: `src/main/resources/static/css/theme.css`

**샘플 데이터 정보**:

-   샘플 데이터 파일: `src/main/resources/static/temp/sample_data.sql`
-   포함된 데이터:
    -   관광지 6개 (해운대 해수욕장, 광안리 해수욕장, 동래온천, 자갈치시장, 신세계 센텀시티, 카페리프 송정점)
    -   해시태그 6개 (해수욕장, 일출명소, 문화, 맛집, 쇼핑, 카페)
    -   지역 16개 (기장군, 금정구, 해운대구, 동래구 등)
    -   관광지 이미지 5개 (대표 이미지 포함)
    -   관광지-해시태그 연결 5개

**⚠️ 빠른 시작**:

1. 데이터베이스에 샘플 데이터 삽입: `mysql -u root -p < src/main/resources/static/temp/sample_data.sql`
2. 백엔드 API 구현 (섹션 6 참조)
3. 프론트엔드 API 엔드포인트 수정 (섹션 8 참조)

---

## 1. 필수 HTML 파일

### 1.1 메인 페이지

-   **파일**: `src/main/resources/templates/pages/search-place/theme.html`
-   **상태**: ✅ 존재
-   **설명**: Thymeleaf 레이아웃을 사용하는 메인 페이지

### 1.2 레이아웃 파일

-   **파일**: `src/main/resources/templates/layouts/layout.html`
-   **상태**: ✅ 존재
-   **설명**: 공통 레이아웃 템플릿

### 1.3 리스트 아이템 템플릿

-   **파일**: `src/main/resources/templates/components/list-item.html`
-   **상태**: ✅ 존재
-   **설명**: 관광지 아이템을 렌더링하는 템플릿 (Thymeleaf fragment)

### 1.4 기타 컴포넌트

-   **파일**: `src/main/resources/templates/components/header.html`
-   **파일**: `src/main/resources/templates/components/footer.html`
-   **파일**: `src/main/resources/templates/components/loading-animation.html`
-   **상태**: ✅ 모두 존재

---

## 2. 필수 CSS 파일

### 2.1 테마 페이지 스타일

-   **파일**: `src/main/resources/static/css/theme.css`
-   **상태**: ✅ 존재
-   **주요 기능**:
    -   테마 섹션 스타일링
    -   그리드 레이아웃 (캐러셀 모드 ↔ 그리드 모드)
    -   반응형 디자인
    -   애니메이션 효과

### 2.2 리스트 컴포넌트 스타일

-   **파일**: `src/main/resources/static/css/list-component.css`
-   **상태**: ✅ 존재
-   **주요 기능**:
    -   리스트 아이템 카드 스타일
    -   좋아요 버튼 스타일
    -   호버 효과

### 2.3 로딩 애니메이션 스타일

-   **파일**: `src/main/resources/static/css/loading-animation.css`
-   **상태**: ✅ 존재
-   **주요 기능**:
    -   페이지 로딩 애니메이션
    -   언어 변경 시 애니메이션

### 2.4 기본 스타일 파일

-   **파일**: `src/main/resources/static/css/reset.css`
-   **파일**: `src/main/resources/static/css/header.css`
-   **파일**: `src/main/resources/static/css/footer.css`
-   **상태**: ✅ 모두 존재

---

## 3. 필수 JavaScript 파일

### 3.1 테마 페이지 메인 스크립트

-   **파일**: `src/main/resources/static/js/theme.js`
-   **상태**: ✅ 존재
-   **주요 기능**:
    -   `ThemeCarousel` 클래스: 테마별 관광지 캐러셀 관리
    -   데이터 로드 및 필터링
    -   테마별 필터링 (kpop, culture, nature, food, shopping)
    -   더보기 기능
    -   상세 페이지 이동

**⚠️ 중요**: 현재 `theme.js`는 JSON 파일을 로드하고 있습니다. 백엔드 API로 변경해야 합니다.

```javascript
// 현재 (49번째 줄)
const response = await fetch('../../data/busanTouristSpots.json');

// 변경 필요
const response = await fetch('/api/tourist-spots');
```

### 3.2 리스트 로더 스크립트

-   **파일**: `src/main/resources/static/js/list-loader.js`
-   **상태**: ✅ 존재
-   **주요 기능**:
    -   `ListLoader` 클래스: 리스트 아이템 렌더링
    -   템플릿 기반 아이템 생성
    -   좋아요 버튼 이벤트 처리

### 3.3 기본 스크립트 파일

-   **파일**: `src/main/resources/static/js/language.js` (다국어 지원)
-   **파일**: `src/main/resources/static/js/auth.js` (인증 관련)
-   **상태**: ✅ 모두 존재

---

## 4. 번역 파일

### 4.1 영어 번역

-   **파일**: `src/main/resources/static/lang/translations-en.json`
-   **상태**: ✅ 존재
-   **필수 키**:
    ```json
    {
        "theme.title": "Orora Recommended Themes",
        "theme.subtitle": "Busan's Representative Tourist Attractions",
        "theme.more_button": "More",
        "theme.user_recommended": "User Recommended Themes",
        "theme.kpop_travel": "K-POP Travel",
        "theme.culture_travel": "Culture Travel",
        "theme.nature_travel": "Nature Travel",
        "theme.food_travel": "Food Travel",
        "theme.shopping_travel": "Shopping Travel"
    }
    ```

### 4.2 일본어 번역

-   **파일**: `src/main/resources/static/lang/translations-jp.json`
-   **상태**: ✅ 존재
-   **필수 키**: 영어와 동일한 키 구조

---

## 5. 백엔드 API 엔드포인트

### 5.1 필수 API: 관광지 목록 조회 (지역별 그룹화)

**엔드포인트**: `GET /api/tourist-spots`

**설명**: 모든 관광지 정보를 지역별로 그룹화하여 반환

**응답 형식**:

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

**데이터 구조 요구사항**:

-   각 `spot` 객체는 다음 필드를 포함해야 합니다:
    -   `id`: 관광지 ID
    -   `title`: 관광지 제목
    -   `description`: 설명
    -   `hashtags`: 해시태그 배열 (문자열 배열)
    -   `imageUrl`: 이미지 URL
    -   `linkUrl`: 링크 URL
    -   `category`: 카테고리 (선택)
    -   `isActive`: 활성화 여부
    -   `viewCount`: 조회수
    -   `ratingAvg`: 평균 평점
    -   `ratingCount`: 평점 개수

**⚠️ 중요**:

-   `hashtags`는 반드시 배열 형태여야 합니다 (문자열 배열)
-   `imageUrl`은 상대 경로 또는 절대 경로로 제공되어야 합니다

### 5.2 선택적 API: 테마별 관광지 검색

**엔드포인트**: `GET /api/tourist-spots/by-theme?theme={theme}`

**설명**: 특정 테마에 맞는 관광지 목록 조회

**쿼리 파라미터**:

-   `theme`: 테마 코드 (kpop, culture, nature, food, shopping)

**응답 형식**: 위와 동일

**참고**: 현재 프론트엔드는 클라이언트 사이드에서 필터링을 수행하므로, 이 API는 선택적입니다.

---

## 5.3 샘플 데이터 기반 실제 API 응답 예시

`sample_data.sql` 파일에 포함된 실제 샘플 데이터를 기반으로 한 API 응답 예시입니다.

### 샘플 데이터 개요

**sample_data.sql** 파일에는 다음 데이터가 포함되어 있습니다:

-   **지역 (regions)**: 16개 (기장군, 금정구, 해운대구, 동래구 등)
-   **해시태그 (hashtags)**: 6개 (해수욕장, 일출명소, 문화, 맛집, 쇼핑, 카페)
-   **관광지 (tourist_spots)**: 6개
-   **관광지 이미지 (tourist_spot_images)**: 5개
-   **관광지-해시태그 연결 (tourist_spot_hashtags)**: 5개

### 실제 샘플 데이터 예시

#### 1. 관광지 데이터 (tourist_spots 테이블)

```sql
-- sample_data.sql에서 추출한 실제 데이터
INSERT INTO tourist_spots (region_id, title, description, link_url, category_code, is_active, view_count) VALUES
(1, '해운대 해수욕장', '부산의 대표 해수욕장으로 매년 수많은 관광객이 찾는 곳입니다.', 'https://www.busan.go.kr', 'BEACH', TRUE, 3500),
(2, '광안리 해수욕장', '광안대교의 아름다운 야경을 감상할 수 있는 해수욕장입니다.', 'https://www.busan.go.kr', 'BEACH', TRUE, 3200),
(3, '동래온천', '부산의 대표적인 온천지로 천연 온천수를 즐길 수 있습니다.', 'https://www.busan.go.kr', 'CULTURE', TRUE, 1200),
(4, '자갈치시장', '부산 대표 수산시장으로 신선한 해산물을 맛볼 수 있습니다.', 'https://www.busan.go.kr', 'FOOD', TRUE, 2200),
(1, '신세계 센텀시티', '세계 최대 규모의 백화점으로 기네스북에 등재된 대형 쇼핑몰입니다.', 'https://www.busan.go.kr', 'SHOPPING', TRUE, 2800),
(2, '카페리프 송정점', '송정해수욕장 뷰가 한눈에 보이는 카페입니다.', 'https://www.busan.go.kr', 'CAFE', TRUE, 320);
```

#### 2. 관광지 이미지 데이터 (tourist_spot_images 테이블)

```sql
-- 대표 이미지 (rep_img_yn = 'Y')가 각 관광지마다 설정되어 있음
INSERT INTO tourist_spot_images (img_name, ori_img_name, tourist_spot_id, image_url, rep_img_yn) VALUES
('haeundae-beach-1-uuid.jpg', 'haeundae-beach-1.jpg', 1, '../../images/haeundae-beach-1.jpg', 'Y'),
('gwangalli-beach-1-uuid.jpg', 'gwangalli-beach-1.jpg', 2, '../../images/gwangalli-beach-1.jpg', 'Y'),
('dongnae-onsen-1-uuid.jpg', 'dongnae-onsen-1.jpg', 3, '../../images/dongnae-onsen-1.jpg', 'Y'),
('jagalchi-market-1-uuid.jpg', 'jagalchi-market-1.jpg', 4, '../../images/jagalchi-market-1.jpg', 'Y');
```

#### 3. 관광지-해시태그 연결 데이터 (tourist_spot_hashtags 테이블)

```sql
-- 각 관광지에 연결된 해시태그
INSERT INTO tourist_spot_hashtags (tourist_spot_id, hashtag_id) VALUES
(1, 1), -- 해운대 해수욕장 - 해수욕장
(1, 2), -- 해운대 해수욕장 - 일출명소
(2, 1), -- 광안리 해수욕장 - 해수욕장
(4, 4), -- 자갈치시장 - 맛집
(5, 5); -- 신세계 센텀시티 - 쇼핑
```

### 실제 API 응답 예시 (샘플 데이터 기반)

**요청**: `GET /api/tourist-spots`

**응답**:

```json
{
    "regions": {
        "area01": {
            "name": "기장군",
            "code": "26710",
            "spots": [
                {
                    "id": 1,
                    "title": "해운대 해수욕장",
                    "description": "부산의 대표 해수욕장으로 매년 수많은 관광객이 찾는 곳입니다.",
                    "hashtags": ["해수욕장", "일출명소"],
                    "imageUrl": "../../images/haeundae-beach-1.jpg",
                    "linkUrl": "https://www.busan.go.kr",
                    "category": "BEACH",
                    "isActive": true,
                    "viewCount": 3500,
                    "ratingAvg": 5.0,
                    "ratingCount": 1
                },
                {
                    "id": 5,
                    "title": "신세계 센텀시티",
                    "description": "세계 최대 규모의 백화점으로 기네스북에 등재된 대형 쇼핑몰입니다.",
                    "hashtags": ["쇼핑"],
                    "imageUrl": null,
                    "linkUrl": "https://www.busan.go.kr",
                    "category": "SHOPPING",
                    "isActive": true,
                    "viewCount": 2800,
                    "ratingAvg": 4.0,
                    "ratingCount": 1
                }
            ]
        },
        "area02": {
            "name": "금정구",
            "code": "26410",
            "spots": [
                {
                    "id": 2,
                    "title": "광안리 해수욕장",
                    "description": "광안대교의 아름다운 야경을 감상할 수 있는 해수욕장입니다.",
                    "hashtags": ["해수욕장"],
                    "imageUrl": "../../images/gwangalli-beach-1.jpg",
                    "linkUrl": "https://www.busan.go.kr",
                    "category": "BEACH",
                    "isActive": true,
                    "viewCount": 3200,
                    "ratingAvg": 5.0,
                    "ratingCount": 1
                },
                {
                    "id": 6,
                    "title": "카페리프 송정점",
                    "description": "송정해수욕장 뷰가 한눈에 보이는 카페입니다.",
                    "hashtags": [],
                    "imageUrl": null,
                    "linkUrl": "https://www.busan.go.kr",
                    "category": "CAFE",
                    "isActive": true,
                    "viewCount": 320,
                    "ratingAvg": 0.0,
                    "ratingCount": 0
                }
            ]
        },
        "area03": {
            "name": "해운대구",
            "code": "26440",
            "spots": [
                {
                    "id": 3,
                    "title": "동래온천",
                    "description": "부산의 대표적인 온천지로 천연 온천수를 즐길 수 있습니다.",
                    "hashtags": [],
                    "imageUrl": "../../images/dongnae-onsen-1.jpg",
                    "linkUrl": "https://www.busan.go.kr",
                    "category": "CULTURE",
                    "isActive": true,
                    "viewCount": 1200,
                    "ratingAvg": 4.0,
                    "ratingCount": 1
                }
            ]
        },
        "area04": {
            "name": "동래구",
            "code": "26290",
            "spots": [
                {
                    "id": 4,
                    "title": "자갈치시장",
                    "description": "부산 대표 수산시장으로 신선한 해산물을 맛볼 수 있습니다.",
                    "hashtags": ["맛집"],
                    "imageUrl": "../../images/jagalchi-market-1.jpg",
                    "linkUrl": "https://www.busan.go.kr",
                    "category": "FOOD",
                    "isActive": true,
                    "viewCount": 2200,
                    "ratingAvg": 4.0,
                    "ratingCount": 1
                }
            ]
        }
    }
}
```

### 데이터베이스 조회 쿼리 예시

#### 1. 관광지와 해시태그를 함께 조회하는 쿼리

```sql
-- 관광지 정보와 해시태그를 함께 조회
SELECT
    ts.id,
    ts.title,
    ts.description,
    ts.link_url,
    ts.category_code,
    ts.view_count,
    r.name as region_name,
    r.area_code,
    GROUP_CONCAT(h.name) as hashtags,
    (SELECT image_url
     FROM tourist_spot_images
     WHERE tourist_spot_id = ts.id AND rep_img_yn = 'Y'
     LIMIT 1) as image_url
FROM tourist_spots ts
LEFT JOIN regions r ON ts.region_id = r.id
LEFT JOIN tourist_spot_hashtags tsh ON ts.id = tsh.tourist_spot_id
LEFT JOIN hashtags h ON tsh.hashtag_id = h.id
WHERE ts.is_active = TRUE
GROUP BY ts.id, ts.title, ts.description, ts.link_url, ts.category_code, ts.view_count, r.name, r.area_code
ORDER BY ts.created_at DESC;
```

#### 2. 지역별로 그룹화하여 조회하는 쿼리

```sql
-- 지역별로 관광지를 그룹화하여 조회
SELECT
    r.area_code,
    r.name as region_name,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', ts.id,
            'title', ts.title,
            'description', ts.description,
            'hashtags', (
                SELECT JSON_ARRAYAGG(h.name)
                FROM tourist_spot_hashtags tsh
                JOIN hashtags h ON tsh.hashtag_id = h.id
                WHERE tsh.tourist_spot_id = ts.id
            ),
            'imageUrl', (
                SELECT image_url
                FROM tourist_spot_images
                WHERE tourist_spot_id = ts.id AND rep_img_yn = 'Y'
                LIMIT 1
            ),
            'linkUrl', ts.link_url,
            'category', ts.category_code,
            'isActive', ts.is_active,
            'viewCount', ts.view_count
        )
    ) as spots
FROM regions r
LEFT JOIN tourist_spots ts ON r.id = ts.region_id AND ts.is_active = TRUE
GROUP BY r.area_code, r.name
HAVING spots IS NOT NULL
ORDER BY r.area_code;
```

### 샘플 데이터 확인 방법

#### 1. 데이터베이스에 샘플 데이터 삽입

```bash
# 1. 스키마 생성
mysql -u root -p < src/main/resources/static/temp/common_code_schema.sql
mysql -u root -p < src/main/resources/static/temp/new_data_schema.sql

# 2. 샘플 데이터 삽입
mysql -u root -p < src/main/resources/static/temp/sample_data.sql
```

#### 2. 데이터 확인 쿼리

```sql
-- 모든 관광지 조회
SELECT * FROM tourist_spots;

-- 관광지와 지역 정보 함께 조회
SELECT
    ts.id,
    ts.title,
    r.name as region_name,
    r.area_code
FROM tourist_spots ts
JOIN regions r ON ts.region_id = r.id;

-- 관광지와 해시태그 함께 조회
SELECT
    ts.title,
    GROUP_CONCAT(h.name) as hashtags
FROM tourist_spots ts
LEFT JOIN tourist_spot_hashtags tsh ON ts.id = tsh.tourist_spot_id
LEFT JOIN hashtags h ON tsh.hashtag_id = h.id
GROUP BY ts.id, ts.title;

-- 관광지의 대표 이미지 조회
SELECT
    ts.title,
    tsi.image_url,
    tsi.rep_img_yn
FROM tourist_spots ts
LEFT JOIN tourist_spot_images tsi ON ts.id = tsi.tourist_spot_id AND tsi.rep_img_yn = 'Y';
```

### 테마별 필터링 예시 (샘플 데이터 기준)

#### K-POP 여행 테마

-   **필터링 조건**: 해시태그에 "핫플레이스", "포토스팟", "데이트" 등 포함
-   **샘플 데이터 결과**: 현재 샘플 데이터에는 해당 해시태그가 없으므로 빈 결과 또는 백업 데이터 사용

#### 자연 여행 테마

-   **필터링 조건**: 해시태그에 "해수욕장", "일출명소" 포함
-   **샘플 데이터 결과**:
    -   해운대 해수욕장 (해수욕장, 일출명소)
    -   광안리 해수욕장 (해수욕장)

#### 음식 여행 테마

-   **필터링 조건**: 해시태그에 "맛집" 포함
-   **샘플 데이터 결과**:
    -   자갈치시장 (맛집)

#### 쇼핑 여행 테마

-   **필터링 조건**: 해시태그에 "쇼핑" 포함 또는 category_code = 'SHOPPING'
-   **샘플 데이터 결과**:
    -   신세계 센텀시티 (쇼핑)

### 주의사항

1. **이미지 URL 경로**:

    - 샘플 데이터의 이미지 경로는 `../../images/`로 시작합니다
    - 실제 서버 환경에 맞게 경로를 조정해야 합니다
    - 이미지가 없는 관광지의 경우 `imageUrl`은 `null`이 될 수 있습니다

2. **해시태그 배열**:

    - 해시태그가 없는 관광지의 경우 빈 배열 `[]`로 반환해야 합니다
    - `null`이 아닌 빈 배열을 사용해야 프론트엔드에서 오류가 발생하지 않습니다

3. **평점 정보**:

    - `ratingAvg`와 `ratingCount`는 `reviews` 테이블에서 계산해야 합니다
    - 리뷰가 없는 경우 `ratingAvg: 0.0`, `ratingCount: 0`으로 설정

4. **지역 코드 매핑**:
    - `regions` 테이블의 `area_code`를 사용하여 지역을 구분합니다
    - API 응답의 `code` 필드에 `area_code` 값을 사용합니다

---

## 6. 백엔드 구현 필요 사항

### 6.1 Controller

-   **파일**: `src/main/java/com/busan/orora/spot/controller/SpotController.java` (생성 필요)
-   **필수 메서드**:
    ```java
    @GetMapping("/api/tourist-spots")
    public ResponseEntity<Map<String, Object>> getAllSpotsByRegion() {
        // 모든 관광지를 지역별로 그룹화하여 반환
        // SpotDto 리스트를 가져와서 Region별로 그룹화
        // 각 Spot에 hashtags, imageUrl 정보 포함
    }
    ```

### 6.2 Service

-   **파일**: `src/main/java/com/busan/orora/spot/service/SpotService.java`
-   **상태**: ✅ 존재 (기본 메서드만 있음)
-   **추가 필요 메서드**:
    ```java
    public Map<String, Object> getAllSpotsGroupedByRegion() {
        // 1. 모든 Spot 조회
        // 2. 각 Spot의 Region 정보 조회
        // 3. 각 Spot의 Hashtag 목록 조회
        // 4. 각 Spot의 Image URL 조회
        // 5. Region별로 그룹화
        // 6. 응답 형식에 맞게 변환
    }
    ```

### 6.3 Mapper

-   **파일**: `src/main/resources/mapper/spotMapper.xml`
-   **상태**: ✅ 존재
-   **추가 필요 쿼리**:

    ```xml
    <!-- Spot과 함께 Hashtag 목록 조회 -->
    <select id="findSpotsWithHashtags" resultMap="SpotWithHashtagsResultMap">
        SELECT
            s.id, s.region_id, s.title, s.description, s.link_url,
            s.category_code, s.is_active, s.view_count,
            h.id as hashtag_id, h.name as hashtag_name
        FROM tourist_spots s
        LEFT JOIN spot_hashtags sh ON s.id = sh.spot_id
        LEFT JOIN hashtags h ON sh.hashtag_id = h.id
        WHERE s.is_active = true
        ORDER BY s.created_at DESC
    </select>

    <!-- Spot의 이미지 URL 조회 -->
    <select id="findSpotImages" resultType="String">
        SELECT image_url
        FROM spot_images
        WHERE spot_id = #{spotId}
        ORDER BY display_order
        LIMIT 1
    </select>
    ```

### 6.4 DTO

-   **파일**: `src/main/java/com/busan/orora/spot/dto/SpotDto.java`
-   **상태**: ✅ 존재
-   **추가 필요 필드** (또는 별도 Response DTO 생성):
    ```java
    private List<String> hashtags;  // 해시태그 목록
    private String imageUrl;         // 대표 이미지 URL
    private String regionName;       // 지역 이름
    ```

---

## 7. 데이터베이스 스키마

### 7.1 필수 테이블

-   `tourist_spots`: 관광지 기본 정보
-   `regions`: 지역 정보
-   `hashtags`: 해시태그 정보
-   `tourist_spot_hashtags`: 관광지-해시태그 연결 테이블
-   `tourist_spot_images`: 관광지 이미지 정보

### 7.2 데이터 관계

```
regions (1) ──< (N) tourist_spots
tourist_spots (N) ──< (N) hashtags (tourist_spot_hashtags)
tourist_spots (1) ──< (N) tourist_spot_images
```

### 7.3 테이블 구조 상세

#### tourist_spots 테이블

```sql
CREATE TABLE tourist_spots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    region_id INT NOT NULL,
    title VARCHAR(80) NOT NULL,
    description TEXT,
    link_url VARCHAR(500),
    category_code VARCHAR(50) DEFAULT 'CULTURE',
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE
);
```

**샘플 데이터 예시**:

-   `id: 1`, `title: "해운대 해수욕장"`, `region_id: 1`, `category_code: "BEACH"`, `view_count: 3500`

#### tourist_spot_images 테이블

```sql
CREATE TABLE tourist_spot_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tourist_spot_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    rep_img_yn VARCHAR(1) DEFAULT 'N' COMMENT '대표 이미지 여부 (Y/N)',
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE
);
```

**샘플 데이터 예시**:

-   `tourist_spot_id: 1`, `image_url: "../../images/haeundae-beach-1.jpg"`, `rep_img_yn: "Y"`

**⚠️ 중요**:

-   `rep_img_yn = 'Y'`인 이미지를 대표 이미지로 사용합니다
-   여러 이미지가 있는 경우 `rep_img_yn = 'Y'`인 첫 번째 이미지를 선택합니다
-   대표 이미지가 없는 경우 `imageUrl`은 `null`로 설정합니다

#### tourist_spot_hashtags 테이블

```sql
CREATE TABLE tourist_spot_hashtags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tourist_spot_id INT NOT NULL,
    hashtag_id INT NOT NULL,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE,
    FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_spot_hashtag (tourist_spot_id, hashtag_id)
);
```

**샘플 데이터 예시**:

-   `tourist_spot_id: 1`, `hashtag_id: 1` (해운대 해수욕장 - 해수욕장)
-   `tourist_spot_id: 1`, `hashtag_id: 2` (해운대 해수욕장 - 일출명소)

### 7.4 샘플 데이터 파일 위치

-   **스키마 파일**: `src/main/resources/static/temp/new_data_schema.sql`
-   **샘플 데이터 파일**: `src/main/resources/static/temp/sample_data.sql`
-   **공통코드 스키마**: `src/main/resources/static/temp/common_code_schema.sql`

**⚠️ 실행 순서**:

1. `common_code_schema.sql` 실행 (공통코드 테이블 생성)
2. `new_data_schema.sql` 실행 (메인 테이블 생성)
3. `sample_data.sql` 실행 (샘플 데이터 삽입)

---

## 8. 프론트엔드 수정 필요 사항

### 8.1 theme.js 수정

**현재 코드 (49번째 줄)**:

```javascript
const response = await fetch('../../data/busanTouristSpots.json');
```

**수정 필요**:

```javascript
const response = await fetch('/api/tourist-spots');
```

**추가 수정 사항**:

1. 에러 처리 개선
2. 로딩 상태 표시
3. 빈 데이터 처리

### 8.2 상세 페이지 이동 경로 확인

**현재 코드 (557번째 줄)**:

```javascript
window.location.href = `../detailed/detailed.html?title=${encodedTitle}`;
```

**확인 필요**: 실제 상세 페이지 경로와 일치하는지 확인

-   Thymeleaf 사용 시: `/pages/detailed/detailed.html?title=${encodedTitle}`
-   또는 백엔드 라우팅에 따라 조정

---

## 9. 체크리스트

### 프론트엔드

-   [x] HTML 파일 존재
-   [x] CSS 파일 존재
-   [x] JavaScript 파일 존재
-   [x] 템플릿 파일 존재
-   [x] 번역 파일 존재
-   [ ] theme.js의 API 엔드포인트 수정 필요
-   [ ] 상세 페이지 이동 경로 확인 필요

### 백엔드

-   [ ] SpotController 생성 필요
-   [ ] getAllSpotsGroupedByRegion() 메서드 구현 필요
-   [ ] SpotService에 지역별 그룹화 메서드 추가 필요
-   [ ] SpotMapper에 Hashtag 조인 쿼리 추가 필요
-   [ ] SpotMapper에 Image URL 조회 쿼리 추가 필요
-   [ ] SpotDto 또는 ResponseDto에 hashtags, imageUrl 필드 추가 필요

### 데이터베이스

-   [ ] 테이블 스키마 확인 (`new_data_schema.sql` 실행)
-   [ ] 공통코드 스키마 확인 (`common_code_schema.sql` 실행)
-   [ ] 샘플 데이터 삽입 (`sample_data.sql` 실행)
-   [ ] Hashtag 데이터 확인 (`SELECT * FROM hashtags;`)
-   [ ] Image URL 데이터 확인 (`SELECT * FROM tourist_spot_images WHERE rep_img_yn = 'Y';`)
-   [ ] 관광지-해시태그 연결 확인 (`SELECT * FROM tourist_spot_hashtags;`)

---

## 10. 테스트 시나리오

### 10.1 기본 기능 테스트

1. 페이지 로드 시 오로라 추천 테마 표시 확인
2. 유저 추천 테마 드롭다운 동작 확인
3. 테마 선택 시 필터링 동작 확인
4. 더보기 버튼 클릭 시 추가 항목 표시 확인

### 10.2 데이터 테스트

1. 빈 데이터 처리 확인
2. 이미지 로드 실패 시 대체 이미지 표시 확인
3. 해시태그 표시 확인
4. 상세 페이지 이동 확인

**샘플 데이터 기반 테스트**:

-   해운대 해수욕장: 해시태그 2개 (해수욕장, 일출명소), 이미지 있음
-   광안리 해수욕장: 해시태그 1개 (해수욕장), 이미지 있음
-   자갈치시장: 해시태그 1개 (맛집), 이미지 있음
-   신세계 센텀시티: 해시태그 1개 (쇼핑), 이미지 없음 (null 처리 확인)

### 10.3 반응형 테스트

1. 모바일 화면에서 그리드 레이아웃 확인
2. 태블릿 화면에서 레이아웃 확인
3. 데스크톱 화면에서 캐러셀 모드 확인

### 10.4 다국어 테스트

1. 언어 변경 시 텍스트 번역 확인
2. 영어/일본어 번역 키 누락 확인

---

## 11. 문제 해결 가이드

### 문제 1: 데이터가 표시되지 않음

-   **원인**: API 엔드포인트가 올바르지 않음
-   **해결**: `theme.js`의 fetch URL을 `/api/tourist-spots`로 변경
-   **확인**: 브라우저 개발자 도구의 Network 탭에서 API 호출 확인

### 문제 2: 해시태그가 표시되지 않음

-   **원인**: API 응답에 `hashtags` 필드가 없거나 배열이 아님
-   **해결**: 백엔드에서 Spot 조회 시 Hashtag 정보를 포함하도록 수정

### 문제 3: 이미지가 표시되지 않음

-   **원인**: `imageUrl`이 올바르지 않거나 데이터가 없음
-   **해결**:
    1. 백엔드에서 Spot의 대표 이미지 URL을 포함하도록 수정
    2. `theme.js`의 이미지 fallback 경로 확인

### 문제 4: 상세 페이지로 이동하지 않음

-   **원인**: 경로가 올바르지 않음
-   **해결**: `theme.js`의 `navigateToDetail()` 메서드의 경로를 실제 상세 페이지 경로로 수정

### 문제 5: 더보기 버튼이 동작하지 않음

-   **원인**: 이벤트 리스너가 제대로 바인딩되지 않음
-   **해결**: DOMContentLoaded 이벤트 후 초기화 확인

### 문제 6: 샘플 데이터가 표시되지 않음

-   **원인**: 샘플 데이터가 데이터베이스에 삽입되지 않음
-   **해결**:
    1. `sample_data.sql` 파일이 실행되었는지 확인
    2. 다음 쿼리로 데이터 확인:
        ```sql
        SELECT COUNT(*) FROM tourist_spots;  -- 6개여야 함
        SELECT COUNT(*) FROM hashtags;       -- 6개여야 함
        SELECT COUNT(*) FROM tourist_spot_hashtags;  -- 5개여야 함
        ```
    3. 데이터가 없으면 `sample_data.sql` 실행

### 문제 7: 이미지가 표시되지 않음 (샘플 데이터 기준)

-   **원인**:
    1. 이미지 파일이 실제로 존재하지 않음
    2. `tourist_spot_images` 테이블에 데이터가 없음
    3. `rep_img_yn = 'Y'`인 이미지가 없음
-   **해결**:
    1. 다음 쿼리로 대표 이미지 확인:
        ```sql
        SELECT ts.title, tsi.image_url, tsi.rep_img_yn
        FROM tourist_spots ts
        LEFT JOIN tourist_spot_images tsi ON ts.id = tsi.tourist_spot_id AND tsi.rep_img_yn = 'Y';
        ```
    2. 이미지 파일 경로 확인: `src/main/resources/static/images/` 디렉토리
    3. `theme.js`의 fallback 이미지 경로 확인 (499번째 줄)

### 문제 8: 해시태그가 표시되지 않음 (샘플 데이터 기준)

-   **원인**:
    1. `tourist_spot_hashtags` 테이블에 연결 데이터가 없음
    2. API에서 해시태그를 배열로 변환하지 않음
-   **해결**:
    1. 다음 쿼리로 해시태그 연결 확인:
        ```sql
        SELECT ts.title, GROUP_CONCAT(h.name) as hashtags
        FROM tourist_spots ts
        LEFT JOIN tourist_spot_hashtags tsh ON ts.id = tsh.tourist_spot_id
        LEFT JOIN hashtags h ON tsh.hashtag_id = h.id
        GROUP BY ts.id, ts.title;
        ```
    2. 백엔드에서 해시태그를 배열로 변환하는 로직 확인
    3. 해시태그가 없는 관광지의 경우 빈 배열 `[]` 반환 확인

---

## 12. 참고 파일

### 관련 Instruction 파일

-   `instruction/01_tag_page.md`: 태그 검색 페이지 가이드 (유사한 구조)
-   `instruction/05_place_page.md`: 지역별 검색 페이지 가이드

### 관련 API 문서

-   `src/main/resources/static/temp/BACKEND_API_ENDPOINTS.md`: 백엔드 API 엔드포인트 문서

### 데이터 스키마

-   `src/main/resources/static/temp/new_data_schema.sql`: 데이터베이스 스키마
-   `src/main/resources/static/temp/sample_data.sql`: 샘플 데이터

---

## 13. 다음 단계

1. **데이터베이스 설정**

    - `common_code_schema.sql` 실행 (공통코드 테이블 생성)
    - `new_data_schema.sql` 실행 (메인 테이블 생성)
    - `sample_data.sql` 실행 (샘플 데이터 삽입)
    - 샘플 데이터 확인 (6개 관광지, 6개 해시태그, 5개 이미지)

2. **백엔드 API 구현**

    - SpotController 생성
    - getAllSpotsGroupedByRegion() 메서드 구현
    - Hashtag 및 Image 정보 포함
    - 샘플 데이터로 API 응답 테스트

3. **프론트엔드 수정**

    - theme.js의 API 엔드포인트 변경 (`/api/tourist-spots`)
    - 상세 페이지 경로 확인 및 수정
    - 샘플 데이터로 화면 표시 확인

4. **테스트**

    - 샘플 데이터 기반 테스트:
        - 해운대 해수욕장 (해수욕장, 일출명소) - 자연 여행 테마
        - 자갈치시장 (맛집) - 음식 여행 테마
        - 신세계 센텀시티 (쇼핑) - 쇼핑 여행 테마
    - 각 테마별 필터링 동작 확인
    - 더보기 기능 확인
    - 반응형 디자인 확인

5. **최적화**
    - 이미지 lazy loading 적용
    - 무한 스크롤 고려
    - 캐싱 전략 고려

---
