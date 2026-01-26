# ORORA 프로젝트 API 명세서

## 목차

1. [인증 API](#인증-api)
    - 일반 로그인/회원가입
    - 소셜 로그인 (OAuth2)
2. [사용자 API](#사용자-api)
3. [관광지 API](#관광지-api)
4. [지역 API](#지역-api)
5. [리뷰 API](#리뷰-api)
6. [댓글 API](#댓글-api)
7. [좋아요 API](#좋아요-api)
8. [검색 API](#검색-api)
9. [해시태그 API](#해시태그-api)
10. [관리자 API](#관리자-api)

---

## 인증 API

### 1. 로그인

- **엔드포인트**: `POST /api/auth/login`
- **설명**: 사용자 로그인 처리
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
  "loginId": "string",
  "password": "string",
  "keepLogin": boolean,
  "saveId": boolean
}
```

- **응답 형식**:

```json
{
    "success": true,
    "user": {
        "id": 1,
        "loginId": "user123",
        "username": "사용자명",
        "email": "user@example.com",
        "role": "MEMBER",
        "roleCode": "MEMBER",
        "profileImage": "/images/upload/profiles/image.jpg",
        "profile_image": "/images/upload/profiles/image.jpg",
        "join_date": "2024-01-01T00:00:00"
    },
    "message": "로그인 성공"
}
```

### 2. 회원가입

- **엔드포인트**: `POST /api/auth/signup`
- **설명**: 신규 사용자 회원가입
- **요청 형식**: `multipart/form-data`
- **요청 파라미터**:
    - `loginId` (required): 로그인 ID
    - `password` (required): 비밀번호
    - `username` (required): 사용자명
    - `email` (required): 이메일
    - `phoneNumber` (optional): 전화번호
    - `address` (optional): 주소
    - `birthDate` (optional): 생년월일 (YYYY-MM-DD)
    - `genderCode` (optional): 성별 코드
    - `profileImage` (optional): 프로필 이미지 파일
- **응답 형식**:

```json
{
    "success": true,
    "message": "회원가입이 완료되었습니다!"
}
```

### 3. 아이디 중복 체크

- **엔드포인트**: `GET /api/auth/check-id?userId={userId}`
- **설명**: 회원가입 시 아이디 중복 확인
- **쿼리 파라미터**:
    - `userId` (required): 확인할 아이디
- **응답 형식**:

```json
{
    "available": true,
    "message": "사용 가능한 아이디입니다."
}
```

### 4. 로그인 상태 확인

- **엔드포인트**: `GET /api/auth/check`
- **설명**: 현재 로그인 상태 및 사용자 정보 조회
- **응답 형식**:

```json
{
    "success": true,
    "loggedIn": true,
    "user": {
        "id": 1,
        "loginId": "user123",
        "username": "사용자명",
        "email": "user@example.com",
        "role": "MEMBER",
        "roleCode": "MEMBER",
        "profileImage": "/images/upload/profiles/image.jpg",
        "profile_image": "/images/upload/profiles/image.jpg",
        "join_date": "2024-01-01T00:00:00"
    }
}
```

### 5. 로그아웃

- **엔드포인트**: `POST /api/auth/logout`
- **설명**: 사용자 로그아웃 처리
- **응답 형식**:

```json
{
    "success": true,
    "message": "로그아웃되었습니다."
}
```

### 6. 아이디 찾기

- **엔드포인트**: `POST /api/auth/find-id`
- **설명**: 사용자명 또는 이메일로 아이디 찾기
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "username": "string",
    "email": "string"
}
```

- **응답 형식**:

```json
{
    "success": true,
    "loginId": "user123",
    "message": "아이디를 찾았습니다."
}
```

### 7. 비밀번호 재설정

- **엔드포인트**: `POST /api/auth/reset-password`
- **설명**: 아이디를 기반으로 비밀번호 재설정
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "loginId": "string",
    "newPassword": "string"
}
```

- **응답 형식**:

```json
{
    "success": true,
    "message": "비밀번호가 성공적으로 재설정되었습니다."
}
```

### 8. 소셜 로그인 (OAuth2)

#### 8.1 카카오 로그인

- **엔드포인트**: `GET /oauth2/authorization/kakao`
- **설명**: 카카오 OAuth2 인증을 통한 소셜 로그인
- **리다이렉트 URI**: `/login/oauth2/code/kakao`
- **인증 흐름**:
    1. 사용자가 카카오 로그인 버튼 클릭
    2. 카카오 인증 서버로 리다이렉트
    3. 사용자 인증 후 콜백 URI로 리다이렉트
    4. 서버에서 사용자 정보 조회 및 자동 회원가입/로그인 처리
    5. 세션에 사용자 정보 저장
- **응답**: 로그인 성공 시 메인 페이지로 리다이렉트
- **주의사항**:
    - 환경 변수 `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET` 설정 필요
    - 카카오 개발자 콘솔에서 리다이렉트 URI 등록 필요

#### 8.2 구글 로그인

- **엔드포인트**: `GET /oauth2/authorization/google`
- **설명**: 구글 OAuth2 인증을 통한 소셜 로그인
- **리다이렉트 URI**: `/login/oauth2/code/google`
- **인증 흐름**:
    1. 사용자가 구글 로그인 버튼 클릭
    2. 구글 인증 서버로 리다이렉트
    3. 사용자 인증 후 콜백 URI로 리다이렉트
    4. 서버에서 사용자 정보 조회 및 자동 회원가입/로그인 처리
    5. 세션에 사용자 정보 저장
- **응답**: 로그인 성공 시 메인 페이지로 리다이렉트
- **주의사항**:
    - 환경 변수 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 설정 필요
    - Google Cloud Console에서 리다이렉트 URI 등록 필요
    - 요청 스코프: `email`, `profile`

#### 8.3 소셜 로그인 특징

- **자동 회원가입**: 소셜 로그인 시 이메일 기반으로 자동 회원가입 처리
- **로그인 타입**: 사용자 테이블의 `login_type_code` 필드에 저장
    - 카카오: `KAKAO`
    - 구글: `GOOGLE`
    - 일반 로그인: `NORMAL`
- **세션 관리**: 일반 로그인과 동일하게 세션 기반 인증 사용
- **사용자 정보**: 소셜 로그인 시 이메일과 이름을 자동으로 수집

---

## 사용자 API

### 1. 사용자 정보 조회

- **엔드포인트**: `GET /api/users/{userId}`
- **설명**: 특정 사용자의 상세 정보 조회
- **경로 파라미터**:
    - `userId` (required): 사용자 ID
- **응답 형식**:

```json
{
    "success": true,
    "user": {
        "id": 1,
        "loginId": "user123",
        "username": "사용자명",
        "email": "user@example.com",
        "phoneNumber": "010-1234-5678",
        "address": "부산시 해운대구",
        "birthDate": "1990-01-01T00:00:00",
        "genderCode": "M",
        "role": "MEMBER",
        "roleCode": "MEMBER",
        "profileImage": "/images/upload/profiles/image.jpg",
        "profile_image": "/images/upload/profiles/image.jpg",
        "join_date": "2024-01-01T00:00:00"
    }
}
```

---

## 페이지(뷰) 엔드포인트

### 1. 사용자 프로필(타인) 페이지

- **엔드포인트**: `GET /pages/profile/{userId}`
- **설명**: 리뷰/댓글 등에서 다른 유저의 프로필을 눌렀을 때 보여주는 페이지
- **렌더링 템플릿**: `pages/mypage/mypage`
- **모델 값**:
    - `profileUserId`: 타인 사용자 ID
- **동작(프론트)**:
    - 타인 프로필에서는 **프로필 수정 버튼 숨김**
    - 타인 프로필에서는 **리뷰 탭만 노출** (댓글/좋아요/신청관리/관광지 추가신청 탭 숨김)
    - 필요한 데이터는 아래 API를 사용해서 로드
        - `GET /api/users/{userId}`
        - `GET /api/users/{userId}/reviews`

### 2. 프로필 수정

- **엔드포인트**: `PUT /api/users/{userId}/profile`
- **설명**: 사용자 프로필 정보 수정
- **경로 파라미터**:
    - `userId` (required): 사용자 ID
- **요청 형식**: `multipart/form-data`
- **요청 파라미터**:
    - `username` (optional): 사용자명
    - `email` (optional): 이메일
    - `phoneNumber` (optional): 전화번호
    - `address` (optional): 주소
    - `birthDate` (optional): 생년월일
    - `genderCode` (optional): 성별 코드
    - `profileImage` (optional): 프로필 이미지 파일
- **응답 형식**:

```json
{
    "success": true,
    "message": "프로필이 성공적으로 수정되었습니다.",
    "user": {
        "id": 1,
        "loginId": "user123",
        "username": "수정된 사용자명",
        "email": "updated@example.com",
        "phoneNumber": "010-1234-5678",
        "address": "부산시 해운대구",
        "birthDate": "1990-01-01T00:00:00",
        "genderCode": "M",
        "role": "MEMBER",
        "roleCode": "MEMBER",
        "profileImage": "/images/upload/profiles/image.jpg",
        "profile_image": "/images/upload/profiles/image.jpg",
        "join_date": "2024-01-01T00:00:00"
    }
}
```

### 3. 사용자별 리뷰 목록 조회

- **엔드포인트**: `GET /api/users/{userId}/reviews`
- **설명**: 특정 사용자가 작성한 리뷰 목록 조회
- **경로 파라미터**:
    - `userId` (required): 사용자 ID
- **응답 형식**:

```json
{
    "success": true,
    "reviews": [
        {
            "id": 1,
            "title": "리뷰 제목",
            "content": "리뷰 내용",
            "rating": 5,
            "touristSpotId": 1,
            "spotTitle": "관광지명",
            "createdAt": "2024-01-01T00:00:00"
        }
    ],
    "totalElements": 10
}
```

### 4. 사용자가 좋아요 누른 리뷰 목록 조회

- **엔드포인트**: `GET /api/users/{userId}/liked-reviews`
- **설명**: 특정 사용자가 좋아요를 누른 리뷰 목록 조회
- **경로 파라미터**:
    - `userId` (required): 사용자 ID
- **응답 형식**:

```json
{
    "success": true,
    "reviews": [
        {
            "id": 1,
            "title": "리뷰 제목",
            "content": "리뷰 내용",
            "rating": 5,
            "touristSpotId": 1,
            "spotTitle": "관광지명",
            "createdAt": "2024-01-01T00:00:00"
        }
    ],
    "totalElements": 10
}
```

### 5. 사용자별 댓글 목록 조회

- **엔드포인트**: `GET /api/users/{userId}/comments`
- **설명**: 특정 사용자가 작성한 댓글 목록 조회
- **경로 파라미터**:
    - `userId` (required): 사용자 ID
- **응답 형식**:

```json
{
    "success": true,
    "comments": [
        {
            "id": 1,
            "content": "댓글 내용",
            "reviewId": 1,
            "reviewTitle": "리뷰 제목",
            "createdAt": "2024-01-01T00:00:00"
        }
    ],
    "totalElements": 10
}
```

### 6. 사용자가 좋아요 누른 관광지 목록 조회

- **엔드포인트**: `GET /api/users/{userId}/liked-spots`
- **설명**: 특정 사용자가 좋아요를 누른 관광지 목록 조회
- **경로 파라미터**:
    - `userId` (required): 사용자 ID
- **응답 형식**:

```json
{
    "success": true,
    "likes": [
        {
            "spotId": 1,
            "title": "관광지명",
            "description": "관광지 설명",
            "likedAt": "2024-01-01T00:00:00"
        }
    ]
}
```

- **비고**
    - 현재 응답은 `spotId/title/description/likedAt`를 반환합니다. (이미지 URL은 포함되지 않습니다.)

### 6-1. (헤더/개발용) 내 Role 변경

- **엔드포인트**: `POST /api/users/me/role`
- **설명**: 로그인 사용자의 `roleCode`를 변경합니다. (요구사항: `MEMBER` ↔ `ADMIN` 토글)
- **인증**: 필요(세션 로그인)
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "roleCode": "ADMIN"
}
```

- **응답 형식**:

```json
{
    "success": true,
    "message": "Role이 변경되었습니다.",
    "user": {
        "id": 1,
        "loginId": "user123",
        "username": "사용자명",
        "email": "user@example.com",
        "role": "ADMIN",
        "roleCode": "ADMIN",
        "profileImage": "/images/upload/profiles/image.jpg",
        "profile_image": "/images/upload/profiles/image.jpg",
        "join_date": "2024-01-01T00:00:00"
    }
}
```

---

## 관광지 API

### 1. 관광지 상세 정보 조회

- **엔드포인트**: `GET /api/tourist-spots/{id}`
- **설명**: 특정 관광지의 상세 정보 조회 (조회수 자동 증가)
- **경로 파라미터**:
    - `id` (required): 관광지 ID
- **쿼리 파라미터**:
    - `userRole` (optional): 사용자 역할 (ADMIN인 경우 비활성화된 카테고리도 접근 가능)
- **응답 형식**:

```json
{
    "id": 1,
    "title": "관광지명",
    "description": "관광지 설명",
    "linkUrl": "https://example.com",
    "categoryCode": "ATTRACTION",
    "categoryActive": true,
    "latitude": 35.1794,
    "longitude": 129.0756,
    "isActive": true,
    "viewCount": 100,
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00",
    "images": [
        {
            "id": 1,
            "imageUrl": "/images/upload/spots/image.jpg",
            "order": "2024-01-01T00:00:00"
        }
    ],
    "hashtags": ["해시태그1", "해시태그2"],
    "region": {
        "id": 1,
        "name": "해운대구",
        "areaCode": 26350
    }
}
```

### 2. 모든 관광지 조회 (지역별 그룹화)

- **엔드포인트**: `GET /api/tourist-spots`
- **설명**: 모든 활성화된 관광지를 지역별로 그룹화하여 조회
- **응답 형식**:

```json
{
    "regions": {
        "area01": {
            "name": "해운대구",
            "code": "26350",
            "spots": [
                {
                    "id": 1,
                    "title": "관광지명",
                    "description": "관광지 설명",
                    "hashtags": ["해시태그1", "해시태그2"],
                    "imageUrl": "/images/upload/spots/image.jpg",
                    "linkUrl": "https://example.com",
                    "category": "CULTURE",
                    "categoryCode": "CULTURE",
                    "categoryActive": true,
                    "isActive": true,
                    "viewCount": 100,
                    "ratingAvg": 4.2,
                    "ratingCount": 12
                }
            ]
        }
    }
}
```

- **비고**
    - `regions`는 **배열이 아니라 객체(Map)** 입니다.
    - 키(`area01`, `area02` ...)는 UI 편의를 위한 순번 키이며, 실제 행정 코드 값은 `code`(= `regions.area_code`)에 들어갑니다.

### 3. 사진 등록 신청

- **엔드포인트**: `POST /api/spot-requests/photo`
- **설명**: 관광지에 사진 추가 신청
- **요청 형식**: `multipart/form-data`
- **요청 파라미터**:
    - `spotId` (required): 관광지 ID
    - `userId` (required): 신청자 ID
    - `image` (required): 이미지 파일
    - `description` (optional): 사진 설명
- **응답 형식**:

```json
{
    "success": true,
    "message": "사진 등록 신청이 완료되었습니다. 관리자 검토 후 반영됩니다."
}
```

### 4. 관광지 추가 신청

- **엔드포인트**: `POST /api/spot-requests/spot`
- **설명**: 새로운 관광지 추가 신청
- **요청 형식**: `multipart/form-data`
- **요청 파라미터**:
    - `userId` (required): 신청자 ID
    - `spotTitle` (required): 관광지명
    - `regionId` (required): 지역 ID
    - `linkUrl` (optional): 링크 URL
    - `hashtags` (optional): 해시태그 (쉼표로 구분)
    - `description` (optional): 설명
    - `latitude` (optional): 위도
    - `longitude` (optional): 경도
    - `address` (optional): 주소
    - `image` (optional): 단일 이미지 파일
    - `images` (optional): 다중 이미지 파일
- **응답 형식**:

```json
{
    "success": true,
    "message": "관광지 추가 신청이 완료되었습니다. 관리자 검토 후 반영됩니다."
}
```

### 5. 관광지 정보 수정요청

- **엔드포인트**: `POST /api/spot-requests/edit`
- **설명**: 관광지 정보 수정 요청
- **요청 형식**: `multipart/form-data`
- **요청 파라미터**:
    - `spotId` (required): 관광지 ID
    - `userId` (required): 신청자 ID
    - `content` (required): 수정 요청 내용
    - `image` (optional): 참고 이미지 파일
- **응답 형식**:

```json
{
    "success": true,
    "message": "관광지 정보 수정요청이 완료되었습니다. 관리자 검토 후 반영됩니다."
}
```

### 6. 신청 취소

- **엔드포인트**: `DELETE /api/spot-requests/{requestId}?userId={userId}`
- **설명**: 사용자가 본인의 신청을 취소
- **경로 파라미터**:
    - `requestId` (required): 신청 ID
- **쿼리 파라미터**:
    - `userId` (required): 사용자 ID (본인 확인용)
- **응답 형식**:

```json
{
    "success": true,
    "message": "신청이 취소되었습니다."
}
```

---

## 지역 API

### 1. 전체 지역구 목록 조회

- **엔드포인트**: `GET /api/regions`
- **설명**: 모든 지역구 목록 조회
- **응답 형식**:

```json
[
    {
        "id": 1,
        "name": "해운대구",
        "areaCode": 26350
    },
    {
        "id": 2,
        "name": "중구",
        "areaCode": 26110
    }
]
```

### 2. 선택한 지역구들의 관광지 목록 조회

- **엔드포인트**: `GET /api/regions/spots?regionIds={regionId1}&regionIds={regionId2}`
- **설명**: 선택한 지역구들의 관광지 목록 조회
- **쿼리 파라미터**:
    - `regionIds` (required): 지역 ID 목록 (복수 가능)
- **응답 형식**:

```json
[
    {
        "spotId": 1,
        "spotTitle": "관광지명",
        "spotDescription": "관광지 설명",
        "imageUrl": "/images/upload/spots/image.jpg",
        "regionId": 1,
        "regionName": "해운대구"
    }
]
```

---

## 리뷰 API

### 1. 관광지별 리뷰 목록 조회

- **엔드포인트**: `GET /api/reviews?touristSpotId={spotId}&userId={userId}`
- **설명**: 특정 관광지의 리뷰 목록 조회
- **쿼리 파라미터**:
    - `touristSpotId` (required): 관광지 ID
    - `userId` (optional): 사용자 ID (제공 시 각 리뷰의 좋아요 여부 포함)
- **응답 형식**:

```json
{
    "success": true,
    "content": [
        {
            "id": 1,
            "title": "리뷰 제목",
            "content": "리뷰 내용",
            "rating": 5,
            "userId": 1,
            "username": "사용자명",
            "profileImage": "/images/upload/profiles/image.jpg",
            "touristSpotId": 1,
            "images": [
                {
                    "id": 1,
                    "imageUrl": "/images/upload/reviews/image.jpg"
                }
            ],
            "likeCount": 10,
            "isLiked": false,
            "createdAt": "2024-01-01T00:00:00",
            "updatedAt": "2024-01-01T00:00:00"
        }
    ],
    "totalElements": 10,
    "totalPages": 1,
    "currentPage": 0
}
```

### 2. 리뷰 작성

- **엔드포인트**: `POST /api/reviews`
- **설명**: 새로운 리뷰 작성
- **요청 형식**: `multipart/form-data` 또는 `application/json`
- **요청 파라미터 (multipart/form-data)**:
    - `touristSpotId` (required): 관광지 ID
    - `title` (required): 리뷰 제목
    - `content` (required): 리뷰 내용
    - `rating` (required): 평점 (1-5)
    - `userId` (required): 사용자 ID
    - `images` (optional): 이미지 파일 배열
- **요청 본문 (application/json)**:

```json
{
    "touristSpotId": 1,
    "title": "리뷰 제목",
    "content": "리뷰 내용",
    "rating": 5,
    "userId": 1
}
```

- **응답 형식**:

```json
{
    "success": true,
    "message": "리뷰가 성공적으로 등록되었습니다.",
    "review": {
        "id": 1,
        "title": "리뷰 제목",
        "content": "리뷰 내용",
        "rating": 5,
        "userId": 1,
        "touristSpotId": 1,
        "createdAt": "2024-01-01T00:00:00"
    }
}
```

### 3. 리뷰 수정

- **엔드포인트**: `PUT /api/reviews/{id}`
- **설명**: 기존 리뷰 수정
- **경로 파라미터**:
    - `id` (required): 리뷰 ID
- **요청 형식**: `multipart/form-data`
- **요청 파라미터**:
    - `userId` (required): 사용자 ID
    - `title` (required): 리뷰 제목
    - `content` (required): 리뷰 내용
    - `rating` (required): 평점 (1-5)
    - `deleteImageIds` (optional): 삭제할 이미지 ID 목록 (JSON 배열 문자열)
    - `images` (optional): 추가할 이미지 파일 배열
- **응답 형식**:

```json
{
    "success": true,
    "message": "리뷰가 성공적으로 수정되었습니다."
}
```

### 4. 리뷰 삭제

- **엔드포인트**: `DELETE /api/reviews/{id}?userId={userId}`
- **설명**: 리뷰 삭제
- **경로 파라미터**:
    - `id` (required): 리뷰 ID
- **쿼리 파라미터**:
    - `userId` (required): 사용자 ID
- **응답 형식**:

```json
{
    "success": true,
    "message": "리뷰가 성공적으로 삭제되었습니다."
}
```

### 5. 리뷰 신고

- **엔드포인트**: `POST /api/reviews/{reviewId}/report`
- **설명**: 부적절한 리뷰 신고
- **경로 파라미터**:
    - `reviewId` (required): 리뷰 ID
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "userId": 1,
    "reason": "신고 사유"
}
```

- **응답 형식**:

```json
{
    "success": true,
    "message": "신고가 접수되었습니다. 검토 후 조치하겠습니다."
}
```

---

## 댓글 API

### 1. 리뷰별 댓글 목록 조회

- **엔드포인트**: `GET /api/reviews/{reviewId}/comments`
- **설명**: 특정 리뷰의 댓글 목록 조회
- **경로 파라미터**:
    - `reviewId` (required): 리뷰 ID
- **응답 형식**:

```json
{
    "success": true,
    "comments": [
        {
            "id": 1,
            "content": "댓글 내용",
            "userId": 1,
            "username": "사용자명",
            "profileImage": "/images/upload/profiles/image.jpg",
            "reviewId": 1,
            "createdAt": "2024-01-01T00:00:00",
            "updatedAt": "2024-01-01T00:00:00"
        }
    ]
}
```

### 2. 댓글 작성

- **엔드포인트**: `POST /api/reviews/{reviewId}/comments`
- **설명**: 리뷰에 댓글 작성
- **경로 파라미터**:
    - `reviewId` (required): 리뷰 ID
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "userId": 1,
    "content": "댓글 내용"
}
```

- **응답 형식**:

```json
{
    "success": true,
    "message": "댓글이 성공적으로 등록되었습니다."
}
```

### 3. 댓글 수정

- **엔드포인트**: `PUT /api/comments/{commentId}`
- **설명**: 댓글 수정
- **경로 파라미터**:
    - `commentId` (required): 댓글 ID
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "userId": 1,
    "content": "수정된 댓글 내용"
}
```

- **응답 형식**:

```json
{
    "success": true,
    "message": "댓글이 성공적으로 수정되었습니다."
}
```

### 4. 댓글 삭제

- **엔드포인트**: `DELETE /api/comments/{commentId}`
- **설명**: 댓글 삭제
- **경로 파라미터**:
    - `commentId` (required): 댓글 ID
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "userId": 1
}
```

- **응답 형식**:

```json
{
    "success": true,
    "message": "댓글이 성공적으로 삭제되었습니다."
}
```

### 5. 댓글 신고

- **엔드포인트**: `POST /api/comments/{commentId}/report`
- **설명**: 부적절한 댓글 신고
- **경로 파라미터**:
    - `commentId` (required): 댓글 ID
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "userId": 1,
    "reason": "신고 사유"
}
```

- **응답 형식**:

```json
{
    "success": true,
    "message": "신고가 접수되었습니다. 검토 후 조치하겠습니다."
}
```

---

## 좋아요 API

### 1. 관광지 좋아요 상태 조회

- **엔드포인트**: `GET /api/tourist-spots/{spotId}/like?userId={userId}`
- **설명**: 특정 관광지의 좋아요 상태 및 개수 조회
- **경로 파라미터**:
    - `spotId` (required): 관광지 ID
- **쿼리 파라미터**:
    - `userId` (optional): 사용자 ID (제공 시 해당 사용자의 좋아요 여부 포함)
- **응답 형식**:

```json
{
    "liked": false,
    "likeCount": 10
}
```

### 2. 관광지 좋아요 토글

- **엔드포인트**: `POST /api/tourist-spots/{spotId}/like?userId={userId}`
- **설명**: 관광지 좋아요 추가/취소
- **경로 파라미터**:
    - `spotId` (required): 관광지 ID
- **쿼리 파라미터**:
    - `userId` (required): 사용자 ID
- **응답 형식**:

```json
{
    "liked": true,
    "likeCount": 11
}
```

### 3. 리뷰 좋아요 상태 조회

- **엔드포인트**: `GET /api/reviews/{reviewId}/like?userId={userId}`
- **설명**: 특정 리뷰의 좋아요 상태 및 개수 조회
- **경로 파라미터**:
    - `reviewId` (required): 리뷰 ID
- **쿼리 파라미터**:
    - `userId` (required): 사용자 ID
- **응답 형식**:

```json
{
    "success": true,
    "liked": false,
    "likeCount": 10
}
```

### 4. 리뷰 좋아요 토글

- **엔드포인트**: `POST /api/reviews/{reviewId}/like?userId={userId}`
- **설명**: 리뷰 좋아요 추가/취소
- **경로 파라미터**:
    - `reviewId` (required): 리뷰 ID
- **쿼리 파라미터**:
    - `userId` (required): 사용자 ID
- **응답 형식**:

```json
{
    "success": true,
    "liked": true,
    "likeCount": 11
}
```

---

## 검색 API

### 1. 통합 검색

- **엔드포인트**: `GET /api/search?q={keyword}`
- **설명**: 관광지, 리뷰 등 전체 검색
- **쿼리 파라미터**:
    - `q` (optional): 검색 키워드
- **응답 형식**:

```json
{
    "spots": [
        {
            "id": 1,
            "title": "관광지명",
            "description": "관광지 설명",
            "imageUrl": "/images/upload/spots/image.jpg"
        }
    ],
    "reviews": [
        {
            "id": 1,
            "title": "리뷰 제목",
            "content": "리뷰 내용",
            "touristSpotId": 1
        }
    ]
}
```

---

## 해시태그 API

### 1. 태그별 관광지 조회

- **엔드포인트**: `GET /api/tag-spots`
- **설명**: 모든 해시태그와 지역별로 그룹화된 관광지 목록 조회
- **응답 형식**:

```json
{
    "allHashtags": [
        {
            "id": 1,
            "name": "해시태그명"
        }
    ],
    "regions": [
        {
            "name": "해운대구",
            "spots": [
                {
                    "id": 1,
                    "title": "관광지명",
                    "description": "관광지 설명",
                    "imageUrl": "/images/upload/spots/image.jpg",
                    "categoryCode": "ATTRACTION",
                    "categoryActive": true,
                    "hashtags": ["해시태그1", "해시태그2"]
                }
            ]
        }
    ]
}
```

---

## 관리자 API

### 관광지 관리

#### 1. 관광지 목록 조회

- **엔드포인트**: `GET /api/admin/tourist-spots`
- **설명**: 모든 관광지 목록 조회 (관리자용)
- **응답 형식**:

```json
{
    "success": true,
    "spots": [
        {
            "id": 1,
            "regionId": 1,
            "title": "관광지명",
            "description": "관광지 설명",
            "linkUrl": "https://example.com",
            "categoryCode": "ATTRACTION",
            "isActive": true,
            "viewCount": 100,
            "createdAt": "2024-01-01T00:00:00",
            "updatedAt": "2024-01-01T00:00:00",
            "latitude": 35.1794,
            "longitude": 129.0756,
            "address": "부산시 해운대구",
            "hashtags": ["해시태그1", "해시태그2"]
        }
    ]
}
```

#### 2. 관광지 추가

- **엔드포인트**: `POST /api/admin/tourist-spots`
- **설명**: 새로운 관광지 추가
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "regionKey": "area01",
    "title": "관광지명",
    "description": "관광지 설명",
    "linkUrl": "https://example.com",
    "categoryCode": "ATTRACTION",
    "latitude": 35.1794,
    "longitude": 129.0756,
    "hashtags": ["해시태그1", "해시태그2"]
}
```

- **응답 형식**:

```json
{
    "success": true,
    "spot": {
        "id": 1,
        "title": "관광지명",
        "description": "관광지 설명"
    }
}
```

#### 3. 관광지 수정

- **엔드포인트**: `PUT /api/admin/tourist-spots/{spotId}`
- **설명**: 기존 관광지 정보 수정
- **경로 파라미터**:
    - `spotId` (required): 관광지 ID
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "regionKey": "area01",
    "title": "수정된 관광지명",
    "description": "수정된 관광지 설명",
    "linkUrl": "https://example.com",
    "categoryCode": "ATTRACTION",
    "latitude": 35.1794,
    "longitude": 129.0756,
    "hashtags": ["해시태그1", "해시태그2"]
}
```

- **응답 형식**:

```json
{
    "success": true,
    "spot": {
        "id": 1,
        "title": "수정된 관광지명"
    }
}
```

#### 4. 관광지 삭제

- **엔드포인트**: `DELETE /api/admin/tourist-spots/{spotId}`
- **설명**: 관광지 삭제
- **경로 파라미터**:
    - `spotId` (required): 관광지 ID
- **응답 형식**:

```json
{
    "success": true,
    "message": "관광지가 삭제되었습니다."
}
```

#### 5. 관광지 이미지 목록 조회

- **엔드포인트**: `GET /api/admin/tourist-spots/{spotId}/images`
- **설명**: 특정 관광지의 이미지 목록 조회
- **경로 파라미터**:
    - `spotId` (required): 관광지 ID
- **응답 형식**:

```json
{
    "success": true,
    "images": [
        {
            "id": 1,
            "imageUrl": "/images/upload/spots/image.jpg",
            "repImgYn": "Y",
            "regTime": "2024-01-01T00:00:00"
        }
    ]
}
```

#### 6. 관광지 이미지 추가

- **엔드포인트**: `POST /api/admin/tourist-spots/{spotId}/images`
- **설명**: 관광지에 이미지 추가
- **경로 파라미터**:
    - `spotId` (required): 관광지 ID
- **요청 형식**: `multipart/form-data`
- **요청 파라미터**:
    - `images` (required): 이미지 파일 배열
- **응답 형식**:

```json
{
    "success": true,
    "message": "이미지가 추가되었습니다."
}
```

#### 7. 관광지 이미지 삭제

- **엔드포인트**: `DELETE /api/admin/tourist-spots/images/{imageId}`
- **설명**: 관광지 이미지 삭제
- **경로 파라미터**:
    - `imageId` (required): 이미지 ID
- **응답 형식**:

```json
{
    "success": true,
    "message": "이미지가 삭제되었습니다."
}
```

#### 8. 대표 이미지 설정

- **엔드포인트**: `PUT /api/admin/tourist-spots/images/{imageId}/set-rep`
- **설명**: 관광지의 대표 이미지 설정
- **경로 파라미터**:
    - `imageId` (required): 이미지 ID
- **응답 형식**:

```json
{
    "success": true,
    "message": "대표 이미지가 설정되었습니다."
}
```

### 사용자 관리

#### 1. 사용자 목록 조회

- **엔드포인트**: `GET /api/admin/users`
- **설명**: 모든 사용자 목록 조회
- **응답 형식**:

```json
{
    "success": true,
    "users": [
        {
            "id": 1,
            "loginId": "user123",
            "username": "사용자명",
            "email": "user@example.com",
            "roleCode": "MEMBER",
            "statusCode": "ACTIVE"
        }
    ]
}
```

#### 2. 사용자 추가

- **엔드포인트**: `POST /api/admin/users`
- **설명**: 새로운 사용자 추가
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "loginId": "newuser",
    "password": "password123",
    "username": "새 사용자",
    "email": "newuser@example.com",
    "role": "MEMBER"
}
```

- **응답 형식**:

```json
{
    "success": true,
    "user": {
        "id": 1,
        "loginId": "newuser",
        "username": "새 사용자",
        "email": "newuser@example.com",
        "roleCode": "MEMBER",
        "statusCode": "ACTIVE"
    }
}
```

#### 3. 사용자 수정

- **엔드포인트**: `PUT /api/admin/users/{userId}`
- **설명**: 사용자 정보 수정
- **경로 파라미터**:
    - `userId` (required): 사용자 ID
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "username": "수정된 사용자명",
    "email": "updated@example.com",
    "role": "ADMIN",
    "status": "ACTIVE"
}
```

- **응답 형식**:

```json
{
    "success": true,
    "user": {
        "id": 1,
        "username": "수정된 사용자명",
        "email": "updated@example.com",
        "roleCode": "ADMIN",
        "statusCode": "ACTIVE"
    }
}
```

#### 4. 사용자 상태 변경

- **엔드포인트**: `PUT /api/admin/users/{userId}/status`
- **설명**: 사용자 상태 변경
- **경로 파라미터**:
    - `userId` (required): 사용자 ID
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "status": "SUSPENDED"
}
```

- **응답 형식**:

```json
{
    "success": true,
    "message": "사용자 상태가 변경되었습니다."
}
```

#### 5. 사용자 삭제

- **엔드포인트**: `DELETE /api/admin/users/{userId}`
- **설명**: 사용자 삭제
- **경로 파라미터**:
    - `userId` (required): 사용자 ID
- **응답 형식**:

```json
{
    "success": true,
    "message": "사용자가 삭제되었습니다."
}
```

### 공통코드 관리

#### 1. 코드 그룹 목록 조회

- **엔드포인트**: `GET /api/admin/common-code-groups`
- **설명**: 모든 코드 그룹 목록 조회
- **응답 형식**:

```json
{
    "success": true,
    "groups": [
        {
            "id": 1,
            "groupCode": "SPOT_CATEGORY",
            "groupName": "관광지 카테고리",
            "groupNameEn": "Spot Category",
            "groupNameJp": "観光地カテゴリ",
            "description": "관광지 카테고리 코드",
            "isActive": true,
            "sortOrder": 1
        }
    ]
}
```

#### 2. 코드 그룹 추가

- **엔드포인트**: `POST /api/admin/common-code-groups`
- **설명**: 새로운 코드 그룹 추가
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "groupCode": "SPOT_CATEGORY",
    "groupName": "관광지 카테고리",
    "groupNameEn": "Spot Category",
    "groupNameJp": "観光地カテゴリ",
    "description": "관광지 카테고리 코드",
    "isActive": true,
    "sortOrder": 1
}
```

- **응답 형식**:

```json
{
    "success": true,
    "group": {
        "id": 1,
        "groupCode": "SPOT_CATEGORY",
        "groupName": "관광지 카테고리"
    }
}
```

#### 3. 코드 그룹 수정

- **엔드포인트**: `PUT /api/admin/common-code-groups/{groupId}`
- **설명**: 코드 그룹 정보 수정
- **경로 파라미터**:
    - `groupId` (required): 코드 그룹 ID
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "groupName": "수정된 그룹명",
    "groupNameEn": "Updated Group Name",
    "groupNameJp": "更新されたグループ名",
    "description": "수정된 설명",
    "isActive": false,
    "sortOrder": 2
}
```

- **응답 형식**:

```json
{
    "success": true,
    "group": {
        "id": 1,
        "groupName": "수정된 그룹명"
    }
}
```

#### 4. 코드 그룹 삭제

- **엔드포인트**: `DELETE /api/admin/common-code-groups/{groupId}`
- **설명**: 코드 그룹 삭제
- **경로 파라미터**:
    - `groupId` (required): 코드 그룹 ID
- **응답 형식**:

```json
{
    "success": true,
    "message": "코드 그룹이 삭제되었습니다."
}
```

#### 5. 코드 목록 조회

- **엔드포인트**: `GET /api/admin/common-codes?groupCode={groupCode}`
- **설명**: 코드 목록 조회 (그룹별 필터링 가능)
- **쿼리 파라미터**:
    - `groupCode` (optional): 코드 그룹 코드
- **응답 형식**:

```json
{
    "success": true,
    "codes": [
        {
            "id": 1,
            "groupCode": "SPOT_CATEGORY",
            "code": "ATTRACTION",
            "codeName": "명소",
            "codeNameEn": "Attraction",
            "codeNameJp": "名所",
            "description": "관광 명소",
            "isActive": true,
            "sortOrder": 1,
            "extraData": null
        }
    ]
}
```

#### 6. 코드 추가

- **엔드포인트**: `POST /api/admin/common-codes`
- **설명**: 새로운 코드 추가
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "groupCode": "SPOT_CATEGORY",
    "code": "ATTRACTION",
    "codeName": "명소",
    "codeNameEn": "Attraction",
    "codeNameJp": "名所",
    "description": "관광 명소",
    "isActive": true,
    "sortOrder": 1,
    "extraData": null
}
```

- **응답 형식**:

```json
{
    "success": true,
    "code": {
        "id": 1,
        "code": "ATTRACTION",
        "codeName": "명소"
    }
}
```

#### 7. 코드 수정

- **엔드포인트**: `PUT /api/admin/common-codes/{codeId}`
- **설명**: 코드 정보 수정
- **경로 파라미터**:
    - `codeId` (required): 코드 ID
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "codeName": "수정된 코드명",
    "codeNameEn": "Updated Code Name",
    "codeNameJp": "更新されたコード名",
    "description": "수정된 설명",
    "isActive": false,
    "sortOrder": 2,
    "extraData": "추가 데이터"
}
```

- **응답 형식**:

```json
{
    "success": true,
    "code": {
        "id": 1,
        "codeName": "수정된 코드명"
    }
}
```

#### 8. 코드 삭제

- **엔드포인트**: `DELETE /api/admin/common-codes/{codeId}`
- **설명**: 코드 삭제
- **경로 파라미터**:
    - `codeId` (required): 코드 ID
- **응답 형식**:

```json
{
    "success": true,
    "message": "코드가 삭제되었습니다."
}
```

### 신청 관리

#### 1. 사진/관광지 추가 신청 목록 조회

- **엔드포인트**: `GET /api/admin/spot-requests`
- **설명**: 모든 사진 추가 및 관광지 추가 신청 목록 조회
- **응답 형식**:

```json
{
    "success": true,
    "requests": [
        {
            "id": 1,
            "userId": 1,
            "type": "photo",
            "applicantId": 1,
            "applicantName": "사용자명",
            "spotId": 1,
            "spotName": "관광지명",
            "imageUrl": "/images/upload/spots/image.jpg",
            "description": "신청 설명",
            "status": "pending",
            "rejectReason": null,
            "createdAt": "2024-01-01T00:00:00",
            "regionId": 1,
            "regionName": "해운대구",
            "linkUrl": "https://example.com",
            "hashtags": "해시태그1, 해시태그2",
            "latitude": 35.1794,
            "longitude": 129.0756,
            "address": "부산시 해운대구"
        }
    ]
}
```

#### 2. 사진 추가 신청 승인

- **엔드포인트**: `PUT /api/admin/spot-requests/{requestId}/approve`
- **설명**: 사진 추가 신청 승인 (사진을 관광지에 추가)
- **경로 파라미터**:
    - `requestId` (required): 신청 ID
- **응답 형식**:

```json
{
    "success": true,
    "message": "신청이 승인되었습니다."
}
```

#### 3. 사진 추가 신청 거부

- **엔드포인트**: `PUT /api/admin/spot-requests/{requestId}/reject`
- **설명**: 사진 추가 신청 거부
- **경로 파라미터**:
    - `requestId` (required): 신청 ID
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "reason": "거부 사유"
}
```

- **응답 형식**:

```json
{
    "success": true,
    "message": "신청이 거부되었습니다."
}
```

#### 4. 사진/관광지 추가 신청 삭제

- **엔드포인트**: `DELETE /api/admin/spot-requests/{requestId}`
- **설명**: 신청 삭제
- **경로 파라미터**:
    - `requestId` (required): 신청 ID
- **응답 형식**:

```json
{
    "success": true,
    "message": "신청이 삭제되었습니다."
}
```

### 신고 관리

#### 1. 신고 목록 조회

- **엔드포인트**: `GET /api/admin/user-reports`
- **설명**: 모든 리뷰 및 댓글 신고 목록 조회
- **응답 형식**:

```json
{
    "success": true,
    "reports": [
        {
            "id": 1,
            "reportType": "review",
            "reporterId": 1,
            "reporterName": "신고자명",
            "reportedUserId": 2,
            "reportedUserName": "신고당한 사용자명",
            "reviewId": 1,
            "reviewTitle": "리뷰 제목",
            "reviewContent": "리뷰 내용",
            "commentId": null,
            "commentContent": null,
            "reason": "신고 사유",
            "status": "pending",
            "type": "spam",
            "createdAt": "2024-01-01T00:00:00",
            "updatedAt": "2024-01-01T00:00:00"
        }
    ]
}
```

#### 2. 신고 처리

- **엔드포인트**: `POST /api/admin/reports/{reportId}/process`
- **설명**: 신고 처리 (처벌 적용)
- **경로 파라미터**:
    - `reportId` (required): 신고 ID
- **요청 형식**: `application/json`
- **요청 본문**:

```json
{
    "action": "resolved",
    "reportType": "review",
    "reportedUserId": 2,
    "penaltyType": "temp_ban_7",
    "deleteContent": true
}
```

- **penaltyType 옵션**:
    - `warning`: 경고
    - `content_delete`: 콘텐츠 삭제
    - `temp_ban_1`: 1일 정지
    - `temp_ban_3`: 3일 정지
    - `temp_ban_7`: 7일 정지
    - `temp_ban_30`: 30일 정지
    - `permanent_ban`: 영구 정지
- **응답 형식**:

```json
{
    "success": true,
    "message": "신고가 처리되었습니다."
}
```

#### 3. 신고 삭제

- **엔드포인트**: `DELETE /api/admin/reports/{reportId}`
- **설명**: 신고 기록 삭제
- **경로 파라미터**:
    - `reportId` (required): 신고 ID
- **요청 형식**: `application/json` (optional)
- **요청 본문**:

```json
{
    "reportType": "review"
}
```

- **응답 형식**:

```json
{
    "success": true,
    "message": "신고 기록이 삭제되었습니다."
}
```

---

## 공통 응답 형식

### 성공 응답

대부분의 API는 다음과 같은 공통 형식을 사용합니다:

```json
{
  "success": true,
  "message": "성공 메시지",
  "data": { ... }
}
```

### 에러 응답

```json
{
    "success": false,
    "message": "에러 메시지"
}
```

### HTTP 상태 코드

- `200 OK`: 요청 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 필요
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

## 참고 사항

1. **인증**: 대부분의 API는 세션 기반 인증을 사용합니다. 로그인 후 세션에 사용자 정보가 저장됩니다.
    - 일반 로그인: 아이디/비밀번호 기반
    - 소셜 로그인: OAuth2 기반 (카카오, 구글)

2. **소셜 로그인 (OAuth2)**:
    - 카카오 로그인: `/oauth2/authorization/kakao`
    - 구글 로그인: `/oauth2/authorization/google`
    - 소셜 로그인 시 자동 회원가입 처리 (이메일 기반)
    - 로그인 타입 코드: `KAKAO`, `GOOGLE`, `NORMAL`
    - 환경 변수 설정 필요:
        - 카카오: `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `KAKAO_REDIRECT_URI`
        - 구글: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`

3. **파일 업로드**: 이미지 업로드가 필요한 API는 `multipart/form-data` 형식을 사용합니다.

4. **권한**: 관리자 API(`/api/admin/*`)는 관리자 권한이 필요합니다.

5. **날짜 형식**: 날짜는 ISO 8601 형식(`YYYY-MM-DDTHH:mm:ss`)을 사용합니다.

6. **지역 코드/키**:
    - `GET /api/regions`의 `areaCode`는 **행정 코드(숫자)** 입니다. (DB `regions.area_code`)
    - `GET /api/tourist-spots`의 `regions`는 UI 편의를 위해 `area01`, `area02` 같은 **순번 키**를 사용하며, 실제 행정 코드는 각 지역 객체의 `code` 필드에 담깁니다.

7. **카테고리 코드**: 관광지 카테고리는 공통코드의 `SPOT_CATEGORY` 그룹에서 관리됩니다.

8. **상태 코드**:
    - 사용자 상태: `ACTIVE`, `SUSPENDED`, `INACTIVE`
    - 신청 상태: `pending`, `approved`, `rejected`
    - 신고 상태: `pending`, `resolved`, `rejected`
