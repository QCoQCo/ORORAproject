# 공통코드 마이그레이션 가이드

## 📋 개요

기존 `new_data_schema.sql`의 ENUM 타입을 공통코드로 변경하는 방법을 안내합니다.

---

## ⚠️ 중요: 수정이 필요한 이유

**공통코드 테이블만 추가해서는 실제로 사용할 수 없습니다!**

현재 상황:
- ✅ `common_code_schema.sql` 실행 → 공통코드 테이블 생성됨
- ❌ `new_data_schema.sql`의 ENUM 컬럼 → 여전히 ENUM 사용 중
- ❌ **연결이 안 되어 있음!**

**결과**: 공통코드 테이블은 있지만 실제로는 사용되지 않음

---

## 🔄 변경 사항 요약

### 변경 전 (ENUM 사용)
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

### 변경 후 (공통코드 사용)
```sql
-- users 테이블
role_code VARCHAR(50) DEFAULT 'MEMBER',
status_code VARCHAR(50) DEFAULT 'ACTIVE',
gender_code VARCHAR(50),
FOREIGN KEY (role_code) REFERENCES common_codes(code),
FOREIGN KEY (status_code) REFERENCES common_codes(code),
FOREIGN KEY (gender_code) REFERENCES common_codes(code),

-- tourist_spots 테이블
category_code VARCHAR(50) DEFAULT 'CULTURE',
FOREIGN KEY (category_code) REFERENCES common_codes(code),

-- review_reports 테이블
status_code VARCHAR(50) DEFAULT 'PENDING',
FOREIGN KEY (status_code) REFERENCES common_codes(code),
```

---

## 📝 마이그레이션 방법

### 방법 1: 새로 시작하는 경우 (권장)

1. **공통코드 테이블 먼저 생성**
   ```sql
   -- common_code_schema.sql 실행
   SOURCE common_code_schema.sql;
   ```

2. **수정된 스키마 사용**
   ```sql
   -- new_data_schema_with_common_code.sql 사용
   SOURCE new_data_schema_with_common_code.sql;
   ```

### 방법 2: 기존 데이터베이스가 있는 경우

#### Step 1: 공통코드 테이블 생성
```sql
-- common_code_schema.sql 실행
SOURCE common_code_schema.sql;
```

#### Step 2: 기존 테이블에 새 컬럼 추가
```sql
-- users 테이블
ALTER TABLE users 
ADD COLUMN role_code VARCHAR(50) DEFAULT 'MEMBER',
ADD COLUMN status_code VARCHAR(50) DEFAULT 'ACTIVE',
ADD COLUMN gender_code VARCHAR(50);

-- tourist_spots 테이블
ALTER TABLE tourist_spots 
ADD COLUMN category_code VARCHAR(50) DEFAULT 'CULTURE';

-- review_reports 테이블
ALTER TABLE review_reports 
ADD COLUMN status_code VARCHAR(50) DEFAULT 'PENDING';
```

#### Step 3: 기존 데이터 마이그레이션
```sql
-- users 테이블 데이터 변환
UPDATE users SET role_code = 'ADMIN' WHERE role = 'admin';
UPDATE users SET role_code = 'VIP' WHERE role = 'vip';
UPDATE users SET role_code = 'MEMBER' WHERE role = 'member';

UPDATE users SET status_code = 'ACTIVE' WHERE status = 'active';
UPDATE users SET status_code = 'INACTIVE' WHERE status = 'inactive';
UPDATE users SET status_code = 'SUSPENDED' WHERE status = 'suspended';

UPDATE users SET gender_code = 'MALE' WHERE gender = 'male';
UPDATE users SET gender_code = 'FEMALE' WHERE gender = 'female';
UPDATE users SET gender_code = 'OTHER' WHERE gender = 'other';

-- tourist_spots 테이블 데이터 변환
UPDATE tourist_spots SET category_code = 'BEACH' WHERE category = 'beach';
UPDATE tourist_spots SET category_code = 'MOUNTAIN' WHERE category = 'mountain';
UPDATE tourist_spots SET category_code = 'CULTURE' WHERE category = 'culture';
UPDATE tourist_spots SET category_code = 'FOOD' WHERE category = 'food';
UPDATE tourist_spots SET category_code = 'SHOPPING' WHERE category = 'shopping';
UPDATE tourist_spots SET category_code = 'CAFE' WHERE category = 'cafe';

-- review_reports 테이블 데이터 변환
UPDATE review_reports SET status_code = 'PENDING' WHERE status = 'pending';
UPDATE review_reports SET status_code = 'REVIEWED' WHERE status = 'reviewed';
UPDATE review_reports SET status_code = 'RESOLVED' WHERE status = 'resolved';
UPDATE review_reports SET status_code = 'DISMISSED' WHERE status = 'dismissed';
```

