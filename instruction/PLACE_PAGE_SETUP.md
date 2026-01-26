# 지역별 검색 페이지 (place.html) 워크플로우/데이터플로우

## 📋 페이지 개요

부산 **SVG 지도**에서 지역(구/군)을 클릭(다중 선택 가능)하면, 선택된 지역들의 관광지 목록을 조회해 **오른쪽 sticky 리스트**에 표시하는 페이지입니다.

### 기술 스택

- **백엔드**: Spring Boot, MyBatis, MySQL
- **프론트엔드**: Thymeleaf 템플릿, Vanilla JavaScript, CSS3

---

## 1. 프론트엔드 파일 구조

### 1.1 템플릿

- `src/main/resources/templates/pages/search-place/place.html`
  - 지도 영역: `#mapSvg` (SVG가 동적으로 삽입됨)
  - 리스트 영역: `#tourist-spots-list`
  - 리스트 아이템 템플릿: `components/list-item.html` fragment를 포함
  - 스크립트 로드:
    - `@{/js/list-loader.js}`
    - `@{/js/searchBy/place.js}`

### 1.2 스크립트

- `src/main/resources/static/js/searchBy/place.js`
  - 지도 로딩/클릭 바인딩, 다중 선택 상태 관리, API 호출, 리스트 렌더링 담당
- `src/main/resources/static/js/list-loader.js`
  - `#list-item` 템플릿을 기반으로 리스트 카드 UI 렌더링 담당

### 1.3 정적 리소스

- 지도 SVG: `src/main/resources/static/images/map.svg`
  - 각 지역 path가 `.c-click` 클래스를 가지며, 다음 속성을 포함합니다.
    - `sigungu-code`: 지역 식별자(숫자)
    - `sigungu-name`: 지역명(한글)

---

## 2. 백엔드 API/레이어 구조

### 2.1 페이지 라우팅(템플릿 반환)

- `GET /pages/search-place/place`
  - 컨트롤러: `src/main/java/com/busan/orora/controller/PageController.java`
  - 반환 템플릿: `pages/search-place/place`

### 2.2 데이터 API(관광지 조회)

- `GET /api/regions/spots?regionIds=1,2,3`
  - 컨트롤러: `com.busan.orora.region.controller.RegionController`
  - 서비스: `com.busan.orora.region.service.RegionService`
  - 매퍼: `com.busan.orora.region.mapper.RegionMapper`
  - SQL: `src/main/resources/mapper/regionMapper.xml`

#### ⚠️ 파라미터 의미 주의

프론트의 `place.js`는 지도 SVG의 `sigungu-code`를 읽어 `regionIds`로 전송합니다.
즉 현재 구현에서 `regionIds`는 **DB region PK(id)** 가 아니라, **regions.sigungu_code 값**으로 사용됩니다.

---

## 3. 워크플로우 (사용자 동작 흐름)

### 3.1 페이지 진입/초기 상태

```
1) 사용자가 /pages/search-place/place 접속
2) place.html 렌더링 (Thymeleaf layout + list-item fragment 포함)
3) DOMContentLoaded 발생
4) place.js 초기화
   - 컨트롤 패널 토글 바인딩
   - [전체 해제] / [선택된 지역 보기] 버튼 바인딩
   - 리스트 패널 숨김/표시 토글 바인딩
   - 지도 SVG 로드(loadMap)
```

### 3.2 지도에서 지역 선택(다중 선택)

```
1) 사용자가 지도에서 특정 지역(path.c-click)을 클릭
2) place.js가 해당 path의 sigungu-code / sigungu-name 읽음
3) selectedRegionIds(Set)에 추가/삭제(토글)
4) 선택 스타일 반영: path에 .selected 클래스 토글
5) 즉시 데이터 조회(fetchRegionSpots) + 선택 정보 텍스트(updateSelectionInfo) 갱신
```

### 3.3 컨트롤 버튼 동작

