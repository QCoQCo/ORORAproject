# 관리자 페이지 백엔드 작업 가이드

## 페이지 개요
관리자가 관광지와 사용자를 관리할 수 있는 페이지입니다. 관광지 추가/수정/삭제, 사용자 관리, 통계 조회 기능을 제공합니다.

**프론트엔드 파일 위치**:
- HTML: `src/main/resources/templates/pages/admin/admin.html`
- JavaScript: `src/main/resources/static/js/admin.js`
- CSS: `src/main/resources/static/css/admin.css`

## 필요한 API 엔드포인트

### 관광지 관리

#### 1. 관리자 관광지 목록 조회
- **엔드포인트**: `GET /api/admin/tourist-spots`
- **설명**: 모든 관광지 목록 조회 (비활성화 포함)
- **쿼리 파라미터**:
  - `region`: 지역 필터 (선택)
  - `category`: 카테고리 필터 (선택)
  - `search`: 검색 키워드 (선택)
  - `page`: 페이지 번호
  - `size`: 페이지 크기
- **권한**: 관리자만 접근 가능

#### 2. 관광지 추가
- **엔드포인트**: `POST /api/admin/tourist-spots`
- **설명**: 새로운 관광지 추가
- **요청 형식**:
```json
{
  "regionId": 1,
  "title": "새로운 관광지",
  "description": "관광지 설명",
  "hashtags": ["새로운", "관광지"],
  "images": [
    {
      "imageUrl": "/images/new.jpg",
      "order": 1
    }
  ],
  "linkUrl": "#",
  "category": "culture"
}
```
- **권한**: 관리자만 접근 가능

#### 3. 관광지 수정
- **엔드포인트**: `PUT /api/admin/tourist-spots/{id}`
- **설명**: 관광지 정보 수정
- **요청 형식**: 관광지 추가와 동일
- **권한**: 관리자만 접근 가능

#### 4. 관광지 삭제
- **엔드포인트**: `DELETE /api/admin/tourist-spots/{id}`
- **설명**: 관광지 삭제 (실제 삭제 또는 비활성화)
- **권한**: 관리자만 접근 가능

#### 5. 관광지 활성화/비활성화
- **엔드포인트**: `PATCH /api/admin/tourist-spots/{id}/status`
- **설명**: 관광지 활성화 상태 변경
- **요청 형식**:
```json
{
  "isActive": false
}
```

### 사용자 관리

#### 6. 사용자 목록 조회
- **엔드포인트**: `GET /api/admin/users`
- **설명**: 모든 사용자 목록 조회
- **쿼리 파라미터**:
  - `role`: 권한 필터 (admin, vip, member)
  - `status`: 상태 필터 (active, inactive, suspended)
  - `search`: 검색 키워드 (사용자명, 이메일)
  - `page`: 페이지 번호
  - `size`: 페이지 크기
- **권한**: 관리자만 접근 가능

#### 7. 사용자 추가
- **엔드포인트**: `POST /api/admin/users`
- **설명**: 새로운 사용자 추가
- **요청 형식**:
```json
{
  "userId": "newuser",
  "username": "새사용자",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "member"
}
```
- **권한**: 관리자만 접근 가능

#### 8. 사용자 수정
- **엔드포인트**: `PUT /api/admin/users/{id}`
- **설명**: 사용자 정보 수정
- **요청 형식**:
```json
{
  "username": "수정된사용자",
  "email": "updated@example.com",
  "role": "vip",
  "status": "active"
}
```
- **권한**: 관리자만 접근 가능

#### 9. 사용자 삭제
- **엔드포인트**: `DELETE /api/admin/users/{id}`
- **설명**: 사용자 삭제 (실제 삭제 또는 비활성화)
- **권한**: 관리자만 접근 가능

#### 10. 사용자 상태 변경
- **엔드포인트**: `PATCH /api/admin/users/{id}/status`
- **설명**: 사용자 상태 변경 (활성/비활성/정지)
- **요청 형식**:
```json
{
  "status": "suspended"
}
```

