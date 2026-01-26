# ORORA 프로젝트 아키텍처 및 데이터 플로우

## 1. 프로젝트 개요

ORORA는 **부산 관광지(지역/태그/테마/통합 검색)**, **관광지 상세**, **리뷰/댓글/좋아요**, **관광지/사진 추가 신청**, **관리자 관리 화면**을 제공하는 Spring Boot 기반 웹 애플리케이션입니다.

### 기술 스택
- **프레임워크**: Spring Boot `3.5.9`
- **언어**: Java `17`
- **빌드**: Gradle
- **DB**: MySQL
- **퍼시스턴스**: MyBatis `3.0.5` (Mapper Interface + XML)
- **뷰**: Thymeleaf + Layout Dialect
- **보안**: Spring Security + OAuth2 Client(카카오/구글)
- **로깅**: Log4j2 (+ log4jdbc)
- **기타**: dotenv-java, Validation, Lombok, DevTools

## 2. 디렉토리 구조(핵심)

### 2.1 백엔드 패키지 구조
`src/main/java/com/busan/orora/` 하위가 ORORA의 도메인 패키지입니다.

```
com/busan/orora/
├── OroraApplication.java
├── config/                # Security/OAuth2/WebMvc 설정
├── controller/            # 관리자 API, 페이지 라우팅(PageController)
├── common/                # 파일 업로드 공통(FileService 등)
├── commoncode/            # 공통코드(코드그룹/코드) 관리
├── user/                  # 로그인/회원가입/프로필
├── spot/                  # 관광지/이미지/신청(spot_requests)
├── region/                # 지역 조회
├── hashtag/               # 해시태그 조회
├── review/                # 리뷰/댓글/신고
├── like/                  # 관광지/리뷰 좋아요
└── search/                # 통합 검색
```

### 2.2 리소스 구조

```
src/main/resources/
├── application.yaml
├── mybatis-config.xml
├── mapper/                # MyBatis XML (userMapper.xml, spotMapper.xml 등)
├── templates/             # Thymeleaf 템플릿
│   ├── layouts/layout.html
│   ├── components/        # header/footer/list-item 등 공용 컴포넌트
│   └── pages/             # 실제 화면(page) 템플릿
└── static/                # css/js/images/lang 등 정적 리소스
```

## 3. 아키텍처 패턴

### 3.1 레이어드 아키텍처
프로젝트는 일반적인 **Controller → Service → Mapper → DB** 구조를 따릅니다.

- **Controller**: HTTP 요청 처리(REST API, 페이지 라우팅)
- **Service**: 비즈니스 로직/트랜잭션
- **Mapper(XML)**: SQL 및 결과 매핑

### 3.2 도메인 단위 모듈화
기능 중심으로 `spot`, `review`, `user`, `admin(commoncode 포함)` 등으로 분리되어 있으며, 각 도메인은 `controller/dto/mapper/service` 형태를 가집니다.

## 4. 라우팅(페이지) 구조

페이지 라우팅은 주로 `com.busan.orora.controller.PageController`에서 처리합니다.

- **메인**: `GET /`, `GET /index`
- **검색**: `GET /pages/search-place/place|tag|theme|search`
- **상세**: `GET /pages/detailed/detailed?id={spotId}`
- **로그인/회원가입**: `GET /pages/login/*`
- **마이페이지**: `GET /pages/mypage/mypage`
- **타인 프로필**: `GET /pages/profile/{userId}` → 템플릿은 `pages/mypage/mypage.html`을 재사용(리뷰 탭만 노출)
- **관리자**: `GET /pages/admin/management` → `pages/admin/admin.html`

## 5. 보안/인증

보안 설정은 `com.busan.orora.config.SecurityConfig`에 정의됩니다.

- **세션 기반 인증**: 기본적으로 세션을 사용합니다.
- **정적 리소스 허용**: `/css/**`, `/js/**`, `/images/**`, `/lang/**` 등
- **공개 페이지 허용**: `/pages/**` (페이지 자체는 공개)
- **공개 API 허용(대표)**:
  - `GET /api/tourist-spots/**` (관광지 조회)
  - `GET /api/reviews` (리뷰 조회)
  - `GET /api/regions/**`, `GET /api/tag-spots`, `GET /api/search/**`
  - `POST /api/auth/**` (로그인/회원가입/로그아웃 등)
- **인증 필요**:
  - `/api/admin/**`, `/pages/admin/**`
  - 그 외 `/api/**` (리뷰 작성/좋아요/신청 등)
- **OAuth2 로그인(옵션)**: 설정이 존재할 때만 활성화되며 로그인 페이지는 `/pages/login/login` 입니다.

## 6. 파일 업로드/서빙 구조

### 6.1 저장 경로 설정
`application.yaml`의 `file.upload.*Location`을 사용합니다.

