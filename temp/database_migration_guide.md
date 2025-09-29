# 데이터베이스 마이그레이션 가이드

## 📋 개요

이 문서는 JSON 파일에서 MySQL 데이터베이스로 데이터를 마이그레이션하는 방법을 설명합니다. 업데이트된 스키마에 맞춰 새로운 테이블들과 필드들이 추가되었습니다.

## 🗂️ 마이그레이션 순서

### 1. 데이터베이스 생성 및 스키마 적용

```sql
-- 데이터베이스 생성
CREATE DATABASE arata_busan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE arata_busan;

-- 스키마 적용 (업데이트된 스키마)
SOURCE database_schema.sql;

-- 초기 데이터 삽입 (해시태그 # 기호 제거됨)
SOURCE initial_data.sql;
```

### 1.1 새로운 테이블 구조

업데이트된 스키마에는 다음 새로운 테이블들이 추가되었습니다:

-   `tourist_spot_views`: 관광지 조회 기록
-   `favorites`: 사용자 즐겨찾기
-   `search_logs`: 검색 기록
-   `image_metadata`: 이미지 메타데이터
-   `translations`: 다국어 지원

### 2. JSON 데이터 마이그레이션 스크립트

#### 2.1 관광지 데이터 마이그레이션

```sql
-- busanTouristSpots.json의 regions 데이터를 tourist_spots 테이블로 마이그레이션
-- 업데이트된 스키마에 맞춰 새로운 필드들이 추가되었습니다.

-- 예시: 기장군 관광지 데이터 (업데이트된 스키마)
INSERT INTO tourist_spots (
    region_id, title, description, image_url, image_path, image_alt,
    link_url, category, is_active, is_verified, view_count, rating_avg, rating_count
) VALUES
(1, '해동 용궁사', '바다 위에 세워진 아름다운 사찰입니다. 일출 명소로도 유명하며 독특한 위치로 많은 관광객이 찾습니다.',
 '../../images/2025(4).jpg', '../../images/2025(4).jpg', '해동 용궁사 전경', '#', 'culture', TRUE, TRUE, 0, 0.00, 0),
(1, '기장 해수욕장', '아름다운 해안 드라이브 코스로 유명한 기장의 해안선입니다. 카페와 맛집이 많아 드라이브 코스로 인기가 높습니다.',
 '../../images/common (33).jpg', '../../images/common (33).jpg', '기장 해수욕장 전경', '#', 'beach', TRUE, TRUE, 0, 0.00, 0);
```

#### 2.2 사용자 데이터 마이그레이션

```sql
-- users.json 데이터를 users 테이블로 마이그레이션
-- 업데이트된 스키마에 맞춰 새로운 인증 관련 필드들이 추가되었습니다.

INSERT INTO users (
    user_id, username, email, password_hash, role, status, phone_number, address,
    birth_date, gender, join_date, last_login, login_count, email_verified,
    email_verification_token, password_reset_token, password_reset_expires
) VALUES
('user001', '테스트유저', 'user001@gmail.com', '$2b$10$hashed_password_here', 'member', 'active',
 '010-2345-6789', '부산광역시 중구', '1990-07-22', 'female', '2024-02-15', '2024-12-18',
 0, FALSE, NULL, NULL, NULL);
```

#### 2.3 해시태그 데이터 마이그레이션

```sql
-- 해시태그 데이터 마이그레이션 (# 기호 제거됨)
-- JSON 파일의 hashtags 배열에서 # 기호를 제거하고 저장

INSERT INTO hashtags (name) VALUES
('사찰'), ('일출명소'), ('바다'), ('기장'), ('불교문화'),
('포토스팟'), ('가족여행'), ('무료관람'), ('주차가능'), ('실외');
```

#### 2.4 관광지-해시태그 연결 데이터 마이그레이션