### 통계 조회

#### 11. 관광지 통계
- **엔드포인트**: `GET /api/admin/statistics/tourist-spots`
- **설명**: 관광지 관련 통계 조회
- **응답 형식**:
```json
{
  "totalSpots": 150,
  "byCategory": {
    "beach": 25,
    "mountain": 20,
    "culture": 50,
    "food": 30,
    "shopping": 15,
    "cafe": 10
  },
  "byRegion": {
    "기장군": 15,
    "해운대구": 20
  }
}
```

#### 12. 사용자 통계
- **엔드포인트**: `GET /api/admin/statistics/users`
- **설명**: 사용자 관련 통계 조회
- **응답 형식**:
```json
{
  "totalUsers": 1000,
  "activeUsers": 850,
  "byRole": {
    "admin": 5,
    "vip": 50,
    "member": 945
  },
  "byStatus": {
    "active": 850,
    "inactive": 100,
    "suspended": 50
  }
}
```

## 필요한 파일 구조

### Controller
```
com.busan.orora.controller.admin/
├── AdminTouristSpotController.java  # 관광지 관리 API
├── AdminUserController.java         # 사용자 관리 API
└── AdminStatisticsController.java  # 통계 조회 API
```

### Service
```
com.busan.orora.service.admin/
├── AdminTouristSpotService.java    # 관광지 관리 로직
├── AdminUserService.java           # 사용자 관리 로직
└── AdminStatisticsService.java     # 통계 조회 로직
```

### Repository
```
com.busan.orora.repository/
├── TouristSpotRepository.java      # 관광지 데이터 접근
├── UserRepository.java             # 사용자 데이터 접근
└── RegionRepository.java          # 지역 데이터 접근
```

### Entity
```
com.busan.orora.entity/
├── TouristSpot.java                # 관광지 엔티티
├── User.java                       # 사용자 엔티티
└── Region.java                     # 지역 엔티티
```

### DTO
```
com.busan.orora.dto.admin/
├── TouristSpotCreateRequest.java   # 관광지 생성 요청 DTO
├── TouristSpotUpdateRequest.java   # 관광지 수정 요청 DTO
├── UserCreateRequest.java          # 사용자 생성 요청 DTO
├── UserUpdateRequest.java          # 사용자 수정 요청 DTO
└── StatisticsResponse.java         # 통계 응답 DTO
```

### Config (보안 설정)
```
com.busan.orora.config/
└── SecurityConfig.java             # Spring Security 설정
```

## 데이터베이스 테이블 관계

### 주요 테이블
- `tourist_spots`: 관광지 정보
- `users`: 사용자 정보
- `regions`: 지역 정보
- `hashtags`: 해시태그
- `tourist_spot_hashtags`: 관광지-태그 연결

## 연관된 다른 페이지

### 1. 상세 페이지 (02_detail_page.md)
- 관리자가 추가/수정한 관광지가 상세 페이지에 표시됨

### 2. 태그 검색 페이지 (01_tag_page.md)
- 관리자가 추가한 관광지가 검색 결과에 포함됨

### 3. 인증 페이지 (06_auth_page.md)
- 관리자 권한 확인을 위한 인증 필요

## 주요 기능

### 1. 관광지 관리
- 관광지 추가: 제목, 설명, 지역, 태그, 이미지, 카테고리
- 관광지 수정: 모든 필드 수정 가능
- 관광지 삭제: 실제 삭제 또는 비활성화
- 관광지 검색: 제목, 지역, 카테고리로 필터링

### 2. 사용자 관리
- 사용자 추가: 아이디, 이름, 이메일, 비밀번호, 권한
- 사용자 수정: 이름, 이메일, 권한, 상태
- 사용자 삭제: 실제 삭제 또는 비활성화
- 사용자 검색: 이름, 이메일로 검색
- 사용자 상태 변경: 활성/비활성/정지

