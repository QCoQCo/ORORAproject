# 리뷰 페이지 백엔드 작업 가이드

## 페이지 개요
관광지에 대한 리뷰를 작성, 조회, 수정, 삭제하는 기능을 제공합니다. 리뷰 좋아요, 댓글, 신고 기능도 포함됩니다.

**프론트엔드 파일 위치**:
- HTML: `src/main/resources/templates/pages/detailed/detailPage.html` (리뷰 섹션)
- JavaScript: `src/main/resources/static/js/detailPage.js` (리뷰 관련 함수)
- CSS: `src/main/resources/static/css/detailPage.css`

## 필요한 API 엔드포인트

### 1. 리뷰 목록 조회
- **엔드포인트**: `GET /api/reviews`
- **설명**: 관광지별 리뷰 목록 조회
- **쿼리 파라미터**:
  - `touristSpotId`: 관광지 ID (필수)
  - `page`: 페이지 번호 (기본값: 0)
  - `size`: 페이지 크기 (기본값: 10)
  - `sort`: 정렬 기준 (createdAt, rating, likes) (기본값: createdAt)
- **응답 형식**:
```json
{
  "content": [
    {
      "id": 1,
      "userId": 1,
      "userName": "e***d",
      "userProfileImage": "/images/default-avatar.png",
      "touristSpotId": 1,
      "touristSpotTitle": "해동 용궁사",
      "title": "정말 아름다운 곳이에요",
      "content": "일출이 정말 멋있었습니다.",
      "rating": 5,
      "likes": 10,
      "comments": 2,
      "images": [
        {
          "id": 1,
          "imageUrl": "/images/review1.jpg",
          "order": 1
        }
      ],
      "isApproved": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "isLiked": false
    }
  ],
  "totalElements": 50,
  "totalPages": 5,
  "currentPage": 0
}
```