```sql
-- tourist_spot_hashtags 테이블에 연결 데이터 삽입
INSERT INTO tourist_spot_hashtags (tourist_spot_id, hashtag_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),  -- 해동 용궁사
(2, 4), (2, 6), (2, 7), (2, 8), (2, 9);  -- 기장 해수욕장
```

#### 2.5 새로운 기능 테이블 데이터 마이그레이션

```sql
-- 이미지 메타데이터 삽입
INSERT INTO image_metadata (tourist_spot_id, image_path, image_url, file_size, width, height, format, alt_text, is_primary) VALUES
(1, '../../images/2025(4).jpg', '../../images/2025(4).jpg', 2048000, 1920, 1080, 'jpg', '해동 용궁사 전경', TRUE),
(2, '../../images/common (33).jpg', '../../images/common (33).jpg', 1536000, 1920, 1080, 'jpg', '기장 해수욕장 전경', TRUE);

-- 다국어 번역 데이터 삽입
INSERT INTO translations (table_name, record_id, field_name, language_code, translated_text) VALUES
('tourist_spots', 1, 'title', 'en', 'Haedong Yonggungsa Temple'),
('tourist_spots', 1, 'description', 'en', 'A beautiful temple built on the sea. Famous as a sunrise spot, many tourists visit due to its unique location.'),
('tourist_spots', 1, 'title', 'jp', '海東龍宮寺'),
('tourist_spots', 1, 'description', 'jp', '海に建てられた美しい寺院です。日の出の名所としても有名で、独特な位置で多くの観光客が訪れます。');
```

#### 2.6 리뷰 데이터 마이그레이션

```sql
-- userReview.json 데이터를 reviews 테이블로 마이그레이션
INSERT INTO reviews (user_id, tourist_spot_id, title, content, rating, is_approved) VALUES
(2, 1, '일출이 정말 아름다워요!', '바다 위에 세워진 사찰이라 정말 신비로웠어요. 특히 일출 시간에 가면 환상적인 경치를 볼 수 있습니다.', 5, TRUE);
```

### 3. 해시태그 연결

```sql
-- 관광지와 해시태그 연결
INSERT INTO tourist_spot_hashtags (tourist_spot_id, hashtag_id) VALUES
(1, 1), -- 해동 용궁사 - #사찰
(1, 2), -- 해동 용궁사 - #일출명소
(1, 3); -- 해동 용궁사 - #바다
```

## 🔧 Java Spring Boot 마이그레이션 구현

### 1. 프로젝트 구조

```
src/main/java/com/aratabusan/
├── ArataBusanApplication.java
├── config/
│   └── DatabaseConfig.java
├── entity/
│   ├── Region.java
│   ├── TouristSpot.java
│   ├── User.java
│   ├── Review.java
│   ├── Hashtag.java
│   ├── ImageMetadata.java
│   ├── TouristSpotView.java
│   ├── Favorite.java
│   ├── SearchLog.java
│   └── Translation.java
├── repository/
│   ├── RegionRepository.java
│   ├── TouristSpotRepository.java
│   ├── UserRepository.java
│   ├── ReviewRepository.java
│   ├── HashtagRepository.java
│   ├── ImageMetadataRepository.java
│   ├── TouristSpotViewRepository.java
│   ├── FavoriteRepository.java
│   ├── SearchLogRepository.java
│   └── TranslationRepository.java
├── service/
│   └── MigrationService.java
└── migration/
    └── DataMigrationRunner.java
```

### 2. Entity 클래스 예시

#### Region.java

```java
@Entity
@Table(name = "regions")
public class Region {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "area_code", unique = true, nullable = false)
    private String areaCode;

    @Column(name = "name", nullable = false)
    private String name;

    @OneToMany(mappedBy = "region", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TouristSpot> touristSpots = new ArrayList<>();

    // 생성자, getter, setter
}
```

#### TouristSpot.java