#### Step 4: 외래키 추가
```sql
-- users 테이블
ALTER TABLE users 
ADD FOREIGN KEY (role_code) REFERENCES common_codes(code),
ADD FOREIGN KEY (status_code) REFERENCES common_codes(code),
ADD FOREIGN KEY (gender_code) REFERENCES common_codes(code);

-- tourist_spots 테이블
ALTER TABLE tourist_spots 
ADD FOREIGN KEY (category_code) REFERENCES common_codes(code);

-- review_reports 테이블
ALTER TABLE review_reports 
ADD FOREIGN KEY (status_code) REFERENCES common_codes(code);
```

#### Step 5: 인덱스 추가
```sql
-- users 테이블
ALTER TABLE users 
ADD INDEX idx_role_code (role_code),
ADD INDEX idx_status_code (status_code);

-- tourist_spots 테이블
ALTER TABLE tourist_spots 
ADD INDEX idx_category_code (category_code);

-- review_reports 테이블
ALTER TABLE review_reports 
ADD INDEX idx_status_code (status_code);
```

#### Step 6: 기존 ENUM 컬럼 삭제 (선택사항)
```sql
-- ⚠️ 주의: 데이터 백업 후 진행하세요!

-- users 테이블
ALTER TABLE users 
DROP COLUMN role,
DROP COLUMN status,
DROP COLUMN gender;

-- tourist_spots 테이블
ALTER TABLE tourist_spots 
DROP COLUMN category;

-- review_reports 테이블
ALTER TABLE review_reports 
DROP COLUMN status;
```

---

## 🔍 코드 매핑 테이블

### USER_ROLE
| 기존 ENUM | 공통코드 | 설명 |
|----------|---------|------|
| 'admin' | 'ADMIN' | 관리자 |
| 'vip' | 'VIP' | VIP 회원 |
| 'member' | 'MEMBER' | 일반 회원 |

### USER_STATUS
| 기존 ENUM | 공통코드 | 설명 |
|----------|---------|------|
| 'active' | 'ACTIVE' | 활성 |
| 'inactive' | 'INACTIVE' | 비활성 |
| 'suspended' | 'SUSPENDED' | 정지 |

### GENDER
| 기존 ENUM | 공통코드 | 설명 |
|----------|---------|------|
| 'male' | 'MALE' | 남성 |
| 'female' | 'FEMALE' | 여성 |
| 'other' | 'OTHER' | 기타 |

### SPOT_CATEGORY
| 기존 ENUM | 공통코드 | 설명 |
|----------|---------|------|
| 'beach' | 'BEACH' | 해변 |
| 'mountain' | 'MOUNTAIN' | 산 |
| 'culture' | 'CULTURE' | 문화 |
| 'food' | 'FOOD' | 음식 |
| 'shopping' | 'SHOPPING' | 쇼핑 |
| 'cafe' | 'CAFE' | 카페 |

### REPORT_STATUS
| 기존 ENUM | 공통코드 | 설명 |
|----------|---------|------|
| 'pending' | 'PENDING' | 대기중 |
| 'reviewed' | 'REVIEWED' | 검토중 |
| 'resolved' | 'RESOLVED' | 처리완료 |
| 'dismissed' | 'DISMISSED' | 기각 |

---

## ✅ 마이그레이션 검증

### 1. 데이터 무결성 확인
```sql
-- NULL 값이 없는지 확인
SELECT COUNT(*) FROM users WHERE role_code IS NULL;
SELECT COUNT(*) FROM users WHERE status_code IS NULL;
SELECT COUNT(*) FROM tourist_spots WHERE category_code IS NULL;
SELECT COUNT(*) FROM review_reports WHERE status_code IS NULL;
```

### 2. 외래키 제약조건 확인
```sql
-- 잘못된 코드값이 없는지 확인
SELECT u.id, u.role_code 
FROM users u 
LEFT JOIN common_codes cc ON u.role_code = cc.code 
WHERE cc.code IS NULL AND u.role_code IS NOT NULL;
```

### 3. 코드 조회 테스트
```sql
-- 공통코드로 조회되는지 확인
SELECT 
    u.id,
    u.username,
    u.role_code,
    cc.code_name as role_name
FROM users u
LEFT JOIN common_codes cc ON u.role_code = cc.code 
    AND cc.group_code = 'USER_ROLE'
LIMIT 10;
```

---

## 🚨 주의사항

1. **백업 필수**: 마이그레이션 전 반드시 데이터베이스 백업
2. **순서 중요**: 공통코드 테이블을 먼저 생성한 후 다른 테이블 수정
3. **데이터 검증**: 마이그레이션 후 데이터 무결성 확인 필수
4. **애플리케이션 코드 수정**: 백엔드/프론트엔드 코드도 함께 수정 필요
   - ENUM 값 → 공통코드 값으로 변경
   - 예: `'admin'` → `'ADMIN'`

---

## 📚 관련 파일

- `common_code_schema.sql`: 공통코드 테이블 생성
- `new_data_schema.sql`: 기존 스키마 (ENUM 사용)
- `new_data_schema_with_common_code.sql`: 수정된 스키마 (공통코드 사용)
