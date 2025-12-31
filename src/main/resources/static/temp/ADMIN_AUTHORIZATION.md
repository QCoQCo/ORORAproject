# ADMIN 권한 판별 과정

이 문서는 로그인한 사용자가 ADMIN인지 아닌지를 판별하는 전체 과정을 설명합니다.

## 1. 권한 판별 방식 개요

이 프로젝트에서는 **두 가지 방식**으로 ADMIN 권한을 판별합니다:

1. **Spring Security 자동 판별**: URL 접근 제어 (SecurityConfig)
2. **수동 판별**: Controller/Service에서 코드로 직접 체크

---

## 2. 권한 데이터 구조

### 2.1 Role Enum
```java
// src/main/java/com/macademy/shop/member/constant/Role.java
public enum Role {
    USER, ADMIN;
}
```

### 2.2 MemberDto의 Role 필드
```java
// src/main/java/com/macademy/shop/member/dto/MemberDto.java
public class MemberDto {
    private Role role;  // USER 또는 ADMIN
    // ...
}
```

### 2.3 데이터베이스 저장
- DB의 `member` 테이블에 `role` 컬럼에 `'USER'` 또는 `'ADMIN'` 문자열로 저장
- MyBatis가 자동으로 Enum으로 변환

---

## 3. 로그인 시 권한 부여 과정

### 3.1 전체 플로우
```
1. 사용자 로그인 요청
   ↓
2. Spring Security Filter Chain
   ↓
3. MemberSecurityService.loadUserByUsername() 호출
   ↓
4. MemberService.login() → DB에서 사용자 조회
   ↓
5. MemberDto의 role 필드 확인 (USER 또는 ADMIN)
   ↓
6. SimpleGrantedAuthority 생성: "ROLE_" + role.toString()
   ↓
7. UserDetails 객체에 권한 정보 저장
   ↓
8. SecurityContext에 인증 정보 저장
```

### 3.2 MemberSecurityService 코드 분석
```java
// src/main/java/com/macademy/shop/member/service/MemberSecurityService.java

@Override
public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    // 1. DB에서 사용자 정보 조회
    MemberDto memberDto = memberService.login(username);
    
    if (memberDto == null) {
        throw new UsernameNotFoundException("User not found: " + username);
    }
    
    // 2. Role을 Spring Security의 GrantedAuthority로 변환
    List<GrantedAuthority> authorities = new ArrayList<>();
    // "ROLE_USER" 또는 "ROLE_ADMIN" 형태로 생성
    authorities.add(new SimpleGrantedAuthority("ROLE_" + memberDto.getRole().toString()));
    
    // 3. UserDetails 객체 생성 및 반환
    return User.builder()
            .username(memberDto.getId())
            .password(memberDto.getPassword())
            .authorities(authorities)  // 권한 정보 포함
            .build();
}
```

**중요 포인트:**
- `memberDto.getRole().toString()`은 `"USER"` 또는 `"ADMIN"`을 반환
- Spring Security는 `"ROLE_"` 접두사를 붙여서 `"ROLE_USER"` 또는 `"ROLE_ADMIN"`으로 저장
- 이 권한 정보는 `SecurityContext`에 저장되어 세션 동안 유지됨

---

## 4. 권한 판별 방법

### 4.1 방법 1: Spring Security 자동 판별 (URL 접근 제어)

#### SecurityConfig 설정
```java
// src/main/java/com/macademy/shop/config/SecurityConfig.java

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
            .requestMatchers("/", "/members/**", "/item/**", "/img/**").permitAll()
            .requestMatchers("/admin/item/new").permitAll()
            .requestMatchers("/admin/**").hasRole("ADMIN")  // ← ADMIN 권한 체크
            .anyRequest().authenticated())
        // ...
}
```

#### 동작 방식
1. 사용자가 `/admin/**` 경로로 요청
2. Spring Security가 자동으로 현재 사용자의 권한 확인
3. `hasRole("ADMIN")`은 내부적으로 `"ROLE_ADMIN"` 권한을 확인
4. 권한이 없으면 `403 Forbidden` 또는 로그인 페이지로 리다이렉트

#### 장점
- 코드 작성 불필요
- URL 레벨에서 자동 보호
- 일관된 보안 정책 적용

