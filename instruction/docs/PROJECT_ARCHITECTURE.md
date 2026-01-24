# 프로젝트 아키텍처 및 데이터 플로우 문서

## 1. 프로젝트 개요

### 기술 스택
- **프레임워크**: Spring Boot 3.5.8
- **언어**: Java 17
- **빌드 도구**: Gradle
- **데이터베이스**: MySQL
- **ORM**: MyBatis 3.0.5
- **템플릿 엔진**: Thymeleaf (Layout Dialect 포함)
- **보안**: Spring Security 6
- **로깅**: Log4j2
- **기타**: Lombok, Validation, DevTools

### 프로젝트 구조
```
shop/
├── src/main/java/com/macademy/shop/
│   ├── ShopApplication.java          # 메인 애플리케이션 진입점
│   ├── HelloController.java          # 메인 페이지 컨트롤러
│   ├── config/                       # 설정 클래스
│   │   ├── SecurityConfig.java       # Spring Security 설정
│   │   ├── WebMvcConfig.java         # Web MVC 설정
│   │   ├── PageHandler.java          # 페이징 처리 유틸리티
│   │   └── CustomAuthenticationEntryPoint.java
│   ├── member/                       # 회원 관리 도메인
│   │   ├── controller/
│   │   ├── service/
│   │   ├── mapper/
│   │   ├── dto/
│   │   ├── form/
│   │   └── constant/
│   ├── item/                         # 상품 관리 도메인
│   │   ├── controller/
│   │   ├── service/
│   │   ├── mapper/
│   │   ├── dto/
│   │   ├── form/
│   │   └── constant/
│   ├── cart/                         # 장바구니 도메인
│   │   ├── controller/
│   │   ├── service/
│   │   ├── mapper/
│   │   ├── dto/
│   │   └── form/
│   ├── order/                        # 주문 관리 도메인
│   │   ├── controller/
│   │   ├── service/
│   │   ├── mapper/
│   │   ├── dto/
│   │   ├── form/
│   │   └── constant/
│   ├── main/                         # 메인 페이지 도메인
│   │   ├── service/
│   │   ├── mapper/
│   │   └── dto/
│   └── exception/                    # 예외 처리
│
├── src/main/resources/
│   ├── application.yaml              # 애플리케이션 설정
│   ├── mybatis-config.xml            # MyBatis 설정
│   ├── mapper/                       # MyBatis Mapper XML
│   │   ├── memberMapper.xml
│   │   ├── itemMapper.xml
│   │   ├── cartMapper.xml
│   │   ├── orderMapper.xml
│   │   ├── mainMapper.xml
│   │   └── common.xml                # 공통 SQL 조각
│   ├── templates/                    # Thymeleaf 템플릿
│   │   ├── layouts/
│   │   ├── fragments/
│   │   ├── index.html
│   │   ├── members/
│   │   ├── item/
│   │   ├── cart/
│   │   └── order/
│   └── static/                       # 정적 리소스
│       ├── css/
│       └── images/
│
└── build.gradle                      # Gradle 빌드 설정
```

## 2. 아키텍처 패턴