```java
@Entity
@Table(name = "tourist_spots")
public class TouristSpot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "image_alt")
    private String imageAlt;

    @Column(name = "link_url")
    private String linkUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private Category category = Category.CULTURE;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "rating_avg")
    private BigDecimal ratingAvg = BigDecimal.ZERO;

    @Column(name = "rating_count")
    private Integer ratingCount = 0;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "tourist_spot_hashtags",
        joinColumns = @JoinColumn(name = "tourist_spot_id"),
        inverseJoinColumns = @JoinColumn(name = "hashtag_id")
    )
    private Set<Hashtag> hashtags = new HashSet<>();

    @OneToMany(mappedBy = "touristSpot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ImageMetadata> imageMetadata = new ArrayList<>();

    @OneToMany(mappedBy = "touristSpot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TouristSpotView> views = new ArrayList<>();

    @OneToMany(mappedBy = "touristSpot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Favorite> favorites = new ArrayList<>();

    // 생성자, getter, setter
}
```

#### 새로운 Entity 클래스들

##### ImageMetadata.java

```java
@Entity
@Table(name = "image_metadata")
public class ImageMetadata {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tourist_spot_id", nullable = false)
    private TouristSpot touristSpot;

    @Column(name = "image_path", nullable = false)
    private String imagePath;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "file_size")
    private Integer fileSize;

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    @Column(name = "format")
    private String format;

    @Column(name = "alt_text")
    private String altText;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate;

    // 생성자, getter, setter
}
```

##### TouristSpotView.java

```java
@Entity
@Table(name = "tourist_spot_views")
public class TouristSpotView {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tourist_spot_id", nullable = false)
    private TouristSpot touristSpot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "referrer")
    private String referrer;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // 생성자, getter, setter
}
```

##### Favorite.java

```java
@Entity
@Table(name = "favorites")
public class Favorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tourist_spot_id", nullable = false)
    private TouristSpot touristSpot;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // 생성자, getter, setter
}
```

##### SearchLog.java

```java
@Entity
@Table(name = "search_logs")
public class SearchLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "search_query", nullable = false)
    private String searchQuery;

    @Enumerated(EnumType.STRING)
    @Column(name = "search_type")
    private SearchType searchType = SearchType.KEYWORD;

    @Column(name = "results_count")
    private Integer resultsCount = 0;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // 생성자, getter, setter
}
```

##### Translation.java

```java
@Entity
@Table(name = "translations")
public class Translation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_name", nullable = false)
    private String tableName;

    @Column(name = "record_id", nullable = false)
    private Long recordId;

    @Column(name = "field_name", nullable = false)
    private String fieldName;

    @Column(name = "language_code", nullable = false)
    private String languageCode;

    @Column(name = "translated_text", columnDefinition = "TEXT", nullable = false)
    private String translatedText;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 생성자, getter, setter
}
```

### 3. MigrationService.java

