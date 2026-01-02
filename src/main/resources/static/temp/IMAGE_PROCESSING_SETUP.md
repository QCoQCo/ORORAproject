# 이미지 처리 시스템 설정 완료

이 문서는 유저 프로필 사진과 관광지 사진 처리를 위해 생성된 파일들을 설명합니다.

## 생성된 파일 및 폴더

### 1. 공통 서비스
- **FileService** (`src/main/java/com/busan/orora/common/service/FileService.java`)
  - 파일 저장/삭제 공통 서비스
  - UUID 기반 고유 파일명 생성
  - 파일 존재 여부 확인

### 2. 관광지 이미지 서비스
- **SpotImageService** (`src/main/java/com/busan/orora/spot/service/SpotImageService.java`)
  - 관광지 이미지 저장/조회/삭제 처리
  - 여러 이미지 일괄 저장 지원
  - 첫 번째 이미지를 대표 이미지로 자동 설정

### 3. 사용자 프로필 이미지 서비스
- **UserService** (업데이트됨)
  - `saveProfileImage()`: 프로필 이미지 저장
  - `deleteProfileImage()`: 프로필 이미지 삭제
  - 기존 이미지 자동 삭제 기능 포함

### 4. 설정 파일
- **WebMvcConfig** (`src/main/java/com/busan/orora/config/WebMvcConfig.java`)
  - 정적 리소스 핸들러 설정
  - `/images/upload/spots/**` → `upload/spots/` 폴더
  - `/images/upload/profiles/**` → `upload/profiles/` 폴더
  - `/images/**` → `static/images/` 폴더 (기존 정적 리소스)

- **application.yaml** (업데이트됨)
  ```yaml
  file:
    upload:
      spotImgLocation: upload/spots      # 관광지 이미지 저장 경로
      profileImgLocation: upload/profiles  # 사용자 프로필 이미지 저장 경로
  ```

### 5. 데이터베이스 매퍼
- **UserMapper** (업데이트됨)
  - `findById()`: 사용자 ID로 조회
  - `updateProfileImage()`: 프로필 이미지 URL 업데이트

- **userMapper.xml** (업데이트됨)
  - `findById` 쿼리 추가
  - `updateProfileImage` 쿼리 추가

### 6. 폴더 구조
```
ORORAproject/
├── upload/
│   ├── spots/        # 관광지 이미지 저장 폴더
│   └── profiles/     # 사용자 프로필 이미지 저장 폴더
└── src/main/resources/static/images/  # 기존 정적 리소스 이미지
```

## 사용 방법

### 관광지 이미지 저장 예시

```java
@Autowired
private SpotImageService spotImageService;

// 여러 이미지 일괄 저장
List<MultipartFile> imageFiles = ...; // 업로드된 파일 리스트
Long spotId = 1L;
spotImageService.saveSpotImages(spotId, imageFiles);

// 이미지 조회
List<SpotImageDto> images = spotImageService.getImagesBySpotId(spotId);
```

### 사용자 프로필 이미지 저장 예시

```java
@Autowired
private UserService userService;

// 프로필 이미지 저장
MultipartFile profileFile = ...; // 업로드된 파일
Long userId = 1L;
String imageUrl = userService.saveProfileImage(userId, profileFile);

// 프로필 이미지 삭제
userService.deleteProfileImage(userId);
```

## 이미지 접근 URL

- **관광지 이미지**: `/images/upload/spots/{UUID}.{확장자}`
- **프로필 이미지**: `/images/upload/profiles/{UUID}.{확장자}`
- **정적 리소스**: `/images/{파일명}` (기존 static/images 폴더)

## 주요 특징

1. **UUID 기반 파일명**: 파일명 중복 방지
2. **트랜잭션 관리**: `@Transactional`로 데이터베이스와 파일 시스템 일관성 보장
3. **자동 대표 이미지 설정**: 첫 번째 이미지가 자동으로 대표 이미지로 설정
4. **기존 파일 자동 삭제**: 업데이트 시 기존 파일 자동 삭제
5. **파일 크기 제한**: 10MB (application.yaml에서 설정)

## 참고 사항

- 업로드된 이미지는 프로젝트 루트의 `upload/` 폴더에 저장됩니다.
- 기존 정적 리소스 이미지는 `src/main/resources/static/images/`에 그대로 유지됩니다.
- `.gitignore`에 `upload/` 폴더를 추가하는 것을 권장합니다.
