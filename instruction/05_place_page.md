# 지역별 검색 페이지 백엔드 작업 가이드

## 페이지 개요
부산 지역 지도를 클릭하여 해당 지역의 관광지를 조회하는 페이지입니다.

**프론트엔드 파일 위치**:
- HTML: `src/main/resources/templates/pages/search-place/place.html`
- JavaScript: `src/main/resources/static/js/searchBy/place.js`
- CSS: `src/main/resources/static/css/searchBy/place.css`

## 필요한 API 엔드포인트

### 1. 지역별 관광지 조회
- **엔드포인트**: `GET /api/tourist-spots/by-region`
- **설명**: 선택된 지역들의 관광지 목록 조회
- **쿼리 파라미터**:
  - `regionIds`: 지역 ID 목록 (쉼표로 구분, 예: `1,2,3`)
  - `areaCodes`: 지역 코드 목록 (쉼표로 구분, 예: `26710,26440`)
- **응답 형식**:
```json
{
  "regions": [
    {
      "id": 1,
      "name": "기장군",
      "areaCode": 26710,
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
  ]
}
```

### 2. 전체 관광지 목록 조회 (지역별 그룹화)
- **엔드포인트**: `GET /api/tourist-spots`
- **설명**: 모든 관광지를 지역별로 그룹화하여 반환 (태그 페이지와 동일)
- **응답 형식**: 태그 페이지와 동일

### 3. 지역 목록 조회
- **엔드포인트**: `GET /api/regions`
- **설명**: 모든 지역 목록 조회
- **응답 형식**:
```json
{
  "regions": [
    {
      "id": 1,
      "name": "기장군",
      "areaCode": 26710
    },
    {
      "id": 2,
      "name": "금정구",
      "areaCode": 26440
    }
  ]
}
```

## 필요한 파일 구조

### Controller
```
com.busan.orora.controller/
├── TouristSpotController.java    # 관광지 조회 API (지역별 필터링 추가)
└── RegionController.java          # 지역 조회 API
```

### Service
```
com.busan.orora.service/
├── TouristSpotService.java      # 관광지 비즈니스 로직
└── RegionService.java            # 지역 비즈니스 로직
```

### Repository
```
com.busan.orora.repository/
├── TouristSpotRepository.java    # 관광지 데이터 접근
└── RegionRepository.java         # 지역 데이터 접근
```

### Entity
```
com.busan.orora.entity/
├── TouristSpot.java              # 관광지 엔티티
└── Region.java                   # 지역 엔티티
```

### DTO
```
com.busan.orora.dto/
├── TouristSpotResponse.java      # 관광지 응답 DTO
└── RegionResponse.java           # 지역 응답 DTO
```

## 데이터베이스 테이블 관계

### 주요 테이블
- `regions`: 지역 정보
- `tourist_spots`: 관광지 정보 (region_id로 연결)

### 관계도
```
regions (1) ────< (N) tourist_spots
```

### 지역 코드 매핑
프론트엔드의 SVG 지도에서 사용하는 `sigungu-code`와 DB의 `area_code` 매핑:
- 1: 강서구 (area06)
- 2: 금정구 (area02)
- 3: 기장군 (area01)
- 4: 남구 (area09)
- 5: 동구 (area11)
- 6: 동래구 (area04)
- 7: 부산진구 (area08)
- 8: 북구 (area05)
- 9: 사상구 (area07)
- 10: 사하구 (area10)
- 11: 서구 (area12)
- 12: 수영구 (area15)
- 13: 연제구 (area14)
- 14: 영도구 (area16)
- 15: 중구 (area13)
- 16: 해운대구 (area03)

## 연관된 다른 페이지

### 1. 상세 페이지 (02_detail_page.md)
- 관광지 클릭 시 상세 페이지로 이동
- URL: `/pages/detailed/detailed.html?id={id}` 또는 `?title={title}`

### 2. 태그 검색 페이지 (01_tag_page.md)
- 같은 관광지 데이터를 사용하지만 필터링 방식이 다름
- 지역 페이지는 지역 기반, 태그 페이지는 태그 기반