```java
@Service
@Transactional
public class MigrationService {

    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private TouristSpotRepository touristSpotRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private HashtagRepository hashtagRepository;

    @Autowired
    private ImageMetadataRepository imageMetadataRepository;

    @Autowired
    private TranslationRepository translationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("classpath:data/busanTouristSpots.json")
    private Resource touristSpotsResource;

    @Value("classpath:data/users.json")
    private Resource usersResource;

    @Value("classpath:data/userReview.json")
    private Resource reviewsResource;

    public void migrateAllData() {
        log.info("데이터 마이그레이션 시작");

        migrateTouristSpots();
        migrateUsers();
        migrateReviews();
        migrateImageMetadata();
        migrateTranslations();

        log.info("데이터 마이그레이션 완료");
    }

    public void migrateTouristSpots() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(touristSpotsResource.getInputStream());
            JsonNode regions = root.get("regions");

            regions.fields().forEachRemaining(entry -> {
                String regionKey = entry.getKey();
                JsonNode regionData = entry.getValue();

                // 지역 정보 저장
                Region region = regionRepository.findByAreaCode(regionData.get("code").asText())
                    .orElseGet(() -> {
                        Region newRegion = new Region();
                        newRegion.setAreaCode(regionData.get("code").asText());
                        newRegion.setName(regionData.get("name").asText());
                        return regionRepository.save(newRegion);
                    });

                // 관광지 데이터 처리
                JsonNode spots = regionData.get("spots");
                if (spots.isArray()) {
                    spots.forEach(spotNode -> {
                        TouristSpot spot = new TouristSpot();
                        spot.setRegion(region);
                        spot.setTitle(spotNode.get("title").asText());
                        spot.setDescription(spotNode.get("description").asText());
                        spot.setImageUrl(spotNode.get("img").asText());
                        spot.setImagePath(spotNode.get("img").asText());
                        spot.setImageAlt(spotNode.get("title").asText() + " 전경");
                        spot.setLinkUrl(spotNode.get("link").asText());
                        spot.setCategory(determineCategory(spotNode.get("hashtags")));

                        // 해시태그 처리
                        if (spotNode.has("hashtags")) {
                            JsonNode hashtags = spotNode.get("hashtags");
                            if (hashtags.isArray()) {
                                hashtags.forEach(hashtagNode -> {
                                    String hashtagName = hashtagNode.asText();
                                    Hashtag hashtag = hashtagRepository.findByName(hashtagName)
                                        .orElseGet(() -> {
                                            Hashtag newHashtag = new Hashtag();
                                            newHashtag.setName(hashtagName);
                                            return hashtagRepository.save(newHashtag);
                                        });
                                    spot.getHashtags().add(hashtag);
                                });
                            }
                        }

                        touristSpotRepository.save(spot);
                    });
                }
            });

        } catch (Exception e) {
            log.error("관광지 데이터 마이그레이션 실패", e);
            throw new RuntimeException("관광지 데이터 마이그레이션 실패", e);
        }
    }

    public void migrateUsers() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(usersResource.getInputStream());
            JsonNode users = root.get("users");

            if (users.isArray()) {
                users.forEach(userNode -> {
                    User user = new User();
                    user.setUserId(userNode.get("userId").asText());
                    user.setUsername(userNode.get("username").asText());
                    user.setEmail(userNode.get("email").asText());
                    user.setPasswordHash(passwordEncoder.encode(userNode.get("password").asText()));
                    user.setRole(UserRole.valueOf(userNode.get("role").asText().toUpperCase()));
                    user.setStatus(UserStatus.valueOf(userNode.get("status").asText().toUpperCase()));
                    user.setPhoneNumber(userNode.get("phoneNumber").asText());
                    user.setAddress(userNode.get("address").asText());
                    user.setBirthDate(LocalDate.parse(userNode.get("birthDate").asText()));
                    user.setGender(Gender.valueOf(userNode.get("gender").asText().toUpperCase()));
                    user.setJoinDate(LocalDate.parse(userNode.get("joinDate").asText()));

                    if (!userNode.get("lastLogin").asText().equals("-")) {
                        user.setLastLogin(LocalDateTime.parse(userNode.get("lastLogin").asText()));
                    }

                    userRepository.save(user);
                });
            }

        } catch (Exception e) {
            log.error("사용자 데이터 마이그레이션 실패", e);
            throw new RuntimeException("사용자 데이터 마이그레이션 실패", e);
        }
    }

    public void migrateReviews() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(reviewsResource.getInputStream());
            JsonNode reviews = root.get("userReview");

            if (reviews.isArray()) {
                reviews.forEach(reviewNode -> {
                    // 사용자 조회
                    User user = userRepository.findByUserId(reviewNode.get("userId").asText())
                        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + reviewNode.get("userId").asText()));

                    // 관광지 조회
                    TouristSpot spot = touristSpotRepository.findByTitle(reviewNode.get("spotTitle").asText())
                        .orElseThrow(() -> new RuntimeException("관광지를 찾을 수 없습니다: " + reviewNode.get("spotTitle").asText()));

                    Review review = new Review();
                    review.setUser(user);
                    review.setTouristSpot(spot);
                    review.setTitle(reviewNode.get("title").asText());
                    review.setContent(reviewNode.get("content").asText());
                    review.setRating(reviewNode.get("rating").asInt());
                    review.setIsApproved(true);

                    reviewRepository.save(review);
                });
            }

        } catch (Exception e) {
            log.error("리뷰 데이터 마이그레이션 실패", e);
            throw new RuntimeException("리뷰 데이터 마이그레이션 실패", e);
        }
    }

    public void migrateImageMetadata() {
        try {
            List<TouristSpot> spots = touristSpotRepository.findAll();

            for (TouristSpot spot : spots) {
                if (spot.getImageUrl() != null && !spot.getImageUrl().isEmpty()) {
                    ImageMetadata metadata = new ImageMetadata();
                    metadata.setTouristSpot(spot);
                    metadata.setImagePath(spot.getImagePath());
                    metadata.setImageUrl(spot.getImageUrl());
                    metadata.setAltText(spot.getImageAlt());
                    metadata.setIsPrimary(true);
                    metadata.setUploadDate(LocalDateTime.now());

                    imageMetadataRepository.save(metadata);
                }
            }
        } catch (Exception e) {
            log.error("이미지 메타데이터 마이그레이션 실패", e);
            throw new RuntimeException("이미지 메타데이터 마이그레이션 실패", e);
        }
    }

    public void migrateTranslations() {
        try {
            // 기본 번역 데이터 삽입 (예시)
            List<TouristSpot> spots = touristSpotRepository.findAll();

            for (TouristSpot spot : spots) {
                // 영어 번역
                Translation titleEn = new Translation();
                titleEn.setTableName("tourist_spots");
                titleEn.setRecordId(spot.getId());
                titleEn.setFieldName("title");
                titleEn.setLanguageCode("en");
                titleEn.setTranslatedText(spot.getTitle() + " (EN)");
                titleEn.setCreatedAt(LocalDateTime.now());
                translationRepository.save(titleEn);

                // 일본어 번역
                Translation titleJp = new Translation();
                titleJp.setTableName("tourist_spots");
                titleJp.setRecordId(spot.getId());
                titleJp.setFieldName("title");
                titleJp.setLanguageCode("jp");
                titleJp.setTranslatedText(spot.getTitle() + " (JP)");
                titleJp.setCreatedAt(LocalDateTime.now());
                translationRepository.save(titleJp);
            }
        } catch (Exception e) {
            log.error("번역 데이터 마이그레이션 실패", e);
            throw new RuntimeException("번역 데이터 마이그레이션 실패", e);
        }
    }

    private Category determineCategory(JsonNode hashtags) {
        if (hashtags == null || !hashtags.isArray()) {
            return Category.CULTURE;
        }

        for (JsonNode hashtag : hashtags) {
            String tag = hashtag.asText().toLowerCase();
            if (tag.contains("해수욕장") || tag.contains("해변") || tag.contains("바다")) {
                return Category.BEACH;
            } else if (tag.contains("산") || tag.contains("공원") || tag.contains("등산")) {
                return Category.MOUNTAIN;
            } else if (tag.contains("시장") || tag.contains("먹거리") || tag.contains("맛집")) {
                return Category.FOOD;
            } else if (tag.contains("쇼핑") || tag.contains("백화점") || tag.contains("상가")) {
                return Category.SHOPPING;
            }
        }

        return Category.CULTURE;
    }
}
```

