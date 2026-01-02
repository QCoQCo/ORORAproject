# 테마 검색 페이지 (theme.html) 작동을 위한 필수 파일 및 코드 정리

## 📋 페이지 개요

테마별로 관광지를 검색하고 필터링하는 페이지입니다. 사용자는 5가지 테마(K-POP 여행, 문화 여행, 자연 여행, 음식 여행, 쇼핑 여행) 중 하나를 선택하여 해당 테마에 맞는 관광지를 필터링하여 볼 수 있습니다.

### 프로젝트 구조

이 프로젝트는 **Spring Boot + Thymeleaf + MyBatis** 기반의 웹 애플리케이션입니다.

-   **백엔드**: Spring Boot 2.x, MyBatis, MySQL
-   **프론트엔드**: Thymeleaf 템플릿, Vanilla JavaScript, CSS3
-   **데이터베이스**: MySQL (arata_busan)

### 프론트엔드 파일 위치

-   **HTML**: `src/main/resources/templates/pages/search-place/theme.html`
-   **JavaScript**: `src/main/resources/static/js/theme.js`
-   **CSS**: `src/main/resources/static/css/theme.css`

### 샘플 데이터 정보

-   **샘플 데이터 파일**: `src/main/resources/static/temp/sample_data.sql`
-   **포함된 데이터**:
    -   관광지 6개 (해운대 해수욕장, 광안리 해수욕장, 동래온천, 자갈치시장, 신세계 센텀시티, 카페리프 송정점)
    -   해시태그 6개 (해수욕장, 일출명소, 문화, 맛집, 쇼핑, 카페)
    -   지역 16개 (기장군, 금정구, 해운대구, 동래구 등)
    -   관광지 이미지 5개 (대표 이미지 포함)
    -   관광지-해시태그 연결 5개

### ⚠️ 빠른 시작 가이드

1. **데이터베이스 설정**

    ```bash
    # 공통코드 테이블 생성
    mysql -u root -p < src/main/resources/static/temp/common_code_schema.sql

    # 메인 테이블 생성
    mysql -u root -p < src/main/resources/static/temp/new_data_schema.sql

    # 샘플 데이터 삽입
    mysql -u root -p < src/main/resources/static/temp/sample_data.sql
    ```

2. **백엔드 API 구현** (섹션 6 참조)

    - SpotController에 `/api/tourist-spots` 엔드포인트 구현
    - SpotService에 지역별 그룹화 메서드 추가
    - SpotMapper에 해시태그 및 이미지 조인 쿼리 추가

3. **프론트엔드 API 엔드포인트 수정** (섹션 8 참조)
    - `theme.js`의 49번째 줄에서 JSON 파일 로드 → API 호출로 변경

---

## 1. 필수 HTML 파일

### 1.1 메인 페이지

-   **파일**: `src/main/resources/templates/pages/search-place/theme.html`
-   **상태**: ✅ 존재
-   **설명**: Thymeleaf 레이아웃을 사용하는 메인 페이지
-   **주요 구조**:
    -   `layout:decorate="~{layouts/layout}"`: 공통 레이아웃 적용
    -   `#aurora-carousel`: 오로라 추천 테마 섹션 (부산 대표 관광지)
    -   `#user-carousel`: 유저 추천 테마 섹션 (테마별 필터링)
    -   `#theme`: 테마 선택 드롭다운 (kpop, culture, nature, food, shopping)
    -   `th:replace="~{components/list-item.html :: list-item-template}"`: 리스트 아이템 템플릿 포함

### 1.2 레이아웃 파일

-   **파일**: `src/main/resources/templates/layouts/layout.html`
-   **상태**: ✅ 존재
-   **설명**: 공통 레이아웃 템플릿
-   **포함 요소**: Header, Footer, 공통 스크립트 및 스타일시트

### 1.3 리스트 아이템 템플릿

-   **파일**: `src/main/resources/templates/components/list-item.html`
-   **상태**: ✅ 존재
-   **설명**: 관광지 아이템을 렌더링하는 템플릿 (Thymeleaf fragment)
-   **템플릿 ID**: `list-item` (JavaScript에서 `document.getElementById('list-item')`로 접근)
-   **포함 요소**:
    -   이미지 영역 (`.item-photo img`)
    -   제목 (`.item-title`)
    -   설명 (`.item-description`)
    -   해시태그 (`.hash-tag`)
    -   좋아요 버튼 (`.likeBtn`)
    -   링크 (`.item-link`)

### 1.4 기타 컴포넌트

-   **파일**: `src/main/resources/templates/components/header.html`
-   **파일**: `src/main/resources/templates/components/footer.html`
-   **파일**: `src/main/resources/templates/components/loading-animation.html`
-   **상태**: ✅ 모두 존재
-   **설명**: 공통 컴포넌트로 레이아웃에서 자동 포함됨

---

## 2. 필수 CSS 파일

### 2.1 테마 페이지 스타일

