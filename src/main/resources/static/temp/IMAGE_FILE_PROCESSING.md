# 이미지 파일 처리 가이드

이 문서는 이 프로젝트에서 이미지 파일이 어떻게 등록되고 불러와지는지 상세히 설명합니다.

## 목차
1. [개요](#개요)
2. [데이터베이스 구조](#데이터베이스-구조)
3. [이미지 등록 프로세스](#이미지-등록-프로세스)
4. [이미지 불러오기 프로세스](#이미지-불러오기-프로세스)
5. [파일 저장 위치 및 설정](#파일-저장-위치-및-설정)
6. [주요 컴포넌트 설명](#주요-컴포넌트-설명)
7. [이미지 업데이트 및 삭제](#이미지-업데이트-및-삭제)

---

## 개요

이 프로젝트는 Spring Boot 기반의 쇼핑몰 애플리케이션으로, 상품 이미지를 관리합니다. 이미지 파일은 다음과 같은 방식으로 처리됩니다:

- **물리적 저장**: 파일 시스템에 실제 이미지 파일 저장
- **메타데이터 저장**: 데이터베이스에 이미지 정보 저장
- **정적 리소스 서빙**: Spring의 ResourceHandler를 통해 이미지 제공

---

## 데이터베이스 구조

### item_img 테이블

이미지 정보는 `item_img` 테이블에 저장됩니다.

```sql
CREATE TABLE item_img (
    item_img_id INT AUTO_INCREMENT PRIMARY KEY,
    img_name VARCHAR(255),              -- 저장된 파일명 (UUID 기반)
    ori_img_name VARCHAR(255),         -- 원본 파일명
    img_url VARCHAR(255),              -- 이미지 접근 URL 경로
    rep_img_yn VARCHAR(1),             -- 대표 이미지 여부 (Y/N)
    item_id INT,                        -- 상품 ID (외래키)
    reg_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(item_id) REFERENCES item(item_id)
);
```

**주요 필드 설명:**
- `img_name`: UUID로 생성된 저장 파일명 (예: `028e4789-1ea2-46c5-9aed-bc5f9ce24655.png`)
- `ori_img_name`: 사용자가 업로드한 원본 파일명 (예: `과자1.jpg`)
- `img_url`: 웹에서 접근할 수 있는 URL 경로 (예: `/images/028e4789-1ea2-46c5-9aed-bc5f9ce24655.png`)
- `rep_img_yn`: 첫 번째 이미지는 'Y', 나머지는 'N'

---

## 이미지 등록 프로세스

### 1. 사용자 요청 단계

**파일 위치**: `src/main/resources/templates/item/itemForm.html`

사용자는 상품 등록 폼에서 최대 5개의 이미지 파일을 업로드할 수 있습니다.

```html
<form role="form" method="post" th:object="${itemForm}" enctype="multipart/form-data">
    <input type="file" class="custom-file-input" name="itemImgFile" />
    <!-- 최대 5개까지 반복 -->
</form>
```

**중요 사항:**
- `enctype="multipart/form-data"` 필수
- `name="itemImgFile"`로 여러 파일을 배열로 전송
- 클라이언트 측에서 이미지 파일 확장자 검증 (jpg, jpeg, png, gif)

### 2. 컨트롤러 단계

**파일 위치**: `src/main/java/com/macademy/shop/item/controller/ItemController.java`

```java
@PostMapping("/admin/item/new")
public String itemNew(@Valid ItemForm itemForm, BindingResult bindingResult, Model model,
        @RequestParam("itemImgFile") List<MultipartFile> itemImgFiles) {
    // ...
    itemService.itemInsert(itemForm, itemImgFiles);
    // ...
}
```

**처리 과정:**
1. `@RequestParam("itemImgFile")`로 여러 파일을 `List<MultipartFile>`로 수신
2. `ItemService.itemInsert()` 메서드 호출

**설정 제한사항** (`application.yaml`):
```yaml
spring:
    servlet:
        multipart:
            max-file-size: 10MB      # 개별 파일 최대 크기
            max-request-size: 10MB   # 전체 요청 최대 크기
```

### 3. 서비스 계층 - ItemService

**파일 위치**: `src/main/java/com/macademy/shop/item/service/ItemService.java`

```java
@Transactional(rollbackFor = Exception.class)
public int itemInsert(ItemForm itemForm, List<MultipartFile> itemImgFiles) throws Exception {
    // 1. 상품 정보를 데이터베이스에 저장
    ItemDto itemDto = convertToItemDto(itemForm);
    itemMapper.itemInsert(itemDto);
    
    // 2. 각 이미지 파일 처리
    int repImageIndex = 0;
    for (int i = 0; i < itemImgFiles.size(); i++) {
        MultipartFile itemImgFile = itemImgFiles.get(i);
        if (itemImgFile == null || itemImgFile.isEmpty()) {
            continue;  // 빈 파일은 건너뛰기
        }
        
        ItemImgDto itemImgDto = new ItemImgDto();
        itemImgDto.setItemId(itemDto.getId());
        
        // 첫 번째 이미지를 대표 이미지로 설정
        if (repImageIndex == 0) {
            itemImgDto.setIsRepImage("Y");
        } else {
            itemImgDto.setIsRepImage("N");
        }
        
        // ItemImgService를 통해 이미지 저장
        itemImgService.saveItemImg(itemImgDto, itemImgFile);
        repImageIndex++;
    }
    return itemDto.getId().intValue();
}
```

**처리 과정:**
1. 상품 정보를 먼저 데이터베이스에 저장 (외래키 제약조건을 위해)
2. 각 이미지 파일을 순회하며 처리
3. 첫 번째 이미지는 대표 이미지(`rep_img_yn = 'Y'`)로 설정
4. `@Transactional`로 모든 작업이 하나의 트랜잭션으로 처리 (실패 시 롤백)

### 4. 서비스 계층 - ItemImgService

**파일 위치**: `src/main/java/com/macademy/shop/item/service/ItemImgService.java`

```java
public void saveItemImg(ItemImgDto itemImgDto, MultipartFile itemImgFile) throws Exception {
    String oriImgName = itemImgFile.getOriginalFilename();
    String imgName = "";
    String imgUrl = "";
    
    if (!itemImgFile.isEmpty()) {
        // 1. FileService를 통해 물리적 파일 저장
        imgName = fileService.uploadFile(itemImgLocation, oriImgName, itemImgFile.getBytes());
        
        // 2. 웹 접근 URL 생성
        imgUrl = "/images/" + imgName;
    }
    
    // 3. DTO에 정보 설정
    itemImgDto.setName(imgName);
    itemImgDto.setOriginalName(oriImgName);
    itemImgDto.setUrl(imgUrl);
    
    // 4. 데이터베이스에 이미지 정보 저장
    itemMapper.itemImgInsert(itemImgDto);
}
```

**처리 과정:**
1. 원본 파일명 추출
2. `FileService.uploadFile()` 호출하여 물리적 파일 저장
3. 웹 접근 URL 생성 (`/images/` + 저장된 파일명)
4. 데이터베이스에 이미지 메타데이터 저장

### 5. 파일 저장 - FileService

**파일 위치**: `src/main/java/com/macademy/shop/item/service/FileService.java`

```java
public String uploadFile(String uploadPath, String originalFileName, byte[] fileData) throws IOException {
    // 1. 업로드 디렉토리 생성 (없으면)
    File uploadDir = new File(uploadPath);
    if (!uploadDir.exists()) {
        uploadDir.mkdirs();
    }
    
    // 2. UUID로 고유한 파일명 생성
    UUID uuid = UUID.randomUUID();
    String extension = "";
    if (originalFileName != null && originalFileName.contains(".")) {
        extension = originalFileName.substring(originalFileName.lastIndexOf("."));
    }
    String savedFileName = uuid.toString() + extension;
    
    // 3. 전체 경로 생성
    String fileUploadFullUrl = uploadPath + File.separator + savedFileName;
    File uploadFile = new File(fileUploadFullUrl);
    
    // 4. 파일 쓰기
    try (FileOutputStream fos = new FileOutputStream(uploadFile)) {
        fos.write(fileData);
    }
    
    return savedFileName;  // 저장된 파일명만 반환
}
```

**처리 과정:**
1. 업로드 디렉토리가 없으면 생성
2. UUID를 사용하여 고유한 파일명 생성 (중복 방지)
3. 원본 파일의 확장자 유지
4. 파일을 바이트 배열로 디스크에 저장
5. 저장된 파일명만 반환 (전체 경로가 아닌)

**예시:**
- 원본 파일명: `과자1.jpg`
- 저장된 파일명: `028e4789-1ea2-46c5-9aed-bc5f9ce24655.jpg`
- 저장 경로: `desktop/upload/028e4789-1ea2-46c5-9aed-bc5f9ce24655.jpg`

### 6. 데이터베이스 저장 - ItemMapper

**파일 위치**: `src/main/resources/mapper/itemMapper.xml`

```xml
<insert id="itemImgInsert" parameterType="ItemImgDto">
    INSERT INTO item_img (img_name, ori_img_name, img_url, rep_img_yn, item_id)
    VALUES (#{name}, #{originalName}, #{url}, #{isRepImage}, #{itemId});
</insert>
```

**저장되는 데이터 예시:**
```sql
INSERT INTO item_img VALUES (
    1,                                              -- item_img_id (자동 증가)
    '028e4789-1ea2-46c5-9aed-bc5f9ce24655.jpg',   -- img_name
    '과자1.jpg',                                    -- ori_img_name
    '/images/028e4789-1ea2-46c5-9aed-bc5f9ce24655.jpg',  -- img_url
    'Y',                                            -- rep_img_yn
    1,                                              -- item_id
    '2024-01-01 12:00:00',                          -- reg_time
    '2024-01-01 12:00:00'                           -- update_time
);
```

---

## 이미지 불러오기 프로세스

### 1. 데이터베이스 조회

**파일 위치**: `src/main/java/com/macademy/shop/item/service/ItemService.java`

```java
public ItemForm itemDetail(Long itemId) {
    // 1. 상품 정보 조회
    ItemDto itemDto = itemMapper.selectItem(itemId);
    
    // 2. 상품 이미지 리스트 조회
    List<ItemImgDto> itemImgList = itemMapper.selectItemImgList(itemId);
    itemForm.setItemImgList(itemImgList);
    
    return itemForm;
}
```

**SQL 쿼리** (`itemMapper.xml`):
```xml
<select id="selectItemImgList" parameterType="Long" resultMap="ItemImgDtoMap">
    SELECT * FROM item_img WHERE item_id = #{itemId}
</select>
```

### 2. 정적 리소스 핸들러 설정

**파일 위치**: `src/main/java/com/macademy/shop/config/WebMvcConfig.java`

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Value("${file.upload.itemImgLocation}")
    private String itemImgLocation;  // "desktop/upload/"
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 업로드된 상품 이미지 서빙
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + itemImgLocation + "/");
        
        // 정적 리소스 이미지 (메인 페이지 슬라이드 등)
        registry.addResourceHandler("/images/main/**")
                .addResourceLocations("classpath:/static/images/main/");
    }
}
```

**설명:**
- `/images/**` 요청이 들어오면 `desktop/upload/` 디렉토리에서 파일을 찾아 제공
- `file:` 접두사는 파일 시스템 경로를 의미
- 예: `/images/028e4789-1ea2-46c5-9aed-bc5f9ce24655.jpg` → `desktop/upload/028e4789-1ea2-46c5-9aed-bc5f9ce24655.jpg`

### 3. 템플릿에서 이미지 표시

#### 메인 페이지 (상품 리스트)

**파일 위치**: `src/main/resources/templates/index.html`

```html
<div th:each="item : ${list}">
    <img th:src="${item.imgUrl}" class="card-img-top" th:alt="${item.name}">
</div>
```

**데이터 조회** (`mainMapper.xml`):
```xml
<select id="mainItemList" resultType="MainItemDto">
    SELECT item.item_id AS id, 
           item.item_name AS name, 
           item.price, 
           item_img.img_url AS imgUrl 
    FROM item
    INNER JOIN item_img ON item.item_id = item_img.item_id
    WHERE item_img.rep_img_yn = 'Y'  -- 대표 이미지만 조회
    ORDER BY item.item_id DESC
    LIMIT #{pageSize} OFFSET #{offset}
</select>
```

#### 상품 상세 페이지

**파일 위치**: `src/main/resources/templates/item/itemDtl.html`

```html
<!-- 대표 이미지 -->
<img th:if="${item.itemImgList != null and item.itemImgList.size() > 0}"
     th:src="${item.itemImgList[0].url}"
     class="rounded repImg"
     th:alt="${item.itemName}" />

<!-- 모든 이미지 표시 -->
<div th:each="itemImg : ${item.itemImgList}">
    <img th:if="${not #strings.isEmpty(itemImg.url)}"
         th:src="${itemImg.url}"
         class="rounded mgb-15"
         width="800" />
</div>
```

**처리 과정:**
1. `item.itemImgList`에서 첫 번째 이미지를 대표 이미지로 표시
2. 모든 이미지를 순회하며 표시
3. `th:src` 속성에 `img_url` 값을 사용 (예: `/images/028e4789-1ea2-46c5-9aed-bc5f9ce24655.jpg`)

---

## 파일 저장 위치 및 설정

### 설정 파일

**파일 위치**: `src/main/resources/application.yaml`

```yaml
file:
    upload:
        itemImgLocation: desktop/upload/    # 상품 이미지 저장 경로
        uploadPath: desktop/upload/         # 일반 파일 업로드 경로
```

### 실제 저장 위치

- **상대 경로**: `desktop/upload/` (프로젝트 루트 기준)
- **절대 경로 예시**: `/Users/qsus/Desktop/ExeX/SWEA/SCODA/KMOVE/SBI/shop/shop/desktop/upload/`

### 저장된 파일 예시

```
desktop/upload/
├── 028e4789-1ea2-46c5-9aed-bc5f9ce24655.png
├── 2a57a6ff-93ae-4e53-848b-c6daa6bf6bd5.png
├── 37c34995-4016-4d12-ae4f-bca36fc18de8.jpeg
└── ...
```

### 정적 리소스 이미지

**위치**: `src/main/resources/static/images/`
- 메인 페이지 슬라이드 이미지: `static/images/main/slide1.jpg`, `slide2.jpg`, etc.
- 로고: `static/images/main/logo.png`
- 기본 상품 이미지: `static/images/itemImg/`

---

## 주요 컴포넌트 설명

### 1. FileService
- **역할**: 실제 파일 시스템에 파일 저장/삭제
- **주요 메서드**:
  - `uploadFile()`: 파일을 UUID로 저장
  - `deleteFile()`: 파일 삭제

### 2. ItemImgService
- **역할**: 이미지 파일과 데이터베이스 간의 중개
- **주요 메서드**:
  - `saveItemImg()`: 새 이미지 저장
  - `updateItemImg()`: 기존 이미지 업데이트

### 3. ItemService
- **역할**: 상품과 이미지의 전체적인 비즈니스 로직 처리
- **주요 메서드**:
  - `itemInsert()`: 상품과 이미지 등록
  - `itemDetail()`: 상품 상세 정보 조회 (이미지 포함)
  - `itemUpdate()`: 상품과 이미지 수정

### 4. ItemMapper
- **역할**: MyBatis를 통한 데이터베이스 접근
- **주요 쿼리**:
  - `itemImgInsert`: 이미지 정보 INSERT
  - `selectItemImgList`: 상품의 모든 이미지 조회
  - `selectItemImgByItemImgId`: 특정 이미지 조회

### 5. WebMvcConfig
- **역할**: 정적 리소스 핸들러 설정
- **기능**: `/images/**` URL을 실제 파일 경로로 매핑

---

## 이미지 업데이트 및 삭제

### 이미지 업데이트

**파일 위치**: `src/main/java/com/macademy/shop/item/service/ItemImgService.java`

```java
public void updateItemImg(Long itemImgId, ItemImgDto itemImgDto, MultipartFile itemImgFile) throws Exception {
    if (!itemImgFile.isEmpty()) {
        // 1. 기존 이미지 정보 조회
        ItemImgDto savedItemImg = itemMapper.selectItemImgByItemImgId(itemImgId);
        
        // 2. 기존 파일 삭제
        if (savedItemImg != null) {
            fileService.deleteFile(itemImgLocation + "/" + savedItemImg.getName());
        }
        
        // 3. 새 파일 업로드
        String oriImgName = itemImgFile.getOriginalFilename();
        String imgName = fileService.uploadFile(itemImgLocation, oriImgName, itemImgFile.getBytes());
        String imgUrl = "/images/" + imgName;
        
        // 4. DTO 설정 및 업데이트
        itemImgDto.setName(imgName);
        itemImgDto.setOriginalName(oriImgName);
        itemImgDto.setUrl(imgUrl);
    }
    itemMapper.itemImgUpdate(itemImgDto);
}
```

**처리 과정:**
1. 기존 이미지 파일을 물리적으로 삭제
2. 새 파일을 업로드
3. 데이터베이스 정보 업데이트

### 이미지 삭제

**파일 위치**: `src/main/java/com/macademy/shop/item/service/FileService.java`

```java
public void deleteFile(String filePath) throws Exception {
    File file = new File(filePath);
    if (file.exists()) {
        file.delete();
    }
}
```

**주의사항:**
- 상품 삭제 시 이미지 파일도 함께 삭제해야 함 (현재 코드에서는 수동 처리 필요)
- 데이터베이스의 CASCADE DELETE 설정 고려

---

## 요약

### 이미지 등록 흐름
```
사용자 업로드 
  → ItemController (MultipartFile 수신)
  → ItemService (상품 저장 + 이미지 처리)
  → ItemImgService (이미지 메타데이터 준비)
  → FileService (물리적 파일 저장)
  → ItemMapper (데이터베이스 저장)
```

### 이미지 불러오기 흐름
```
템플릿 요청 (th:src="${item.imgUrl}")
  → ItemService (데이터베이스 조회)
  → ItemMapper (SQL 쿼리 실행)
  → WebMvcConfig (URL → 파일 경로 매핑)
  → 파일 시스템에서 이미지 제공
```

### 주요 경로
- **저장 경로**: `desktop/upload/`
- **웹 접근 URL**: `/images/{UUID}.{확장자}`
- **데이터베이스 테이블**: `item_img`
- **설정 파일**: `application.yaml` (file.upload.itemImgLocation)

---

## 참고 사항

1. **파일명 중복 방지**: UUID를 사용하여 파일명 충돌 방지
2. **트랜잭션 관리**: `@Transactional`로 데이터베이스와 파일 시스템의 일관성 보장
3. **대표 이미지**: 첫 번째 이미지가 자동으로 대표 이미지로 설정됨
4. **파일 크기 제한**: 10MB (설정에서 변경 가능)
5. **지원 확장자**: jpg, jpeg, png, gif (클라이언트 측 검증)
