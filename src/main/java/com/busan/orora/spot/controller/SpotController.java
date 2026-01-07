package com.busan.orora.spot.controller;

import com.busan.orora.hashtag.dto.HashtagDto;
import com.busan.orora.hashtag.service.HashtagService;
import com.busan.orora.region.dto.RegionDto;
import com.busan.orora.region.service.RegionService;
import com.busan.orora.common.service.FileService;
import com.busan.orora.spot.dto.SpotDto;
import com.busan.orora.spot.dto.SpotImageDto;
import com.busan.orora.spot.dto.SpotRequestDto;
import com.busan.orora.spot.service.SpotImageService;
import com.busan.orora.spot.service.SpotRequestService;
import com.busan.orora.spot.service.SpotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class SpotController {
    
    @Autowired
    private SpotService spotService;
    
    @Autowired
    private SpotImageService spotImageService;
    
    @Autowired
    private HashtagService hashtagService;
    
    @Autowired
    private RegionService regionService;
    
    @Autowired
    private SpotRequestService spotRequestService;
    
    @Autowired
    private FileService fileService;
    
    @Value("${file.upload.spotImgLocation}")
    private String spotImgLocation;

    /**
     * 관광지 상세 정보 조회
     * @param id 관광지 ID
     * @return 관광지 상세 정보 (이미지, 해시태그, 지역 정보 포함)
     */
    @GetMapping("/tourist-spots/{id}")
    public ResponseEntity<Map<String, Object>> getTouristSpotDetail(@PathVariable Long id) {
        try {
            // 1. 관광지 기본 정보 조회
            SpotDto spot = spotService.getSpotById(id);
            if (spot == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            // 2. 이미지 목록 조회
            List<SpotImageDto> images = spotImageService.getImagesBySpotId(id);
            
            // 3. 해시태그 목록 조회
            List<HashtagDto> hashtags = hashtagService.getHashtagsBySpotId(id);
            
            // 4. 지역 정보 조회
            RegionDto region = null;
            if (spot.getRegionId() != null) {
                region = regionService.getRegionById(spot.getRegionId());
            }

            // 5. 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("id", spot.getId());
            response.put("title", spot.getTitle());
            response.put("description", spot.getDescription());
            response.put("linkUrl", spot.getLinkUrl());
            response.put("categoryCode", spot.getCategoryCode());
            response.put("isActive", spot.getIsActive());
            response.put("viewCount", spot.getViewCount());
            response.put("createdAt", spot.getCreatedAt());
            response.put("updatedAt", spot.getUpdatedAt());

            // 이미지 배열 구성 (프론트엔드에서 기대하는 형식)
            List<Map<String, Object>> imageList = images.stream()
                .map(img -> {
                    Map<String, Object> imgMap = new HashMap<>();
                    imgMap.put("id", img.getId());
                    imgMap.put("imageUrl", img.getImageUrl());
                    imgMap.put("order", img.getRegTime() != null ? img.getRegTime().toString() : "");
                    return imgMap;
                })
                .collect(Collectors.toList());
            response.put("images", imageList);

            // 해시태그 배열 구성 (이름만 추출)
            List<String> hashtagNames = hashtags.stream()
                .map(HashtagDto::getName)
                .collect(Collectors.toList());
            response.put("hashtags", hashtagNames);

            // 지역 정보 구성
            if (region != null) {
                Map<String, Object> regionMap = new HashMap<>();
                regionMap.put("id", region.getId());
                regionMap.put("name", region.getName());
                regionMap.put("areaCode", region.getAreaCode());
                response.put("region", regionMap);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 모든 활성화된 관광지를 지역별로 그룹화하여 조회
     * @return 지역별로 그룹화된 관광지 데이터
     */
    @GetMapping("/tourist-spots")
    public ResponseEntity<Map<String, Object>> getAllSpotsByRegion() {
        try {
            Map<String, Object> result = spotService.getAllSpotsGroupedByRegion();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 사진 등록 신청 API
     * @param spotId 관광지 ID
     * @param userId 신청자 ID
     * @param image 업로드된 이미지 파일
     * @param description 사진 설명
     * @return 신청 결과
     */
    @PostMapping("/spot-requests/photo")
    public ResponseEntity<Map<String, Object>> submitPhotoRequest(
            @RequestParam("spotId") Long spotId,
            @RequestParam("userId") Long userId,
            @RequestPart("image") MultipartFile image,
            @RequestParam(value = "description", required = false) String description) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 1. 파일 검증
            if (image == null || image.isEmpty()) {
                response.put("success", false);
                response.put("message", "사진을 선택해주세요.");
                return ResponseEntity.badRequest().body(response);
            }

            // 2. 파일 저장
            String oriImgName = image.getOriginalFilename();
            String imgName = fileService.uploadFile(spotImgLocation, oriImgName, image.getBytes());
            String imgUrl = "/images/upload/spots/" + imgName;

            // 3. 신청 정보 생성
            SpotRequestDto requestDto = new SpotRequestDto();
            requestDto.setUserId(userId);
            requestDto.setTouristSpotId(spotId);
            requestDto.setRequestType("photo");
            requestDto.setImageUrl(imgUrl);
            requestDto.setImgName(imgName);
            requestDto.setOriImgName(oriImgName);
            requestDto.setDescription(description != null ? description : "");
            requestDto.setStatus("pending");

            // 4. DB에 저장
            spotRequestService.addRequest(requestDto);

            response.put("success", true);
            response.put("message", "사진 등록 신청이 완료되었습니다. 관리자 검토 후 반영됩니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "신청 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 관광지 추가 신청 API
     * @param userId 신청자 ID
     * @param spotTitle 관광지명
     * @param regionId 지역 ID
     * @param linkUrl 링크 URL (선택)
     * @param hashtags 해시태그 (선택)
     * @param description 설명 (선택)
     * @param image 이미지 파일 (선택)
     * @return 신청 결과
     */
    @PostMapping("/spot-requests/spot")
    public ResponseEntity<Map<String, Object>> submitSpotRequest(
            @RequestParam("userId") Long userId,
            @RequestParam("spotTitle") String spotTitle,
            @RequestParam("regionId") Long regionId,
            @RequestParam(value = "linkUrl", required = false) String linkUrl,
            @RequestParam(value = "hashtags", required = false) String hashtags,
            @RequestParam(value = "description", required = false) String description,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 1. 필수 필드 검증
            if (spotTitle == null || spotTitle.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "관광지명을 입력해주세요.");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (regionId == null) {
                response.put("success", false);
                response.put("message", "지역을 선택해주세요.");
                return ResponseEntity.badRequest().body(response);
            }

            // 2. 이미지 파일 처리 (선택사항)
            String imageUrl = null;
            String imgName = null;
            String oriImgName = null;
            
            if (image != null && !image.isEmpty()) {
                oriImgName = image.getOriginalFilename();
                imgName = fileService.uploadFile(spotImgLocation, oriImgName, image.getBytes());
                imageUrl = "/images/upload/spots/" + imgName;
            }

            // 3. 신청 정보 생성
            SpotRequestDto requestDto = new SpotRequestDto();
            requestDto.setUserId(userId);
            requestDto.setRequestType("spot");
            requestDto.setSpotTitle(spotTitle);
            requestDto.setRegionId(regionId);
            requestDto.setLinkUrl(linkUrl);
            requestDto.setHashtags(hashtags);
            requestDto.setDescription(description);
            requestDto.setImageUrl(imageUrl);
            requestDto.setImgName(imgName);
            requestDto.setOriImgName(oriImgName);
            requestDto.setStatus("pending");

            // 4. DB에 저장
            spotRequestService.addRequest(requestDto);

            response.put("success", true);
            response.put("message", "관광지 추가 신청이 완료되었습니다. 관리자 검토 후 반영됩니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "신청 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 신청 취소 API (사용자용)
     * @param requestId 신청 ID
     * @param userId 사용자 ID (본인 확인용)
     * @return 취소 결과
     */
    @DeleteMapping("/spot-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> cancelSpotRequest(
            @PathVariable Long requestId,
            @RequestParam("userId") Long userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 1. 신청 정보 조회
            SpotRequestDto request = spotRequestService.getRequestById(requestId);
            if (request == null) {
                response.put("success", false);
                response.put("message", "신청을 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // 2. 본인 확인
            if (!request.getUserId().equals(userId)) {
                response.put("success", false);
                response.put("message", "본인의 신청만 취소할 수 있습니다.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // 3. 상태 확인 (대기중인 신청만 취소 가능)
            if (!"pending".equals(request.getStatus())) {
                response.put("success", false);
                response.put("message", "대기중인 신청만 취소할 수 있습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 4. 신청 삭제
            spotRequestService.deleteRequest(requestId);

            response.put("success", true);
            response.put("message", "신청이 취소되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "신청 취소 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}