-   **파일**: `src/main/resources/static/css/theme.css`
-   **상태**: ✅ 존재
-   **주요 기능**:
    -   테마 섹션 스타일링 (`.theme-section`, `.section-title`)
    -   그리드 레이아웃 (`.theme-grid`, `.grid-mode` 클래스로 캐러셀 ↔ 그리드 전환)
    -   반응형 디자인 (모바일, 태블릿, 데스크톱 대응)
    -   애니메이션 효과 (전환 애니메이션, 호버 효과)
    -   더보기 버튼 스타일 (`.more-btn`)
    -   테마 선택 드롭다운 스타일 (`.theme-selector select`)

### 2.2 리스트 컴포넌트 스타일

-   **파일**: `src/main/resources/static/css/list-component.css`
-   **상태**: ✅ 존재
-   **주요 기능**:
    -   리스트 아이템 카드 스타일 (`.item`, `.item-photo`, `.item-title` 등)
    -   좋아요 버튼 스타일 (`.likeBtn`, `.liked` 상태)
    -   호버 효과 (카드 호버 시 확대 및 그림자 효과)
    -   이미지 비율 유지 (aspect-ratio 사용)

### 2.3 로딩 애니메이션 스타일

-   **파일**: `src/main/resources/static/css/loading-animation.css`
-   **상태**: ✅ 존재
-   **주요 기능**:
    -   페이지 로딩 애니메이션 (페이드 인/아웃)
    -   언어 변경 시 애니메이션
    -   데이터 로딩 중 표시

### 2.4 기본 스타일 파일

-   **파일**: `src/main/resources/static/css/reset.css` (CSS 리셋)
-   **파일**: `src/main/resources/static/css/header.css` (헤더 스타일)
-   **파일**: `src/main/resources/static/css/footer.css` (푸터 스타일)
-   **상태**: ✅ 모두 존재
-   **설명**: 레이아웃에서 자동으로 포함되는 공통 스타일

---

## 3. 필수 JavaScript 파일

### 3.1 테마 페이지 메인 스크립트

-   **파일**: `src/main/resources/static/js/theme.js`
-   **상태**: ✅ 존재 (645줄)
-   **주요 클래스**: `ThemeCarousel`
-   **주요 기능**:
    -   `init()`: 초기화 및 데이터 로드
    -   `loadData()`: API에서 관광지 데이터 로드 (현재는 JSON 파일 로드 중)
    -   `getAuroraRecommendedSpots()`: 오로라 추천 테마 필터링 (부산 대표 관광지)
    -   `filterByTheme()`: 테마별 필터링 (kpop, culture, nature, food, shopping)
    -   `renderCarousel()`: 캐러셀/그리드 렌더링
    -   `createListItem()`: 리스트 아이템 생성 (템플릿 기반)
    -   `loadMore()`: 더보기 기능 (페이지네이션)
    -   `navigateToDetail()`: 상세 페이지 이동

**⚠️ 중요**: 현재 `theme.js`의 49번째 줄에서 JSON 파일을 로드하고 있습니다. 백엔드 API로 변경해야 합니다.

```javascript
// 현재 코드 (49번째 줄)
const response = await fetch('../../data/busanTouristSpots.json');

// 변경 필요
const response = await fetch('/api/tourist-spots');
```

**데이터 구조 요구사항**:

-   API 응답은 `{ regions: { area01: { name, code, spots: [...] }, ... } }` 형식이어야 함
-   각 `spot` 객체는 `id`, `title`, `description`, `hashtags` (배열), `imageUrl`, `linkUrl` 등을 포함해야 함

### 3.2 리스트 로더 스크립트

-   **파일**: `src/main/resources/static/js/list-loader.js`
-   **상태**: ✅ 존재
-   **주요 기능**:
    -   `ListLoader` 클래스: 리스트 아이템 렌더링
    -   템플릿 기반 아이템 생성
    -   좋아요 버튼 이벤트 처리
-   **참고**: `theme.js`에서 직접 템플릿을 사용하므로 이 파일은 다른 페이지에서도 사용 가능

### 3.3 기본 스크립트 파일

-   **파일**: `src/main/resources/static/js/language.js` (다국어 지원)
    -   언어 변경 기능 (한국어, 영어, 일본어)
    -   `data-translate` 속성 기반 번역
-   **파일**: `src/main/resources/static/js/auth.js` (인증 관련)
    -   로그인/로그아웃 상태 관리
    -   인증 토큰 처리
-   **상태**: ✅ 모두 존재
-   **설명**: 레이아웃에서 자동으로 포함되는 공통 스크립트

---

## 4. 번역 파일 (다국어 지원)

프로젝트는 한국어, 영어, 일본어를 지원합니다. `language.js`가 `data-translate` 속성을 가진 요소를 자동으로 번역합니다.

### 4.1 영어 번역

