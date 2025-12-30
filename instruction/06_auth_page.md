# 인증 페이지 백엔드 작업 가이드

## 페이지 개요

사용자 로그인, 회원가입, 로그아웃 기능을 제공하는 페이지입니다. 다른 페이지에서 인증이 필요한 기능을 사용하기 위한 기반이 됩니다.

**프론트엔드 파일 위치**:

-   HTML:
    -   `src/main/resources/templates/pages/login/login.html`
    -   `src/main/resources/templates/pages/login/signup.html`
-   JavaScript:
    -   `src/main/resources/static/js/login.js`
    -   `src/main/resources/static/js/signup.js`
    -   `src/main/resources/static/js/auth.js`
-   CSS:
    -   `src/main/resources/static/css/login.css`
    -   `src/main/resources/static/css/signup.css`

## 필요한 API 엔드포인트

### 1. 로그인

-   **엔드포인트**: `POST /api/auth/login`
-   **설명**: 사용자 로그인
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
-   **설명**: 새로운 사용자 회원가입
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
-   **설명**: 회원가입 시 아이디 중복 확인
-   **응답 형식**:

```json
{
    "available": true,
    "message": "사용 가능한 아이디입니다."
}
```

또는

```json
{
    "available": false,
    "message": "이미 사용 중인 아이디입니다."
}
```

### 4. 이메일 중복 체크

-   **엔드포인트**: `GET /api/auth/check-email?email={email}`
-   **설명**: 회원가입 시 이메일 중복 확인
-   **응답 형식**: 아이디 중복 체크와 동일

### 5. 로그아웃

-   **엔드포인트**: `POST /api/auth/logout`
-   **설명**: 사용자 로그아웃
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

### 6. 현재 사용자 정보 조회

-   **엔드포인트**: `GET /api/auth/me`
-   **설명**: 현재 로그인한 사용자 정보 조회
-   **권한**: 로그인 필요
-   **응답 형식**:

```json
{
    "id": 1,
    "userId": "admin",
    "username": "관리자",
    "email": "admin@aratabusan.com",
    "role": "admin",
    "status": "active"
}
```

### 7. 비밀번호 변경

-   **엔드포인트**: `PUT /api/auth/password`
-   **설명**: 현재 사용자의 비밀번호 변경
-   **권한**: 로그인 필요
-   **요청 형식**:

```json
{
    "currentPassword": "string",
    "newPassword": "string"
}
```

## 필요한 파일 구조

### Controller

```
com.busan.orora.controller.auth/
└── AuthController.java            # 인증 관련 API
```

### Service

```
com.busan.orora.service.auth/
├── AuthService.java               # 인증 비즈니스 로직
└── UserService.java               # 사용자 관리 로직
```

### Repository

```
com.busan.orora.repository/
└── UserRepository.java            # 사용자 데이터 접근
```

### Entity

```
com.busan.orora.entity/
└── User.java                      # 사용자 엔티티
```

### DTO

```
com.busan.orora.dto.auth/
├── LoginRequest.java              # 로그인 요청 DTO
├── SignupRequest.java             # 회원가입 요청 DTO
├── AuthResponse.java              # 인증 응답 DTO
└── UserResponse.java              # 사용자 응답 DTO
```

### Security

```
com.busan.orora.security/
├── JwtTokenProvider.java          # JWT 토큰 생성/검증
├── JwtAuthenticationFilter.java   # JWT 인증 필터
└── SecurityConfig.java            # Spring Security 설정
```

## 데이터베이스 테이블 관계

### 주요 테이블

-   `users`: 사용자 정보

