# 공통코드(Common Code)란?

## 📌 정의

**공통코드**는 시스템 전반에서 반복적으로 사용되는 코드값들을 중앙에서 관리하는 체계입니다. 
예를 들어, 사용자 역할(admin, vip, member), 주문 상태(대기, 처리중, 완료), 카테고리 등과 같은 
고정된 값들의 목록을 별도의 테이블로 관리하는 것을 말합니다.

---

## 🎯 왜 사용하나요?

### 현재 스키마의 문제점 (ENUM 사용)

현재 스키마에서는 다음과 같이 **ENUM 타입**을 사용하고 있습니다:

```sql
-- users 테이블
role ENUM('admin', 'vip', 'member') DEFAULT 'member',
status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
gender ENUM('male', 'female', 'other'),

-- tourist_spots 테이블
category ENUM('beach', 'mountain', 'culture', 'food', 'shopping', 'cafe') DEFAULT 'culture',

-- review_reports 테이블
status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
```

### ENUM의 단점

1. **코드 추가/수정이 어려움**: 새로운 코드를 추가하려면 ALTER TABLE이 필요
2. **다국어 지원 어려움**: 코드값 자체가 영어로 고정
3. **정렬 순서 관리 불가**: 코드의 우선순위나 정렬 순서를 지정할 수 없음
4. **설명/메타데이터 부족**: 각 코드의 의미나 설명을 저장할 수 없음
5. **비활성화 관리 불가**: 사용하지 않는 코드를 비활성화할 수 없음

---

## 💡 공통코드 테이블 예시

### 기본 구조

```sql
-- 공통코드 그룹 테이블 (코드 분류)
CREATE TABLE common_code_groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_code VARCHAR(50) NOT NULL UNIQUE,  -- 코드 그룹 식별자
    group_name VARCHAR(100) NOT NULL,         -- 코드 그룹명
    description TEXT,                        -- 설명
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,                -- 정렬 순서
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 공통코드 테이블 (실제 코드값)
CREATE TABLE common_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_code VARCHAR(50) NOT NULL,         -- 코드 그룹 참조
    code VARCHAR(50) NOT NULL,               -- 코드값
    code_name VARCHAR(100) NOT NULL,         -- 코드명 (표시용)
    code_name_en VARCHAR(100),              -- 영문명
    code_name_jp VARCHAR(100),             -- 일문명
    description TEXT,                        -- 상세 설명
    sort_order INT DEFAULT 0,               -- 정렬 순서
    is_active BOOLEAN DEFAULT TRUE,         -- 사용 여부
    extra_data JSON,                        -- 추가 데이터 (JSON 형식)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_code) REFERENCES common_code_groups(group_code) ON DELETE CASCADE,
    UNIQUE KEY unique_group_code (group_code, code),
    INDEX idx_group_code (group_code),
    INDEX idx_is_active (is_active)
);
```

---

## 📊 실제 데이터 예시

### 1. 코드 그룹 데이터

```sql
INSERT INTO common_code_groups (group_code, group_name, description, sort_order) VALUES
('USER_ROLE', '사용자 역할', '시스템 사용자의 권한 역할', 1),
('USER_STATUS', '사용자 상태', '사용자 계정의 활성화 상태', 2),
('GENDER', '성별', '사용자의 성별 정보', 3),
('SPOT_CATEGORY', '관광지 카테고리', '관광지의 분류 카테고리', 4),
('REPORT_STATUS', '신고 상태', '리뷰 신고의 처리 상태', 5);
```

### 2. 공통코드 데이터

#### 사용자 역할 (USER_ROLE)
```sql
INSERT INTO common_codes (group_code, code, code_name, code_name_en, code_name_jp, sort_order) VALUES
('USER_ROLE', 'ADMIN', '관리자', 'Administrator', '管理者', 1),
('USER_ROLE', 'VIP', 'VIP 회원', 'VIP Member', 'VIP会員', 2),
('USER_ROLE', 'MEMBER', '일반 회원', 'General Member', '一般会員', 3);
```