-   **파일**: `src/main/resources/static/lang/translations-en.json`
-   **상태**: ✅ 존재
-   **필수 키** (theme.html에서 사용):
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
-   **사용 방법**: HTML에서 `data-translate="theme.title"` 속성 사용

### 4.2 일본어 번역

-   **파일**: `src/main/resources/static/lang/translations-jp.json`
-   **상태**: ✅ 존재
-   **필수 키**: 영어와 동일한 키 구조
-   **예시**:
    ```json
    {
        "theme.title": "オロラおすすめテーマ",
        "theme.subtitle": "釜山の代表的な観光地",
        "theme.more_button": "もっと見る",
        "theme.user_recommended": "ユーザーおすすめテーマ",
        "theme.kpop_travel": "K-POP旅行",
        "theme.culture_travel": "文化旅行",
        "theme.nature_travel": "自然旅行",
        "theme.food_travel": "グルメ旅行",
        "theme.shopping_travel": "ショッピング旅行"
    }
    ```

---

## 5. 백엔드 API 엔드포인트

### 5.1 필수 API: 관광지 목록 조회 (지역별 그룹화)

**엔드포인트**: `GET /api/tourist-spots`

**설명**: 모든 활성화된 관광지 정보를 지역별로 그룹화하여 반환합니다. 프론트엔드에서 이 데이터를 받아 테마별로 필터링합니다.

**요청 헤더**: 없음 (인증 불필요)

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
                    "linkUrl": "https://www.busan.go.kr",
                    "category": "CULTURE",
                    "isActive": true,
                    "viewCount": 3500,
                    "ratingAvg": 4.5,
                    "ratingCount": 10
                }
            ]
        },
        "area02": {
            "name": "금정구",
            "code": "26410",
            "spots": [...]
        }
    }
}
```

**데이터 구조 요구사항**:

-   **최상위 객체**: `regions` (필수)
-   **지역 키**: `area01`, `area02`, ... (area_code 기반, 문자열)
-   **지역 객체**:
    -   `name`: 지역 이름 (예: "기장군")
    -   `code`: 지역 코드 (예: "26710", regions 테이블의 area_code)
    -   `spots`: 관광지 배열 (필수, 빈 배열 가능)
-   **관광지 객체** (`spot`):
    -   `id`: 관광지 ID (Long, 필수)
    -   `title`: 관광지 제목 (String, 필수)
    -   `description`: 설명 (String, null 가능)
    -   `hashtags`: 해시태그 배열 (String[], 필수, 빈 배열 가능)
    -   `imageUrl`: 대표 이미지 URL (String, null 가능)
    -   `linkUrl`: 링크 URL (String, null 가능)
    -   `category`: 카테고리 코드 (String, 예: "CULTURE", "BEACH", "FOOD")
    -   `isActive`: 활성화 여부 (Boolean, 필수)
    -   `viewCount`: 조회수 (Integer, 필수)
    -   `ratingAvg`: 평균 평점 (Double, 0.0 ~ 5.0)
    -   `ratingCount`: 평점 개수 (Integer)

**⚠️ 중요 사항**:

1. **해시태그 배열**:

    - 반드시 배열 형태여야 함 (`[]` 또는 `["태그1", "태그2"]`)
    - `null`이 아닌 빈 배열 `[]`로 반환해야 프론트엔드 오류 방지
    - 해시태그가 없는 경우: `"hashtags": []`

2. **이미지 URL**:

    - 상대 경로: `/images/spot1.jpg` 또는 `../../images/spot1.jpg`
    - 절대 경로: `https://example.com/images/spot1.jpg`
    - 이미지가 없는 경우: `"imageUrl": null`

3. **지역 코드 매핑**:

    - `regions` 테이블의 `area_code` 값을 문자열로 변환하여 사용
    - 예: `area_code = 26710` → `"code": "26710"`

4. **평점 정보**:
    - `reviews` 테이블에서 계산
    - 리뷰가 없는 경우: `"ratingAvg": 0.0`, `"ratingCount": 0`

### 5.2 선택적 API: 테마별 관광지 검색

**엔드포인트**: `GET /api/tourist-spots/by-theme?theme={theme}`

**설명**: 특정 테마에 맞는 관광지 목록을 서버에서 필터링하여 반환합니다.

**쿼리 파라미터**:

-   `theme`: 테마 코드 (필수)
    -   `kpop`: K-POP 여행
    -   `culture`: 문화 여행
    -   `nature`: 자연 여행
    -   `food`: 음식 여행
    -   `shopping`: 쇼핑 여행

**응답 형식**: 5.1과 동일 (지역별 그룹화)

**참고**:

-   현재 프론트엔드는 클라이언트 사이드에서 필터링을 수행하므로, 이 API는 **선택적**입니다.
-   서버 사이드 필터링이 필요한 경우에만 구현하면 됩니다.

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

### 6.1 Controller 구현

-   **파일**: `src/main/java/com/busan/orora/spot/controller/SpotController.java`
-   **상태**: ⚠️ 존재하지만 비어있음 (TODO만 있음)
-   **구현 필요**:

```java
package com.busan.orora.spot.controller;

import com.busan.orora.spot.service.SpotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SpotController {

    @Autowired
    private SpotService spotService;

    /**
     * 모든 관광지를 지역별로 그룹화하여 반환
     * @return 지역별로 그룹화된 관광지 목록
     */
    @GetMapping("/tourist-spots")
    public ResponseEntity<Map<String, Object>> getAllSpotsByRegion() {
        try {
            Map<String, Object> result = spotService.getAllSpotsGroupedByRegion();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // 에러 처리
            return ResponseEntity.internalServerError().build();
        }
    }
}
```

**주의사항**:

-   `@RestController` 사용 (JSON 응답)
-   `@RequestMapping("/api")`로 기본 경로 설정
-   에러 처리 추가 권장

### 6.2 Service 구현

-   **파일**: `src/main/java/com/busan/orora/spot/service/SpotService.java`
-   **상태**: ✅ 존재 (기본 메서드만 있음: `getAllSpots()`, `getSpotsByRegion()`, `getSpotById()`)
-   **의존성 주입 필요**:
    -   `SpotMapper` (이미 있음)
    -   `RegionService` (이미 있음: `src/main/java/com/busan/orora/region/service/RegionService.java`)
    -   `HashtagService` (이미 있음: `src/main/java/com/busan/orora/hashtag/service/HashtagService.java`)
    -   `SpotImageService` (이미 있음: `src/main/java/com/busan/orora/spot/service/SpotImageService.java`)
-   **추가 필요 메서드**:

```java
/**
 * 모든 관광지를 지역별로 그룹화하여 반환
 * @return { regions: { area01: { name, code, spots: [...] }, ... } }
 */
public Map<String, Object> getAllSpotsGroupedByRegion() {
    // 1. 모든 활성화된 Spot 조회
    List<SpotDto> spots = spotMapper.findAllSpots();

    // 2. 각 Spot에 추가 정보 조회 및 그룹화
    Map<String, Object> regionsMap = new LinkedHashMap<>();

    for (SpotDto spot : spots) {
        // 2-1. Region 정보 조회
        RegionDto region = regionService.getRegionById(spot.getRegionId());
        String areaKey = "area" + String.format("%02d", region.getAreaCode());

        // 2-2. Hashtag 목록 조회
        List<HashtagDto> hashtagDtos = hashtagService.getHashtagsBySpotId(spot.getId());
        List<String> hashtags = hashtagDtos.stream()
            .map(HashtagDto::getName)
            .collect(Collectors.toList());

        // 2-3. 대표 이미지 URL 조회
        List<SpotImageDto> images = spotImageService.getImagesBySpotId(spot.getId());
        String imageUrl = images.stream()
            .filter(img -> "Y".equals(img.getRepImgYn()))
            .findFirst()
            .map(SpotImageDto::getImageUrl)
            .orElse(null);

        // 2-4. Region별로 그룹화
        if (!regionsMap.containsKey(areaKey)) {
            Map<String, Object> regionData = new HashMap<>();
            regionData.put("name", region.getName());
            regionData.put("code", String.valueOf(region.getAreaCode()));
            regionData.put("spots", new ArrayList<>());
            regionsMap.put(areaKey, regionData);
        }

        // 2-5. Spot 데이터 구성
        Map<String, Object> spotData = new HashMap<>();
        spotData.put("id", spot.getId());
        spotData.put("title", spot.getTitle());
        spotData.put("description", spot.getDescription());
        spotData.put("hashtags", hashtags);
        spotData.put("imageUrl", imageUrl);
        spotData.put("linkUrl", spot.getLinkUrl());
        spotData.put("category", spot.getCategoryCode());
        spotData.put("isActive", spot.getIsActive());
        spotData.put("viewCount", spot.getViewCount());
        // ratingAvg, ratingCount는 Review 테이블에서 계산 필요

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> spotsList =
            (List<Map<String, Object>>) ((Map<String, Object>) regionsMap.get(areaKey)).get("spots");
        spotsList.add(spotData);
    }

    // 3. 응답 형식에 맞게 변환
    Map<String, Object> response = new HashMap<>();
    response.put("regions", regionsMap);

    return response;
}
```

**구현 팁**:

-   N+1 문제 방지를 위해 배치 조회 고려
-   캐싱 적용 고려 (Redis 등)
-   평점 정보는 `ReviewService`에서 계산

### 6.3 Mapper 쿼리 추가

-   **파일**: `src/main/resources/mapper/spotMapper.xml`
-   **상태**: ✅ 존재 (기본 쿼리만 있음)
-   **현재 쿼리**: `findAllSpots()`, `findSpotsByRegion()`, `findSpotById()`
-   **추가 필요**: 없음 (Service에서 다른 Service를 호출하여 조회)

**참고**:

-   `HashtagMapper`는 이미 `findHashtagsBySpotId()` 메서드가 있음
-   `SpotImageMapper`는 이미 `findImagesBySpotId()` 메서드가 있음
-   단, `hashtagMapper.xml`과 `regionMapper.xml`에 실제 쿼리 구현이 필요할 수 있음

### 6.4 DTO 구조

-   **파일**: `src/main/java/com/busan/orora/spot/dto/SpotDto.java`
-   **상태**: ✅ 존재
-   **현재 필드**: `id`, `regionId`, `title`, `description`, `linkUrl`, `categoryCode`, `isActive`, `viewCount`, `createdAt`, `updatedAt`
-   **추가 필요**: 없음 (Service에서 Map으로 변환하여 응답)

**대안**: 별도 Response DTO 생성 (선택사항)

```java
// SpotResponseDto.java (선택사항)
public class SpotResponseDto {
    private Long id;
    private String title;
    private String description;
    private List<String> hashtags;
    private String imageUrl;
    private String linkUrl;
    private String category;
    private Boolean isActive;
    private Integer viewCount;
    private Double ratingAvg;
    private Integer ratingCount;
    // getter, setter
}
```

### 6.5 관련 Service 확인

프로젝트에 이미 존재하는 Service들:

1. **RegionService** (`src/main/java/com/busan/orora/region/service/RegionService.java`)

    - `getAllRegions()`: 모든 지역 조회
    - `getRegionById(Long id)`: ID로 지역 조회
    - `getRegionByAreaCode(Integer areaCode)`: 지역 코드로 조회

2. **HashtagService** (`src/main/java/com/busan/orora/hashtag/service/HashtagService.java`)

    - `getAllHashtags()`: 모든 해시태그 조회
    - `getHashtagById(Long id)`: ID로 해시태그 조회
    - `getHashtagsBySpotId(Long spotId)`: 관광지 ID로 해시태그 목록 조회 ⭐

3. **SpotImageService** (`src/main/java/com/busan/orora/spot/service/SpotImageService.java`)

    - `getImagesBySpotId(Long spotId)`: 관광지 ID로 이미지 목록 조회 ⭐
    - `saveSpotImage()`: 이미지 저장
    - `saveSpotImages()`: 여러 이미지 저장

4. **ReviewService** (평점 계산용, 구현 필요할 수 있음)
    - `getAverageRating(Long spotId)`: 평균 평점 계산
    - `getRatingCount(Long spotId)`: 평점 개수 조회

---

## 7. 데이터베이스 스키마

### 7.1 필수 테이블

프로젝트에서 사용하는 주요 테이블:

-   **`regions`**: 지역 정보 (기장군, 금정구, 해운대구 등)
-   **`tourist_spots`**: 관광지 기본 정보
-   **`hashtags`**: 해시태그 정보
-   **`tourist_spot_hashtags`**: 관광지-해시태그 연결 테이블 (다대다 관계)
-   **`tourist_spot_images`**: 관광지 이미지 정보
-   **`reviews`**: 리뷰 정보 (평점 계산용, 선택사항)

### 7.2 데이터 관계 (ERD)

```
regions (1) ──< (N) tourist_spots
tourist_spots (N) ──< (N) hashtags (via tourist_spot_hashtags)
tourist_spots (1) ──< (N) tourist_spot_images
tourist_spots (1) ──< (N) reviews (선택사항)
```

**관계 설명**:

-   하나의 지역(`regions`)은 여러 관광지(`tourist_spots`)를 가질 수 있음
-   하나의 관광지는 여러 해시태그를 가질 수 있고, 하나의 해시태그는 여러 관광지에 연결될 수 있음 (다대다)
-   하나의 관광지는 여러 이미지를 가질 수 있음 (대표 이미지는 `rep_img_yn = 'Y'`로 구분)

### 7.3 테이블 구조 상세

#### regions 테이블