### 3. 통계 조회
- 관광지 통계: 총 개수, 카테고리별, 지역별 분포
- 사용자 통계: 총 사용자 수, 권한별, 상태별 분포
- 차트 데이터 제공 (프론트엔드에서 차트 렌더링)

### 4. 데이터 내보내기
- 전체 데이터 백업 (JSON/CSV)
- 관광지 데이터만 내보내기
- 사용자 데이터만 내보내기

## 프론트엔드 연동 포인트

### JavaScript 파일 수정 필요
`src/main/resources/static/js/admin.js`의 다음 부분을 수정:

1. **관광지 목록 조회**:
```javascript
// 기존: JSON 파일 로드
// 변경 후
async function loadTouristSpots() {
  const response = await fetch('/api/admin/tourist-spots');
  const data = await response.json();
  // UI 업데이트
}
```

2. **관광지 추가**:
```javascript
// 기존: 로컬 스토리지 저장
// 변경 후
async function addTouristSpot(formData) {
  const response = await fetch('/api/admin/tourist-spots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const result = await response.json();
  // UI 업데이트
}
```

3. **사용자 목록 조회**:
```javascript
// 기존: JSON 파일 로드
// 변경 후
async function loadUsers() {
  const response = await fetch('/api/admin/users');
  const data = await response.json();
  // UI 업데이트
}
```

4. **통계 조회**:
```javascript
// 기존: 하드코딩된 값
// 변경 후
async function loadStatistics() {
  const spotsResponse = await fetch('/api/admin/statistics/tourist-spots');
  const usersResponse = await fetch('/api/admin/statistics/users');
  const spotsStats = await spotsResponse.json();
  const usersStats = await usersResponse.json();
  // UI 업데이트
}
```

## 주의사항

1. **권한 관리**
   - 모든 API는 관리자 권한(`role = 'admin'`) 필요
   - Spring Security로 권한 체크
   - 권한 없으면 403 Forbidden 반환

2. **데이터 검증**
   - 관광지 추가/수정 시 필수 필드 검증
   - 사용자 추가 시 이메일, 아이디 중복 체크
   - 비밀번호 강도 검증

3. **해시태그 처리**
   - 태그는 쉼표로 구분된 문자열로 받아서 파싱
   - 기존 태그가 있으면 재사용, 없으면 생성
   - 태그 이름 정규화 (공백 제거, 소문자 변환 등)

4. **이미지 처리**
   - 이미지 업로드는 별도 API 필요
   - 이미지 URL 유효성 검증
   - 이미지 순서 관리

5. **삭제 처리**
   - 실제 삭제 vs 논리 삭제 (비활성화) 결정
   - 관련 데이터 (리뷰, 좋아요 등) 처리 방법 결정
   - CASCADE DELETE 또는 SOFT DELETE

6. **성능 최적화**
   - 통계 조회는 캐싱 고려
   - 대량 데이터 조회 시 페이지네이션 필수
   - 인덱스 활용

7. **보안**
   - SQL Injection 방지
   - XSS 방지
   - CSRF 방지
   - 비밀번호는 해시화하여 저장

8. **트랜잭션 처리**
   - 관광지 추가 시 태그 연결도 함께 처리
   - 사용자 삭제 시 관련 데이터 처리

## 테스트 케이스

1. 관리자 권한 확인 (관리자/일반 사용자)
2. 관광지 목록 조회 (필터링, 검색, 페이지네이션)
3. 관광지 추가 (성공/실패 케이스)
4. 관광지 수정
5. 관광지 삭제
6. 관광지 활성화/비활성화
7. 사용자 목록 조회 (필터링, 검색, 페이지네이션)
8. 사용자 추가 (중복 체크)
9. 사용자 수정
10. 사용자 삭제
11. 사용자 상태 변경
12. 통계 조회 (관광지/사용자)
13. 데이터 내보내기