#### 사용자 상태 (USER_STATUS)
```sql
INSERT INTO common_codes (group_code, code, code_name, code_name_en, code_name_jp, sort_order) VALUES
('USER_STATUS', 'ACTIVE', '활성', 'Active', 'アクティブ', 1),
('USER_STATUS', 'INACTIVE', '비활성', 'Inactive', '非アクティブ', 2),
('USER_STATUS', 'SUSPENDED', '정지', 'Suspended', '停止', 3);
```

#### 관광지 카테고리 (SPOT_CATEGORY)
```sql
INSERT INTO common_codes (group_code, code, code_name, code_name_en, code_name_jp, sort_order) VALUES
('SPOT_CATEGORY', 'BEACH', '해변', 'Beach', 'ビーチ', 1),
('SPOT_CATEGORY', 'MOUNTAIN', '산', 'Mountain', '山', 2),
('SPOT_CATEGORY', 'CULTURE', '문화', 'Culture', '文化', 3),
('SPOT_CATEGORY', 'FOOD', '음식', 'Food', '食べ物', 4),
('SPOT_CATEGORY', 'SHOPPING', '쇼핑', 'Shopping', 'ショッピング', 5),
('SPOT_CATEGORY', 'CAFE', '카페', 'Cafe', 'カフェ', 6);
```

#### 신고 상태 (REPORT_STATUS)
```sql
INSERT INTO common_codes (group_code, code, code_name, code_name_en, code_name_jp, sort_order) VALUES
('REPORT_STATUS', 'PENDING', '대기중', 'Pending', '保留中', 1),
('REPORT_STATUS', 'REVIEWED', '검토중', 'Reviewed', '検討中', 2),
('REPORT_STATUS', 'RESOLVED', '처리완료', 'Resolved', '処理完了', 3),
('REPORT_STATUS', 'DISMISSED', '기각', 'Dismissed', '却下', 4);
```

---

## 🔄 스키마 변경 예시

### 변경 전 (ENUM 사용)

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role ENUM('admin', 'vip', 'member') DEFAULT 'member',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    gender ENUM('male', 'female', 'other')
);
```

### 변경 후 (공통코드 사용)

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_code VARCHAR(50),      -- 'ADMIN', 'VIP', 'MEMBER'
    status_code VARCHAR(50),    -- 'ACTIVE', 'INACTIVE', 'SUSPENDED'
    gender_code VARCHAR(50),    -- 'MALE', 'FEMALE', 'OTHER'
    FOREIGN KEY (role_code) REFERENCES common_codes(code),
    FOREIGN KEY (status_code) REFERENCES common_codes(code),
    FOREIGN KEY (gender_code) REFERENCES common_codes(code)
);
```

---

## ✅ 공통코드의 장점

### 1. **유연성**
- 코드 추가/수정이 테이블 구조 변경 없이 가능
- 새로운 코드를 INSERT만으로 추가 가능

### 2. **다국어 지원**
- 각 언어별 코드명을 저장 가능
- 프론트엔드에서 언어에 따라 적절한 이름 표시

### 3. **메타데이터 관리**
- 각 코드에 대한 설명, 정렬 순서, 추가 정보 저장 가능
- JSON 필드로 확장 가능한 데이터 저장

### 4. **비활성화 관리**
- 사용하지 않는 코드를 `is_active = FALSE`로 비활성화
- 기존 데이터는 유지하면서 새 데이터에는 사용 불가

### 5. **중앙 관리**
- 모든 코드를 한 곳에서 관리
- 코드 변경 시 영향 범위 파악 용이

### 6. **정렬 순서 제어**
- `sort_order`로 드롭다운, 리스트 표시 순서 제어

---

## 📝 사용 예시

### 1. 코드 조회 (한국어)

```sql
-- 사용자 역할 목록 조회
SELECT code, code_name 
FROM common_codes 
WHERE group_code = 'USER_ROLE' 
  AND is_active = TRUE 
ORDER BY sort_order;

-- 결과:
-- ADMIN | 관리자
-- VIP   | VIP 회원
-- MEMBER| 일반 회원
```