### 2. 리뷰 작성
- **엔드포인트**: `POST /api/reviews`
- **설명**: 새로운 리뷰 작성
- **요청 형식**:
```json
{
  "touristSpotId": 1,
  "title": "리뷰 제목",
  "content": "리뷰 내용",
  "rating": 5,
  "images": [
    {
      "imageUrl": "/images/review1.jpg",
      "order": 1
    }
  ]
}
```
- **응답 형식**:
```json
{
  "success": true,
  "review": {
    "id": 1,
    "userId": 1,
    "touristSpotId": 1,
    "title": "리뷰 제목",
    "content": "리뷰 내용",
    "rating": 5,
    "likes": 0,
    "comments": 0,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 3. 리뷰 수정
- **엔드포인트**: `PUT /api/reviews/{id}`
- **설명**: 본인이 작성한 리뷰 수정
- **권한**: 작성자만 수정 가능
- **요청 형식**: 리뷰 작성과 동일

### 4. 리뷰 삭제
- **엔드포인트**: `DELETE /api/reviews/{id}`
- **설명**: 본인이 작성한 리뷰 삭제
- **권한**: 작성자만 삭제 가능
- **응답 형식**:
```json
{
  "success": true,
  "message": "리뷰가 삭제되었습니다."
}
```

### 5. 리뷰 좋아요 토글
- **엔드포인트**: `POST /api/reviews/{id}/like`
- **설명**: 리뷰 좋아요 추가/제거
- **요청 형식**:
```json
{
  "userId": 1,
  "action": "like" // 또는 "unlike"
}
```
- **응답 형식**:
```json
{
  "success": true,
  "isLiked": true,
  "likes": 11
}
```

### 6. 리뷰 댓글 목록 조회
- **엔드포인트**: `GET /api/reviews/{id}/comments`
- **설명**: 특정 리뷰의 댓글 목록 조회
- **응답 형식**:
```json
{
  "comments": [
    {
      "id": 1,
      "userId": 2,
      "userName": "댓글작성자",
      "content": "댓글 내용",
      "isApproved": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 7. 리뷰 댓글 작성
- **엔드포인트**: `POST /api/reviews/{id}/comments`
- **설명**: 리뷰에 댓글 작성
- **요청 형식**:
```json
{
  "content": "댓글 내용"
}
```

### 8. 리뷰 신고
- **엔드포인트**: `POST /api/reviews/{id}/report`
- **설명**: 부적절한 리뷰 신고
- **요청 형식**:
```json
{
  "userId": 1,
  "reason": "부적절한 내용"
}
```
- **응답 형식**:
```json
{
  "success": true,
  "message": "신고가 접수되었습니다."
}
```

### 9. 관광지 평점 업데이트
- **엔드포인트**: 내부 처리 (리뷰 작성/삭제 시 자동)
- **설명**: 리뷰 작성/삭제 시 관광지의 평균 평점과 평점 개수 업데이트

## 필요한 파일 구조

### Controller
```
com.busan.orora.controller/
└── ReviewController.java         # 리뷰 관련 API
```

### Service
```
com.busan.orora.service/
├── ReviewService.java            # 리뷰 비즈니스 로직
└── TouristSpotService.java       # 관광지 평점 업데이트 로직
```

### Repository
```
com.busan.orora.repository/
├── ReviewRepository.java          # 리뷰 데이터 접근
├── ReviewImageRepository.java     # 리뷰 이미지 데이터 접근
├── ReviewLikeRepository.java     # 리뷰 좋아요 데이터 접근
├── ReviewCommentRepository.java  # 리뷰 댓글 데이터 접근
└── ReviewReportRepository.java   # 리뷰 신고 데이터 접근
```

### Entity
```
com.busan.orora.entity/
├── Review.java                   # 리뷰 엔티티
├── ReviewImage.java              # 리뷰 이미지 엔티티
├── ReviewLike.java               # 리뷰 좋아요 엔티티
├── ReviewComment.java            # 리뷰 댓글 엔티티
└── ReviewReport.java            # 리뷰 신고 엔티티
```

### DTO
```
com.busan.orora.dto/
├── ReviewRequest.java            # 리뷰 작성/수정 요청 DTO
├── ReviewResponse.java           # 리뷰 응답 DTO
├── ReviewCommentRequest.java     # 댓글 작성 요청 DTO
└── ReviewReportRequest.java      # 신고 요청 DTO
```

## 데이터베이스 테이블 관계

### 주요 테이블
- `reviews`: 리뷰 기본 정보
- `review_images`: 리뷰 이미지 (1:N)
- `review_likes`: 리뷰 좋아요 (N:M)
- `review_comments`: 리뷰 댓글 (1:N)
- `review_reports`: 리뷰 신고 (1:N)
- `tourist_spots`: 관광지 (N:1)
- `users`: 사용자 (N:1)

### 관계도
```
users (1) ────< (N) reviews >─── (1) tourist_spots
reviews (1) ────< (N) review_images
reviews (1) ────< (N) review_likes >─── (N) users
reviews (1) ────< (N) review_comments >─── (N) users
reviews (1) ────< (N) review_reports >─── (N) users
```

## 연관된 다른 페이지

### 1. 상세 페이지 (02_detail_page.md)
- 리뷰 섹션이 상세 페이지 내에 포함됨
- 관광지 정보와 함께 리뷰 표시

### 2. 마이페이지 (07_mypage.md)
- 사용자가 작성한 리뷰 목록 표시
- 리뷰 수정/삭제 기능

### 3. 관리자 페이지 (04_admin_page.md)
- 리뷰 승인/거부 기능
- 신고된 리뷰 관리

## 주요 기능

### 1. 리뷰 작성
- 제목, 내용, 평점(1-5), 이미지 첨부
- 로그인 사용자만 작성 가능
- 작성 후 관광지 평점 자동 업데이트

### 2. 리뷰 조회
- 관광지별 리뷰 목록
- 정렬: 최신순, 평점순, 좋아요순
- 페이지네이션

### 3. 리뷰 수정/삭제
- 작성자만 수정/삭제 가능
- 수정/삭제 시 관광지 평점 재계산

### 4. 리뷰 좋아요
- 좋아요 추가/제거
- 중복 좋아요 방지
- 좋아요 수 실시간 업데이트

### 5. 리뷰 댓글
- 리뷰에 댓글 작성
- 댓글 목록 조회
- 댓글 수 표시

### 6. 리뷰 신고
- 부적절한 리뷰 신고
- 중복 신고 방지
- 신고 사유 입력

### 7. 관광지 평점 계산
- 리뷰 작성 시: `rating_avg = (기존_평점합 + 새_평점) / (기존_개수 + 1)`
- 리뷰 삭제 시: `rating_avg = (기존_평점합 - 삭제_평점) / (기존_개수 - 1)`
- 리뷰 수정 시: 평점 변경 반영

## 프론트엔드 연동 포인트

### JavaScript 파일 수정 필요
`src/main/resources/static/js/detailPage.js`의 다음 부분을 수정:

1. **리뷰 데이터 로드** (line 516-553):
```javascript
// 기존
const dataPath = getReviewDataPath();
const response = await fetch(dataPath);

// 변경 후
const urlParams = new URLSearchParams(window.location.search);
const spotId = urlParams.get('id');
const response = await fetch(`/api/reviews?touristSpotId=${spotId}`);
```

2. **리뷰 작성** (line 780-835):
```javascript
// 기존: 로컬 스토리지 저장
// 변경 후
async function submitReview() {
  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      touristSpotId: currentSpotId,
      title: title,
      content: content,
      rating: selectedRating,
      images: uploadedImages
    })
  });
  const result = await response.json();
  // UI 업데이트
}
```

3. **리뷰 좋아요** (line 859-901):
```javascript
// 기존: 로컬 스토리지 관리
// 변경 후
async function toggleReviewLike(reviewId) {
  const response = await fetch(`/api/reviews/${reviewId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: currentUserId, action: 'like' })
  });
  const result = await response.json();
  // UI 업데이트
}
```

4. **리뷰 신고** (line 903-913):
```javascript
// 기존: alert만 표시
// 변경 후
async function reportReview(reviewId) {
  const reason = prompt('신고 사유를 입력해주세요:');
  if (reason) {
    const response = await fetch(`/api/reviews/${reviewId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUserId, reason: reason })
    });
    const result = await response.json();
    alert(result.message);
  }
}
```

## 주의사항

1. **권한 관리**
   - 리뷰 작성: 로그인 사용자만
   - 리뷰 수정/삭제: 작성자만
   - 관리자는 모든 리뷰 수정/삭제 가능

2. **평점 계산**
   - 리뷰 작성/수정/삭제 시 관광지 평점 자동 업데이트
   - 트랜잭션 처리 필수 (평점 업데이트 실패 시 리뷰도 롤백)

3. **이미지 처리**
   - 이미지 업로드는 별도 API 필요 (파일 업로드)
   - 이미지 순서 관리 (`image_order`)
   - 이미지 삭제 시 파일도 삭제

4. **성능 최적화**
   - 리뷰 목록 조회 시 N+1 문제 방지 (JOIN 또는 페치 조인)
   - 좋아요 수는 캐싱 고려
   - 인덱스: `reviews.tourist_spot_id`, `reviews.user_id`, `reviews.created_at`

5. **데이터 검증**
   - 평점: 1-5 범위
   - 제목/내용: 최소/최대 길이 제한
   - 이미지 개수 제한

6. **신고 처리**
   - 중복 신고 방지 (UNIQUE 제약)
   - 신고 누적 시 리뷰 자동 숨김 처리 고려
   - 관리자 승인 후 처리

7. **댓글 기능**
   - 댓글도 신고 기능 필요
   - 댓글 수정/삭제 기능 고려

## 테스트 케이스

1. 리뷰 작성 (로그인/비로그인)
2. 리뷰 목록 조회 (정렬, 페이지네이션)
3. 리뷰 수정 (작성자/타인)
4. 리뷰 삭제 (작성자/타인)
5. 리뷰 좋아요 추가/제거
6. 리뷰 댓글 작성/조회
7. 리뷰 신고
8. 관광지 평점 업데이트 (작성/수정/삭제)
9. 이미지 첨부 리뷰 작성
10. 중복 좋아요 방지
11. 중복 신고 방지
