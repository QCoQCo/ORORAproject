# 테마 검색 페이지 (theme.html) 구현 가이드

## 📋 프로젝트 개요

테마별로 관광지를 검색하고 필터링하는 페이지입니다. 사용자는 5가지 테마(K-POP 여행, 문화 여행, 자연 여행, 음식 여행, 쇼핑 여행) 중 하나를 선택하여 해당 테마에 맞는 관광지를 필터링하여 볼 수 있습니다.

### 기술 스택

-   **백엔드**: Spring Boot 2.x, MyBatis, MySQL
-   **프론트엔드**: Thymeleaf 템플릿, Vanilla JavaScript, CSS3
-   **데이터베이스**: MySQL (arata_busan)

---

## 1. 데이터베이스 스키마 구조

### 1.1 주요 테이블

#### `regions` 테이블

```sql
CREATE TABLE regions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    area_code INT NOT NULL UNIQUE,  -- 지역 코드 (26710, 26410 등)
    name VARCHAR(30) NOT NULL,       -- 지역 이름 (기장군, 금정구 등)
    sigungu_code INT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**주요 필드**:

-   `area_code`: 지역 코드 (API 응답의 `code` 필드에 사용)
-   `name`: 지역 이름 (API 응답의 `name` 필드에 사용)

#### `tourist_spots` 테이블

```sql
CREATE TABLE tourist_spots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    region_id INT NOT NULL,
    title VARCHAR(80) NOT NULL,
    description TEXT,
    link_url VARCHAR(500),
    category_code VARCHAR(50) DEFAULT 'CULTURE',  -- BEACH, MOUNTAIN, CULTURE, FOOD, SHOPPING, CAFE 등
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE
);
```

**주요 필드**:

-   `category_code`: 카테고리 코드 (BEACH, CULTURE, FOOD, SHOPPING, CAFE, MOUNTAIN, ETC 등)
-   `is_active`: 활성화 여부 (비활성화된 관광지는 조회에서 제외)
-   `view_count`: 조회수

#### `tourist_spot_images` 테이블

```sql
CREATE TABLE tourist_spot_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    img_name VARCHAR(255),
    ori_img_name VARCHAR(255),
    tourist_spot_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    rep_img_yn VARCHAR(1) DEFAULT 'N',  -- 대표 이미지 여부 (Y/N)
    reg_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE
);
```

**⚠️ 중요**:

-   `rep_img_yn = 'Y'`인 이미지를 대표 이미지로 사용
-   여러 이미지가 있는 경우 `rep_img_yn = 'Y'`인 첫 번째 이미지를 선택
-   대표 이미지가 없는 경우 `imageUrl`은 `null`로 설정

#### `hashtags` 테이블

```sql
CREATE TABLE hashtags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,  -- 해시태그 이름 (해수욕장, 일출명소 등)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `tourist_spot_hashtags` 테이블

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

#### `reviews` 테이블 (평점 계산용)

```sql
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tourist_spot_id INT NOT NULL,
    title VARCHAR(80) NOT NULL,
    content TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tourist_spot_id) REFERENCES tourist_spots(id) ON DELETE CASCADE
);
```

### 1.2 데이터 관계 (ERD)

```
regions (1) ──< (N) tourist_spots
tourist_spots (N) ──< (N) hashtags (via tourist_spot_hashtags)
tourist_spots (1) ──< (N) tourist_spot_images
tourist_spots (1) ──< (N) reviews
```

---

## 2. 데이터 파일 구조

### 2.1 데이터 파일 위치 및 실행 순서

**⚠️ 반드시 순서대로 실행**:

```bash
# 1. 공통코드 테이블 생성
mysql -u root -p arata_busan < src/main/resources/static/temp/common_code_schema.sql

# 2. 메인 스키마 생성
mysql -u root -p arata_busan < src/main/resources/static/temp/new_data_schema.sql

# 3. Phase 3 데이터 삽입 (순서 중요!)
mysql -u root -p arata_busan < src/main/resources/static/temp/phase3_tourist_spots.sql
mysql -u root -p arata_busan < src/main/resources/static/temp/phase3_hashtags.sql
mysql -u root -p arata_busan < src/main/resources/static/temp/phase3_tourist_spot_images.sql
mysql -u root -p arata_busan < src/main/resources/static/temp/phase3_tourist_spot_hashtags.sql
mysql -u root -p arata_busan < src/main/resources/static/temp/phase3_reviews.sql
```

### 2.2 데이터 파일 상세

#### `phase3_tourist_spots.sql`

-   **내용**: 관광지 기본 정보 (80개 관광지)
-   **주요 데이터**:
    -   `id`: 7~86 (기존 1~6 뒤에 추가)
    -   `region_id`: 1~16 (16개 지역)
    -   `title`: 관광지 제목
    -   `description`: 관광지 설명
    -   `category_code`: BEACH, CULTURE, FOOD, SHOPPING, CAFE, MOUNTAIN, ETC
    -   `is_active`: TRUE
    -   `view_count`: 0 (초기값)

#### `phase3_hashtags.sql`

-   **내용**: 해시태그 목록 (342개 해시태그)
-   **주요 해시태그 예시**:
    -   자연 관련: 해수욕장, 일출명소, 바다, 산, 공원, 절경
    -   문화 관련: 문화, 역사, 전통, 예술, 사찰, 박물관
    -   음식 관련: 맛집, 시장, 해산물, 카페, 디저트
    -   쇼핑 관련: 쇼핑, 백화점, 소품샵, 편집샵
    -   K-POP 관련: 핫플레이스, 포토스팟, 데이트, 인스타그램

#### `phase3_tourist_spot_images.sql`

-   **내용**: 관광지 이미지 정보 (80개 이미지)
-   **주요 데이터**:
    -   `tourist_spot_id`: 7~86
    -   `image_url`: `/images/파일명.jpg` 형식
    -   `rep_img_yn`: 'Y' (모두 대표 이미지)

#### `phase3_tourist_spot_hashtags.sql`

-   **내용**: 관광지-해시태그 연결 정보
-   **주요 데이터**:
    -   `tourist_spot_id`: 7~86
    -   `hashtag_id`: 해시태그 ID (서브쿼리로 조회)
    -   각 관광지마다 5~10개의 해시태그 연결

#### `phase3_reviews.sql`

-   **내용**: 리뷰 정보 (6개 리뷰)
-   **주요 데이터**:
    -   `tourist_spot_id`: 7, 9, 11, 51
    -   `rating`: 3~5
    -   `is_approved`: TRUE

---

## 3. 프론트엔드 파일 구조

### 3.1 HTML 파일

#### `src/main/resources/templates/pages/search-place/theme.html`

-   **역할**: 테마 페이지 메인 템플릿
-   **주요 구조**:

    ```html
    <div class="theme-section">
        <!-- 오로라 추천 테마 섹션 -->
        <div id="aurora-carousel" class="theme-grid"></div>
    </div>

    <div class="theme-section">
        <!-- 유저 추천 테마 섹션 -->
        <select id="theme">
            <option value="kpop">K-POP 여행</option>
            <option value="culture">문화 여행</option>
            <option value="nature">자연 여행</option>
            <option value="food">음식 여행</option>
            <option value="shopping">쇼핑 여행</option>
        </select>
        <div id="user-carousel" class="theme-grid"></div>
    </div>

    <!-- 리스트 아이템 템플릿 -->
    <div th:replace="~{components/list-item.html :: list-item-template}"></div>
    ```

-   **사용되는 Thymeleaf 속성**:
    -   `layout:decorate="~{layouts/layout}"`: 공통 레이아웃 적용
    -   `th:replace="~{components/list-item.html :: list-item-template}"`: 리스트 아이템 템플릿 포함
    -   `data-translate`: 다국어 번역 키

#### `src/main/resources/templates/components/list-item.html`