## 주요 기능

### 1. 지역 선택
- SVG 지도에서 지역 클릭
- 다중 선택 가능
- 선택된 지역의 관광지 목록 표시

### 2. 관광지 목록 표시
- 선택된 지역의 관광지만 표시
- 여러 지역 선택 시 모든 관광지 통합 표시
- 관광지 클릭 시 상세 페이지로 이동

### 3. 지역 정보 표시
- 선택된 지역 이름 표시
- 선택된 지역 개수 표시

### 4. 전체 해제
- 모든 선택 해제
- 기본 메시지 표시

## 프론트엔드 연동 포인트

### JavaScript 파일 수정 필요
`src/main/resources/static/js/searchBy/place.js`의 다음 부분을 수정:

1. **관광지 데이터 로드** (line 141-157):
```javascript
// 기존
const dataPath = getDataPath();
const response = await fetch(`${dataPath}busanTouristSpots.json`);
touristData = await response.json();

// 변경 후
async function loadTouristData() {
  const response = await fetch('/api/tourist-spots');
  touristData = await response.json();
}
```

2. **지역별 관광지 조회** (line 310-355):
```javascript
// 기존: 로컬 데이터에서 필터링
// 변경 후
async function displayRegionTouristSpots(regionElement, regionName) {
  const regionCode = regionElement.getAttribute('sigungu-code');
  // regionCode를 areaCode로 변환
  const areaCode = convertSigunguCodeToAreaCode(regionCode);
  
  const response = await fetch(`/api/tourist-spots/by-region?areaCodes=${areaCode}`);
  const data = await response.json();
  
  // UI 업데이트
}
```

3. **여러 지역 선택 시** (line 358-402):
```javascript
// 기존: 로컬 데이터에서 필터링
// 변경 후
async function displaySelectedRegionsTouristSpots() {
  const selectedRegions = getSelectedRegions();
  const areaCodes = selectedRegions.map(r => convertSigunguCodeToAreaCode(r.code)).join(',');
  
  const response = await fetch(`/api/tourist-spots/by-region?areaCodes=${areaCodes}`);
  const data = await response.json();
  
  // 모든 지역의 관광지 통합
  let allSpots = [];
  data.regions.forEach(region => {
    allSpots = allSpots.concat(region.spots);
  });
  
  // UI 업데이트
}
```

4. **지역 코드 변환 함수 추가**:
```javascript
function convertSigunguCodeToAreaCode(sigunguCode) {
  const codeToAreaMap = {
    1: 26710,  // 강서구
    2: 26440,  // 금정구
    3: 26710,  // 기장군
    // ... 나머지 매핑
  };
  return codeToAreaMap[sigunguCode];
}
```

## 주의사항

1. **지역 코드 매핑**
   - SVG 지도의 `sigungu-code`와 DB의 `area_code`가 다름
   - 매핑 테이블 또는 변환 함수 필요
   - 또는 DB에 `sigungu_code` 컬럼 추가 고려

2. **성능 최적화**
   - 여러 지역 선택 시 IN 쿼리 사용
   - 인덱스: `tourist_spots.region_id`
   - 지역별 관광지 수가 많을 경우 페이지네이션 고려

3. **데이터 일관성**
   - 지역이 없는 관광지 처리
   - 비활성화된 관광지 필터링 (일반 사용자)
   - 관리자는 모든 관광지 조회 가능

4. **에러 처리**
   - 존재하지 않는 지역 코드 처리
   - 관광지가 없는 지역 처리
   - 네트워크 오류 처리

5. **캐싱**
   - 지역 목록은 변경 빈도가 낮으므로 캐싱 고려
   - 지역별 관광지 목록도 캐싱 고려

## 테스트 케이스

1. 전체 관광지 목록 조회 (지역별 그룹화)
2. 단일 지역 선택 시 관광지 조회
3. 여러 지역 선택 시 관광지 통합 조회
4. 지역 코드 변환 테스트
5. 존재하지 않는 지역 코드 처리
6. 관광지가 없는 지역 처리
7. 지역 목록 조회
8. 관광지 클릭 시 상세 페이지 이동