### 2.1 레이어드 아키텍처 (Layered Architecture)
프로젝트는 전통적인 3계층 아키텍처를 따릅니다:

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│  (Controller + Thymeleaf Templates)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Business Logic Layer          │
│         (Service Classes)            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Data Access Layer            │
│    (Mapper Interface + XML)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Database (MySQL)            │
└─────────────────────────────────────┘
```

### 2.2 도메인별 패키지 구조
각 도메인(member, item, cart, order)은 독립적인 패키지로 구성되며, 동일한 구조를 가집니다:
- `controller/`: HTTP 요청 처리
- `service/`: 비즈니스 로직
- `mapper/`: 데이터베이스 접근 인터페이스
- `dto/`: 데이터 전송 객체
- `form/`: 폼 검증용 객체
- `constant/`: 상수 정의

## 3. 데이터베이스 스키마

### 3.1 주요 테이블 구조

#### member (회원)
- `member_id` (PK, AUTO_INCREMENT)
- `id` (로그인 ID, UNIQUE)
- `password` (BCrypt 암호화)
- `name`
- `email`
- `address`
- `role` (USER/ADMIN)
- `oauth` (OAuth 타입)
- `reg_time`, `update_time`

#### item (상품)
- `item_id` (PK, AUTO_INCREMENT)
- `item_name`
- `price`
- `stock_num` (재고 수량)
- `item_detail`
- `item_sell_status` (SELL/SOLD_OUT)
- `reg_time`, `update_time`

#### item_img (상품 이미지)
- `item_img_id` (PK, AUTO_INCREMENT)
- `img_name` (저장된 파일명)
- `ori_img_name` (원본 파일명)
- `img_url` (이미지 경로)
- `rep_img_yn` (대표 이미지 여부: Y/N)
- `item_id` (FK → item.item_id)
- `reg_time`, `update_time`

#### cart (장바구니)
- `cart_id` (PK, AUTO_INCREMENT)
- `member_id` (FK → member.member_id)

#### cart_item (장바구니 상품)
- `cart_item_id` (PK, AUTO_INCREMENT)
- `cart_id` (FK → cart.cart_id)
- `item_id` (FK → item.item_id)
- `count` (수량)
- `reg_time`, `update_time`

#### orders (주문)
- `order_id` (PK, AUTO_INCREMENT)
- `member_id` (FK → member.member_id)
- `order_date`
- `order_status` (ORDER/CANCEL)

#### order_item (주문 상품)
- `order_item_id` (PK, AUTO_INCREMENT)
- `order_id` (FK → orders.order_id)
- `item_id` (FK → item.item_id)
- `order_price` (주문 당시 가격)
- `count` (수량)

### 3.2 테이블 관계도
```
member (1) ──── (1) cart
member (1) ──── (N) orders
item (1) ──── (N) item_img
item (1) ──── (N) cart_item
item (1) ──── (N) order_item
cart (1) ──── (N) cart_item
orders (1) ──── (N) order_item
```

## 4. 주요 데이터 플로우

### 4.1 회원 가입 플로우
```
1. 사용자 → GET /members/new
   ↓
2. MemberController.memberForm()
   ↓
3. Thymeleaf: members/memberJoinForm.html 렌더링
   ↓
4. 사용자 입력 → POST /members/new
   ↓
5. MemberController.newMember()
   ↓
6. MemberService.memberInsert()
   ↓
7. PasswordEncoder.encode() (BCrypt 암호화)
   ↓
8. MemberMapper.memberInsert()
   ↓
9. INSERT INTO member
```

### 4.2 로그인 플로우
```
1. 사용자 → GET /members/login
   ↓
2. MemberController.loginForm()
   ↓
3. Thymeleaf: members/memberLoginForm.html 렌더링
   ↓
4. 사용자 입력 → POST /members/login
   ↓
5. Spring Security Filter Chain
   ↓
6. MemberSecurityService.loadUserByUsername()
   ↓
7. MemberMapper.login() → DB 조회
   ↓
8. PasswordEncoder.matches() (비밀번호 검증)
   ↓
9. 인증 성공 → SecurityContext에 저장
   ↓
10. defaultSuccessUrl("/") 리다이렉트
```

### 4.3 상품 등록 플로우 (관리자)
```
1. 관리자 → GET /admin/item/new
   ↓
2. ItemController.itemForm()
   ↓
3. Thymeleaf: item/itemForm.html 렌더링
   ↓
4. 관리자 입력 + 파일 업로드 → POST /admin/item/new
   ↓
5. ItemController.itemNew()
   ↓
6. ItemService.itemInsert() (@Transactional)
   ↓
7. ItemMapper.itemInsert() → item 테이블 INSERT
   ↓
8. ItemImgService.saveItemImg() (각 이미지 파일)
   ↓
9. FileService.uploadFile() → 파일 시스템 저장
   ↓
10. ItemMapper.itemImgInsert() → item_img 테이블 INSERT
```

### 4.4 상품 조회 플로우 (메인 페이지)
```
1. 사용자 → GET /?page=1&searchQuery=과자
   ↓
2. HelloController.main()
   ↓
3. MainService.getMainItemList()
   ↓
4. MainMapper.mainItemList()
   ↓
5. SQL: SELECT item + item_img (JOIN, WHERE rep_img_yn='Y')
   ↓
6. 페이징 처리 (PageHandler)
   ↓
7. Model에 데이터 추가
   ↓
8. Thymeleaf: index.html 렌더링
```

### 4.5 장바구니 추가 플로우
```
1. 사용자 → POST /cart (JSON)
   {
     "itemId": 1,
     "count": 2
   }
   ↓
2. CartController.order() (@RequestBody)
   ↓
3. CartService.createCartItem()
   ↓
4. CartService.isCartExists() → 장바구니 존재 확인
   ↓
5. 없으면 CartService.createCart() → cart 테이블 INSERT
   ↓
6. CartMapper.insertCartItem() → cart_item 테이블 INSERT
   ↓
7. ResponseEntity 반환 (JSON)
```

### 4.6 주문 생성 플로우
```
1. 사용자 → POST /order (JSON)
   {
     "itemId": 1,
     "count": 2
   }
   ↓