-   **역할**: 관광지 아이템 템플릿 (Thymeleaf fragment)
-   **구조**:
    ```html
    <template id="list-item">
        <li class="item">
            <div class="item-photo">
                <img src="" alt="" />
                <button class="likeBtn"></button>
            </div>
            <div class="item-info">
                <p class="item-title"></p>
                <p class="item-description"></p>
                <p class="hash-tag"></p>
            </div>
        </li>
    </template>
    ```
-   **JavaScript에서 사용**: `document.getElementById('list-item')`로 접근하여 클론 생성

### 3.2 JavaScript 파일

#### `src/main/resources/static/js/theme.js`

-   **주요 클래스**: `ThemeCarousel`
-   **주요 메서드**:

1. **`init()`**: 초기화 및 데이터 로드

    ```javascript
    async init() {
        await this.loadData();
        await this.renderCarousel('aurora-carousel');
        await this.renderCarousel('user-carousel', 'kpop');
        this.setupEventListeners();
    }
    ```

2. **`loadData()`**: API에서 관광지 데이터 로드

    ```javascript
    async loadData() {
        const response = await fetch('/api/tourist-spots');
        const data = await response.json();

        // regions 객체를 배열로 변환
        const allSpots = [];
        Object.values(data.regions).forEach((region) => {
            region.spots.forEach((spot) => {
                allSpots.push({ ...spot, region: region.name });
            });
        });

        this.allData['aurora-carousel'] = this.getAuroraRecommendedSpots(allSpots);
        this.allData['user-carousel'] = allSpots;
    }
    ```

3. **`getAuroraRecommendedSpots()`**: 오로라 추천 테마 필터링

    - 해시태그에 "부산대표명소", "포토스팟", "랜드마크" 등 포함된 관광지 선별
    - 최대 20개까지 추천

4. **`filterByTheme(spots, theme)`**: 테마별 필터링

    - `kpop`: 영화, 문화, 핫플레이스, 젊은이, 트렌디, 데이트, 포토스팟 등
    - `culture`: 문화, 역사, 사찰, 전통, 예술, 박물관 등
    - `nature`: 자연, 산, 공원, 바다, 해수욕장, 등산, 일출, 일몰 등
    - `food`: 시장, 먹거리, 맛집, 해산물, 카페, 디저트 등
    - `shopping`: 쇼핑, 백화점, 상가, 소품샵, 편집샵 등

5. **`renderCarousel(carouselId, theme)`**: 캐러셀/그리드 렌더링

    - 초기: 캐러셀 모드 (가로 스크롤)
    - 더보기 클릭 후: 그리드 모드 (격자 레이아웃)

6. **`createListItem(itemData)`**: 리스트 아이템 생성

    ```javascript
    createListItem(itemData) {
        const template = document.getElementById('list-item');
        const itemFragment = document.importNode(template.content, true);

        // 이미지 설정
        imgElement.src = itemData.imageUrl || '';

        // 텍스트 설정
        titleElement.textContent = itemData.title || '';
        descriptionElement.textContent = itemData.description || '';
        hashtagElement.textContent = itemData.hashtags.join(' ');

        // 이벤트 리스너 설정
        linkElement.addEventListener('click', () => {
            this.navigateToDetail(itemData);
        });

        return itemFragment;
    }
    ```

7. **`navigateToDetail(itemData)`**: 상세 페이지 이동

    ```javascript
    navigateToDetail(itemData) {
        if (itemData.id) {
            window.location.href = `../detailed/detailed?id=${itemData.id}`;
        } else {
            const encodedTitle = encodeURIComponent(itemData.title);
            window.location.href = `../detailed/detailed?title=${encodedTitle}`;
        }
    }
    ```

8. **`loadMore(carouselId)`**: 더보기 기능
    - 페이지네이션 (10개씩 추가)
    - 그리드 모드로 전환