```sql
CREATE TABLE regions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    area_code INT NOT NULL UNIQUE,  -- 지역 코드 (26710, 26410 등)
    name VARCHAR(30) NOT NULL,       -- 지역 이름 (기장군, 금정구 등)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**주요 필드**:

-   `area_code`: 지역 코드 (API 응답의 `code` 필드에 사용)
-   `name`: 지역 이름 (API 응답의 `name` 필드에 사용)

#### tourist_spots 테이블

```sql
CREATE TABLE tourist_spots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    region_id INT NOT NULL,
    title VARCHAR(80) NOT NULL,
    description TEXT,
    link_url VARCHAR(500),
    category_code VARCHAR(50) DEFAULT 'CULTURE' COMMENT '관광지 카테고리 코드',
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
    INDEX idx_region_id (region_id),
    INDEX idx_category_code (category_code),
    INDEX idx_is_active (is_active)
);
```

**주요 필드**:

-   `category_code`: 카테고리 코드 (BEACH, CULTURE, FOOD, SHOPPING, CAFE 등)
-   `is_active`: 활성화 여부 (비활성화된 관광지는 조회에서 제외)
-   `view_count`: 조회수

**샘플 데이터 예시**:

-   `id: 1`, `title: "해운대 해수욕장"`, `region_id: 1`, `category_code: "BEACH"`, `view_count: 3500`

#### tourist_spot_images 테이블

```sql
CREATE TABLE tourist_spot_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    img_name VARCHAR(255) COMMENT '저장된 파일명',
    ori_img_name VARCHAR(255) COMMENT '원본 파일명',
    tourist_spot_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    rep_img_yn VARCHAR(1) DEFAULT 'N' COMMENT '대표 이미지 여부 (Y/N)',
    reg_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE,
    INDEX idx_tourist_spot_id (tourist_spot_id),
    INDEX idx_rep_img_yn (rep_img_yn)
);
```

**⚠️ 중요**:

-   `rep_img_yn = 'Y'`인 이미지를 대표 이미지로 사용
-   여러 이미지가 있는 경우 `rep_img_yn = 'Y'`인 첫 번째 이미지를 선택
-   대표 이미지가 없는 경우 `imageUrl`은 `null`로 설정
-   `image_url`은 웹에서 접근 가능한 경로여야 함 (예: `/images/spot1.jpg`)

**샘플 데이터 예시**:

-   `tourist_spot_id: 1`, `image_url: "../../images/haeundae-beach-1.jpg"`, `rep_img_yn: "Y"`

#### hashtags 테이블

```sql
CREATE TABLE hashtags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,  -- 해시태그 이름 (해수욕장, 일출명소 등)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### tourist_spot_hashtags 테이블

```sql
CREATE TABLE tourist_spot_hashtags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tourist_spot_id INT NOT NULL,
    hashtag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE,
    FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_spot_hashtag (tourist_spot_id, hashtag_id)
);
```

**샘플 데이터 예시**:

-   `tourist_spot_id: 1`, `hashtag_id: 1` (해운대 해수욕장 - 해수욕장)
-   `tourist_spot_id: 1`, `hashtag_id: 2` (해운대 해수욕장 - 일출명소)

### 7.4 샘플 데이터 파일 위치

-   **공통코드 스키마**: `src/main/resources/static/temp/common_code_schema.sql`
    -   공통코드 그룹 및 코드 테이블 생성 (카테고리, 사용자 역할 등)
-   **메인 스키마**: `src/main/resources/static/temp/new_data_schema.sql`
    -   관광지, 지역, 해시태그, 이미지 등 메인 테이블 생성
-   **샘플 데이터**: `src/main/resources/static/temp/sample_data.sql`
    -   테스트용 샘플 데이터 삽입

**⚠️ 실행 순서** (반드시 순서대로 실행):

```bash
# 1. 공통코드 테이블 생성
mysql -u root -p arata_busan < src/main/resources/static/temp/common_code_schema.sql

# 2. 메인 테이블 생성
mysql -u root -p arata_busan < src/main/resources/static/temp/new_data_schema.sql

# 3. 샘플 데이터 삽입
mysql -u root -p arata_busan < src/main/resources/static/temp/sample_data.sql
```

**데이터베이스 확인**:

```sql
-- 데이터 개수 확인
SELECT COUNT(*) FROM tourist_spots;        -- 6개
SELECT COUNT(*) FROM hashtags;              -- 6개
SELECT COUNT(*) FROM tourist_spot_hashtags; -- 5개
SELECT COUNT(*) FROM tourist_spot_images;   -- 5개
SELECT COUNT(*) FROM regions;              -- 16개
```

---

## 8. 프론트엔드 수정 필요 사항

### 8.1 theme.js 수정 (필수)

**파일**: `src/main/resources/static/js/theme.js`

#### 8.1.1 API 엔드포인트 변경

**현재 코드 (49번째 줄)**:

```javascript
// TODO: 백엔드 연결 시 수정 필요 - API 엔드포인트로 변경
// 예: const response = await fetch('/api/tourist-spots');
const response = await fetch('../../data/busanTouristSpots.json');
```

**수정 필요**:

```javascript
const response = await fetch('/api/tourist-spots');
```

#### 8.1.2 에러 처리 개선

**현재 코드 (45-94번째 줄)**:

```javascript
async loadData() {
    try {
        const response = await fetch('/api/tourist-spots');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // ... 데이터 처리
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        // 오류 발생 시 빈 배열로 초기화
        this.allData['aurora-carousel'] = [];
        this.allData['user-carousel'] = [];
    }
}
```

**개선 권장 사항**:

```javascript
async loadData() {
    try {
        const response = await fetch('/api/tourist-spots');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 데이터 구조 검증
        if (!data || !data.regions) {
            throw new Error('데이터 구조가 올바르지 않습니다. regions 속성이 없습니다.');
        }

        // ... 기존 데이터 처리 로직

    } catch (error) {
        console.error('데이터 로드 실패:', error);

        // 사용자에게 에러 메시지 표시 (선택사항)
        const grid = document.getElementById('aurora-carousel');
        if (grid) {
            grid.innerHTML = '<div class="no-data">데이터를 불러오는 중 오류가 발생했습니다.</div>';
        }

        // 빈 배열로 초기화
        this.allData['aurora-carousel'] = [];
        this.allData['user-carousel'] = [];
    }
}
```

#### 8.1.3 이미지 URL 처리

**현재 코드 (496번째 줄)**:

```javascript
imgElement.src = itemData.img || '';
```

**수정 필요** (API 응답의 `imageUrl` 필드 사용):

```javascript
// itemData.img → itemData.imageUrl로 변경
imgElement.src = itemData.imageUrl || '';
```

또는 데이터 변환 시:

```javascript
// loadData() 메서드에서
allSpots.push({
    ...spot,
    img: spot.imageUrl, // imageUrl을 img로 매핑
    region: region.name,
});
```

#### 8.1.4 해시태그 배열 처리

**현재 코드 (512-516번째 줄)**:

```javascript
const hashtagElement = itemFragment.querySelector('.hash-tag');
if (hashtagElement && itemData.hashtags) {
    hashtagElement.textContent = Array.isArray(itemData.hashtags)
        ? itemData.hashtags.join(' ')
        : itemData.hashtags;
}
```

**확인 사항**: API 응답의 `hashtags`가 배열인지 확인 (이미 올바르게 처리되어 있음)

### 8.2 상세 페이지 이동 경로 확인

**파일**: `src/main/resources/static/js/theme.js`

**현재 코드 (557번째 줄)**:

```javascript
navigateToDetail(itemData) {
    const encodedTitle = encodeURIComponent(itemData.title);
    window.location.href = `../detailed/detailed.html?title=${encodedTitle}`;
}
```

**확인 필요**: 실제 상세 페이지 경로와 일치하는지 확인

**가능한 경로**:

1. **Thymeleaf 템플릿 사용 시**:

    ```javascript
    window.location.href = `/pages/detailed/detailed.html?title=${encodedTitle}`;
    ```

2. **백엔드 라우팅 사용 시**:

    ```javascript
    window.location.href = `/detailed?title=${encodedTitle}`;
    ```

3. **ID 기반 라우팅 사용 시**:
    ```javascript
    window.location.href = `/detailed/${itemData.id}`;
    ```

**권장**: 프로젝트의 다른 페이지에서 상세 페이지로 이동하는 방식을 확인하고 동일하게 맞춤

### 8.3 추가 개선 사항 (선택사항)

#### 8.3.1 로딩 상태 표시

```javascript
async loadData() {
    // 로딩 시작
    this.showLoading();

    try {
        const response = await fetch('/api/tourist-spots');
        // ... 데이터 처리
    } finally {
        // 로딩 종료
        this.hideLoading();
    }
}
```

#### 8.3.2 빈 데이터 처리

```javascript
if (!data || !data.regions || Object.keys(data.regions).length === 0) {
    console.warn('표시할 데이터가 없습니다.');
    // 빈 상태 UI 표시
    return;
}
```

#### 8.3.3 이미지 로드 실패 처리

**현재 코드 (498-501번째 줄)**:

```javascript
imgElement.onerror = () => {
    imgElement.src = '../../images/common.jpg';
    imgElement.onerror = null;
};
```

**확인 사항**: fallback 이미지 경로가 올바른지 확인

---

## 9. 구현 체크리스트

### ✅ 프론트엔드 (파일 존재 확인)

-   [x] HTML 파일 존재 (`theme.html`)
-   [x] CSS 파일 존재 (`theme.css`, `list-component.css`, `loading-animation.css`)
-   [x] JavaScript 파일 존재 (`theme.js`, `list-loader.js`)
-   [x] 템플릿 파일 존재 (`list-item.html`)
-   [x] 번역 파일 존재 (`translations-en.json`, `translations-jp.json`)

### ⚠️ 프론트엔드 (수정 필요)

-   [ ] `theme.js`의 49번째 줄: API 엔드포인트 변경 (`/api/tourist-spots`)
-   [ ] `theme.js`의 496번째 줄: `itemData.img` → `itemData.imageUrl` 확인
-   [ ] `theme.js`의 557번째 줄: 상세 페이지 이동 경로 확인
-   [ ] 에러 처리 개선 (선택사항)
-   [ ] 로딩 상태 표시 추가 (선택사항)

### ⚠️ 백엔드 (구현 필요)

-   [ ] `SpotController.java`: `/api/tourist-spots` 엔드포인트 구현
-   [ ] `SpotService.java`: `getAllSpotsGroupedByRegion()` 메서드 구현
-   [ ] `SpotService.java`: 의존성 주입 추가 (RegionService, HashtagService, SpotImageService)
-   [ ] 평점 계산 로직 추가 (ReviewService 연동, 선택사항)
-   [ ] 에러 처리 및 예외 처리 추가