2. OrderController.order()
   ↓
3. OrderService.createOrder() (@Transactional)
   ↓
4. OrderMapper.insertOrder() → orders 테이블 INSERT
   ↓
5. OrderItemService.createOrderItem()
   ↓
6. OrderMapper.changeStock() → item.stock_num 감소
   ↓
7. OrderMapper.insertOrderItem() → order_item 테이블 INSERT
   ↓
8. ResponseEntity 반환 (JSON)
```

### 4.7 장바구니에서 주문 플로우
```
1. 사용자 → POST /cart/orders (JSON)
   {
     "cartOrderDtoList": [
       {"cartItemId": 1},
       {"cartItemId": 2}
     ]
   }
   ↓
2. CartController.orderCartItem()
   ↓
3. CartService.orderCartItem()
   ↓
4. CartMapper.findCartItemById() → 각 장바구니 아이템 조회
   ↓
5. OrderForm 리스트 생성
   ↓
6. OrderService.cartOrders() → 주문 생성
   ↓
7. CartService.deleteCartItem() → 장바구니에서 삭제
```

### 4.8 주문 취소 플로우
```
1. 사용자 → POST /order/{orderId}/cancel
   ↓
2. OrderController.cancelOrder()
   ↓
3. OrderService.validateOrder() → 권한 확인
   ↓
4. OrderService.cancelOrder()
   ↓
5. OrderMapper.findOrder() → 주문 조회
   ↓
6. OrderItemService.increaseStock() → 각 상품 재고 증가
   ↓