-   **데이터 구조 요구사항**:
    -   API 응답: `{ regions: { area01: { name, code, spots: [...] }, ... } }`
    -   각 `spot` 객체:
        -   `id`: 관광지 ID (Long)
        -   `title`: 제목 (String)
        -   `description`: 설명 (String)
        -   `hashtags`: 해시태그 배열 (String[], 필수, 빈 배열 가능)
        -   `imageUrl`: 대표 이미지 URL (String, null 가능)
        -   `linkUrl`: 링크 URL (String, null 가능)
        -   `category`: 카테고리 코드 (String)
        -   `isActive`: 활성화 여부 (Boolean)
        -   `viewCount`: 조회수 (Integer)

### 3.3 CSS 파일

#### `src/main/resources/static/css/theme.css`

-   **주요 스타일**:
    -   `.theme-section`: 테마 섹션 컨테이너
    -   `.theme-grid`: 캐러셀/그리드 레이아웃
    -   `.theme-grid.grid-mode`: 그리드 모드 (더보기 클릭 후)
    -   `.item`: 관광지 카드 스타일
    -   `.more-btn`: 더보기 버튼
    -   반응형 디자인 (모바일, 태블릿, 데스크톱)

#### `src/main/resources/static/css/list-component.css`

-   **주요 스타일**:
    -   `.item-photo`: 이미지 영역
    -   `.item-title`: 제목
    -   `.item-description`: 설명
    -   `.hash-tag`: 해시태그
    -   `.likeBtn`: 좋아요 버튼

---

## 4. 백엔드 API 구조

### 4.1 필수 API: 관광지 목록 조회 (지역별 그룹화)

**엔드포인트**: `GET /api/tourist-spots`

**설명**: 모든 활성화된 관광지 정보를 지역별로 그룹화하여 반환합니다.

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
                    "id": 7,
                    "title": "해동 용궁사",
                    "description": "바다 위에 세워진 아름다운 사찰입니다.",
                    "hashtags": ["사찰", "일출명소", "바다"],
                    "imageUrl": "/images/2025(4).jpg",
                    "linkUrl": null,
                    "category": "CULTURE",
                    "isActive": true,
                    "viewCount": 0,
                    "ratingAvg": 4.0,
                    "ratingCount": 2
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
    -   `name`: 지역 이름 (String, 필수)
    -   `code`: 지역 코드 (String, regions 테이블의 area_code)
    -   `spots`: 관광지 배열 (Array, 필수, 빈 배열 가능)
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

1. **해시태그 배열**: 반드시 배열 형태 (`[]` 또는 `["태그1", "태그2"]`), `null` 금지
2. **이미지 URL**: `null` 가능, 대표 이미지는 `rep_img_yn = 'Y'`인 것만
3. **지역 코드 매핑**: `area_code`를 문자열로 변환하여 `code` 필드에 사용
4. **평점**: 리뷰가 없으면 `ratingAvg: 0.0`, `ratingCount: 0`

### 4.2 구현 필요 사항

#### Controller 구현

**파일**: `src/main/java/com/busan/orora/spot/controller/SpotController.java`

**현재 상태**: `getTouristSpotDetail()` 메서드만 존재, `getAllSpotsByRegion()` 메서드 필요

**추가 필요**:

```java
@GetMapping("/tourist-spots")
public ResponseEntity<Map<String, Object>> getAllSpotsByRegion() {
    try {
        Map<String, Object> result = spotService.getAllSpotsGroupedByRegion();
        return ResponseEntity.ok(result);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
```

#### Service 구현

**파일**: `src/main/java/com/busan/orora/spot/service/SpotService.java`

**현재 상태**: 기본 메서드만 존재 (`getAllSpots()`, `getSpotsByRegion()`, `getSpotById()`)

**추가 필요**:

```java
@Autowired
private RegionService regionService;

@Autowired
private HashtagService hashtagService;

@Autowired
private SpotImageService spotImageService;

@Autowired
private ReviewService reviewService;  // 평점 계산용

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

        // 2-4. 평점 정보 조회
        Double ratingAvg = reviewService.getAverageRating(spot.getId());
        Integer ratingCount = reviewService.getRatingCount(spot.getId());

        // 2-5. Region별로 그룹화
        if (!regionsMap.containsKey(areaKey)) {
            Map<String, Object> regionData = new HashMap<>();
            regionData.put("name", region.getName());
            regionData.put("code", String.valueOf(region.getAreaCode()));
            regionData.put("spots", new ArrayList<>());
            regionsMap.put(areaKey, regionData);
        }

        // 2-6. Spot 데이터 구성
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
        spotData.put("ratingAvg", ratingAvg != null ? ratingAvg : 0.0);
        spotData.put("ratingCount", ratingCount != null ? ratingCount : 0);

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

#### Mapper 쿼리

**파일**: `src/main/resources/mapper/spotMapper.xml`

**현재 상태**: `findAllSpots()` 쿼리 존재 확인 필요

**필요 쿼리**:

```xml
<select id="findAllSpots" resultMap="SpotResultMap">
    SELECT id, region_id, title, description, link_url, category_code,
           is_active, view_count, created_at, updated_at
    FROM tourist_spots
    WHERE is_active = TRUE
    ORDER BY created_at DESC
</select>
```

---

## 5. 데이터 흐름

### 5.1 전체 흐름

```
1. 사용자가 theme.html 페이지 접속
   ↓
2. theme.js의 ThemeCarousel.init() 실행
   ↓
3. loadData() 메서드가 GET /api/tourist-spots 호출
   ↓
4. SpotController.getAllSpotsByRegion() 실행
   ↓
5. SpotService.getAllSpotsGroupedByRegion() 실행
   - SpotMapper.findAllSpots()로 모든 관광지 조회
   - 각 관광지마다:
     * RegionService.getRegionById()로 지역 정보 조회
     * HashtagService.getHashtagsBySpotId()로 해시태그 조회
     * SpotImageService.getImagesBySpotId()로 이미지 조회
     * ReviewService로 평점 계산
   - 지역별로 그룹화하여 Map 생성
   ↓
6. JSON 응답 반환
   ↓
7. theme.js에서 데이터 처리
   - regions 객체를 배열로 변환
   - 오로라 추천 테마 필터링
   - 유저 추천 테마 데이터 준비
   ↓
8. renderCarousel()로 화면 렌더링
   - list-item 템플릿을 사용하여 아이템 생성
   - 이벤트 리스너 설정
```

### 5.2 테마 필터링 흐름

```
1. 사용자가 테마 선택 (예: "자연 여행")
   ↓
2. theme.js의 filterByTheme() 실행
   - 해시태그 배열에서 키워드 매칭
   - 제목에서 키워드 매칭
   ↓
3. sortByThemePriority()로 우선순위 정렬
   ↓
4. renderCarousel()로 필터링된 데이터 렌더링
```

---

## 6. 파일 사용 방식

### 6.1 프론트엔드 파일 연결

#### HTML에서 CSS/JS 로드

```html
<!-- theme.html -->
<link rel="stylesheet" th:href="@{/css/theme.css}" />
<link rel="stylesheet" th:href="@{/css/list-component.css}" />
<script th:src="@{/js/theme.js}"></script>
<script th:src="@{/js/list-loader.js}"></script>
```

#### 템플릿 Fragment 사용

```html
<!-- theme.html -->
<div th:replace="~{components/list-item.html :: list-item-template}"></div>
```

#### JavaScript에서 템플릿 사용

```javascript
// theme.js
const template = document.getElementById('list-item');
const itemFragment = document.importNode(template.content, true);
```

### 6.2 백엔드 파일 연결

#### Controller → Service → Mapper

```java
// SpotController.java
@Autowired
private SpotService spotService;