### 2. 코드 조회 (영어)

```sql
-- 사용자 역할 목록 조회 (영문)
SELECT code, code_name_en as code_name 
FROM common_codes 
WHERE group_code = 'USER_ROLE' 
  AND is_active = TRUE 
ORDER BY sort_order;

-- 결과:
-- ADMIN | Administrator
-- VIP   | VIP Member
-- MEMBER| General Member
```

### 3. 사용자 정보와 코드명 함께 조회

```sql
-- 사용자 정보와 역할명 함께 조회
SELECT 
    u.id,
    u.username,
    u.role_code,
    cc.code_name as role_name
FROM users u
LEFT JOIN common_codes cc ON u.role_code = cc.code 
    AND cc.group_code = 'USER_ROLE'
WHERE u.id = 1;
```

### 4. 새로운 코드 추가 (테이블 구조 변경 불필요)

```sql
-- 새로운 카테고리 추가
INSERT INTO common_codes (group_code, code, code_name, code_name_en, sort_order) 
VALUES ('SPOT_CATEGORY', 'HOTEL', '호텔', 'Hotel', 7);

-- 즉시 사용 가능! ALTER TABLE 불필요
```

---

## 🎨 프론트엔드 활용 예시

### JavaScript 예시

```javascript
// 공통코드 API 호출
async function getCommonCodes(groupCode, language = 'ko') {
    const response = await fetch(`/api/common-codes/${groupCode}?lang=${language}`);
    const codes = await response.json();
    return codes;
}

// 드롭다운 생성
async function createRoleDropdown() {
    const codes = await getCommonCodes('USER_ROLE', 'ko');
    const select = document.getElementById('role-select');
    
    codes.forEach(code => {
        const option = document.createElement('option');
        option.value = code.code;
        option.textContent = code.codeName; // '관리자', 'VIP 회원', '일반 회원'
        select.appendChild(option);
    });
}
```

---

## 🔍 비교표

| 항목 | ENUM | 공통코드 테이블 |
|-----|------|----------------|
| 코드 추가 | ALTER TABLE 필요 | INSERT만으로 가능 |
| 코드 수정 | ALTER TABLE 필요 | UPDATE만으로 가능 |
| 다국어 지원 | 불가능 | 가능 (별도 컬럼) |
| 설명 저장 | 불가능 | 가능 |
| 정렬 순서 | 불가능 | 가능 |
| 비활성화 | 불가능 | 가능 |
| 확장성 | 낮음 | 높음 |
| 성능 | 빠름 | 약간 느림 (JOIN 필요) |
| 관리 편의성 | 낮음 | 높음 |

---

## 💼 실무 적용 가이드

### 언제 ENUM을 사용할까?
- 코드값이 거의 변경되지 않을 때
- 성능이 매우 중요한 경우
- 단순한 true/false 같은 이진 값

### 언제 공통코드를 사용할까?
- 코드값이 자주 추가/변경될 가능성이 있을 때
- 다국어 지원이 필요한 경우
- 관리자가 코드를 직접 관리해야 할 때
- 코드에 메타데이터(설명, 순서 등)가 필요할 때

---

## 🚀 현재 스키마에 적용한다면?

현재 스키마의 ENUM들을 공통코드로 변경하면:

1. **users 테이블**
   - `role` → `role_code` (VARCHAR, 공통코드 참조)
   - `status` → `status_code` (VARCHAR, 공통코드 참조)
   - `gender` → `gender_code` (VARCHAR, 공통코드 참조)

2. **tourist_spots 테이블**
   - `category` → `category_code` (VARCHAR, 공통코드 참조)

3. **review_reports 테이블**
   - `status` → `status_code` (VARCHAR, 공통코드 참조)

이렇게 변경하면 관리자 페이지에서 코드를 직접 추가/수정할 수 있고, 
다국어 지원도 쉽게 구현할 수 있습니다!