### 4. DataMigrationRunner.java

```java
@Component
public class DataMigrationRunner implements CommandLineRunner {

    @Autowired
    private MigrationService migrationService;

    @Override
    public void run(String... args) throws Exception {
        // 애플리케이션 시작 시 자동으로 마이그레이션 실행
        // 실제 운영에서는 @Profile("migration") 등으로 제어
        if (shouldRunMigration()) {
            migrationService.migrateAllData();
        }
    }

    private boolean shouldRunMigration() {
        // 마이그레이션 실행 조건 확인
        // 예: 특정 프로파일 활성화 시, 또는 데이터가 비어있을 때
        return true; // 개발 환경에서만 true로 설정
    }
}
```

### 5. application.yml 설정

```yaml
spring:
    datasource:
        url: jdbc:mysql://localhost:3306/arata_busan?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8
        username: your_username
        password: your_password
        driver-class-name: com.mysql.cj.jdbc.Driver

    jpa:
        hibernate:
            ddl-auto: validate
        show-sql: true
        properties:
            hibernate:
                dialect: org.hibernate.dialect.MySQL8Dialect
                format_sql: true

logging:
    level:
        com.aratabusan: DEBUG
        org.springframework.web: DEBUG
```

### 6. 필요한 의존성 (pom.xml)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## ⚠️ 주의사항