// SpotService.java
@Autowired
private SpotMapper spotMapper;
@Autowired
private RegionService regionService;
@Autowired
private HashtagService hashtagService;
@Autowired
private SpotImageService spotImageService;
```

---

## 7. 구현 체크리스트

### ✅ 프론트엔드 (파일 존재 확인)

-   [x] HTML 파일 존재 (`theme.html`)
-   [x] CSS 파일 존재 (`theme.css`, `list-component.css`)
-   [x] JavaScript 파일 존재 (`theme.js`)
-   [x] 템플릿 파일 존재 (`list-item.html`)

### ⚠️ 프론트엔드 (수정 필요)

-   [ ] `theme.js`의 49번째 줄: API 엔드포인트 변경 (`/api/tourist-spots`)
-   [ ] `theme.js`의 496번째 줄: `itemData.img` → `itemData.imageUrl` 확인
-   [ ] `theme.js`의 557번째 줄: 상세 페이지 이동 경로 확인

### ⚠️ 백엔드 (구현 필요)

-   [ ] `SpotController.java`: `/api/tourist-spots` 엔드포인트 구현
-   [ ] `SpotService.java`: `getAllSpotsGroupedByRegion()` 메서드 구현
-   [ ] `SpotService.java`: 의존성 주입 추가 (RegionService, HashtagService, SpotImageService, ReviewService)
-   [ ] `ReviewService.java`: 평점 계산 메서드 구현 (`getAverageRating()`, `getRatingCount()`)
-   [ ] `spotMapper.xml`: `findAllSpots()` 쿼리 확인/구현

### ⚠️ 데이터베이스 (설정 필요)

-   [ ] 데이터베이스 생성 (`arata_busan`)
-   [ ] 공통코드 스키마 실행 (`common_code_schema.sql`)
-   [ ] 메인 스키마 실행 (`new_data_schema.sql`)
-   [ ] Phase 3 데이터 삽입 (순서대로 실행)
-   [ ] 데이터 확인:
    -   [ ] `SELECT COUNT(*) FROM tourist_spots;` → 86개
    -   [ ] `SELECT COUNT(*) FROM hashtags;` → 342개
    -   [ ] `SELECT COUNT(*) FROM tourist_spot_hashtags;` → 800개 이상
    -   [ ] `SELECT COUNT(*) FROM tourist_spot_images;` → 80개
    -   [ ] `SELECT COUNT(*) FROM regions;` → 16개

---

## 8. 테스트 시나리오

### 8.1 기본 기능 테스트

1. 페이지 로드 시 오로라 추천 테마 표시 확인
2. 유저 추천 테마 드롭다운 동작 확인
3. 테마 선택 시 필터링 동작 확인
4. 더보기 버튼 클릭 시 추가 항목 표시 확인

### 8.2 데이터 테스트

1. 빈 데이터 처리 확인
2. 이미지 로드 실패 시 대체 이미지 표시 확인
3. 해시태그 표시 확인
4. 상세 페이지 이동 확인

### 8.3 테마별 필터링 테스트

-   **자연 여행**: 해수욕장, 일출명소, 산, 공원 등
-   **음식 여행**: 시장, 맛집, 해산물, 카페 등
-   **쇼핑 여행**: 쇼핑, 백화점, 소품샵 등
-   **문화 여행**: 문화, 역사, 사찰, 박물관 등
-   **K-POP 여행**: 핫플레이스, 포토스팟, 데이트 등

---

## 9. 문제 해결 가이드

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

---

## 10. 역할 분담 (A, B)

### 👤 역할 A (백엔드 담당)

#### 작업 내용

1. **SpotController 구현**

    - `GET /api/tourist-spots` 엔드포인트 추가
    - 에러 처리 구현

2. **SpotService 구현**

    - `getAllSpotsGroupedByRegion()` 메서드 구현
    - 의존성 주입 추가 (RegionService, HashtagService, SpotImageService, ReviewService)
    - 지역별 그룹화 로직 구현
    - 해시태그 배열 변환
    - 대표 이미지 URL 추출
    - 평점 계산 (ReviewService 연동)

3. **ReviewService 구현** (필요 시)

    - `getAverageRating(Long spotId)`: 평균 평점 계산
    - `getRatingCount(Long spotId)`: 평점 개수 조회

4. **Mapper 쿼리 확인/구현**

    - `spotMapper.xml`의 `findAllSpots()` 쿼리 확인
    - 필요 시 쿼리 수정

5. **데이터베이스 설정**

    - 스키마 실행 순서 확인
    - Phase 3 데이터 삽입
    - 데이터 검증

6. **API 테스트**
    - Postman 또는 브라우저에서 API 호출 테스트
    - 응답 형식 검증

#### 파일 목록

-   `src/main/java/com/busan/orora/spot/controller/SpotController.java`
-   `src/main/java/com/busan/orora/spot/service/SpotService.java`
-   `src/main/java/com/busan/orora/review/service/ReviewService.java` (필요 시)
-   `src/main/resources/mapper/spotMapper.xml`

---

### 👤 역할 B (프론트엔드 담당)

#### 작업 내용

1. **theme.js 수정**

    - API 엔드포인트 변경 (`/api/tourist-spots`)
    - 데이터 구조 확인 및 수정
    - `imageUrl` 필드 사용 확인
    - 상세 페이지 이동 경로 확인

2. **데이터 처리 로직 확인**

    - `loadData()` 메서드의 데이터 변환 로직 확인
    - `filterByTheme()` 메서드의 필터링 로직 확인
    - `createListItem()` 메서드의 템플릿 사용 확인

3. **UI/UX 개선** (선택사항)

    - 로딩 상태 표시 추가
    - 에러 처리 개선
    - 빈 데이터 처리 개선

4. **테스트 및 디버깅**

    - 브라우저에서 페이지 테스트
    - 개발자 도구로 API 호출 확인
    - 데이터 표시 확인
    - 테마 필터링 동작 확인

5. **반응형 디자인 확인**
    - 모바일 화면에서 레이아웃 확인
    - 태블릿 화면에서 레이아웃 확인
    - 데스크톱 화면에서 레이아웃 확인

#### 파일 목록

-   `src/main/resources/static/js/theme.js`
-   `src/main/resources/templates/pages/search-place/theme.html`
-   `src/main/resources/static/css/theme.css` (필요 시)

---

### 🤝 공동 작업

1. **API 응답 형식 협의**

    - 백엔드와 프론트엔드 간 데이터 구조 확인
    - 필수 필드 및 선택 필드 정의

2. **통합 테스트**

    - 전체 플로우 테스트
    - 에러 케이스 테스트

3. **문서 업데이트**
    - 구현 완료 후 문서 업데이트
    - 추가된 기능 문서화

---

## 11. 참고 파일

### 관련 Instruction 파일

-   `instruction/01_tag_page.md`: 태그 검색 페이지 가이드
-   `instruction/05_place_page.md`: 지역별 검색 페이지 가이드

### 관련 API 문서

-   `src/main/resources/static/temp/BACKEND_API_ENDPOINTS.md`: 백엔드 API 엔드포인트 문서

### 데이터 스키마

-   `src/main/resources/static/temp/new_data_schema.sql`: 데이터베이스 스키마
-   `src/main/resources/static/temp/common_code_schema.sql`: 공통코드 스키마

### 데이터 파일

-   `src/main/resources/static/temp/phase3_tourist_spots.sql`: 관광지 데이터
-   `src/main/resources/static/temp/phase3_hashtags.sql`: 해시태그 데이터
-   `src/main/resources/static/temp/phase3_tourist_spot_images.sql`: 이미지 데이터
-   `src/main/resources/static/temp/phase3_tourist_spot_hashtags.sql`: 관광지-해시태그 연결 데이터
-   `src/main/resources/static/temp/phase3_reviews.sql`: 리뷰 데이터

---

**문서 작성일**: 2025년  
**프로젝트**: ORORA (부산 관광 가이드)  
**기술 스택**: Spring Boot, Thymeleaf, MyBatis, MySQL, Vanilla JavaScript