### ⚠️ Mapper (쿼리 확인 필요)

-   [ ] `hashtagMapper.xml`: `findHashtagsBySpotId` 쿼리 구현 확인
-   [ ] `regionMapper.xml`: `findRegionById` 쿼리 구현 확인
-   [ ] `spotImageMapper.xml`: `findImagesBySpotId` 쿼리 구현 확인 (이미 있음)

### ⚠️ 데이터베이스 (설정 필요)

-   [ ] 데이터베이스 생성 (`arata_busan`)
-   [ ] 공통코드 스키마 실행 (`common_code_schema.sql`)
-   [ ] 메인 스키마 실행 (`new_data_schema.sql`)
-   [ ] 샘플 데이터 삽입 (`sample_data.sql`)
-   [ ] 데이터 확인:
    -   [ ] `SELECT COUNT(*) FROM tourist_spots;` → 6개
    -   [ ] `SELECT COUNT(*) FROM hashtags;` → 6개
    -   [ ] `SELECT COUNT(*) FROM tourist_spot_hashtags;` → 5개
    -   [ ] `SELECT COUNT(*) FROM tourist_spot_images;` → 5개
    -   [ ] `SELECT COUNT(*) FROM regions;` → 16개

### ✅ 테스트 (기능 확인)

-   [ ] API 엔드포인트 테스트 (`GET /api/tourist-spots`)
-   [ ] API 응답 형식 확인 (regions 구조, spot 필드)
-   [ ] 프론트엔드 데이터 로드 확인
-   [ ] 테마별 필터링 동작 확인
-   [ ] 더보기 버튼 동작 확인
-   [ ] 상세 페이지 이동 확인
-   [ ] 이미지 표시 확인
-   [ ] 해시태그 표시 확인
-   [ ] 반응형 디자인 확인
-   [ ] 다국어 번역 확인

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

5. **최적화** (선택사항)
    - 이미지 lazy loading 적용
    - 무한 스크롤 고려
    - 캐싱 전략 고려 (Redis 등)
    - API 응답 최적화 (N+1 문제 해결)

---

## 14. 요약 및 핵심 포인트

### 📌 핵심 구현 사항

1. **백엔드 API 구현** (최우선)

    - `SpotController`에 `GET /api/tourist-spots` 엔드포인트 추가
    - `SpotService.getAllSpotsGroupedByRegion()` 메서드 구현
    - 지역별 그룹화, 해시태그 배열, 이미지 URL 포함

2. **프론트엔드 수정** (필수)

    - `theme.js` 49번째 줄: API 엔드포인트 변경
    - `theme.js` 496번째 줄: `imageUrl` 필드 확인
    - 상세 페이지 경로 확인

3. **데이터베이스 설정** (필수)
    - 스키마 실행 순서: common_code → new_data → sample_data
    - 샘플 데이터 확인 (6개 관광지, 6개 해시태그, 5개 이미지)

### 🔑 중요 데이터 구조

**API 응답 형식**:

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
          "hashtags": ["해수욕장", "일출명소"],  // 배열 필수
          "imageUrl": "/images/spot1.jpg",      // null 가능
          ...
        }
      ]
    }
  }
}
```

### ⚠️ 주의사항

1. **해시태그**: 반드시 배열 형태 (`[]` 또는 `["태그1"]`), `null` 금지
2. **이미지 URL**: `null` 가능, 대표 이미지는 `rep_img_yn = 'Y'`인 것만
3. **지역 코드**: `area_code`를 문자열로 변환하여 `code` 필드에 사용
4. **평점**: 리뷰가 없으면 `ratingAvg: 0.0`, `ratingCount: 0`

### 📚 관련 파일 위치

-   **프론트엔드**: `src/main/resources/templates/pages/search-place/theme.html`
-   **백엔드 Controller**: `src/main/java/com/busan/orora/spot/controller/SpotController.java`
-   **백엔드 Service**: `src/main/java/com/busan/orora/spot/service/SpotService.java`
-   **데이터베이스 스키마**: `src/main/resources/static/temp/new_data_schema.sql`
-   **샘플 데이터**: `src/main/resources/static/temp/sample_data.sql`

### 🚀 빠른 시작 명령어

```bash
# 1. 데이터베이스 설정
mysql -u root -p arata_busan < src/main/resources/static/temp/common_code_schema.sql
mysql -u root -p arata_busan < src/main/resources/static/temp/new_data_schema.sql
mysql -u root -p arata_busan < src/main/resources/static/temp/sample_data.sql

# 2. 애플리케이션 실행
./gradlew bootRun

# 3. 브라우저에서 확인
# http://localhost:8080/pages/search-place/theme
```

---

**문서 작성일**: 2024년  
**프로젝트**: ORORA (부산 관광 가이드)  
**기술 스택**: Spring Boot, Thymeleaf, MyBatis, MySQL, Vanilla JavaScript
