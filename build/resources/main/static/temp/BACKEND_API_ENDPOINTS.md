# 부산 관광 가이드 백엔드 API 엔드포인트 명세서

# Spring boot thymeleaf thymeleaf-layout-dialect 

## 개요

이 문서는 부산 관광 가이드 프로젝트의 백엔드 API 엔드포인트들을 정리한 명세서입니다. 현재 프론트엔드에서는 JSON 파일을 사용하고 있지만, 백엔드 연결 시 다음과 같은 API 엔드포인트들이 필요합니다.

## 인증 관련 API

### 1. 로그인

-   **엔드포인트**: `POST /api/auth/login`
-   **요청 형식**:
    ```json
    {
        "userId": "string",
        "password": "string"
    }
    ```
-   **응답 형식**:
    ```json
    {
        "success": true,
        "user": {
            "id": 1,
            "userId": "admin",
            "username": "관리자",
            "email": "admin@aratabusan.com",
            "role": "admin",
            "status": "active"
        },
        "token": "jwt_token_string"
    }
    ```

### 2. 회원가입

-   **엔드포인트**: `POST /api/auth/signup`
-   **요청 형식**:
    ```json
    {
        "userId": "string",
        "password": "string",
        "username": "string",
        "email": "string",
        "phoneNumber": "string",
        "birthDate": "YYYY-MM-DD",
        "address": "string"
    }
    ```
-   **응답 형식**:
    ```json
    {
        "success": true,
        "user": {
            "id": 1,
            "userId": "newuser",
            "username": "새사용자",
            "email": "newuser@example.com",
            "role": "member",
            "status": "active"
        },
        "message": "회원가입이 완료되었습니다."
    }
    ```

### 3. 아이디 중복 체크

-   **엔드포인트**: `GET /api/auth/check-id?userId={userId}`
-   **응답 형식**:
    ```json
    {
        "available": true,
        "message": "사용 가능한 아이디입니다."
    }
    ```

### 4. 로그아웃

-   **엔드포인트**: `POST /api/auth/logout`
-   **요청 형식**:
    ```json
    {
        "token": "jwt_token_string"
    }
    ```
-   **응답 형식**:
    ```json
    {
        "success": true,
        "message": "로그아웃되었습니다."
    }
    ```

## 관광지 관련 API

### 1. 관광지 목록 조회

-   **엔드포인트**: `GET /api/tourist-spots`
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
                        "hashtags": ["#사찰", "#일출명소", "#바다"],
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

### 2. 특정 관광지 상세 조회

-   **엔드포인트**: `GET /api/tourist-spots/{spotId}`
-   **응답 형식**:
    ```json
    {
        "id": 1,
        "title": "해동 용궁사",
        "description": "바다 위에 세워진 아름다운 사찰입니다.",
        "hashtags": ["#사찰", "#일출명소", "#바다"],
        "imageUrl": "/images/2025(4).jpg",
        "linkUrl": "#",
        "category": "culture",
        "region": {
            "id": 1,
            "name": "기장군",
            "code": "26710"
        },
        "isActive": true,
        "viewCount": 0,
        "ratingAvg": 0.0,
        "ratingCount": 0,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
    }
    ```

## 리뷰 관련 API

### 1. 리뷰 목록 조회

-   **엔드포인트**: `GET /api/reviews?spotTitle={title}`
-   **응답 형식**:
    ```json
    {
        "reviews": [
            {
                "id": 1,
                "userId": 1,
                "spotTitle": "해동 용궁사",
                "title": "정말 아름다운 곳이에요",
                "content": "일출이 정말 멋있었습니다.",
                "rating": 5,
                "likes": 10,
                "replies": 2,
                "createdAt": "2024-01-01T00:00:00Z",
                "updatedAt": "2024-01-01T00:00:00Z"
            }
        ]
    }
    ```

### 2. 리뷰 작성

-   **엔드포인트**: `POST /api/reviews`
-   **요청 형식**:
    ```json
    {
        "spotTitle": "해동 용궁사",
        "title": "리뷰 제목",
        "content": "리뷰 내용",
        "rating": 5,
        "userId": 1
    }
    ```
-   **응답 형식**:
    ```json
    {
        "success": true,
        "review": {
            "id": 1,
            "userId": 1,
            "spotTitle": "해동 용궁사",
            "title": "리뷰 제목",
            "content": "리뷰 내용",
            "rating": 5,
            "likes": 0,
            "replies": 0,
            "createdAt": "2024-01-01T00:00:00Z"
        }
    }
    ```

### 3. 리뷰 좋아요

-   **엔드포인트**: `POST /api/reviews/{reviewId}/like`
-   **요청 형식**:
    ```json
    {
        "userId": 1,
        "action": "like"
    }
    ```
-   **응답 형식**:
    ```json
    {
        "success": true,
        "likes": 11
    }
    ```

### 4. 리뷰 신고

-   **엔드포인트**: `POST /api/reviews/{reviewId}/report`
-   **요청 형식**:
    ```json
    {
        "userId": 1,
        "reason": "부적절한 내용"
    }
    ```
-   **응답 형식**:
    ```json
    {
        "success": true,
        "message": "신고가 접수되었습니다."
    }
    ```

## 관리자 API

### 1. 관리자 관광지 목록 조회

