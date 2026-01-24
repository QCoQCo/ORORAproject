package com.busan.orora.controller;

import com.busan.orora.spot.dto.SpotDto;
import com.busan.orora.spot.service.SpotService;
import com.busan.orora.user.dto.UserDto;
import com.busan.orora.user.service.UserService;
import com.busan.orora.hashtag.service.HashtagService;
import com.busan.orora.hashtag.dto.HashtagDto;
import com.busan.orora.hashtag.mapper.HashtagMapper;
import com.busan.orora.commoncode.dto.CommonCodeGroupDto;
import com.busan.orora.commoncode.dto.CommonCodeDto;
import com.busan.orora.commoncode.service.CommonCodeGroupService;
import com.busan.orora.commoncode.service.CommonCodeService;
import com.busan.orora.spot.dto.SpotImageDto;
import com.busan.orora.spot.service.SpotImageService;
import com.busan.orora.review.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    
    @Autowired
    private SpotService spotService;

    @Autowired
    private UserService userService;

    @Autowired
    private HashtagService hashtagService;

    @Autowired
    private HashtagMapper hashtagMapper;

    @Autowired
    private CommonCodeGroupService commonCodeGroupService;

    @Autowired
    private CommonCodeService commonCodeService;

    @Autowired
    private com.busan.orora.spot.service.SpotRequestService spotRequestService;

    @Autowired
    private SpotImageService spotImageService;

    @Autowired
    private com.busan.orora.review.mapper.ReviewMapper reviewMapper;

    @Autowired
    private ReviewService reviewService;

    // 관리자 권한 확인 메서드 (Spring Security 인증 컨텍스트에서만 확인)
    private boolean isAdmin(HttpServletRequest request) {
        // Spring Security 인증 컨텍스트에서 권한 확인
        try {
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                boolean hasAdminRole = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                if (hasAdminRole) {
                    return true;
                }
            }
        } catch (Exception e) {
            logger.debug("Spring Security 인증 컨텍스트 확인 실패: {}", e.getMessage());
        }
        
        return false;
    }

    // 관광지 목록 조회
    @GetMapping("/tourist-spots")
    @ResponseBody
    public Map<String, Object> getTouristSpots(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        // 관리자 권한 확인
        if (!isAdmin(request)) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return response;
        }
        
        try {
            List<SpotDto> spots = spotService.getAllSpots();

            // N+1 쿼리 문제 해결: 배치 조회로 모든 해시태그를 한 번에 조회
            List<Long> spotIds = spots.stream()
                    .map(SpotDto::getId)
                    .collect(Collectors.toList());

            // 배치 조회로 모든 해시태그 조회
            Map<Long, List<String>> hashtagsBySpotId = new HashMap<>();
            if (!spotIds.isEmpty()) {
                List<HashtagDto> hashtagDtos = hashtagService.getHashtagsBySpotIds(spotIds);
                for (HashtagDto dto : hashtagDtos) {
                    if (dto.getTouristSpotId() != null && dto.getName() != null) {
                        hashtagsBySpotId.computeIfAbsent(dto.getTouristSpotId(), k -> new ArrayList<>())
                                .add(dto.getName());
                    }
                }
            }

            // 각 관광지의 해시태그를 포함하여 응답 생성
            List<Map<String, Object>> spotsWithHashtags = spots.stream().map(spot -> {
                Map<String, Object> spotMap = new HashMap<>();
                spotMap.put("id", spot.getId());
                spotMap.put("regionId", spot.getRegionId());
                spotMap.put("title", spot.getTitle());
                spotMap.put("description", spot.getDescription());
                spotMap.put("linkUrl", spot.getLinkUrl());
                spotMap.put("categoryCode", spot.getCategoryCode());
                spotMap.put("isActive", spot.getIsActive());
                spotMap.put("viewCount", spot.getViewCount());
                spotMap.put("createdAt", spot.getCreatedAt());
                spotMap.put("updatedAt", spot.getUpdatedAt());
                spotMap.put("latitude", spot.getLatitude());
                spotMap.put("longitude", spot.getLongitude());
                spotMap.put("address", spot.getAddress());

                // 배치 조회한 해시태그 사용
                List<String> hashtagNames = hashtagsBySpotId.getOrDefault(spot.getId(), new ArrayList<>());
                spotMap.put("hashtags", hashtagNames);

                return spotMap;
            }).collect(Collectors.toList());

            response.put("success", true);
            response.put("spots", spotsWithHashtags);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "관광지 목록을 불러오는데 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 사용자 목록 조회
    @GetMapping("/users")
    @ResponseBody
    public Map<String, Object> getUsers(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        // 관리자 권한 확인
        if (!isAdmin(request)) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return response;
        }
        
        try {
            List<UserDto> users = userService.getAllUsers();
            response.put("success", true);
            response.put("users", users);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "사용자 목록을 불러오는데 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 관광지 추가
    @PostMapping("/tourist-spots")
    @ResponseBody
    @Transactional
    public Map<String, Object> addTouristSpot(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // area01 형식의 regionKey를 regionId로 변환
            String regionKey = (String) request.get("regionKey");
            Long regionId = Long.parseLong(regionKey.replace("area", ""));

            SpotDto spotDto = new SpotDto();
            spotDto.setRegionId(regionId);
            spotDto.setTitle((String) request.get("title"));
            spotDto.setDescription((String) request.get("description"));
            spotDto.setLinkUrl((String) request.get("linkUrl"));
            spotDto.setCategoryCode((String) request.get("categoryCode"));
            // 위도/경도 설정
            if (request.get("latitude") != null) {
                spotDto.setLatitude(((Number) request.get("latitude")).doubleValue());
            }
            if (request.get("longitude") != null) {
                spotDto.setLongitude(((Number) request.get("longitude")).doubleValue());
            }
            spotDto.setIsActive(true);
            spotDto.setViewCount(0);

            SpotDto savedSpot = spotService.addSpot(spotDto);

            // 해시태그 처리
            @SuppressWarnings("unchecked")
            List<String> hashtagNames = (List<String>) request.get("hashtags");
            if (hashtagNames != null && !hashtagNames.isEmpty()) {
                for (String hashtagName : hashtagNames) {
                    // 해시태그가 존재하는지 확인
                    HashtagDto hashtag = hashtagService.getHashtagByName(hashtagName);
                    if (hashtag == null) {
                        // 해시태그가 없으면 생성
                        hashtag = new HashtagDto();
                        hashtag.setName(hashtagName);
                        hashtagMapper.insertHashtag(hashtag);
                    }
                    // 관광지-해시태그 연결
                    hashtagMapper.insertSpotHashtag(savedSpot.getId(), hashtag.getId());
                }
            }

            response.put("success", true);
            response.put("spot", savedSpot);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "관광지 추가에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 관광지 수정
    @PutMapping("/tourist-spots/{spotId}")
    @ResponseBody
    @Transactional
    public Map<String, Object> updateTouristSpot(@PathVariable Long spotId, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            SpotDto existingSpot = spotService.getSpotById(spotId);
            if (existingSpot == null) {
                response.put("success", false);
                response.put("message", "관광지를 찾을 수 없습니다.");
                return response;
            }

            // area01 형식의 regionKey를 regionId로 변환
            String regionKey = (String) request.get("regionKey");
            Long regionId = Long.parseLong(regionKey.replace("area", ""));

            existingSpot.setRegionId(regionId);
            existingSpot.setTitle((String) request.get("title"));
            existingSpot.setDescription((String) request.get("description"));
            existingSpot.setLinkUrl((String) request.get("linkUrl"));
            if (request.get("categoryCode") != null) {
                existingSpot.setCategoryCode((String) request.get("categoryCode"));
            }
            // 위도/경도 설정
            if (request.get("latitude") != null) {
                existingSpot.setLatitude(((Number) request.get("latitude")).doubleValue());
            } else {
                existingSpot.setLatitude(null);
            }
            if (request.get("longitude") != null) {
                existingSpot.setLongitude(((Number) request.get("longitude")).doubleValue());
            } else {
                existingSpot.setLongitude(null);
            }

            SpotDto updatedSpot = spotService.updateSpot(existingSpot);

            // 해시태그 처리: 기존 해시태그 삭제 후 새로 추가
            hashtagMapper.deleteSpotHashtags(spotId);
            @SuppressWarnings("unchecked")
            List<String> hashtagNames = (List<String>) request.get("hashtags");
            if (hashtagNames != null && !hashtagNames.isEmpty()) {
                for (String hashtagName : hashtagNames) {
                    HashtagDto hashtag = hashtagService.getHashtagByName(hashtagName);
                    if (hashtag == null) {
                        hashtag = new HashtagDto();
                        hashtag.setName(hashtagName);
                        hashtagMapper.insertHashtag(hashtag);
                    }
                    hashtagMapper.insertSpotHashtag(spotId, hashtag.getId());
                }
            }

            response.put("success", true);
            response.put("spot", updatedSpot);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "관광지 수정에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 관광지 삭제
    @DeleteMapping("/tourist-spots/{spotId}")
    @ResponseBody
    @Transactional
    public Map<String, Object> deleteTouristSpot(@PathVariable Long spotId) {
        Map<String, Object> response = new HashMap<>();
        try {
            spotService.deleteSpot(spotId);
            response.put("success", true);
            response.put("message", "관광지가 삭제되었습니다.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "관광지 삭제에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 사용자 추가
    @PostMapping("/users")
    @ResponseBody
    @Transactional
    public Map<String, Object> addUser(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDto userDto = new UserDto();
            userDto.setLoginId((String) request.get("loginId"));
            userDto.setUsername((String) request.get("username"));
            userDto.setEmail((String) request.get("email"));
            userDto.setRoleCode(((String) request.get("role")).toUpperCase());
            userDto.setStatusCode("ACTIVE");

            String password = (String) request.get("password");
            userService.insertUser(userDto, password);

            response.put("success", true);
            response.put("user", userDto);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "사용자 추가에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 사용자 수정
    @PutMapping("/users/{userId}")
    @ResponseBody
    @Transactional
    public Map<String, Object> updateUser(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDto userDto = new UserDto();
            userDto.setId(userId);
            userDto.setUsername((String) request.get("username"));
            userDto.setEmail((String) request.get("email"));
            if (request.get("role") != null) {
                userDto.setRoleCode(((String) request.get("role")).toUpperCase());
            }
            if (request.get("status") != null) {
                userDto.setStatusCode(((String) request.get("status")).toUpperCase());
            }

            UserDto updatedUser = userService.updateUser(userId, userDto);
            response.put("success", true);
            response.put("user", updatedUser);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "사용자 수정에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 사용자 상태 변경
    @PutMapping("/users/{userId}/status")
    @ResponseBody
    @Transactional
    public Map<String, Object> updateUserStatus(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String status = ((String) request.get("status")).toUpperCase();
            userService.updateUserStatus(userId, status);
            response.put("success", true);
            response.put("message", "사용자 상태가 변경되었습니다.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "사용자 상태 변경에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 사용자 삭제
    @DeleteMapping("/users/{userId}")
    @ResponseBody
    @Transactional
    public Map<String, Object> deleteUser(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            userService.deleteUser(userId);
            response.put("success", true);
            response.put("message", "사용자가 삭제되었습니다.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "사용자 삭제에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // ========== 공통코드 관리 API ==========

    // 코드 그룹 목록 조회
    @GetMapping("/common-code-groups")
    @ResponseBody
    public Map<String, Object> getCommonCodeGroups(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        // 관리자 권한 확인
        if (!isAdmin(request)) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return response;
        }
        
        try {
            List<CommonCodeGroupDto> groups = commonCodeGroupService.getAllGroups();
            response.put("success", true);
            response.put("groups", groups);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "코드 그룹 목록을 불러오는데 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 코드 그룹 추가
    @PostMapping("/common-code-groups")
    @ResponseBody
    @Transactional
    public Map<String, Object> addCommonCodeGroup(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            CommonCodeGroupDto groupDto = new CommonCodeGroupDto();
            groupDto.setGroupCode((String) request.get("groupCode"));
            groupDto.setGroupName((String) request.get("groupName"));
            groupDto.setGroupNameEn((String) request.get("groupNameEn"));
            groupDto.setGroupNameJp((String) request.get("groupNameJp"));
            groupDto.setDescription((String) request.get("description"));
            if (request.get("isActive") != null) {
                groupDto.setIsActive((Boolean) request.get("isActive"));
            }
            if (request.get("sortOrder") != null) {
                groupDto.setSortOrder(((Number) request.get("sortOrder")).intValue());
            }

            commonCodeGroupService.addGroup(groupDto);
            response.put("success", true);
            response.put("group", groupDto);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "코드 그룹 추가에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 코드 그룹 수정
    @PutMapping("/common-code-groups/{groupId}")
    @ResponseBody
    @Transactional
    public Map<String, Object> updateCommonCodeGroup(@PathVariable Long groupId,
            @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            CommonCodeGroupDto groupDto = commonCodeGroupService.getGroupById(groupId);
            if (groupDto == null) {
                response.put("success", false);
                response.put("message", "코드 그룹을 찾을 수 없습니다.");
                return response;
            }

            if (request.get("groupName") != null) {
                groupDto.setGroupName((String) request.get("groupName"));
            }
            if (request.get("groupNameEn") != null) {
                groupDto.setGroupNameEn((String) request.get("groupNameEn"));
            }
            if (request.get("groupNameJp") != null) {
                groupDto.setGroupNameJp((String) request.get("groupNameJp"));
            }
            if (request.get("description") != null) {
                groupDto.setDescription((String) request.get("description"));
            }
            if (request.get("isActive") != null) {
                groupDto.setIsActive((Boolean) request.get("isActive"));
            }
            if (request.get("sortOrder") != null) {
                groupDto.setSortOrder(((Number) request.get("sortOrder")).intValue());
            }

            commonCodeGroupService.updateGroup(groupDto);
            response.put("success", true);
            response.put("group", groupDto);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "코드 그룹 수정에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 코드 그룹 삭제
    @DeleteMapping("/common-code-groups/{groupId}")
    @ResponseBody
    @Transactional
    public Map<String, Object> deleteCommonCodeGroup(@PathVariable Long groupId) {
        Map<String, Object> response = new HashMap<>();
        try {
            commonCodeGroupService.deleteGroup(groupId);
            response.put("success", true);
            response.put("message", "코드 그룹이 삭제되었습니다.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "코드 그룹 삭제에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 코드 목록 조회 (그룹별)
    @GetMapping("/common-codes")
    @ResponseBody
    public Map<String, Object> getCommonCodes(@RequestParam(required = false) String groupCode, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        // 관리자 권한 확인
        if (!isAdmin(request)) {
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return response;
        }
        
        try {
            List<CommonCodeDto> codes;
            if (groupCode != null && !groupCode.isEmpty()) {
                codes = commonCodeService.getCodesByGroupCode(groupCode);
            } else {
                codes = commonCodeService.getAllCodes();
            }
            response.put("success", true);
            response.put("codes", codes);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "코드 목록을 불러오는데 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 코드 추가
    @PostMapping("/common-codes")
    @ResponseBody
    @Transactional
    public Map<String, Object> addCommonCode(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            CommonCodeDto codeDto = new CommonCodeDto();
            codeDto.setGroupCode((String) request.get("groupCode"));
            codeDto.setCode((String) request.get("code"));
            codeDto.setCodeName((String) request.get("codeName"));
            codeDto.setCodeNameEn((String) request.get("codeNameEn"));
            codeDto.setCodeNameJp((String) request.get("codeNameJp"));
            codeDto.setDescription((String) request.get("description"));
            if (request.get("isActive") != null) {
                codeDto.setIsActive((Boolean) request.get("isActive"));
            }
            if (request.get("sortOrder") != null) {
                codeDto.setSortOrder(((Number) request.get("sortOrder")).intValue());
            }
            if (request.get("extraData") != null) {
                codeDto.setExtraData((String) request.get("extraData"));
            }

            commonCodeService.addCode(codeDto);
            response.put("success", true);
            response.put("code", codeDto);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "코드 추가에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 코드 수정
    @PutMapping("/common-codes/{codeId}")
    @ResponseBody
    @Transactional
    public Map<String, Object> updateCommonCode(@PathVariable Long codeId, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            CommonCodeDto codeDto = commonCodeService.getCodeById(codeId);
            if (codeDto == null) {
                response.put("success", false);
                response.put("message", "코드를 찾을 수 없습니다.");
                return response;
            }

            if (request.get("codeName") != null) {
                codeDto.setCodeName((String) request.get("codeName"));
            }
            if (request.get("codeNameEn") != null) {
                codeDto.setCodeNameEn((String) request.get("codeNameEn"));
            }
            if (request.get("codeNameJp") != null) {
                codeDto.setCodeNameJp((String) request.get("codeNameJp"));
            }
            if (request.get("description") != null) {
                codeDto.setDescription((String) request.get("description"));
            }
            if (request.get("isActive") != null) {
                codeDto.setIsActive((Boolean) request.get("isActive"));
            }
            if (request.get("sortOrder") != null) {
                codeDto.setSortOrder(((Number) request.get("sortOrder")).intValue());
            }
            if (request.get("extraData") != null) {
                codeDto.setExtraData((String) request.get("extraData"));
            }

            commonCodeService.updateCode(codeDto);
            response.put("success", true);
            response.put("code", codeDto);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "코드 수정에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 코드 삭제
    @DeleteMapping("/common-codes/{codeId}")
    @ResponseBody
    @Transactional
    public Map<String, Object> deleteCommonCode(@PathVariable Long codeId) {
        Map<String, Object> response = new HashMap<>();
        try {
            commonCodeService.deleteCode(codeId);
            response.put("success", true);
            response.put("message", "코드가 삭제되었습니다.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "코드 삭제에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // ========== 사진 추가 신청 관리 API ==========

    // 사진 추가 신청 목록 조회
    @GetMapping("/spot-requests")
    @ResponseBody
    public Map<String, Object> getSpotRequests() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<com.busan.orora.spot.dto.SpotRequestDto> requests = spotRequestService.getAllRequests();

            // DTO를 Map으로 변환하여 프론트엔드에 전달
            List<Map<String, Object>> requestList = requests.stream().map(request -> {
                Map<String, Object> requestMap = new HashMap<>();
                requestMap.put("id", request.getId());
                requestMap.put("userId", request.getUserId());
                requestMap.put("type", request.getRequestType());
                requestMap.put("applicantId", request.getApplicantId());
                requestMap.put("applicantName", request.getApplicantName());
                requestMap.put("spotId", request.getTouristSpotId());
                requestMap.put("spotName",
                        request.getSpotName() != null ? request.getSpotName() : request.getSpotTitle());
                requestMap.put("imageUrl", request.getImageUrl());
                requestMap.put("description", request.getDescription());
                requestMap.put("status", request.getStatus());
                requestMap.put("rejectReason", request.getRejectReason());
                requestMap.put("createdAt", request.getCreatedAt());
                // 관광지 추가 신청 관련 추가 필드
                requestMap.put("regionId", request.getRegionId());
                requestMap.put("regionName", request.getRegionName());
                requestMap.put("linkUrl", request.getLinkUrl());
                requestMap.put("hashtags", request.getHashtags());
                requestMap.put("latitude", request.getLatitude());
                requestMap.put("longitude", request.getLongitude());
                requestMap.put("address", request.getAddress());
                return requestMap;
            }).collect(Collectors.toList());

            response.put("success", true);
            response.put("requests", requestList);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "신청 목록을 불러오는데 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 사진 추가 신청 승인
    @PutMapping("/spot-requests/{requestId}/approve")
    @ResponseBody
    @Transactional
    public Map<String, Object> approveSpotRequest(@PathVariable Long requestId) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 1. 신청 정보 조회
            com.busan.orora.spot.dto.SpotRequestDto request = spotRequestService.getRequestById(requestId);
            if (request == null) {
                response.put("success", false);
                response.put("message", "신청을 찾을 수 없습니다.");
                return response;
            }

            // 2. 신청 유형에 따라 처리
            if ("photo".equals(request.getRequestType())) {
                // 사진 추가 신청: 사진을 관광지에 추가
                if (request.getTouristSpotId() == null) {
                    response.put("success", false);
                    response.put("message", "관광지 ID가 없습니다.");
                    return response;
                }
                
                // 이미지 URL이 있는 경우에만 추가
                if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
                    // 해당 관광지에 대표 이미지가 있는지 확인
                    List<SpotImageDto> existingImages = spotImageService.getImagesBySpotId(request.getTouristSpotId());
                    boolean hasRepImage = existingImages.stream()
                            .anyMatch(img -> "Y".equals(img.getRepImgYn()));
                    
                    // 사진을 관광지 이미지로 추가 (대표 이미지가 없으면 대표로 설정)
                    spotImageService.addImageByUrl(
                            request.getTouristSpotId(), 
                            request.getImageUrl(), 
                            !hasRepImage  // 대표 이미지가 없으면 대표로 설정
                    );
                }
            } else if ("spot".equals(request.getRequestType())) {
                // 관광지 추가 신청: 프론트엔드에서 별도로 처리 (추가 모달 통해)
                // 이 엔드포인트에서는 상태만 변경
            }

            // 3. 신청 상태를 'approved'로 변경
            spotRequestService.updateRequestStatus(requestId, "approved", null);

            response.put("success", true);
            response.put("message", "신청이 승인되었습니다.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "승인에 실패했습니다: " + e.getMessage());
            logger.error("오류 발생", e);
        }
        return response;
    }

    // 사진 추가 신청 거부
    @PutMapping("/spot-requests/{requestId}/reject")
    @ResponseBody
    @Transactional
    public Map<String, Object> rejectSpotRequest(@PathVariable Long requestId,
            @RequestBody Map<String, Object> requestBody) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 1. 신청 정보 조회
            com.busan.orora.spot.dto.SpotRequestDto request = spotRequestService.getRequestById(requestId);
            if (request == null) {
                response.put("success", false);
                response.put("message", "신청을 찾을 수 없습니다.");
                return response;
            }

            // 2. 거부 사유 추출
            String reason = (String) requestBody.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                reason = "사유 없음";
            }

            // 3. 신청 상태를 'rejected'로 변경 및 거부 사유 저장
            spotRequestService.updateRequestStatus(requestId, "rejected", reason);

            response.put("success", true);
            response.put("message", "신청이 거부되었습니다.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "거부에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 사진/관광지 추가 신청 삭제
    @DeleteMapping("/spot-requests/{requestId}")
    @ResponseBody
    @Transactional
    public Map<String, Object> deleteSpotRequest(@PathVariable Long requestId) {
        Map<String, Object> response = new HashMap<>();
        try {
            spotRequestService.deleteRequest(requestId);
            response.put("success", true);
            response.put("message", "신청이 삭제되었습니다.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "삭제에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // ========== 관광지 이미지 관리 API ==========

    // 관광지 이미지 목록 조회
    @GetMapping("/tourist-spots/{spotId}/images")
    @ResponseBody
    public Map<String, Object> getSpotImages(@PathVariable Long spotId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<SpotImageDto> images = spotImageService.getImagesBySpotId(spotId);
            response.put("success", true);
            response.put("images", images);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "이미지 목록을 불러오는데 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 관광지 이미지 삭제
    @DeleteMapping("/tourist-spots/images/{imageId}")
    @ResponseBody
    public Map<String, Object> deleteSpotImage(@PathVariable Long imageId) {
        Map<String, Object> response = new HashMap<>();
        try {
            spotImageService.deleteImage(imageId);
            response.put("success", true);
            response.put("message", "이미지가 삭제되었습니다.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "이미지 삭제에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 관광지 이미지 추가
    @PostMapping("/tourist-spots/{spotId}/images")
    @ResponseBody
    public Map<String, Object> addSpotImages(
            @PathVariable Long spotId,
            @RequestParam("images") List<MultipartFile> images) {
        Map<String, Object> response = new HashMap<>();
        try {
            spotImageService.saveSpotImages(spotId, images);
            response.put("success", true);
            response.put("message", "이미지가 추가되었습니다.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "이미지 추가에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // 대표 이미지 설정
    @PutMapping("/tourist-spots/images/{imageId}/set-rep")
    @ResponseBody
    public Map<String, Object> setRepresentativeImage(@PathVariable Long imageId) {
        Map<String, Object> response = new HashMap<>();
        try {
            spotImageService.setRepresentativeImage(imageId);
            response.put("success", true);
            response.put("message", "대표 이미지가 설정되었습니다.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "대표 이미지 설정에 실패했습니다: " + e.getMessage());
        }
        return response;
    }

    // ========== 유저 신고 관리 API ==========

    // 신고 목록 조회
    @GetMapping("/user-reports")
    @ResponseBody
    public Map<String, Object> getUserReports() {
        Map<String, Object> response = new HashMap<>();
        try {
            // 리뷰 신고 목록 조회
            List<Map<String, Object>> reviewReports = reviewMapper.findAllReports();
            
            // 댓글 신고 목록 조회
            List<Map<String, Object>> commentReports = reviewService.getAllCommentReports();
            
            // 프론트엔드에 맞게 데이터 변환 (리뷰 신고)
            List<Map<String, Object>> reviewReportList = reviewReports.stream().map(report -> {
                Map<String, Object> reportMap = new HashMap<>();
                reportMap.put("id", report.get("id"));
                reportMap.put("reportType", "review"); // 신고 유형: 리뷰
                reportMap.put("reporterId", report.get("reporterId"));
                reportMap.put("reporterName", report.get("reporterName") != null ? report.get("reporterName") : report.get("reporterLoginId"));
                reportMap.put("reportedUserId", report.get("reportedUserId"));
                reportMap.put("reportedUserName", report.get("reportedUserName") != null ? report.get("reportedUserName") : report.get("reportedUserLoginId"));
                reportMap.put("reviewId", report.get("reviewId"));
                reportMap.put("reviewTitle", report.get("reviewTitle"));
                reportMap.put("reviewContent", report.get("reviewContent"));
                reportMap.put("commentId", null);
                reportMap.put("commentContent", null);
                reportMap.put("reason", report.get("reason"));
                reportMap.put("status", report.get("statusCode") != null ? ((String) report.get("statusCode")).toLowerCase() : "pending");
                reportMap.put("createdAt", report.get("createdAt"));
                reportMap.put("updatedAt", report.get("updatedAt"));
                
                // 신고 유형 추정 (reason 내용 기반)
                String reasonStr = (String) report.get("reason");
                String type = "other";
                if (reasonStr != null) {
                    String lowerReason = reasonStr.toLowerCase();
                    if (lowerReason.contains("스팸") || lowerReason.contains("spam")) {
                        type = "spam";
                    } else if (lowerReason.contains("욕설") || lowerReason.contains("비방") || lowerReason.contains("abuse")) {
                        type = "abuse";
                    } else if (lowerReason.contains("부적절") || lowerReason.contains("inappropriate")) {
                        type = "inappropriate";
                    }
                }
                reportMap.put("type", type);
                
                return reportMap;
            }).collect(Collectors.toList());

            // 프론트엔드에 맞게 데이터 변환 (댓글 신고)
            List<Map<String, Object>> commentReportList = commentReports.stream().map(report -> {
                Map<String, Object> reportMap = new HashMap<>();
                reportMap.put("id", report.get("id"));
                reportMap.put("reportType", "comment"); // 신고 유형: 댓글
                reportMap.put("reporterId", report.get("reporterId"));
                reportMap.put("reporterName", report.get("reporterName") != null ? report.get("reporterName") : report.get("reporterLoginId"));
                reportMap.put("reportedUserId", report.get("reportedUserId"));
                reportMap.put("reportedUserName", report.get("reportedUserName") != null ? report.get("reportedUserName") : report.get("reportedUserLoginId"));
                reportMap.put("reviewId", report.get("reviewId"));
                reportMap.put("reviewTitle", report.get("reviewTitle"));
                reportMap.put("reviewContent", null);
                reportMap.put("commentId", report.get("commentId"));
                reportMap.put("commentContent", report.get("commentContent"));
                reportMap.put("reason", report.get("reason"));
                reportMap.put("status", report.get("statusCode") != null ? ((String) report.get("statusCode")).toLowerCase() : "pending");
                reportMap.put("createdAt", report.get("createdAt"));
                reportMap.put("updatedAt", report.get("updatedAt"));
                
                // 신고 유형 추정 (reason 내용 기반)
                String reasonStr = (String) report.get("reason");
                String type = "other";
                if (reasonStr != null) {
                    String lowerReason = reasonStr.toLowerCase();
                    if (lowerReason.contains("스팸") || lowerReason.contains("spam")) {
                        type = "spam";
                    } else if (lowerReason.contains("욕설") || lowerReason.contains("비방") || lowerReason.contains("abuse")) {
                        type = "abuse";
                    } else if (lowerReason.contains("부적절") || lowerReason.contains("inappropriate")) {
                        type = "inappropriate";
                    }
                }
                reportMap.put("type", type);
                
                return reportMap;
            }).collect(Collectors.toList());

            // 리뷰 신고와 댓글 신고를 합쳐서 날짜순으로 정렬
            List<Map<String, Object>> allReports = new ArrayList<>();
            allReports.addAll(reviewReportList);
            allReports.addAll(commentReportList);
            
            // 생성일시 기준으로 내림차순 정렬
            allReports.sort((a, b) -> {
                Object aDate = a.get("createdAt");
                Object bDate = b.get("createdAt");
                if (aDate == null && bDate == null) return 0;
                if (aDate == null) return 1;
                if (bDate == null) return -1;
                return bDate.toString().compareTo(aDate.toString());
            });

            response.put("success", true);
            response.put("reports", allReports);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "신고 목록을 불러오는데 실패했습니다: " + e.getMessage());
            logger.error("오류 발생", e);
        }
        return response;
    }

    // 신고 처리 (처벌 적용)
    @PostMapping("/reports/{reportId}/process")
    @ResponseBody
    @Transactional
    public Map<String, Object> processReport(@PathVariable Long reportId, @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String action = (String) request.get("action"); // 'resolved' 또는 'rejected'
            String reportType = (String) request.get("reportType"); // 'review' 또는 'comment'
            
            // 상태 코드 결정
            String statusCode = "resolved".equals(action) ? "RESOLVED" : "REJECTED";
            
            // 신고 유형에 따라 처리
            if ("comment".equals(reportType)) {
                // 댓글 신고 처리
                reviewMapper.updateCommentReportStatus(reportId, statusCode);
            } else {
                // 리뷰 신고 처리 (기본값)
                reviewMapper.updateReviewReportStatus(reportId, statusCode);
            }
            
            // 처벌 정보 처리 (resolved인 경우)
            if ("resolved".equals(action)) {
                String penaltyType = (String) request.get("penaltyType");
                Object reportedUserIdObj = request.get("reportedUserId");
                Long reportedUserId = null;
                
                if (reportedUserIdObj != null) {
                    if (reportedUserIdObj instanceof Number) {
                        reportedUserId = ((Number) reportedUserIdObj).longValue();
                    } else if (reportedUserIdObj instanceof String) {
                        try {
                            reportedUserId = Long.parseLong((String) reportedUserIdObj);
                        } catch (NumberFormatException e) {
                            // 무시
                        }
                    }
                }
                
                // 처벌 유형에 따른 사용자 상태 변경
                if (penaltyType != null && reportedUserId != null && reportedUserId > 0) {
                    switch (penaltyType) {
                        case "warning":
                            // 경고는 별도의 테이블에 기록 (TODO: 경고 테이블 구현 필요)
                            break;
                        case "content_delete":
                            // 콘텐츠 삭제 처리는 deleteContent 체크박스로 처리
                            break;
                        case "temp_ban_1":
                        case "temp_ban_3":
                        case "temp_ban_7":
                        case "temp_ban_30":
                        case "permanent_ban":
                            // 사용자 상태를 SUSPENDED로 변경
                            userService.updateUserStatus(reportedUserId, "SUSPENDED");
                            break;
                    }
                }
                
                // 콘텐츠 삭제 처리
                Boolean deleteContent = (Boolean) request.get("deleteContent");
                if (Boolean.TRUE.equals(deleteContent)) {
                    // TODO: 관련 리뷰 또는 댓글 삭제 처리
                    // 실제 구현 시 reviewService.deleteReview() 또는 commentService.deleteComment() 호출
                }
            }
            
            response.put("success", true);
            response.put("message", "신고가 처리되었습니다.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "신고 처리에 실패했습니다: " + e.getMessage());
            logger.error("오류 발생", e);
        }
        return response;
    }

    // 신고 삭제
    @DeleteMapping("/reports/{reportId}")
    @ResponseBody
    @Transactional
    public Map<String, Object> deleteReport(@PathVariable Long reportId, @RequestBody(required = false) Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String reportType = "review"; // 기본값
            if (request != null && request.get("reportType") != null) {
                reportType = (String) request.get("reportType");
            }
            
            // 신고 유형에 따라 삭제
            if ("comment".equals(reportType)) {
                // 댓글 신고 삭제
                reviewMapper.deleteCommentReport(reportId);
            } else {
                // 리뷰 신고 삭제 (기본값)
                reviewMapper.deleteReviewReport(reportId);
            }
            
            response.put("success", true);
            response.put("message", "신고 기록이 삭제되었습니다.");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "신고 삭제에 실패했습니다: " + e.getMessage());
            logger.error("오류 발생", e);
        }
        return response;
    }
}