#### 예시
```java
// ItemController의 /admin/items 엔드포인트
@GetMapping("/admin/items")
public String itemListPage(...) {
    // 이 메서드는 ADMIN만 접근 가능
    // SecurityConfig에서 자동으로 필터링됨
}
```

---

### 4.2 방법 2: 수동 판별 (코드에서 직접 체크)

#### CartController 예시
```java
// src/main/java/com/macademy/shop/cart/controller/CartController.java

public boolean validateCartItem(Long cartItemId, Principal principal) {
    CartDetailDto cartItem = cartService.findCartItem(cartItemId);
    if (cartItem == null || cartItem.getMemberId() == null) {
        return false;
    }
    
    Long currentMemberId = cartService.findMemberId(principal.getName());
    if (currentMemberId == null) {
        return false;
    }
    
    // 1. Principal에서 사용자 ID 가져오기
    // 2. MemberService로 사용자 정보 조회
    MemberDto currentMember = memberService.login(principal.getName());
    
    // 3. Role이 ADMIN인지 직접 비교
    if (currentMember != null && currentMember.getRole() == Role.ADMIN) {
        return true;  // ADMIN은 항상 권한 있음
    }
    
    // 4. 일반 사용자는 본인 것만 접근 가능
    return cartItem.getMemberId().equals(currentMemberId);
}
```

#### 수동 판별 단계
```
1. Principal.getName() → 현재 로그인한 사용자 ID 가져오기
   ↓
2. MemberService.login(id) → DB에서 MemberDto 조회
   ↓
3. memberDto.getRole() → Role enum 값 가져오기
   ↓
4. memberDto.getRole() == Role.ADMIN → 비교
```

#### 사용 시나리오
- **비즈니스 로직에서 조건부 처리**: ADMIN은 특별한 권한 부여
- **세밀한 권한 제어**: URL 레벨이 아닌 데이터 레벨에서 권한 체크
- **복잡한 권한 로직**: 여러 조건을 조합한 권한 판별

---

## 5. 권한 판별 방법 비교

| 구분 | Spring Security 자동 판별 | 수동 판별 |
|------|-------------------------|----------|
| **사용 위치** | SecurityConfig | Controller/Service |
| **체크 시점** | 요청 전 (Filter Chain) | 비즈니스 로직 내 |
| **코드 작성** | 설정만 필요 | 직접 코드 작성 |
| **용도** | URL 접근 제어 | 세밀한 권한 제어 |
| **예시** | `/admin/**` 접근 제한 | ADMIN은 모든 장바구니 접근 가능 |

---

## 6. 실제 사용 예시

### 6.1 URL 레벨 접근 제어 (자동)
```java
// SecurityConfig.java
.requestMatchers("/admin/**").hasRole("ADMIN")

// ItemController.java
@GetMapping("/admin/items")
public String itemListPage(...) {
    // ADMIN만 접근 가능 (자동 필터링)
}
```

### 6.2 비즈니스 로직에서 권한 체크 (수동)
```java
// CartController.java
@PostMapping("/cart/{cartItemId}/update")
public ResponseEntity<Map<String, Object>> updateCartItem(
        @PathVariable Long cartItemId,
        @RequestBody Map<String, Object> requestBody,
        Principal principal) {
    
    // 수동 권한 체크
    if (!validateCartItem(cartItemId, principal)) {
        response.put("success", false);
        response.put("message", "권한이 없습니다.");
        return ResponseEntity.badRequest().body(response);
    }
    
    // 권한이 있으면 처리 계속
    // ...
}
```

### 6.3 ADMIN 특별 처리
```java
// CartController.validateCartItem() 메서드 내부
MemberDto currentMember = memberService.login(principal.getName());

// ADMIN은 모든 장바구니 아이템에 접근 가능
if (currentMember != null && currentMember.getRole() == Role.ADMIN) {
    return true;  // ADMIN은 항상 true 반환
}

// 일반 사용자는 본인 것만 접근 가능
return cartItem.getMemberId().equals(currentMemberId);
```

---

## 7. 권한 정보 확인 방법