-   **엔드포인트**: `GET /api/admin/tourist-spots`
-   **응답 형식**: 관광지 목록 조회와 동일

### 2. 관광지 추가

-   **엔드포인트**: `POST /api/admin/tourist-spots`
-   **요청 형식**:
    ```json
    {
        "regionId": 1,
        "title": "새로운 관광지",
        "description": "관광지 설명",
        "hashtags": ["#새로운", "#관광지"],
        "imageUrl": "/images/new.jpg",
        "linkUrl": "#"
    }
    ```
-   **응답 형식**:
    ```json
    {
        "success": true,
        "spot": {
            "id": 1,
            "regionId": 1,
            "title": "새로운 관광지",
            "description": "관광지 설명",
            "hashtags": ["#새로운", "#관광지"],
            "imageUrl": "/images/new.jpg",
            "linkUrl": "#",
            "category": "culture",
            "isActive": true,
            "viewCount": 0,
            "ratingAvg": 0.0,
            "ratingCount": 0,
            "createdAt": "2024-01-01T00:00:00Z"
        }
    }
    ```

### 3. 관광지 수정

-   **엔드포인트**: `PUT /api/admin/tourist-spots/{spotId}`
-   **요청 형식**:
    ```json
    {
        "regionId": 1,
        "title": "수정된 관광지",
        "description": "수정된 설명",
        "hashtags": ["#수정된", "#관광지"],
        "imageUrl": "/images/updated.jpg",
        "linkUrl": "#"
    }
    ```
-   **응답 형식**:
    ```json
    {
        "success": true,
        "spot": {
            "id": 1,
            "regionId": 1,
            "title": "수정된 관광지",
            "description": "수정된 설명",
            "hashtags": ["#수정된", "#관광지"],
            "imageUrl": "/images/updated.jpg",
            "linkUrl": "#",
            "updatedAt": "2024-01-01T00:00:00Z"
        }
    }
    ```

### 4. 관광지 삭제

-   **엔드포인트**: `DELETE /api/admin/tourist-spots/{spotId}`
-   **응답 형식**:
    ```json
    {
        "success": true,
        "message": "관광지가 삭제되었습니다."
    }
    ```

### 5. 사용자 목록 조회

-   **엔드포인트**: `GET /api/admin/users`
-   **응답 형식**:
    ```json
    {
        "users": [
            {
                "id": 1,
                "userId": "admin",
                "username": "관리자",
                "email": "admin@aratabusan.com",
                "role": "admin",
                "status": "active",
                "joinDate": "2024-01-01",
                "lastLogin": "2024-12-19"
            }
        ]
    }
    ```

### 6. 사용자 추가

-   **엔드포인트**: `POST /api/admin/users`
-   **요청 형식**:
    ```json
    {
        "username": "새사용자",
        "email": "newuser@example.com",
        "role": "member",
        "password": "password123"
    }
    ```
-   **응답 형식**:
    ```json
    {
        "success": true,
        "user": {
            "id": 1,
            "userId": "newuser",
            "username": "새사용자",
            "email": "newuser@example.com",
            "role": "member",
            "status": "active",
            "joinDate": "2024-01-01"
        }
    }
    ```

### 7. 사용자 수정

-   **엔드포인트**: `PUT /api/admin/users/{userId}`
-   **요청 형식**:
    ```json
    {
        "username": "수정된사용자",
        "email": "updated@example.com",
        "role": "vip",
        "status": "active"
    }
    ```
-   **응답 형식**:
    ```json
    {
        "success": true,
        "user": {
            "id": 1,
            "userId": "user001",
            "username": "수정된사용자",
            "email": "updated@example.com",
            "role": "vip",
            "status": "active",
            "updatedAt": "2024-01-01T00:00:00Z"
        }
    }
    ```

### 8. 사용자 삭제

-   **엔드포인트**: `DELETE /api/admin/users/{userId}`
-   **응답 형식**:
    ```json
    {
        "success": true,
        "message": "사용자가 삭제되었습니다."
    }
    ```

## 데이터베이스 스키마

프로젝트의 데이터베이스 스키마는 `temp/new_data_schema.sql` 파일에 정의되어 있습니다. 주요 테이블은 다음과 같습니다:

-   `regions`: 지역 정보
-   `tourist_spots`: 관광지 정보
-   `hashtags`: 해시태그 정보
-   `tourist_spot_hashtags`: 관광지-해시태그 연결
-   `users`: 사용자 정보
-   `reviews`: 리뷰 정보
-   `review_images`: 리뷰 이미지
-   `tourist_spot_likes`: 관광지 좋아요
-   `review_likes`: 리뷰 좋아요
-   `review_comments`: 리뷰 댓글

## 인증 및 권한

-   모든 API는 JWT 토큰 기반 인증을 사용합니다.
-   관리자 API는 `admin` 역할을 가진 사용자만 접근 가능합니다.
-   일반 사용자는 자신의 리뷰만 수정/삭제할 수 있습니다.

## 에러 처리

모든 API는 표준 HTTP 상태 코드를 사용합니다:

-   `200`: 성공
-   `400`: 잘못된 요청
-   `401`: 인증 실패
-   `403`: 권한 없음
-   `404`: 리소스 없음
-   `500`: 서버 오류

에러 응답 형식:

```json
{
    "success": false,
    "error": "에러 메시지",
    "code": "ERROR_CODE"
}
```