- **전체 해제**
  - `selectedRegionIds.clear()`
  - 모든 `.c-click.selected`에서 `.selected` 제거
  - 리스트를 기본 안내 문구로 초기화
  - 선택 정보 텍스트 갱신

- **선택된 지역 보기**
  - 선택된 값이 있으면 `fetchRegionSpots([...selectedRegionIds])` 호출
  - 없으면 alert로 안내

---

## 4. 데이터플로우 (요청/응답/상태 변화)

### 4.1 전체 데이터 흐름

```
브라우저(place.js)
  selectedRegionIds(Set)
        ↓ (join(','))
GET /api/regions/spots?regionIds=...
        ↓
RegionController.getSpotsByRegions()
        ↓
RegionService.searchSpotsByRegionIds()
  - RegionMapper.searchSpotsByRegionIds() 로 관광지 + 대표이미지 + 해시태그 집계 조회
  - CommonCodeService.getCodesByGroupCode("SPOT_CATEGORY") 로 카테고리 활성 상태 조회
  - 각 관광지 DTO에 categoryActive 채움
        ↓
JSON(List<SearchSpotsByRegionDto>) 응답
        ↓
브라우저(place.js)
  renderSpotList(spots)
  - hashtags가 문자열이면 ',' 분리 후 '#태그' 배열로 변환
  - ListLoader에 data 전달 → 템플릿 기반 렌더링
```

### 4.2 API 응답 데이터 계약 (현재 구현 기준)

엔드포인트: `GET /api/regions/spots`

요청 예시:

```
GET /api/regions/spots?regionIds=15,16
```

응답 형식(배열):

```json
[
  {
    "id": 7,
    "title": "해동 용궁사",
    "description": "바다 위에 세워진 아름다운 사찰입니다.",
    "categoryCode": "CULTURE",
    "imageUrl": "/images/2025(4).jpg",
    "hashtags": "사찰, 일출명소, 바다",
    "categoryActive": true
  }
]
```

#### 프론트 렌더링에서의 데이터 변환

`place.js`는 `ListLoader` 입력 포맷에 맞추기 위해 다음처럼 매핑합니다.

- `hashtags`
  - 배열이면 그대로 사용
  - 문자열이면 `,`로 split 후 `#` prefix를 붙여 배열로 변환
- 이미지/링크
  - `img`: `spot.imageUrl || spot.image_url || ''`
  - `link`: `spot.linkUrl || spot.link_url || '#'` (현재 API에는 linkUrl이 없음 → 기본값 사용)
- 카테고리 활성
  - `categoryActive: spot.categoryActive !== false`

---

## 5. 에러/예외 흐름

### 5.1 인증/권한으로 HTML이 내려오는 경우

`place.js`는 응답 `content-type`이 `text/html`이면 **로그인 페이지 등 HTML이 반환된 케이스**로 보고 예외 처리합니다.

### 5.2 선택된 지역이 없는 경우

- `regionIds.length === 0`이면 API 호출 없이 리스트에 기본 안내 문구를 표시합니다.

### 5.3 API 실패/네트워크 오류

- 리스트 영역에 `"관광지 데이터를 불러오지 못했습니다."` 메시지를 표시합니다.

---

## 6. 관련 파일/코드 포인트(빠른 링크)

- 템플릿: `templates/pages/search-place/place.html`
- 지도 로더/클릭: `static/js/searchBy/place.js` (`loadMap()`, `bindRegionClick()`, `fetchRegionSpots()`)
- 리스트 렌더러: `static/js/list-loader.js` (`ListLoader.createListItem()`, `ListLoader.render()`)
- API 컨트롤러: `java/com/busan/orora/region/controller/RegionController.java`
- SQL: `resources/mapper/regionMapper.xml` (`searchSpotsByRegionIds`)

---

**문서 작성일**: 2026-01-26  
**프로젝트**: ORORA (부산 관광 가이드)