7. OrderMapper.cancelOrder() → order_status = 'CANCEL'
```

## 5. 보안 설정

### 5.1 Spring Security 설정 (SecurityConfig)
- **인증 방식**: Form Login
- **비밀번호 암호화**: BCryptPasswordEncoder
- **권한 관리**: Role-based (USER, ADMIN)
- **접근 제어**:
  - `/`, `/members/**`, `/item/**`, `/img/**` → permitAll()
  - `/admin/**` → hasRole("ADMIN")
  - 기타 → authenticated()

### 5.2 인증 프로세스
1. `MemberSecurityService`가 `UserDetailsService` 구현
2. 로그인 시 `loadUserByUsername()` 호출
3. `MemberMapper.login()`으로 DB에서 사용자 조회
4. `PasswordEncoder.matches()`로 비밀번호 검증
5. 인증 성공 시 `UserDetails` 반환

## 6. 주요 서비스 로직

### 6.1 ItemService
- **트랜잭션**: `@Transactional(rollbackFor = Exception.class)`
- **주요 기능**:
  - 상품 등록 (이미지 파일 처리 포함)
  - 상품 수정
  - 상품 조회 (페이징, 검색)
  - 상품 상세 조회

### 6.2 CartService
- **트랜잭션**: `@Transactional(rollbackFor = Exception.class)`
- **주요 기능**:
  - 장바구니 생성 (자동)
  - 장바구니 상품 추가
  - 장바구니 상품 수량 변경
  - 장바구니 상품 삭제
  - 장바구니에서 주문

### 6.3 OrderService
- **주요 기능**:
  - 단일 상품 주문 생성
  - 장바구니에서 주문 생성
  - 주문 조회 (페이징)
  - 주문 취소 (재고 복구 포함)
  - 주문 권한 검증

### 6.4 OrderItemService
- **주요 기능**:
  - 주문 상품 생성 (재고 감소)
  - 재고 증가 (주문 취소 시)

## 7. 페이징 처리

### 7.1 PageHandler 클래스
- **역할**: 페이징 정보 계산 및 제공
- **주요 속성**:
  - `totalCount`: 전체 레코드 수
  - `totalPage`: 전체 페이지 수
  - `startPage`, `endPage`: 네비게이션 범위
  - `pageSize`: 페이지당 레코드 수
  - `naviSize`: 네비게이션 크기 (10)

### 7.2 페이징 사용 예시
```java
int pageSize = 10;
int offset = (page - 1) * pageSize;
Map<String, Object> map = new HashMap<>();
map.put("pageSize", pageSize);
map.put("offset", offset);

List<ItemDto> items = itemService.itemListPage(map);
int totalCount = itemService.countAdminItems(map);
PageHandler ph = new PageHandler(totalCount, pageSize, page);
```

## 8. 파일 업로드 처리

### 8.1 FileService
- **업로드 경로**: `desktop/upload/` (application.yaml 설정)
- **최대 파일 크기**: 10MB
- **기능**:
  - 파일 저장 (UUID 기반 파일명 생성)
  - 파일 삭제

### 8.2 ItemImgService
- **기능**:
  - 상품 이미지 저장
  - 대표 이미지 설정 (첫 번째 이미지 = rep_img_yn='Y')
  - 이미지 업데이트

## 9. 검색 기능

### 9.1 공통 SQL 조각 (common.xml)
- `itemSearchConditions`: 재사용 가능한 검색 조건 SQL
- **검색 조건**:
  - 날짜 범위 (1일, 1주, 1개월, 6개월)
  - 판매 상태 (SELL, SOLD_OUT)
  - 상품명/상세설명 검색 (LIKE)

### 9.2 검색 사용 예시
```xml
<include refid="com.macademy.shop.mapper.commonSql.itemSearchConditions" />
```

## 10. 예외 처리

### 10.1 커스텀 예외
- `OutOfStockException`: 재고 부족 예외

### 10.2 예외 처리 패턴
- Service 계층에서 비즈니스 예외 발생
- Controller에서 try-catch로 처리
- ResponseEntity로 에러 메시지 반환 (REST API)
- Model에 에러 메시지 추가 후 뷰 반환 (일반 요청)

## 11. 설정 파일

### 11.1 application.yaml
- **데이터베이스**: MySQL (log4jdbc 사용)
- **MyBatis**: mapper-locations, config-location
- **파일 업로드**: max-file-size, max-request-size
- **개발 도구**: DevTools 활성화

### 11.2 SecurityConfig
- CSRF 비활성화
- Form Login 설정
- Logout 설정
- CustomAuthenticationEntryPoint 설정

## 12. API 엔드포인트 요약

### 12.1 회원 (Member)
- `GET /members/login` - 로그인 페이지
- `GET /members/new` - 회원가입 페이지
- `POST /members/new` - 회원가입 처리
- `POST /members/logout` - 로그아웃

### 12.2 상품 (Item)
- `GET /` - 메인 페이지 (상품 목록)
- `GET /item/{itemId}` - 상품 상세
- `GET /admin/item/new` - 상품 등록 페이지
- `POST /admin/item/new` - 상품 등록
- `GET /admin/item/{itemId}` - 상품 수정 페이지
- `POST /admin/item/{itemId}` - 상품 수정
- `GET /admin/items` - 상품 관리 목록 (페이징, 검색)

### 12.3 장바구니 (Cart)
- `GET /cart` - 장바구니 목록
- `POST /cart` - 장바구니 추가 (JSON)
- `POST /cart/{cartItemId}/update` - 수량 변경 (JSON)
- `DELETE /cart/{cartItemId}` - 장바구니 삭제
- `POST /cart/orders` - 장바구니에서 주문 (JSON)

### 12.4 주문 (Order)
- `POST /order` - 주문 생성 (JSON)
- `GET /orders` - 주문 내역 (페이징)
- `POST /order/{orderId}/cancel` - 주문 취소

## 13. 데이터 변환 패턴

### 13.1 Form → DTO 변환
- Controller에서 `Form` 객체를 받음
- Service에서 `Form`을 `DTO`로 변환
- Mapper에서 `DTO`를 사용하여 DB 작업

### 13.2 DTO → Form 변환
- Service에서 `DTO`를 조회
- `DTO`를 `Form`으로 변환하여 Controller에 반환
- Model에 `Form` 추가하여 뷰에 전달

## 14. 트랜잭션 관리

### 14.1 @Transactional 사용
- **ItemService**: 상품 등록/수정 시 여러 테이블 작업
- **CartService**: 장바구니 작업 시 여러 테이블 작업
- **OrderService**: 주문 생성 시 재고 감소와 주문 생성

### 14.2 롤백 정책
- `@Transactional(rollbackFor = Exception.class)`: 모든 예외 발생 시 롤백

## 15. 개발 가이드라인

### 15.1 패키지 구조 준수
- 각 도메인은 독립적인 패키지로 구성
- Controller → Service → Mapper 순서로 의존성 방향 유지

### 15.2 네이밍 규칙
- Controller: `{Domain}Controller`
- Service: `{Domain}Service`
- Mapper: `{Domain}Mapper`
- DTO: `{Domain}Dto` 또는 `{Purpose}Dto`
- Form: `{Purpose}Form`

### 15.3 의존성 주입
- `@RequiredArgsConstructor` (Lombok) 사용 권장
- `@Autowired` 필드 주입도 사용 (레거시 코드)

이 문서는 프로젝트의 전체 구조와 데이터 플로우를 이해하는 데 필요한 핵심 정보를 담고 있습니다. 새로운 사이트 개발 시 이 구조를 참고하여 유사한 아키텍처를 구축할 수 있습니다.