- `file.upload.spotImgLocation`: 관광지/신청 이미지 저장 폴더
- `file.upload.profileImgLocation`: 프로필 이미지 저장 폴더
- `file.upload.reviewImgLocation`: 리뷰 이미지 저장 폴더

기본값은 프로젝트 루트 기준의 상대 경로(`upload/spots`, `upload/profiles`, `upload/reviews`)이며, 운영 환경에서는 절대 경로로 변경 가능합니다.

### 6.2 이미지 URL 서빙
`com.busan.orora.config.WebMvcConfig`에서 업로드 폴더를 다음 URL로 매핑합니다.

- 관광지 이미지: `/images/upload/spots/**`
- 프로필 이미지: `/images/upload/profiles/**`
- 리뷰 이미지: `/images/upload/reviews/**`

또한 레거시 파일을 위해 프로젝트 루트의 `upload/*` 폴더도 폴백 경로로 함께 등록합니다.

## 7. 주요 데이터 플로우(대표 시나리오)

### 7.1 테마/지역/태그 검색(관광지 목록)
1) 사용자가 `GET /pages/search-place/theme`(또는 place/tag) 접속  
2) 프론트 JS가 `GET /api/tourist-spots` 호출  
3) `SpotService.getAllSpotsGroupedByRegion()`이 관광지를 조회하고,
   - 지역/대표이미지/해시태그/평점 통계를 배치 조회하여 조합  
4) 응답은 다음 형태를 가집니다:
   - 최상위: `{ "regions": { "area01": { name, code, spots: [...] }, ... } }`

### 7.2 관광지 상세
1) 사용자가 `GET /pages/detailed/detailed?id={spotId}` 접속  
2) 프론트 JS가 `GET /api/tourist-spots/{id}` 호출  
3) 서버는 카테고리 활성 여부를 확인하고(비활성 카테고리는 ADMIN만 접근),
   조회수 증가 후 이미지/해시태그/지역 정보를 포함해 반환  

### 7.3 리뷰/댓글/신고
- 리뷰 조회: `GET /api/reviews?touristSpotId={id}&userId={optional}`
- 리뷰 작성/수정/삭제: `POST/PUT/DELETE /api/reviews`
- 댓글: `GET/POST /api/reviews/{reviewId}/comments`, `PUT/DELETE /api/comments/{commentId}`
- 신고: `POST /api/reviews/{reviewId}/report`, `POST /api/comments/{commentId}/report`

### 7.4 관광지/사진 추가 신청(사용자)
- 사진 추가 신청: `POST /api/spot-requests/photo` (이미지 업로드)
- 관광지 추가 신청: `POST /api/spot-requests/spot` (단일/다중 이미지 업로드 가능)
- 정보 수정 요청: `POST /api/spot-requests/edit`
- 신청 취소: `DELETE /api/spot-requests/{requestId}?userId={userId}`

### 7.5 관리자 플로우(요약)
- 관광지/사용자/공통코드/신청/신고 관리는 `GET /pages/admin/management` + `/api/admin/**` 조합으로 동작합니다.

## 8. 문서 위치 안내

- **API 명세**: `instruction/docs/API_SPECIFICATION.md`
- **DB 정의**: `instruction/docs/TABLE_DEFINITION.md`
- **메뉴 구조**: `instruction/docs/MENU_STRUCTURE.md`
- **테마 페이지 구현 가이드**: `instruction/THEME_PAGE_SETUP.md` (docs 폴더 밖)

---

**마지막 갱신**: 2026-01-26

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

---

## (ORORA 추가) 사용자 프로필(타인) 보기 플로우

### 개요
리뷰/댓글/포토리뷰 모달 등에서 **작성자 이름/프로필 이미지 클릭** 시 해당 유저의 프로필(마이페이지 형태)을 볼 수 있습니다.

### 페이지 엔드포인트
- `GET /pages/profile/{userId}`: 타인 프로필 페이지 (템플릿: `pages/mypage/mypage`)

### 화면 동작 요약
- 타인 프로필에서는 **프로필 수정 버튼 숨김**
- 타인 프로필에서는 **리뷰 탭만 노출** (그 외 탭 숨김)
- 데이터 로딩:
  - `GET /api/users/{userId}` (사용자 기본 정보)
  - `GET /api/users/{userId}/reviews` (작성 리뷰 목록)

### 관련 파일
- `src/main/java/com/busan/orora/controller/PageController.java` (페이지 라우팅)
- `src/main/resources/templates/pages/mypage/mypage.html` (뷰)
- `src/main/resources/static/js/mypage.js` (타인 프로필 모드 로직)
- `src/main/resources/static/js/detailPage.js` (리뷰/댓글/포토리뷰 모달에서 프로필 이동)
- `src/main/resources/static/js/admin.js` (관리자 유저관리 ‘프로필’ 버튼 이동)

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