1. **비밀번호 해시화**: 사용자 비밀번호는 BCryptPasswordEncoder로 해시화하여 저장
2. **데이터 무결성**: JPA 엔티티 관계 매핑 확인
3. **인코딩**: UTF-8 인코딩으로 데이터 저장
4. **백업**: 마이그레이션 전 데이터 백업 필수
5. **테스트**: 개발 환경에서 먼저 테스트
6. **트랜잭션**: @Transactional로 데이터 일관성 보장
7. **예외 처리**: 적절한 예외 처리 및 로깅

## 🔍 검증 쿼리

```sql
-- 데이터 마이그레이션 검증
SELECT COUNT(*) as total_regions FROM regions;
SELECT COUNT(*) as total_spots FROM tourist_spots;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_reviews FROM reviews;
SELECT COUNT(*) as total_hashtags FROM hashtags;
SELECT COUNT(*) as total_image_metadata FROM image_metadata;
SELECT COUNT(*) as total_translations FROM translations;

-- 지역별 관광지 수 확인
SELECT r.name, COUNT(ts.id) as spot_count
FROM regions r
LEFT JOIN tourist_spots ts ON r.id = ts.region_id
GROUP BY r.id, r.name;

-- 카테고리별 관광지 수 확인
SELECT category, COUNT(*) as count
FROM tourist_spots
GROUP BY category;

-- 언어별 번역 수 확인
SELECT language_code, COUNT(*) as count
FROM translations
GROUP BY language_code;
```

## 🚀 실행 방법

1. **개발 환경 설정**

    ```bash
    # 프로파일 설정으로 마이그레이션 실행
    java -jar -Dspring.profiles.active=migration your-app.jar
    ```

2. **수동 마이그레이션 실행**

    ```java
    @RestController
    public class MigrationController {

        @Autowired
        private MigrationService migrationService;

        @PostMapping("/admin/migrate")
        public ResponseEntity<String> runMigration() {
            try {
                migrationService.migrateAllData();
                return ResponseEntity.ok("마이그레이션 완료");
            } catch (Exception e) {
                return ResponseEntity.status(500).body("마이그레이션 실패: " + e.getMessage());
            }
        }
    }
    ```

## 📊 마이그레이션 체크리스트

### 사전 준비

-   [ ] 데이터베이스 스키마 생성 완료
-   [ ] JSON 데이터 파일 준비 완료
-   [ ] 개발 환경 설정 완료
-   [ ] 백업 데이터 준비 완료

### 마이그레이션 실행

-   [ ] 지역 데이터 마이그레이션
-   [ ] 관광지 데이터 마이그레이션
-   [ ] 사용자 데이터 마이그레이션
-   [ ] 리뷰 데이터 마이그레이션
-   [ ] 해시태그 데이터 마이그레이션
-   [ ] 이미지 메타데이터 마이그레이션
-   [ ] 번역 데이터 마이그레이션

### 검증

-   [ ] 데이터 개수 확인
-   [ ] 관계 매핑 확인
-   [ ] 데이터 무결성 확인
-   [ ] 성능 테스트
