package com.busan.orora.user.controller;

import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Autowired;
import com.busan.orora.user.service.UserService;
import com.busan.orora.user.dto.UserDto;
import com.busan.orora.user.form.UserLoginForm;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

@Controller
public class UserController {
    @Autowired
    private UserService userService;

    // 로그인 페이지
    @GetMapping("/pages/login/login")
    public String loginPage() {
        return "pages/login/login";
    }

    // 회원가입 페이지
    @GetMapping("/pages/login/signup")
    public String signupPage() {
        return "pages/login/signup";
    }

    // 로그인 API
    @PostMapping("/api/auth/login")
    @ResponseBody
    public Map<String, Object> login(@RequestBody UserLoginForm loginForm) {
        Map<String, Object> response = new HashMap<>();

        try {
            UserDto user = userService.login(loginForm.getLoginId(), loginForm.getPassword());

            if (user != null) {
                response.put("success", true);
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("loginId", user.getLoginId());
                userMap.put("username", user.getUsername());
                userMap.put("email", user.getEmail());
                userMap.put("role", user.getRoleCode() != null ? user.getRoleCode() : "MEMBER");
                userMap.put("roleCode", user.getRoleCode() != null ? user.getRoleCode() : "MEMBER");
                userMap.put("profileImage",
                        user.getProfileImage() != null ? user.getProfileImage() : "/images/defaultProfile.png");
                userMap.put("profile_image",
                        user.getProfileImage() != null ? user.getProfileImage() : "/images/defaultProfile.png");
                userMap.put("join_date", user.getJoinDate() != null ? user.getJoinDate().toString() : null);
                response.put("user", userMap);
                response.put("message", "로그인 성공");
            } else {
                response.put("success", false);
                response.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "로그인 처리 중 오류가 발생했습니다: " + e.getMessage());
        }

        return response;
    }

    // 회원가입 API
    @PostMapping("/api/auth/signup")
    @ResponseBody
    public Map<String, Object> signup(
            @RequestPart("loginId") String loginId,
            @RequestPart("password") String password,
            @RequestPart("username") String username,
            @RequestPart("email") String email,
            @RequestPart(value = "phoneNumber", required = false) String phoneNumber,
            @RequestPart(value = "address", required = false) String address,
            @RequestPart(value = "birthDate", required = false) String birthDate,
            @RequestPart(value = "genderCode", required = false) String genderCode,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 아이디 중복 체크
            if (userService.isLoginIdExists(loginId)) {
                response.put("success", false);
                response.put("message", "이미 사용 중인 아이디입니다.");
                return response;
            }

            // 이메일 필수 체크
            if (email == null || email.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "이메일은 필수 입력 사항입니다.");
                return response;
            }

            // 이메일 중복 체크
            if (userService.isEmailExists(email)) {
                response.put("success", false);
                response.put("message", "이미 사용 중인 이메일입니다.");
                return response;
            }

            // 회원가입 처리
            UserDto userDto = new UserDto();
            userDto.setLoginId(loginId);
            userDto.setUsername(username);
            userDto.setEmail(email);
            userDto.setPhoneNumber(phoneNumber);
            userDto.setAddress(address);

            // birthDate 문자열을 LocalDateTime으로 변환
            if (birthDate != null && !birthDate.trim().isEmpty()) {
                try {
                    java.time.LocalDate date = java.time.LocalDate.parse(birthDate,
                            java.time.format.DateTimeFormatter.ISO_LOCAL_DATE);
                    userDto.setBirthDate(date.atStartOfDay());
                } catch (Exception e) {
                    // 날짜 파싱 실패 시 null로 설정
                    userDto.setBirthDate(null);
                }
            }

            userDto.setGenderCode(genderCode);

            // 회원가입 처리 (프로필 이미지 포함)
            userService.insertUser(userDto, password, profileImage);

            response.put("success", true);
            response.put("message", "회원가입이 완료되었습니다!");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "회원가입 처리 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }

    // 아이디 중복 체크 API
    @GetMapping("/api/auth/check-id")
    @ResponseBody
    public Map<String, Object> checkId(@RequestParam String userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            boolean available = !userService.isLoginIdExists(userId);
            response.put("available", available);
            response.put("message", available ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.");
        } catch (Exception e) {
            response.put("available", false);
            response.put("message", "아이디 확인 중 오류가 발생했습니다: " + e.getMessage());
        }

        return response;
    }

