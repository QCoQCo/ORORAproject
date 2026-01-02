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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
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

    // 관광지 목록 조회
    @GetMapping("/tourist-spots")
    @ResponseBody
    public Map<String, Object> getTouristSpots() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<SpotDto> spots = spotService.getAllSpots();
            
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
                
                // 해시태그 조회
                List<HashtagDto> hashtags = hashtagService.getHashtagsBySpotId(spot.getId());
                List<String> hashtagNames = hashtags.stream()
                    .map(HashtagDto::getName)
                    .collect(Collectors.toList());
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
    public Map<String, Object> getUsers() {
        Map<String, Object> response = new HashMap<>();
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
    public Map<String, Object> getCommonCodeGroups() {
        Map<String, Object> response = new HashMap<>();
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
    public Map<String, Object> updateCommonCodeGroup(@PathVariable Long groupId, @RequestBody Map<String, Object> request) {
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
    public Map<String, Object> getCommonCodes(@RequestParam(required = false) String groupCode) {
        Map<String, Object> response = new HashMap<>();
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
}
