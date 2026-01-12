# 마이페이지 백엔드 작업 가이드

## 페이지 개요
사용자가 작성한 리뷰, 댓글, 좋아요한 관광지를 조회하는 페이지입니다.

**프론트엔드 파일 위치**:
- HTML: `src/main/resources/templates/pages/mypage/mypage.html`
- JavaScript: `src/main/resources/static/js/mypage.js`
- CSS: `src/main/resources/static/css/mypage.css`

## 필요한 API 엔드포인트

### 1. 내 리뷰 목록 조회
- **엔드포인트**: `GET /api/users/{userId}/reviews`
- **설명**: 사용자가 작성한 리뷰 목록 조회
- **권한**: 본인 또는 관리자만 접근 가능
- **쿼리 파라미터**: `page`, `size`, `sort`
- **응답 형식**: 리뷰 목록 (03_review_page.md 참고)

### 2. 내 댓글 목록 조회
- **엔드포인트**: `GET /api/users/{userId}/comments`
- **설명**: 사용자가 작성한 댓글 목록 조회
- **권한**: 본인 또는 관리자만 접근 가능
- **응답 형식**:
```json
{
  "comments": [
    {
      "id": 1,
      "reviewId": 1,
      "reviewTitle": "리뷰 제목",
      "touristSpotTitle": "해동 용궁사",
      "content": "댓글 내용",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 3. 좋아요한 관광지 목록 조회
- **엔드포인트**: `GET /api/users/{userId}/liked-spots`
- **설명**: 사용자가 좋아요한 관광지 목록 조회
- **권한**: 본인 또는 관리자만 접근 가능
- **응답 형식**: 관광지 목록 (02_detail_page.md 참고)

### 4. 사용자 정보 조회
- **엔드포인트**: `GET /api/users/{userId}`
- **설명**: 사용자 프로필 정보 조회
- **권한**: 본인 또는 관리자만 접근 가능
- **응답 형식**:
```json
{
  "id": 1,
  "userId": "user001",
  "username": "사용자명",
  "email": "user@example.com",
  "profileImage": "/images/default-avatar.png",
  "joinDate": "2024-01-01",
  "role": "member",
  "status": "active"
}
```

### 5. 사용자 정보 수정
- **엔드포인트**: `PUT /api/users/{userId}`
- **설명**: 사용자 프로필 정보 수정
- **권한**: 본인만 수정 가능
- **요청 형식**:
```json
{
  "username": "수정된 이름",
  "email": "updated@example.com",
  "phoneNumber": "010-1234-5678",
  "address": "부산광역시 해운대구"
}
```

## 필요한 파일 구조

### Controller
```
com.busan.orora.controller/
└── UserController.java            # 사용자 관련 API
```

### Service
```
com.busan.orora.service/
└── UserService.java               # 사용자 비즈니스 로직
```

### Repository
```
com.busan.orora.repository/
├── UserRepository.java            # 사용자 데이터 접근
├── ReviewRepository.java          # 리뷰 데이터 접근
├── ReviewCommentRepository.java   # 댓글 데이터 접근
└── TouristSpotLikeRepository.java # 좋아요 데이터 접근
```

### Entity
```
com.busan.orora.entity/
└── User.java                      # 사용자 엔티티
```

### DTO
```
com.busan.orora.dto/
├── UserResponse.java              # 사용자 응답 DTO
└── UserUpdateRequest.java         # 사용자 수정 요청 DTO
```

## 데이터베이스 테이블 관계

### 주요 테이블
- `users`: 사용자 정보
- `reviews`: 리뷰 (user_id로 연결)
- `review_comments`: 댓글 (user_id로 연결)
- `tourist_spot_likes`: 관광지 좋아요 (user_id로 연결)

## 연관된 다른 페이지

### 1. 상세 페이지 (02_detail_page.md)
- 리뷰 클릭 시 해당 관광지 상세 페이지로 이동
- 관광지 클릭 시 상세 페이지로 이동

### 2. 리뷰 페이지 (03_review_page.md)
- 리뷰 수정/삭제 기능

### 3. 인증 페이지 (06_auth_page.md)
- 사용자 정보 조회를 위한 인증 필요

## 주요 기능

### 1. 내 리뷰 조회
- 사용자가 작성한 모든 리뷰 목록
- 리뷰 수정/삭제 링크
- 관광지명, 작성일, 평점 표시

### 2. 내 댓글 조회
- 사용자가 작성한 모든 댓글 목록
- 댓글이 달린 리뷰 정보 표시
- 관광지명 표시

### 3. 좋아요한 관광지 조회
- 사용자가 좋아요한 관광지 목록
- 관광지 클릭 시 상세 페이지로 이동
- 좋아요 취소 기능

### 4. 사용자 정보 표시
- 프로필 이미지, 이름, 이메일
- 가입일, 권한 정보

### 5. 사용자 정보 수정
- 이름, 이메일, 전화번호, 주소 수정
- 프로필 이미지 변경

## 프론트엔드 연동 포인트

### JavaScript 파일 수정 필요
`src/main/resources/static/js/mypage.js`의 다음 부분을 수정:

1. **사용자 정보 로드**:
```javascript
async function loadUserInfo() {
  const userId = getCurrentUserId();
  const response = await fetch(`/api/users/${userId}`);
  const user = await response.json();
  // UI 업데이트
}
```

2. **내 리뷰 목록 로드**:
```javascript
async function loadMyReviews() {
  const userId = getCurrentUserId();
  const response = await fetch(`/api/users/${userId}/reviews`);
  const data = await response.json();
  // UI 업데이트
}
```

3. **내 댓글 목록 로드**:
```javascript
async function loadMyComments() {
  const userId = getCurrentUserId();
  const response = await fetch(`/api/users/${userId}/comments`);
  const data = await response.json();
  // UI 업데이트
}
```

4. **좋아요한 관광지 목록 로드**:
```javascript
async function loadLikedSpots() {
  const userId = getCurrentUserId();
  const response = await fetch(`/api/users/${userId}/liked-spots`);
  const data = await response.json();
  // UI 업데이트
}
```

## 주의사항

1. **권한 관리**
   - 본인만 자신의 정보 조회/수정 가능
   - 관리자는 모든 사용자 정보 조회 가능
   - 다른 사용자의 정보 접근 시 403 Forbidden

2. **성능 최적화**
   - 리뷰, 댓글, 좋아요 목록은 페이지네이션 적용
   - 인덱스: `reviews.user_id`, `review_comments.user_id`, `tourist_spot_likes.user_id`

3. **데이터 검증**
   - 이메일 형식 검증
   - 전화번호 형식 검증
   - 프로필 이미지 크기 제한

4. **에러 처리**
   - 존재하지 않는 사용자 ID 처리 (404)
   - 권한 없음 처리 (403)
   - 데이터가 없을 때 빈 목록 반환

## 테스트 케이스

1. 내 리뷰 목록 조회
2. 내 댓글 목록 조회
3. 좋아요한 관광지 목록 조회
4. 사용자 정보 조회
5. 사용자 정보 수정
6. 다른 사용자 정보 접근 시도 (403)
7. 존재하지 않는 사용자 조회 (404)
8. 페이지네이션 테스트