    // 로그아웃 API
    @PostMapping("/api/auth/logout")
    @ResponseBody
    public Map<String, Object> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "로그아웃되었습니다.");
        return response;
    }

    // 사용자 정보 조회 API
    @GetMapping("/api/users/{userId}")
    @ResponseBody
    public Map<String, Object> getUserById(@org.springframework.web.bind.annotation.PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            UserDto user = userService.getUserById(userId);
            if (user != null) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("loginId", user.getLoginId());
                userMap.put("username", user.getUsername());
                userMap.put("email", user.getEmail());
                userMap.put("phoneNumber", user.getPhoneNumber());
                userMap.put("address", user.getAddress());
                userMap.put("birthDate", user.getBirthDate() != null ? user.getBirthDate().toString() : null);
                userMap.put("genderCode", user.getGenderCode());
                userMap.put("role", user.getRoleCode() != null ? user.getRoleCode() : "MEMBER");
                userMap.put("roleCode", user.getRoleCode() != null ? user.getRoleCode() : "MEMBER");
                userMap.put("profileImage",
                        user.getProfileImage() != null ? user.getProfileImage() : "/images/defaultProfile.png");
                userMap.put("profile_image",
                        user.getProfileImage() != null ? user.getProfileImage() : "/images/defaultProfile.png");
                userMap.put("join_date", user.getJoinDate() != null ? user.getJoinDate().toString() : null);
                response.put("success", true);
                response.put("user", userMap);
            } else {
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "사용자 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }

    // 프로필 수정 페이지
    @GetMapping("/pages/mypage/edit-profile")
    public String editProfilePage() {
        return "pages/mypage/edit-profile";
    }

    // 프로필 수정 API
    @org.springframework.web.bind.annotation.PutMapping("/api/users/{userId}/profile")
    @ResponseBody
    public Map<String, Object> updateProfile(
            @org.springframework.web.bind.annotation.PathVariable Long userId,
            @RequestPart(value = "username", required = false) String username,
            @RequestPart(value = "email", required = false) String email,
            @RequestPart(value = "phoneNumber", required = false) String phoneNumber,
            @RequestPart(value = "address", required = false) String address,
            @RequestPart(value = "birthDate", required = false) String birthDate,
            @RequestPart(value = "genderCode", required = false) String genderCode,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 현재 로그인한 사용자 확인 (간단한 검증)
            // TODO: 실제로는 세션/토큰을 통해 권한 확인 필요

            // UserDto 생성
            UserDto userDto = new UserDto();
            userDto.setUsername(username);
            userDto.setEmail(email);
            userDto.setPhoneNumber(phoneNumber);
            userDto.setAddress(address);

            // 생년월일 변환
            if (birthDate != null && !birthDate.trim().isEmpty()) {
                try {
                    java.time.LocalDate date = java.time.LocalDate.parse(birthDate);
                    userDto.setBirthDate(date.atStartOfDay());
                } catch (Exception e) {
                    userDto.setBirthDate(null);
                }
            }

            userDto.setGenderCode(genderCode);

            // 프로필 업데이트
            UserDto updatedUser = userService.updateUserProfile(userId, userDto, profileImage);

            // 응답 생성
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", updatedUser.getId());
            userMap.put("loginId", updatedUser.getLoginId());
            userMap.put("username", updatedUser.getUsername());
            userMap.put("email", updatedUser.getEmail());
            userMap.put("phoneNumber", updatedUser.getPhoneNumber());
            userMap.put("address", updatedUser.getAddress());
            userMap.put("birthDate", updatedUser.getBirthDate() != null ? updatedUser.getBirthDate().toString() : null);
            userMap.put("genderCode", updatedUser.getGenderCode());
            userMap.put("role", updatedUser.getRoleCode() != null ? updatedUser.getRoleCode() : "MEMBER");
            userMap.put("roleCode", updatedUser.getRoleCode() != null ? updatedUser.getRoleCode() : "MEMBER");
            userMap.put("profileImage",
                    updatedUser.getProfileImage() != null ? updatedUser.getProfileImage()
                            : "/images/defaultProfile.png");
            userMap.put("profile_image",
                    updatedUser.getProfileImage() != null ? updatedUser.getProfileImage()
                            : "/images/defaultProfile.png");
            userMap.put("join_date", updatedUser.getJoinDate() != null ? updatedUser.getJoinDate().toString() : null);

            response.put("success", true);
            response.put("message", "프로필이 성공적으로 수정되었습니다.");
            response.put("user", userMap);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "프로필 수정 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }
}