### 테이블 구조

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'vip', 'member') DEFAULT 'member',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    ...
);
```

## 연관된 다른 페이지

### 1. 모든 페이지

-   인증이 필요한 기능을 사용하는 모든 페이지에서 사용
-   리뷰 작성, 좋아요, 마이페이지 등

### 2. 마이페이지 (07_mypage.md)

-   로그인한 사용자의 정보 표시
-   사용자 정보 수정

### 3. 관리자 페이지 (04_admin_page.md)

-   관리자 권한 확인

## 주요 기능

### 1. 로그인

-   아이디/비밀번호로 로그인
-   JWT 토큰 발급
-   로그인 실패 시 에러 메시지
-   마지막 로그인 시간 업데이트

### 2. 회원가입

-   필수 정보 입력: 아이디, 비밀번호, 이름, 이메일
-   선택 정보: 전화번호, 생년월일, 주소
-   아이디/이메일 중복 체크
-   비밀번호 해시화하여 저장
-   기본 권한: `member`
-   기본 상태: `active`

### 3. 아이디/이메일 중복 체크

-   실시간 중복 체크 (회원가입 폼에서)
-   AJAX로 비동기 확인

### 4. 로그아웃

-   JWT 토큰 무효화
-   세션 종료 (세션 사용 시)

### 5. 현재 사용자 정보 조회

-   로그인 상태 확인
-   사용자 정보 반환
-   권한 정보 포함

### 6. 비밀번호 변경

-   현재 비밀번호 확인
-   새 비밀번호로 변경
-   비밀번호 해시화하여 저장

## 프론트엔드 연동 포인트

### JavaScript 파일 수정 필요

1. **로그인** (`src/main/resources/static/js/login.js`):

```javascript
// 기존: 로컬 스토리지 저장
// 변경 후
async function login(userId, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
    });
    const result = await response.json();

    if (result.success) {
        // JWT 토큰 저장
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        // 메인 페이지로 이동
        window.location.href = '/';
    } else {
        alert('로그인 실패: ' + result.message);
    }
}
```

2. **회원가입** (`src/main/resources/static/js/signup.js`):

```javascript
// 기존: 로컬 스토리지 저장
// 변경 후
async function signup(formData) {
    const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    });
    const result = await response.json();

    if (result.success) {
        alert('회원가입이 완료되었습니다.');
        window.location.href = '/pages/login/login.html';
    } else {
        alert('회원가입 실패: ' + result.message);
    }
}
```

3. **아이디 중복 체크**:

```javascript
async function checkUserId(userId) {
    const response = await fetch(`/api/auth/check-id?userId=${userId}`);
    const result = await response.json();
    return result.available;
}
```

4. **인증 상태 확인** (`src/main/resources/static/js/auth.js`):

```javascript
async function getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
        return await response.json();
    } else {
        localStorage.removeItem('token');
        return null;
    }
}
```

## 주의사항

1. **보안**

    - 비밀번호는 절대 평문으로 저장하지 않음 (BCrypt 등 사용)
    - JWT 토큰은 만료 시간 설정
    - HTTPS 사용 권장
    - SQL Injection 방지
    - XSS 방지

2. **비밀번호 정책**

    - 최소 길이: 6자 이상
    - 복잡도 요구사항 고려 (대소문자, 숫자, 특수문자)
    - 비밀번호 재사용 방지

3. **중복 체크**

    - 아이디: 대소문자 구분 여부 결정
    - 이메일: 이메일 형식 검증
    - 실시간 중복 체크는 서버 부하 고려

4. **에러 처리**

    - 로그인 실패: 구체적인 에러 메시지 (아이디 없음, 비밀번호 틀림)
    - 회원가입 실패: 필드별 에러 메시지
    - 중복 체크: 명확한 메시지

5. **세션/토큰 관리**

    - JWT 토큰은 클라이언트에 저장 (localStorage 또는 cookie)
    - 토큰 만료 시 자동 로그아웃
    - 리프레시 토큰 고려

6. **사용자 상태**

    - `inactive`: 비활성화된 사용자는 로그인 불가
    - `suspended`: 정지된 사용자는 로그인 불가
    - 관리자가 상태 변경 가능

7. **권한 관리**
    - `admin`: 관리자 권한
    - `vip`: VIP 회원 권한
    - `member`: 일반 회원 권한

## 테스트 케이스

1. 로그인 성공 (일반 사용자/관리자)
2. 로그인 실패 (아이디 없음, 비밀번호 틀림)
3. 회원가입 성공
4. 회원가입 실패 (중복 아이디, 중복 이메일, 필수 필드 누락)
5. 아이디 중복 체크
6. 이메일 중복 체크
7. 로그아웃
8. 현재 사용자 정보 조회 (로그인/비로그인)
9. 비밀번호 변경 (성공/실패)
10. 비활성화된 사용자 로그인 시도
11. 정지된 사용자 로그인 시도
12. JWT 토큰 만료 처리
