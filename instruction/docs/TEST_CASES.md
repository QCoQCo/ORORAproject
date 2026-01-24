# ORORA 프로젝트 테스트케이스 문서

## 목차
1. [인증 API 테스트케이스](#1-인증-api-테스트케이스)
2. [사용자 API 테스트케이스](#2-사용자-api-테스트케이스)
3. [관광지 API 테스트케이스](#3-관광지-api-테스트케이스)
4. [지역 API 테스트케이스](#4-지역-api-테스트케이스)
5. [리뷰 API 테스트케이스](#5-리뷰-api-테스트케이스)
6. [댓글 API 테스트케이스](#6-댓글-api-테스트케이스)
7. [좋아요 API 테스트케이스](#7-좋아요-api-테스트케이스)
8. [검색 API 테스트케이스](#8-검색-api-테스트케이스)
9. [해시태그 API 테스트케이스](#9-해시태그-api-테스트케이스)
10. [관리자 API 테스트케이스](#10-관리자-api-테스트케이스)

---

## 1. 인증 API 테스트케이스

### 1.1 로그인

#### TC-AUTH-001: 정상 로그인
- **목적**: 유효한 아이디와 비밀번호로 로그인 성공
- **전제조건**: 회원가입된 사용자 존재
- **입력 데이터**:
  ```json
  {
    "loginId": "testuser",
    "password": "password123",
    "keepLogin": false,
    "saveId": false
  }
  ```
- **예상 결과**:
  - HTTP 상태 코드: 200
  - 응답에 사용자 정보 포함
  - 세션에 사용자 정보 저장
  - `success: true`

#### TC-AUTH-002: 잘못된 비밀번호로 로그인 실패
- **목적**: 존재하는 아이디이지만 비밀번호가 틀린 경우
- **전제조건**: 회원가입된 사용자 존재
- **입력 데이터**:
  ```json
  {
    "loginId": "testuser",
    "password": "wrongpassword",
    "keepLogin": false,
    "saveId": false
  }
  ```
- **예상 결과**:
  - HTTP 상태 코드: 401 또는 400
  - `success: false`
  - 에러 메시지: "아이디 또는 비밀번호가 올바르지 않습니다."

#### TC-AUTH-003: 존재하지 않는 아이디로 로그인 실패
- **목적**: 존재하지 않는 아이디로 로그인 시도
- **입력 데이터**:
  ```json
  {
    "loginId": "nonexistent",
    "password": "password123",
    "keepLogin": false,
    "saveId": false
  }
  ```
- **예상 결과**:
  - HTTP 상태 코드: 401 또는 400
  - `success: false`
  - 에러 메시지: "아이디 또는 비밀번호가 올바르지 않습니다."

#### TC-AUTH-004: 필수 필드 누락
- **목적**: 필수 필드(loginId, password) 누락 시도
- **입력 데이터**:
  ```json
  {
    "loginId": "",
    "password": "password123"
  }
  ```
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "아이디를 입력해주세요."

#### TC-AUTH-005: 로그인 상태 유지 옵션
- **목적**: keepLogin 옵션 활성화 시 세션 유지 시간 연장
- **입력 데이터**:
  ```json
  {
    "loginId": "testuser",
    "password": "password123",
    "keepLogin": true,
    "saveId": false
  }
  ```
- **예상 결과**:
  - HTTP 상태 코드: 200
  - 세션 만료 시간이 연장됨
  - `success: true`

### 1.2 회원가입

#### TC-AUTH-006: 정상 회원가입
- **목적**: 모든 필수 정보를 올바르게 입력하여 회원가입 성공
- **입력 데이터** (multipart/form-data):
  - `loginId`: "newuser"
  - `password`: "password123"
  - `username`: "홍길동"
  - `email`: "newuser@example.com"
  - `phoneNumber`: "010-1234-5678" (선택)
  - `address`: "부산시 해운대구" (선택)
  - `birthDate`: "1990-01-01" (선택)
  - `genderCode`: "M" (선택)
  - `profileImage`: 이미지 파일 (선택)
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "회원가입이 완료되었습니다!"

#### TC-AUTH-007: 아이디 중복으로 회원가입 실패
- **목적**: 이미 존재하는 아이디로 회원가입 시도
- **전제조건**: 동일한 loginId를 가진 사용자 존재
- **입력 데이터**:
  - `loginId`: "existinguser"
  - `password`: "password123"
  - `username`: "홍길동"
  - `email`: "new@example.com"
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "이미 사용 중인 아이디입니다."

#### TC-AUTH-008: 이메일 중복으로 회원가입 실패
- **목적**: 이미 존재하는 이메일로 회원가입 시도
- **전제조건**: 동일한 email을 가진 사용자 존재
- **입력 데이터**:
  - `loginId`: "newuser"
  - `password`: "password123"
  - `username`: "홍길동"
  - `email`: "existing@example.com"
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "이미 사용 중인 이메일입니다."

#### TC-AUTH-009: 아이디 길이 제한 위반
- **목적**: 아이디가 4자 미만 또는 20자 초과
- **입력 데이터**:
  - `loginId`: "abc" (3자)
  - `password`: "password123"
  - `username`: "홍길동"
  - `email`: "test@example.com"
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "아이디는 4자 이상 20자 이하로 입력해주세요."

#### TC-AUTH-010: 비밀번호 길이 제한 위반
- **목적**: 비밀번호가 6자 미만 또는 15자 초과
- **입력 데이터**:
  - `loginId`: "newuser"
  - `password`: "12345" (5자)
  - `username`: "홍길동"
  - `email`: "test@example.com"
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "비밀번호는 6자 이상 15자 이하로 입력해주세요."

#### TC-AUTH-011: 이메일 형식 오류
- **목적**: 잘못된 이메일 형식 입력
- **입력 데이터**:
  - `loginId`: "newuser"
  - `password`: "password123"
  - `username`: "홍길동"
  - `email`: "invalid-email"
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "이메일 형식에 맞지 않습니다."

#### TC-AUTH-012: 필수 필드 누락
- **목적**: 필수 필드(loginId, password, username, email) 누락
- **입력 데이터**:
  - `loginId`: ""
  - `password`: "password123"
  - `username`: ""
  - `email`: "test@example.com"
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "아이디는 필수 입력 값입니다." 또는 "이름은 필수 입력 값입니다."

### 1.3 아이디 중복 체크

#### TC-AUTH-013: 사용 가능한 아이디 확인
- **목적**: 중복되지 않는 아이디 확인
- **입력 데이터**: `GET /api/auth/check-id?userId=newuser`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `available: true`
  - 메시지: "사용 가능한 아이디입니다."

#### TC-AUTH-014: 중복된 아이디 확인
- **목적**: 이미 사용 중인 아이디 확인
- **전제조건**: 해당 아이디를 가진 사용자 존재
- **입력 데이터**: `GET /api/auth/check-id?userId=existinguser`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `available: false`
  - 메시지: "이미 사용 중인 아이디입니다."

### 1.4 로그인 상태 확인

#### TC-AUTH-015: 로그인 상태 확인 (로그인됨)
- **목적**: 로그인된 사용자의 상태 확인
- **전제조건**: 세션에 사용자 정보 존재
- **입력 데이터**: `GET /api/auth/check`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - `loggedIn: true`
  - 사용자 정보 포함

#### TC-AUTH-016: 로그인 상태 확인 (로그인 안됨)
- **목적**: 로그인하지 않은 사용자의 상태 확인
- **전제조건**: 세션에 사용자 정보 없음
- **입력 데이터**: `GET /api/auth/check`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - `loggedIn: false`
  - 사용자 정보 없음

### 1.5 로그아웃

#### TC-AUTH-017: 정상 로그아웃
- **목적**: 로그인된 사용자의 로그아웃 처리
- **전제조건**: 로그인된 상태
- **입력 데이터**: `POST /api/auth/logout`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "로그아웃되었습니다."
  - 세션 무효화

### 1.6 아이디 찾기

#### TC-AUTH-018: 정상 아이디 찾기 (사용자명과 이메일로)
- **목적**: 등록된 사용자명과 이메일로 아이디 찾기
- **전제조건**: 해당 정보로 가입된 사용자 존재
- **입력 데이터**:
  ```json
  {
    "username": "홍길동",
    "email": "test@example.com"
  }
  ```
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - `loginId`: 찾은 아이디
  - 메시지: "아이디를 찾았습니다."

#### TC-AUTH-019: 존재하지 않는 정보로 아이디 찾기 실패
- **목적**: 등록되지 않은 사용자명/이메일로 아이디 찾기
- **입력 데이터**:
  ```json
  {
    "username": "존재하지않음",
    "email": "nonexistent@example.com"
  }
  ```
- **예상 결과**:
  - HTTP 상태 코드: 404 또는 400
  - `success: false`
  - 에러 메시지: "일치하는 사용자 정보를 찾을 수 없습니다."

#### TC-AUTH-020: 필수 필드 누락 (아이디 찾기)
- **목적**: username 또는 email 누락
- **입력 데이터**:
  ```json
  {
    "username": "",
    "email": "test@example.com"
  }
  ```
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "사용자명 또는 이메일을 입력해주세요."

### 1.7 비밀번호 재설정

#### TC-AUTH-021: 정상 비밀번호 재설정
- **목적**: 존재하는 아이디로 비밀번호 재설정
- **전제조건**: 해당 아이디를 가진 사용자 존재
- **입력 데이터**:
  ```json
  {
    "loginId": "testuser",
    "newPassword": "newpassword123"
  }
  ```
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "비밀번호가 성공적으로 재설정되었습니다."

#### TC-AUTH-022: 존재하지 않는 아이디로 비밀번호 재설정 실패
- **목적**: 존재하지 않는 아이디로 비밀번호 재설정 시도
- **입력 데이터**:
  ```json
  {
    "loginId": "nonexistent",
    "newPassword": "newpassword123"
  }
  ```
- **예상 결과**:
  - HTTP 상태 코드: 404 또는 400
  - `success: false`
  - 에러 메시지: "해당 아이디를 찾을 수 없습니다."

#### TC-AUTH-023: 비밀번호 길이 제한 위반 (재설정)
- **목적**: 새 비밀번호가 6자 미만 또는 15자 초과
- **입력 데이터**:
  ```json
  {
    "loginId": "testuser",
    "newPassword": "12345"
  }
  ```
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "비밀번호는 6자 이상 15자 이하로 입력해주세요."

### 1.8 소셜 로그인 (OAuth2)

#### TC-AUTH-024: 카카오 로그인 성공
- **목적**: 카카오 OAuth2 인증을 통한 로그인 성공
- **전제조건**: 
  - 카카오 개발자 콘솔 설정 완료
  - 환경 변수 설정 완료
- **입력 데이터**: `GET /oauth2/authorization/kakao`
- **예상 결과**:
  - 카카오 인증 페이지로 리다이렉트
  - 인증 후 콜백 처리
  - 자동 회원가입 또는 로그인 처리
  - 메인 페이지로 리다이렉트
  - 세션에 사용자 정보 저장

#### TC-AUTH-025: 구글 로그인 성공
- **목적**: 구글 OAuth2 인증을 통한 로그인 성공
- **전제조건**: 
  - Google Cloud Console 설정 완료
  - 환경 변수 설정 완료
- **입력 데이터**: `GET /oauth2/authorization/google`
- **예상 결과**:
  - 구글 인증 페이지로 리다이렉트
  - 인증 후 콜백 처리
  - 자동 회원가입 또는 로그인 처리
  - 메인 페이지로 리다이렉트
  - 세션에 사용자 정보 저장

#### TC-AUTH-026: 소셜 로그인 환경 변수 미설정
- **목적**: OAuth2 클라이언트 정보가 설정되지 않은 경우
- **전제조건**: 환경 변수 미설정
- **입력 데이터**: `GET /oauth2/authorization/kakao`
- **예상 결과**:
  - HTTP 상태 코드: 500 또는 400
  - 에러 메시지: "OAuth2 설정이 올바르지 않습니다."

---

## 2. 사용자 API 테스트케이스

### 2.1 사용자 정보 조회

#### TC-USER-001: 정상 사용자 정보 조회
- **목적**: 존재하는 사용자 ID로 정보 조회
- **전제조건**: 해당 ID를 가진 사용자 존재
- **입력 데이터**: `GET /api/users/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 사용자 상세 정보 포함 (id, loginId, username, email 등)

#### TC-USER-002: 존재하지 않는 사용자 조회
- **목적**: 존재하지 않는 사용자 ID로 조회
- **입력 데이터**: `GET /api/users/99999`
- **예상 결과**:
  - HTTP 상태 코드: 404
  - `success: false`
  - 에러 메시지: "사용자를 찾을 수 없습니다."

### 2.2 프로필 수정

#### TC-USER-003: 정상 프로필 수정
- **목적**: 본인의 프로필 정보 수정
- **전제조건**: 로그인된 상태, 본인 계정
- **입력 데이터** (multipart/form-data):
  - `username`: "수정된 이름"
  - `email`: "updated@example.com"
  - `phoneNumber`: "010-9876-5432"
  - `address`: "부산시 중구"
  - `birthDate`: "1995-05-15"
  - `genderCode`: "F"
  - `profileImage`: 이미지 파일 (선택)
- **입력 데이터**: `PUT /api/users/1/profile`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "프로필이 성공적으로 수정되었습니다."
  - 수정된 사용자 정보 반환

#### TC-USER-004: 타인의 프로필 수정 시도 (권한 없음)
- **목적**: 다른 사용자의 프로필 수정 시도
- **전제조건**: 로그인된 상태, 다른 사용자 ID
- **입력 데이터**: `PUT /api/users/2/profile` (본인 ID는 1)
- **예상 결과**:
  - HTTP 상태 코드: 403
  - `success: false`
  - 에러 메시지: "본인의 프로필만 수정할 수 있습니다."

#### TC-USER-005: 로그인하지 않은 상태에서 프로필 수정 시도
- **목적**: 비로그인 상태에서 프로필 수정 시도
- **전제조건**: 로그인하지 않은 상태
- **입력 데이터**: `PUT /api/users/1/profile`
- **예상 결과**:
  - HTTP 상태 코드: 401
  - `success: false`
  - 에러 메시지: "로그인이 필요합니다."

#### TC-USER-006: 이메일 형식 오류 (프로필 수정)
- **목적**: 잘못된 이메일 형식으로 수정 시도
- **입력 데이터**:
  - `email`: "invalid-email"
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "이메일 형식에 맞지 않습니다."

### 2.3 사용자별 리뷰 목록 조회

#### TC-USER-007: 정상 리뷰 목록 조회
- **목적**: 특정 사용자가 작성한 리뷰 목록 조회
- **전제조건**: 해당 사용자가 작성한 리뷰 존재
- **입력 데이터**: `GET /api/users/1/reviews`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 리뷰 목록 배열
  - `totalElements`: 전체 개수

#### TC-USER-008: 리뷰가 없는 사용자의 리뷰 목록 조회
- **목적**: 리뷰를 작성하지 않은 사용자의 리뷰 목록 조회
- **입력 데이터**: `GET /api/users/1/reviews`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 빈 배열 반환
  - `totalElements: 0`

### 2.4 사용자가 좋아요 누른 리뷰 목록 조회

#### TC-USER-009: 정상 좋아요한 리뷰 목록 조회
- **목적**: 특정 사용자가 좋아요를 누른 리뷰 목록 조회
- **전제조건**: 해당 사용자가 좋아요를 누른 리뷰 존재
- **입력 데이터**: `GET /api/users/1/liked-reviews`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 좋아요한 리뷰 목록 배열
  - `totalElements`: 전체 개수

### 2.5 사용자별 댓글 목록 조회

#### TC-USER-010: 정상 댓글 목록 조회
- **목적**: 특정 사용자가 작성한 댓글 목록 조회
- **전제조건**: 해당 사용자가 작성한 댓글 존재
- **입력 데이터**: `GET /api/users/1/comments`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 댓글 목록 배열
  - `totalElements`: 전체 개수

### 2.6 사용자가 좋아요 누른 관광지 목록 조회

#### TC-USER-011: 정상 좋아요한 관광지 목록 조회
- **목적**: 특정 사용자가 좋아요를 누른 관광지 목록 조회
- **전제조건**: 해당 사용자가 좋아요를 누른 관광지 존재
- **입력 데이터**: `GET /api/users/1/liked-spots`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 좋아요한 관광지 목록 배열

---

## 3. 관광지 API 테스트케이스

### 3.1 관광지 상세 정보 조회

#### TC-SPOT-001: 정상 관광지 상세 정보 조회
- **목적**: 존재하는 관광지의 상세 정보 조회
- **전제조건**: 해당 ID를 가진 관광지 존재
- **입력 데이터**: `GET /api/tourist-spots/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - 관광지 상세 정보 포함 (title, description, images, hashtags, region 등)
  - 조회수(viewCount) 증가

#### TC-SPOT-002: 존재하지 않는 관광지 조회
- **목적**: 존재하지 않는 관광지 ID로 조회
- **입력 데이터**: `GET /api/tourist-spots/99999`
- **예상 결과**:
  - HTTP 상태 코드: 404
  - 에러 메시지: "관광지를 찾을 수 없습니다."

#### TC-SPOT-003: 비활성화된 관광지 조회 (일반 사용자)
- **목적**: 비활성화된 관광지 조회 시도 (일반 사용자)
- **전제조건**: isActive=false인 관광지 존재
- **입력 데이터**: `GET /api/tourist-spots/1`
- **예상 결과**:
  - HTTP 상태 코드: 404 또는 403
  - 에러 메시지: "관광지를 찾을 수 없습니다."

#### TC-SPOT-004: 비활성화된 관광지 조회 (관리자)
- **목적**: 비활성화된 관광지 조회 (관리자 권한)
- **전제조건**: 관리자 권한, isActive=false인 관광지 존재
- **입력 데이터**: `GET /api/tourist-spots/1?userRole=ADMIN`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - 관광지 정보 반환 (비활성화 상태 포함)

### 3.2 모든 관광지 조회 (지역별 그룹화)

#### TC-SPOT-005: 정상 관광지 목록 조회
- **목적**: 모든 활성화된 관광지를 지역별로 그룹화하여 조회
- **입력 데이터**: `GET /api/tourist-spots`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - 지역별로 그룹화된 관광지 목록
  - 각 지역에 속한 관광지 배열

#### TC-SPOT-006: 관광지가 없는 경우
- **목적**: 등록된 관광지가 없는 경우
- **전제조건**: 활성화된 관광지 없음
- **입력 데이터**: `GET /api/tourist-spots`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - 빈 배열 또는 빈 지역 그룹 반환

### 3.3 사진 등록 신청

#### TC-SPOT-007: 정상 사진 등록 신청
- **목적**: 관광지에 사진 추가 신청
- **전제조건**: 로그인된 상태, 존재하는 관광지
- **입력 데이터** (multipart/form-data):
  - `spotId`: 1
  - `userId`: 1
  - `image`: 이미지 파일
  - `description`: "사진 설명" (선택)
- **입력 데이터**: `POST /api/spot-requests/photo`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "사진 등록 신청이 완료되었습니다. 관리자 검토 후 반영됩니다."

#### TC-SPOT-008: 필수 필드 누락 (사진 등록 신청)
- **목적**: spotId 또는 userId 누락
- **입력 데이터**:
  - `userId`: 1
  - `image`: 이미지 파일
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "관광지 ID가 필요합니다."

#### TC-SPOT-009: 존재하지 않는 관광지에 사진 등록 신청
- **목적**: 존재하지 않는 관광지 ID로 신청
- **입력 데이터**:
  - `spotId`: 99999
  - `userId`: 1
  - `image`: 이미지 파일
- **예상 결과**:
  - HTTP 상태 코드: 404
  - `success: false`
  - 에러 메시지: "관광지를 찾을 수 없습니다."

#### TC-SPOT-010: 이미지 파일이 아닌 파일 업로드
- **목적**: 이미지가 아닌 파일 업로드 시도
- **입력 데이터**:
  - `spotId`: 1
  - `userId`: 1
  - `image`: document.pdf
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "이미지 파일만 업로드 가능합니다."

### 3.4 관광지 추가 신청

#### TC-SPOT-011: 정상 관광지 추가 신청
- **목적**: 새로운 관광지 추가 신청
- **전제조건**: 로그인된 상태
- **입력 데이터** (multipart/form-data):
  - `userId`: 1
  - `spotTitle`: "새로운 관광지"
  - `regionId`: 1
  - `linkUrl`: "https://example.com" (선택)
  - `hashtags`: "해시태그1, 해시태그2" (선택)
  - `description`: "관광지 설명" (선택)
  - `latitude`: 35.1794 (선택)
  - `longitude`: 129.0756 (선택)
  - `address`: "부산시 해운대구" (선택)
  - `image`: 이미지 파일 (선택)
- **입력 데이터**: `POST /api/spot-requests/spot`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "관광지 추가 신청이 완료되었습니다. 관리자 검토 후 반영됩니다."

#### TC-SPOT-012: 필수 필드 누락 (관광지 추가 신청)
- **목적**: spotTitle 또는 regionId 누락
- **입력 데이터**:
  - `userId`: 1
  - `regionId`: 1
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "관광지명을 입력해주세요."

#### TC-SPOT-013: 존재하지 않는 지역 ID로 신청
- **목적**: 존재하지 않는 regionId로 신청
- **입력 데이터**:
  - `userId`: 1
  - `spotTitle`: "새로운 관광지"
  - `regionId`: 99999
- **예상 결과**:
  - HTTP 상태 코드: 404
  - `success: false`
  - 에러 메시지: "지역을 찾을 수 없습니다."

### 3.5 관광지 정보 수정요청

#### TC-SPOT-014: 정상 관광지 정보 수정요청
- **목적**: 기존 관광지 정보 수정 요청
- **전제조건**: 로그인된 상태, 존재하는 관광지
- **입력 데이터** (multipart/form-data):
  - `spotId`: 1
  - `userId`: 1
  - `content`: "수정 요청 내용"
  - `image`: 참고 이미지 파일 (선택)
- **입력 데이터**: `POST /api/spot-requests/edit`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "관광지 정보 수정요청이 완료되었습니다. 관리자 검토 후 반영됩니다."

#### TC-SPOT-015: 필수 필드 누락 (수정요청)
- **목적**: content 누락
- **입력 데이터**:
  - `spotId`: 1
  - `userId`: 1
  - `content`: ""
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "수정 요청 내용을 입력해주세요."

### 3.6 신청 취소

#### TC-SPOT-016: 정상 신청 취소
- **목적**: 본인이 신청한 내용 취소
- **전제조건**: 로그인된 상태, 본인이 신청한 요청 존재
- **입력 데이터**: `DELETE /api/spot-requests/1?userId=1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "신청이 취소되었습니다."

#### TC-SPOT-017: 타인의 신청 취소 시도
- **목적**: 다른 사용자가 신청한 내용 취소 시도
- **전제조건**: 다른 사용자가 신청한 요청
- **입력 데이터**: `DELETE /api/spot-requests/1?userId=2` (신청자는 userId=1)
- **예상 결과**:
  - HTTP 상태 코드: 403
  - `success: false`
  - 에러 메시지: "본인의 신청만 취소할 수 있습니다."

#### TC-SPOT-018: 존재하지 않는 신청 취소
- **목적**: 존재하지 않는 신청 ID로 취소 시도
- **입력 데이터**: `DELETE /api/spot-requests/99999?userId=1`
- **예상 결과**:
  - HTTP 상태 코드: 404
  - `success: false`
  - 에러 메시지: "신청을 찾을 수 없습니다."

---

## 4. 지역 API 테스트케이스

### 4.1 전체 지역구 목록 조회

#### TC-REGION-001: 정상 지역구 목록 조회
- **목적**: 모든 지역구 목록 조회
- **입력 데이터**: `GET /api/regions`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - 지역구 목록 배열 (id, name, areaCode 포함)

#### TC-REGION-002: 지역구가 없는 경우
- **목적**: 등록된 지역구가 없는 경우
- **전제조건**: 지역구 데이터 없음
- **입력 데이터**: `GET /api/regions`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - 빈 배열 반환

### 4.2 선택한 지역구들의 관광지 목록 조회

#### TC-REGION-003: 정상 지역별 관광지 조회
- **목적**: 선택한 지역구들의 관광지 목록 조회
- **전제조건**: 해당 지역에 속한 관광지 존재
- **입력 데이터**: `GET /api/regions/spots?regionIds=1&regionIds=2`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - 선택한 지역들의 관광지 목록 배열
  - 각 관광지에 regionId, regionName 포함

#### TC-REGION-004: 존재하지 않는 지역 ID로 조회
- **목적**: 존재하지 않는 지역 ID로 조회
- **입력 데이터**: `GET /api/regions/spots?regionIds=99999`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - 빈 배열 반환 또는 해당 지역의 관광지 없음

#### TC-REGION-005: 지역 파라미터 누락
- **목적**: regionIds 파라미터 누락
- **입력 데이터**: `GET /api/regions/spots`
- **예상 결과**:
  - HTTP 상태 코드: 400
  - 에러 메시지: "지역 ID가 필요합니다."

---

## 5. 리뷰 API 테스트케이스

### 5.1 관광지별 리뷰 목록 조회

#### TC-REVIEW-001: 정상 리뷰 목록 조회
- **목적**: 특정 관광지의 리뷰 목록 조회
- **전제조건**: 해당 관광지에 작성된 리뷰 존재
- **입력 데이터**: `GET /api/reviews?touristSpotId=1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 리뷰 목록 배열 (제목, 내용, 평점, 작성자 정보, 좋아요 수 등)
  - `totalElements`, `totalPages`, `currentPage` 포함

#### TC-REVIEW-002: 로그인한 사용자의 리뷰 목록 조회 (좋아요 여부 포함)
- **목적**: 로그인한 사용자가 좋아요를 누른 리뷰 표시
- **전제조건**: 로그인된 상태
- **입력 데이터**: `GET /api/reviews?touristSpotId=1&userId=1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 각 리뷰에 `isLiked` 필드 포함

#### TC-REVIEW-003: 리뷰가 없는 관광지 조회
- **목적**: 리뷰가 작성되지 않은 관광지의 리뷰 목록 조회
- **입력 데이터**: `GET /api/reviews?touristSpotId=1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 빈 배열 반환
  - `totalElements: 0`

#### TC-REVIEW-004: 존재하지 않는 관광지의 리뷰 조회
- **목적**: 존재하지 않는 관광지 ID로 리뷰 조회
- **입력 데이터**: `GET /api/reviews?touristSpotId=99999`
- **예상 결과**:
  - HTTP 상태 코드: 404 또는 200 (빈 배열)
  - 에러 메시지 또는 빈 배열

### 5.2 리뷰 작성

#### TC-REVIEW-005: 정상 리뷰 작성
- **목적**: 모든 필수 정보를 입력하여 리뷰 작성
- **전제조건**: 로그인된 상태, 존재하는 관광지
- **입력 데이터** (multipart/form-data):
  - `touristSpotId`: 1
  - `title`: "좋은 관광지입니다"
  - `content`: "리뷰 내용입니다."
  - `rating`: 5
  - `userId`: 1
  - `images`: 이미지 파일 배열 (선택)
- **입력 데이터**: `POST /api/reviews`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "리뷰가 성공적으로 등록되었습니다."
  - 작성된 리뷰 정보 반환

#### TC-REVIEW-006: 필수 필드 누락 (리뷰 작성)
- **목적**: title, content, rating 중 하나 이상 누락
- **입력 데이터**:
  - `touristSpotId`: 1
  - `title`: ""
  - `content`: "리뷰 내용"
  - `rating`: 5
  - `userId`: 1
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "제목을 입력해주세요."

#### TC-REVIEW-007: 평점 범위 초과
- **목적**: rating이 1~5 범위를 벗어남
- **입력 데이터**:
  - `touristSpotId`: 1
  - `title`: "리뷰 제목"
  - `content`: "리뷰 내용"
  - `rating`: 6
  - `userId`: 1
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "평점은 1~5 사이의 값이어야 합니다."

#### TC-REVIEW-008: 제목 길이 제한 초과
- **목적**: title이 80자 초과
- **입력 데이터**:
  - `title`: "80자를 초과하는 매우 긴 제목..." (81자 이상)
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "제목은 80자 이하로 입력해주세요."

#### TC-REVIEW-009: 존재하지 않는 관광지에 리뷰 작성
- **목적**: 존재하지 않는 관광지 ID로 리뷰 작성 시도
- **입력 데이터**:
  - `touristSpotId`: 99999
  - `title`: "리뷰 제목"
  - `content`: "리뷰 내용"
  - `rating`: 5
  - `userId`: 1
- **예상 결과**:
  - HTTP 상태 코드: 404
  - `success: false`
  - 에러 메시지: "관광지를 찾을 수 없습니다."

#### TC-REVIEW-010: 로그인하지 않은 상태에서 리뷰 작성
- **목적**: 비로그인 상태에서 리뷰 작성 시도
- **전제조건**: 로그인하지 않은 상태
- **입력 데이터**: `POST /api/reviews`
- **예상 결과**:
  - HTTP 상태 코드: 401
  - `success: false`
  - 에러 메시지: "로그인이 필요합니다."

### 5.3 리뷰 수정

#### TC-REVIEW-011: 정상 리뷰 수정
- **목적**: 본인이 작성한 리뷰 수정
- **전제조건**: 로그인된 상태, 본인이 작성한 리뷰 존재
- **입력 데이터** (multipart/form-data):
  - `userId`: 1
  - `title`: "수정된 제목"
  - `content`: "수정된 내용"
  - `rating`: 4
  - `deleteImageIds`: "[1,2]" (JSON 배열 문자열, 선택)
  - `images`: 새 이미지 파일 배열 (선택)
- **입력 데이터**: `PUT /api/reviews/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "리뷰가 성공적으로 수정되었습니다."

#### TC-REVIEW-012: 타인의 리뷰 수정 시도
- **목적**: 다른 사용자가 작성한 리뷰 수정 시도
- **전제조건**: 다른 사용자가 작성한 리뷰
- **입력 데이터**: `PUT /api/reviews/1` (작성자는 userId=2, 현재 사용자는 userId=1)
- **예상 결과**:
  - HTTP 상태 코드: 403
  - `success: false`
  - 에러 메시지: "본인이 작성한 리뷰만 수정할 수 있습니다."

#### TC-REVIEW-013: 존재하지 않는 리뷰 수정
- **목적**: 존재하지 않는 리뷰 ID로 수정 시도
- **입력 데이터**: `PUT /api/reviews/99999`
- **예상 결과**:
  - HTTP 상태 코드: 404
  - `success: false`
  - 에러 메시지: "리뷰를 찾을 수 없습니다."

### 5.4 리뷰 삭제

#### TC-REVIEW-014: 정상 리뷰 삭제
- **목적**: 본인이 작성한 리뷰 삭제
- **전제조건**: 로그인된 상태, 본인이 작성한 리뷰 존재
- **입력 데이터**: `DELETE /api/reviews/1?userId=1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "리뷰가 성공적으로 삭제되었습니다."

#### TC-REVIEW-015: 타인의 리뷰 삭제 시도
- **목적**: 다른 사용자가 작성한 리뷰 삭제 시도
- **전제조건**: 다른 사용자가 작성한 리뷰
- **입력 데이터**: `DELETE /api/reviews/1?userId=2` (작성자는 userId=1)
- **예상 결과**:
  - HTTP 상태 코드: 403
  - `success: false`
  - 에러 메시지: "본인이 작성한 리뷰만 삭제할 수 있습니다."

#### TC-REVIEW-016: 존재하지 않는 리뷰 삭제
- **목적**: 존재하지 않는 리뷰 ID로 삭제 시도
- **입력 데이터**: `DELETE /api/reviews/99999?userId=1`
- **예상 결과**:
  - HTTP 상태 코드: 404
  - `success: false`
  - 에러 메시지: "리뷰를 찾을 수 없습니다."

### 5.5 리뷰 신고

#### TC-REVIEW-017: 정상 리뷰 신고
- **목적**: 부적절한 리뷰 신고
- **전제조건**: 로그인된 상태, 존재하는 리뷰
- **입력 데이터**:
  ```json
  {
    "userId": 1,
    "reason": "부적절한 내용"
  }
  ```
- **입력 데이터**: `POST /api/reviews/1/report`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "신고가 접수되었습니다. 검토 후 조치하겠습니다."

#### TC-REVIEW-018: 본인의 리뷰 신고 시도
- **목적**: 본인이 작성한 리뷰를 신고 시도
- **전제조건**: 본인이 작성한 리뷰
- **입력 데이터**: `POST /api/reviews/1/report` (작성자와 신고자가 동일)
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "본인의 리뷰는 신고할 수 없습니다."

#### TC-REVIEW-019: 필수 필드 누락 (리뷰 신고)
- **목적**: reason 누락
- **입력 데이터**:
  ```json
  {
    "userId": 1,
    "reason": ""
  }
  ```
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "신고 사유를 입력해주세요."

---

## 6. 댓글 API 테스트케이스

### 6.1 리뷰별 댓글 목록 조회

#### TC-COMMENT-001: 정상 댓글 목록 조회
- **목적**: 특정 리뷰의 댓글 목록 조회
- **전제조건**: 해당 리뷰에 작성된 댓글 존재
- **입력 데이터**: `GET /api/reviews/1/comments`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 댓글 목록 배열 (내용, 작성자 정보, 작성일시 등)

#### TC-COMMENT-002: 댓글이 없는 리뷰 조회
- **목적**: 댓글이 작성되지 않은 리뷰의 댓글 목록 조회
- **입력 데이터**: `GET /api/reviews/1/comments`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 빈 배열 반환

### 6.2 댓글 작성

#### TC-COMMENT-003: 정상 댓글 작성
- **목적**: 모든 필수 정보를 입력하여 댓글 작성
- **전제조건**: 로그인된 상태, 존재하는 리뷰
- **입력 데이터**:
  ```json
  {
    "userId": 1,
    "content": "좋은 리뷰네요!"
  }
  ```
- **입력 데이터**: `POST /api/reviews/1/comments`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "댓글이 성공적으로 등록되었습니다."

#### TC-COMMENT-004: 필수 필드 누락 (댓글 작성)
- **목적**: content 누락
- **입력 데이터**:
  ```json
  {
    "userId": 1,
    "content": ""
  }
  ```
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "댓글 내용을 입력해주세요."

#### TC-COMMENT-005: 존재하지 않는 리뷰에 댓글 작성
- **목적**: 존재하지 않는 리뷰 ID로 댓글 작성 시도
- **입력 데이터**: `POST /api/reviews/99999/comments`
- **예상 결과**:
  - HTTP 상태 코드: 404
  - `success: false`
  - 에러 메시지: "리뷰를 찾을 수 없습니다."

#### TC-COMMENT-006: 로그인하지 않은 상태에서 댓글 작성
- **목적**: 비로그인 상태에서 댓글 작성 시도
- **전제조건**: 로그인하지 않은 상태
- **입력 데이터**: `POST /api/reviews/1/comments`
- **예상 결과**:
  - HTTP 상태 코드: 401
  - `success: false`
  - 에러 메시지: "로그인이 필요합니다."

### 6.3 댓글 수정

#### TC-COMMENT-007: 정상 댓글 수정
- **목적**: 본인이 작성한 댓글 수정
- **전제조건**: 로그인된 상태, 본인이 작성한 댓글 존재
- **입력 데이터**:
  ```json
  {
    "userId": 1,
    "content": "수정된 댓글 내용"
  }
  ```
- **입력 데이터**: `PUT /api/comments/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "댓글이 성공적으로 수정되었습니다."

#### TC-COMMENT-008: 타인의 댓글 수정 시도
- **목적**: 다른 사용자가 작성한 댓글 수정 시도
- **전제조건**: 다른 사용자가 작성한 댓글
- **입력 데이터**: `PUT /api/comments/1` (작성자는 userId=2, 현재 사용자는 userId=1)
- **예상 결과**:
  - HTTP 상태 코드: 403
  - `success: false`
  - 에러 메시지: "본인이 작성한 댓글만 수정할 수 있습니다."

#### TC-COMMENT-009: 존재하지 않는 댓글 수정
- **목적**: 존재하지 않는 댓글 ID로 수정 시도
- **입력 데이터**: `PUT /api/comments/99999`
- **예상 결과**:
  - HTTP 상태 코드: 404
  - `success: false`
  - 에러 메시지: "댓글을 찾을 수 없습니다."

### 6.4 댓글 삭제

#### TC-COMMENT-010: 정상 댓글 삭제
- **목적**: 본인이 작성한 댓글 삭제
- **전제조건**: 로그인된 상태, 본인이 작성한 댓글 존재
- **입력 데이터**:
  ```json
  {
    "userId": 1
  }
  ```
- **입력 데이터**: `DELETE /api/comments/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "댓글이 성공적으로 삭제되었습니다."

#### TC-COMMENT-011: 타인의 댓글 삭제 시도
- **목적**: 다른 사용자가 작성한 댓글 삭제 시도
- **전제조건**: 다른 사용자가 작성한 댓글
- **입력 데이터**: `DELETE /api/comments/1` (작성자는 userId=2, 현재 사용자는 userId=1)
- **예상 결과**:
  - HTTP 상태 코드: 403
  - `success: false`
  - 에러 메시지: "본인이 작성한 댓글만 삭제할 수 있습니다."

#### TC-COMMENT-012: 존재하지 않는 댓글 삭제
- **목적**: 존재하지 않는 댓글 ID로 삭제 시도
- **입력 데이터**: `DELETE /api/comments/99999`
- **예상 결과**:
  - HTTP 상태 코드: 404
  - `success: false`
  - 에러 메시지: "댓글을 찾을 수 없습니다."

### 6.5 댓글 신고

#### TC-COMMENT-013: 정상 댓글 신고
- **목적**: 부적절한 댓글 신고
- **전제조건**: 로그인된 상태, 존재하는 댓글
- **입력 데이터**:
  ```json
  {
    "userId": 1,
    "reason": "부적절한 내용"
  }
  ```
- **입력 데이터**: `POST /api/comments/1/report`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "신고가 접수되었습니다. 검토 후 조치하겠습니다."

#### TC-COMMENT-014: 본인의 댓글 신고 시도
- **목적**: 본인이 작성한 댓글을 신고 시도
- **전제조건**: 본인이 작성한 댓글
- **입력 데이터**: `POST /api/comments/1/report` (작성자와 신고자가 동일)
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "본인의 댓글은 신고할 수 없습니다."

---

## 7. 좋아요 API 테스트케이스

### 7.1 관광지 좋아요

#### TC-LIKE-001: 정상 관광지 좋아요 상태 조회
- **목적**: 특정 관광지의 좋아요 상태 및 개수 조회
- **입력 데이터**: `GET /api/tourist-spots/1/like`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `liked`: false (또는 true)
  - `likeCount`: 좋아요 개수

#### TC-LIKE-002: 로그인한 사용자의 관광지 좋아요 상태 조회
- **목적**: 로그인한 사용자의 좋아요 여부 포함
- **전제조건**: 로그인된 상태
- **입력 데이터**: `GET /api/tourist-spots/1/like?userId=1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `liked`: 해당 사용자의 좋아요 여부
  - `likeCount`: 좋아요 개수

#### TC-LIKE-003: 정상 관광지 좋아요 추가
- **목적**: 관광지에 좋아요 추가
- **전제조건**: 로그인된 상태, 좋아요를 누르지 않은 상태
- **입력 데이터**: `POST /api/tourist-spots/1/like?userId=1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `liked`: true
  - `likeCount`: 증가된 좋아요 개수

#### TC-LIKE-004: 정상 관광지 좋아요 취소
- **목적**: 이미 좋아요를 누른 관광지의 좋아요 취소
- **전제조건**: 로그인된 상태, 이미 좋아요를 누른 상태
- **입력 데이터**: `POST /api/tourist-spots/1/like?userId=1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `liked`: false
  - `likeCount`: 감소된 좋아요 개수

#### TC-LIKE-005: 존재하지 않는 관광지에 좋아요
- **목적**: 존재하지 않는 관광지 ID로 좋아요 시도
- **입력 데이터**: `POST /api/tourist-spots/99999/like?userId=1`
- **예상 결과**:
  - HTTP 상태 코드: 404
  - 에러 메시지: "관광지를 찾을 수 없습니다."

#### TC-LIKE-006: 로그인하지 않은 상태에서 관광지 좋아요
- **목적**: 비로그인 상태에서 좋아요 시도
- **전제조건**: 로그인하지 않은 상태
- **입력 데이터**: `POST /api/tourist-spots/1/like`
- **예상 결과**:
  - HTTP 상태 코드: 401
  - 에러 메시지: "로그인이 필요합니다."

### 7.2 리뷰 좋아요

#### TC-LIKE-007: 정상 리뷰 좋아요 상태 조회
- **목적**: 특정 리뷰의 좋아요 상태 및 개수 조회
- **전제조건**: 로그인된 상태
- **입력 데이터**: `GET /api/reviews/1/like?userId=1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - `liked`: false (또는 true)
  - `likeCount`: 좋아요 개수

#### TC-LIKE-008: 정상 리뷰 좋아요 추가
- **목적**: 리뷰에 좋아요 추가
- **전제조건**: 로그인된 상태, 좋아요를 누르지 않은 상태
- **입력 데이터**: `POST /api/reviews/1/like?userId=1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - `liked`: true
  - `likeCount`: 증가된 좋아요 개수

#### TC-LIKE-009: 정상 리뷰 좋아요 취소
- **목적**: 이미 좋아요를 누른 리뷰의 좋아요 취소
- **전제조건**: 로그인된 상태, 이미 좋아요를 누른 상태
- **입력 데이터**: `POST /api/reviews/1/like?userId=1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - `liked`: false
  - `likeCount`: 감소된 좋아요 개수

#### TC-LIKE-010: 존재하지 않는 리뷰에 좋아요
- **목적**: 존재하지 않는 리뷰 ID로 좋아요 시도
- **입력 데이터**: `POST /api/reviews/99999/like?userId=1`
- **예상 결과**:
  - HTTP 상태 코드: 404
  - `success: false`
  - 에러 메시지: "리뷰를 찾을 수 없습니다."

#### TC-LIKE-011: 로그인하지 않은 상태에서 리뷰 좋아요
- **목적**: 비로그인 상태에서 좋아요 시도
- **전제조건**: 로그인하지 않은 상태
- **입력 데이터**: `POST /api/reviews/1/like`
- **예상 결과**:
  - HTTP 상태 코드: 401
  - `success: false`
  - 에러 메시지: "로그인이 필요합니다."

---

## 8. 검색 API 테스트케이스

### 8.1 통합 검색

#### TC-SEARCH-001: 정상 통합 검색 (키워드 포함)
- **목적**: 키워드로 관광지와 리뷰 통합 검색
- **전제조건**: 검색 키워드와 일치하는 관광지 또는 리뷰 존재
- **입력 데이터**: `GET /api/search?q=해운대`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `spots`: 검색된 관광지 목록
  - `reviews`: 검색된 리뷰 목록

#### TC-SEARCH-002: 통합 검색 (키워드 없음)
- **목적**: 키워드 없이 검색 (전체 조회)
- **입력 데이터**: `GET /api/search`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - 모든 관광지와 리뷰 반환 또는 빈 결과

#### TC-SEARCH-003: 검색 결과 없음
- **목적**: 검색 키워드와 일치하는 결과가 없는 경우
- **입력 데이터**: `GET /api/search?q=존재하지않는키워드12345`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - 빈 배열 반환
  - `spots`: []
  - `reviews`: []

#### TC-SEARCH-004: 특수문자 포함 검색
- **목적**: 특수문자가 포함된 키워드로 검색
- **입력 데이터**: `GET /api/search?q=해운대!@#`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - 검색 결과 반환 (특수문자 처리 방식에 따라 다름)

#### TC-SEARCH-005: 빈 문자열 검색
- **목적**: 빈 문자열로 검색
- **입력 데이터**: `GET /api/search?q=`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - 전체 결과 반환 또는 빈 결과

---

## 9. 해시태그 API 테스트케이스

### 9.1 태그별 관광지 조회

#### TC-HASHTAG-001: 정상 태그별 관광지 조회
- **목적**: 모든 해시태그와 지역별로 그룹화된 관광지 목록 조회
- **입력 데이터**: `GET /api/tag-spots`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `allHashtags`: 모든 해시태그 목록
  - `regions`: 지역별로 그룹화된 관광지 목록
  - 각 관광지에 `hashtags` 배열 포함

#### TC-HASHTAG-002: 해시태그가 없는 경우
- **목적**: 등록된 해시태그가 없는 경우
- **전제조건**: 해시태그 데이터 없음
- **입력 데이터**: `GET /api/tag-spots`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `allHashtags`: 빈 배열
  - `regions`: 빈 배열 또는 관광지만 반환

---

## 10. 관리자 API 테스트케이스

### 10.1 관광지 관리

#### TC-ADMIN-001: 정상 관광지 목록 조회 (관리자)
- **목적**: 관리자 권한으로 모든 관광지 목록 조회
- **전제조건**: 관리자 권한, 로그인된 상태
- **입력 데이터**: `GET /api/admin/tourist-spots`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 모든 관광지 목록 (비활성화된 것 포함)

#### TC-ADMIN-002: 일반 사용자의 관리자 API 접근 시도
- **목적**: 일반 사용자가 관리자 API 접근 시도
- **전제조건**: 일반 사용자 권한, 로그인된 상태
- **입력 데이터**: `GET /api/admin/tourist-spots`
- **예상 결과**:
  - HTTP 상태 코드: 403
  - `success: false`
  - 에러 메시지: "관리자 권한이 필요합니다."

#### TC-ADMIN-003: 정상 관광지 추가 (관리자)
- **목적**: 관리자가 새로운 관광지 추가
- **전제조건**: 관리자 권한, 로그인된 상태
- **입력 데이터**:
  ```json
  {
    "regionKey": "area01",
    "title": "새로운 관광지",
    "description": "관광지 설명",
    "linkUrl": "https://example.com",
    "categoryCode": "ATTRACTION",
    "latitude": 35.1794,
    "longitude": 129.0756,
    "hashtags": ["해시태그1", "해시태그2"]
  }
  ```
- **입력 데이터**: `POST /api/admin/tourist-spots`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 추가된 관광지 정보 반환

#### TC-ADMIN-004: 필수 필드 누락 (관광지 추가)
- **목적**: 필수 필드(title, regionKey 등) 누락
- **입력 데이터**:
  ```json
  {
    "regionKey": "area01",
    "description": "관광지 설명"
  }
  ```
- **예상 결과**:
  - HTTP 상태 코드: 400
  - `success: false`
  - 에러 메시지: "관광지명을 입력해주세요."

#### TC-ADMIN-005: 정상 관광지 수정 (관리자)
- **목적**: 관리자가 기존 관광지 정보 수정
- **전제조건**: 관리자 권한, 존재하는 관광지
- **입력 데이터**:
  ```json
  {
    "regionKey": "area01",
    "title": "수정된 관광지명",
    "description": "수정된 설명"
  }
  ```
- **입력 데이터**: `PUT /api/admin/tourist-spots/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 수정된 관광지 정보 반환

#### TC-ADMIN-006: 정상 관광지 삭제 (관리자)
- **목적**: 관리자가 관광지 삭제
- **전제조건**: 관리자 권한, 존재하는 관광지
- **입력 데이터**: `DELETE /api/admin/tourist-spots/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "관광지가 삭제되었습니다."

#### TC-ADMIN-007: 정상 관광지 이미지 목록 조회
- **목적**: 특정 관광지의 이미지 목록 조회
- **전제조건**: 관리자 권한, 존재하는 관광지
- **입력 데이터**: `GET /api/admin/tourist-spots/1/images`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 이미지 목록 배열

#### TC-ADMIN-008: 정상 관광지 이미지 추가
- **목적**: 관광지에 이미지 추가
- **전제조건**: 관리자 권한, 존재하는 관광지
- **입력 데이터** (multipart/form-data):
  - `images`: 이미지 파일 배열
- **입력 데이터**: `POST /api/admin/tourist-spots/1/images`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "이미지가 추가되었습니다."

#### TC-ADMIN-009: 정상 관광지 이미지 삭제
- **목적**: 관광지 이미지 삭제
- **전제조건**: 관리자 권한, 존재하는 이미지
- **입력 데이터**: `DELETE /api/admin/tourist-spots/images/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "이미지가 삭제되었습니다."

#### TC-ADMIN-010: 정상 대표 이미지 설정
- **목적**: 관광지의 대표 이미지 설정
- **전제조건**: 관리자 권한, 존재하는 이미지
- **입력 데이터**: `PUT /api/admin/tourist-spots/images/1/set-rep`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "대표 이미지가 설정되었습니다."

### 10.2 사용자 관리

#### TC-ADMIN-011: 정상 사용자 목록 조회
- **목적**: 관리자가 모든 사용자 목록 조회
- **전제조건**: 관리자 권한, 로그인된 상태
- **입력 데이터**: `GET /api/admin/users`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 사용자 목록 배열

#### TC-ADMIN-012: 정상 사용자 추가 (관리자)
- **목적**: 관리자가 새로운 사용자 추가
- **전제조건**: 관리자 권한
- **입력 데이터**:
  ```json
  {
    "loginId": "newuser",
    "password": "password123",
    "username": "새 사용자",
    "email": "newuser@example.com",
    "role": "MEMBER"
  }
  ```
- **입력 데이터**: `POST /api/admin/users`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 추가된 사용자 정보 반환

#### TC-ADMIN-013: 정상 사용자 수정 (관리자)
- **목적**: 관리자가 사용자 정보 수정
- **전제조건**: 관리자 권한, 존재하는 사용자
- **입력 데이터**:
  ```json
  {
    "username": "수정된 사용자명",
    "email": "updated@example.com",
    "role": "ADMIN",
    "status": "ACTIVE"
  }
  ```
- **입력 데이터**: `PUT /api/admin/users/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 수정된 사용자 정보 반환

#### TC-ADMIN-014: 정상 사용자 상태 변경
- **목적**: 관리자가 사용자 상태 변경
- **전제조건**: 관리자 권한, 존재하는 사용자
- **입력 데이터**:
  ```json
  {
    "status": "SUSPENDED"
  }
  ```
- **입력 데이터**: `PUT /api/admin/users/1/status`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "사용자 상태가 변경되었습니다."

#### TC-ADMIN-015: 정상 사용자 삭제 (관리자)
- **목적**: 관리자가 사용자 삭제
- **전제조건**: 관리자 권한, 존재하는 사용자
- **입력 데이터**: `DELETE /api/admin/users/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "사용자가 삭제되었습니다."

### 10.3 공통코드 관리

#### TC-ADMIN-016: 정상 코드 그룹 목록 조회
- **목적**: 모든 코드 그룹 목록 조회
- **전제조건**: 관리자 권한
- **입력 데이터**: `GET /api/admin/common-code-groups`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 코드 그룹 목록 배열

#### TC-ADMIN-017: 정상 코드 그룹 추가
- **목적**: 새로운 코드 그룹 추가
- **전제조건**: 관리자 권한
- **입력 데이터**:
  ```json
  {
    "groupCode": "NEW_CATEGORY",
    "groupName": "새 카테고리",
    "groupNameEn": "New Category",
    "groupNameJp": "新カテゴリ",
    "description": "새 카테고리 코드",
    "isActive": true,
    "sortOrder": 1
  }
  ```
- **입력 데이터**: `POST /api/admin/common-code-groups`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 추가된 코드 그룹 정보 반환

#### TC-ADMIN-018: 정상 코드 그룹 수정
- **목적**: 코드 그룹 정보 수정
- **전제조건**: 관리자 권한, 존재하는 코드 그룹
- **입력 데이터**:
  ```json
  {
    "groupName": "수정된 그룹명",
    "isActive": false
  }
  ```
- **입력 데이터**: `PUT /api/admin/common-code-groups/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 수정된 코드 그룹 정보 반환

#### TC-ADMIN-019: 정상 코드 그룹 삭제
- **목적**: 코드 그룹 삭제
- **전제조건**: 관리자 권한, 존재하는 코드 그룹
- **입력 데이터**: `DELETE /api/admin/common-code-groups/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "코드 그룹이 삭제되었습니다."

#### TC-ADMIN-020: 정상 코드 목록 조회
- **목적**: 코드 목록 조회 (그룹별 필터링 가능)
- **전제조건**: 관리자 권한
- **입력 데이터**: `GET /api/admin/common-codes?groupCode=SPOT_CATEGORY`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 코드 목록 배열

#### TC-ADMIN-021: 정상 코드 추가
- **목적**: 새로운 코드 추가
- **전제조건**: 관리자 권한
- **입력 데이터**:
  ```json
  {
    "groupCode": "SPOT_CATEGORY",
    "code": "NEW_CODE",
    "codeName": "새 코드",
    "codeNameEn": "New Code",
    "codeNameJp": "新コード",
    "description": "새 코드 설명",
    "isActive": true,
    "sortOrder": 1
  }
  ```
- **입력 데이터**: `POST /api/admin/common-codes`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 추가된 코드 정보 반환

#### TC-ADMIN-022: 정상 코드 수정
- **목적**: 코드 정보 수정
- **전제조건**: 관리자 권한, 존재하는 코드
- **입력 데이터**:
  ```json
  {
    "codeName": "수정된 코드명",
    "isActive": false
  }
  ```
- **입력 데이터**: `PUT /api/admin/common-codes/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 수정된 코드 정보 반환

#### TC-ADMIN-023: 정상 코드 삭제
- **목적**: 코드 삭제
- **전제조건**: 관리자 권한, 존재하는 코드
- **입력 데이터**: `DELETE /api/admin/common-codes/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "코드가 삭제되었습니다."

### 10.4 신청 관리

#### TC-ADMIN-024: 정상 신청 목록 조회
- **목적**: 모든 사진 추가 및 관광지 추가 신청 목록 조회
- **전제조건**: 관리자 권한
- **입력 데이터**: `GET /api/admin/spot-requests`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 신청 목록 배열 (사진 추가, 관광지 추가, 수정요청 포함)

#### TC-ADMIN-025: 정상 사진 추가 신청 승인
- **목적**: 사진 추가 신청 승인 (사진을 관광지에 추가)
- **전제조건**: 관리자 권한, 존재하는 신청
- **입력 데이터**: `PUT /api/admin/spot-requests/1/approve`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "신청이 승인되었습니다."
  - 사진이 관광지에 추가됨

#### TC-ADMIN-026: 정상 사진 추가 신청 거부
- **목적**: 사진 추가 신청 거부
- **전제조건**: 관리자 권한, 존재하는 신청
- **입력 데이터**:
  ```json
  {
    "reason": "부적절한 이미지입니다."
  }
  ```
- **입력 데이터**: `PUT /api/admin/spot-requests/1/reject`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "신청이 거부되었습니다."
  - 신청 상태가 "rejected"로 변경

#### TC-ADMIN-027: 정상 신청 삭제
- **목적**: 신청 삭제
- **전제조건**: 관리자 권한, 존재하는 신청
- **입력 데이터**: `DELETE /api/admin/spot-requests/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "신청이 삭제되었습니다."

### 10.5 신고 관리

#### TC-ADMIN-028: 정상 신고 목록 조회
- **목적**: 모든 리뷰 및 댓글 신고 목록 조회
- **전제조건**: 관리자 권한
- **입력 데이터**: `GET /api/admin/user-reports`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 신고 목록 배열 (리뷰 신고, 댓글 신고 포함)

#### TC-ADMIN-029: 정상 신고 처리
- **목적**: 신고 처리 (처벌 적용)
- **전제조건**: 관리자 권한, 존재하는 신고
- **입력 데이터**:
  ```json
  {
    "action": "resolved",
    "reportType": "review",
    "reportedUserId": 2,
    "penaltyType": "temp_ban_7",
    "deleteContent": true
  }
  ```
- **입력 데이터**: `POST /api/admin/reports/1/process`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "신고가 처리되었습니다."
  - 신고 상태가 "resolved"로 변경
  - 처벌 적용 (사용자 정지, 콘텐츠 삭제 등)

#### TC-ADMIN-030: 정상 신고 삭제
- **목적**: 신고 기록 삭제
- **전제조건**: 관리자 권한, 존재하는 신고
- **입력 데이터**:
  ```json
  {
    "reportType": "review"
  }
  ```
- **입력 데이터**: `DELETE /api/admin/reports/1`
- **예상 결과**:
  - HTTP 상태 코드: 200
  - `success: true`
  - 메시지: "신고 기록이 삭제되었습니다."

---

## 테스트케이스 작성 가이드

### 테스트케이스 ID 규칙
- 형식: `TC-{카테고리}-{번호}`
- 카테고리: AUTH, USER, SPOT, REGION, REVIEW, COMMENT, LIKE, SEARCH, HASHTAG, ADMIN

### 테스트케이스 구성 요소
1. **테스트케이스 ID**: 고유 식별자
2. **목적**: 테스트의 목적과 의도
3. **전제조건**: 테스트 실행 전 필요한 조건
4. **입력 데이터**: 요청에 포함될 데이터
5. **예상 결과**: 기대되는 응답 및 동작

### 우선순위 분류
- **P0 (Critical)**: 핵심 기능, 정상 케이스
- **P1 (High)**: 주요 기능, 예외 케이스
- **P2 (Medium)**: 부가 기능, 경계값 테스트
- **P3 (Low)**: 선택적 기능, 엣지 케이스

### 테스트 실행 시 주의사항
1. 각 테스트케이스는 독립적으로 실행 가능해야 함
2. 테스트 데이터는 사전에 준비되어야 함
3. 테스트 후 데이터 정리 필요
4. 권한별 테스트는 적절한 사용자 계정으로 실행
5. 파일 업로드 테스트는 유효한 이미지 파일 사용

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-01-24 | - | 초기 테스트케이스 문서 작성 |