### 7.1 Controller에서 현재 사용자 권한 확인
```java
@Controller
public class SomeController {
    
    @Autowired
    private MemberService memberService;
    
    @GetMapping("/some-endpoint")
    public String someMethod(Principal principal) {
        // 방법 1: MemberService를 통해 조회
        MemberDto member = memberService.login(principal.getName());
        if (member.getRole() == Role.ADMIN) {
            // ADMIN 처리
        }
        
        // 방법 2: SecurityContext에서 직접 확인 (추가 구현 필요)
        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }
}
```

### 7.2 Thymeleaf 템플릿에서 권한 확인
```html
<!-- Spring Security Thymeleaf 확장 사용 -->
<div sec:authorize="hasRole('ADMIN')">
    <!-- ADMIN만 보이는 내용 -->
    <a href="/admin/items">상품 관리</a>
</div>
```

---

## 8. 권한 판별 흐름도

### 8.1 로그인 시 권한 부여
```
┌─────────────────┐
│  사용자 로그인   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Spring Security Filter   │
└────────┬─────────────────┘
         │
         ▼
┌─────────────────────────┐
│ MemberSecurityService    │
│ loadUserByUsername()     │
└────────┬─────────────────┘
         │
         ▼
┌─────────────────────────┐
│ MemberService.login()   │
│ → DB에서 MemberDto 조회 │
└────────┬─────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Role 확인               │
│ USER 또는 ADMIN         │
└────────┬─────────────────┘
         │
         ▼
┌─────────────────────────┐
│ GrantedAuthority 생성    │
│ "ROLE_USER" 또는        │
│ "ROLE_ADMIN"            │
└────────┬─────────────────┘
         │
         ▼
┌─────────────────────────┐
│ SecurityContext 저장     │
│ (세션 동안 유지)         │
└─────────────────────────┘
```

### 8.2 요청 시 권한 체크
```
┌─────────────────┐
│  요청 발생       │
│  /admin/items   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Spring Security Filter   │
│ SecurityConfig 확인      │
└────────┬─────────────────┘
         │
         ▼
┌─────────────────────────┐
│ hasRole("ADMIN") 체크    │
│ SecurityContext에서     │
│ "ROLE_ADMIN" 권한 확인   │
└────────┬─────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌──────────┐
│ 있음  │ │ 없음     │
└───┬───┘ └────┬─────┘
    │          │
    ▼          ▼
┌─────────┐ ┌──────────────┐
│ 요청 허용│ │ 403 Forbidden│
│ Controller│ │ 또는 리다이렉트│
│ 실행     │ └──────────────┘
└─────────┘
```

---

## 9. 주의사항 및 베스트 프랙티스

### 9.1 주의사항
1. **Role Enum 비교**: `==` 연산자 사용 가능 (Enum은 싱글톤)
2. **Principal.getName()**: 로그인한 사용자의 ID 반환 (member.id 필드)
3. **DB 조회 오버헤드**: 수동 판별 시 매번 DB 조회가 발생할 수 있음

### 9.2 권장 사항
1. **URL 레벨 보호**: 가능하면 SecurityConfig에서 처리
2. **캐싱 고려**: 자주 사용되는 권한 정보는 캐싱 고려
3. **일관성 유지**: 권한 체크 로직을 한 곳에 모아서 관리

### 9.3 개선 가능한 부분
```java
// 현재: 매번 DB 조회
MemberDto member = memberService.login(principal.getName());
if (member.getRole() == Role.ADMIN) { ... }

// 개선: SecurityContext에서 직접 확인 (추가 구현 필요)
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
boolean isAdmin = auth.getAuthorities().stream()
    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
```

---

## 10. 요약

### ADMIN 권한 판별의 핵심 포인트

1. **로그인 시**: `MemberSecurityService`가 DB의 `role` 값을 `"ROLE_ADMIN"` 권한으로 변환하여 저장
2. **자동 판별**: `SecurityConfig`의 `hasRole("ADMIN")`으로 URL 접근 제어
3. **수동 판별**: `MemberService.login()`으로 사용자 조회 후 `getRole() == Role.ADMIN` 비교
4. **권한 저장 위치**: `SecurityContext` (세션 동안 유지)
5. **권한 형식**: Spring Security는 `"ROLE_"` 접두사 필요 (`"ROLE_ADMIN"`)

이 프로젝트에서는 **두 가지 방식을 혼합**하여 사용하며, URL 레벨 보호는 자동으로, 비즈니스 로직 내 세밀한 제어는 수동으로 처리합니다.
