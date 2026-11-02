package com.busan.orora.user.controller;

import com.busan.orora.common.util.ErrorMessages;
import org.springframework.stereotype.Controller;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.beans.factory.annotation.Autowired;
import com.busan.orora.common.util.SessionUtil;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import org.springframework.ui.Model;

@Controller
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    /** 로그인 상태 유지 기간: 7일 (초 단위) */
    private static final int KEEP_LOGIN_SECONDS = 7 * 24 * 60 * 60;

    @Autowired
    private UserService userService;

    @Autowired
    private com.busan.orora.commoncode.service.CommonCodeService commonCodeService;

    // 로그인 페이지
    @GetMapping("/pages/login/login")
    public String loginPage(Model model) {
        // LOGIN_TYPE 공통코드 조회
        List<com.busan.orora.commoncode.dto.CommonCodeDto> loginTypes = commonCodeService
                .getCodesByGroupCode("LOGIN_TYPE");

        // 각 로그인 타입의 활성 상태를 모델에 추가
        boolean isNormalActive = false;
        boolean isKakaoActive = false;
        boolean isGoogleActive = false;

        for (com.busan.orora.commoncode.dto.CommonCodeDto code : loginTypes) {
            if ("NOR".equals(code.getCode()) && Boolean.TRUE.equals(code.getIsActive())) {
                isNormalActive = true;
            } else if ("KAK".equals(code.getCode()) && Boolean.TRUE.equals(code.getIsActive())) {
                isKakaoActive = true;
            } else if ("GOO".equals(code.getCode()) && Boolean.TRUE.equals(code.getIsActive())) {
                isGoogleActive = true;
            }
        }

        model.addAttribute("isNormalActive", isNormalActive);
        model.addAttribute("isKakaoActive", isKakaoActive);
        model.addAttribute("isGoogleActive", isGoogleActive);

        return "pages/login/login";
    }

    // 회원가입 페이지
    @GetMapping("/pages/login/signup")
    public String signupPage(Model model) {
        // 일반 회원가입(NOR) 활성 상태 확인
        List<com.busan.orora.commoncode.dto.CommonCodeDto> loginTypes = commonCodeService
                .getCodesByGroupCode("LOGIN_TYPE");

        boolean isNormalActive = false;
        for (com.busan.orora.commoncode.dto.CommonCodeDto code : loginTypes) {
            if ("NOR".equals(code.getCode()) && Boolean.TRUE.equals(code.getIsActive())) {
                isNormalActive = true;
                break;
            }
        }

        // 일반 회원가입이 비활성화되어 있으면 로그인 페이지로 리다이렉트
        if (!isNormalActive) {
            return "redirect:/pages/login/login";
        }

        return "pages/login/signup";
    }

    // 아이디 찾기 페이지
    @GetMapping("/pages/login/find-id")
    public String findIdPage() {
        return "pages/login/find-id";
    }

    // 비밀번호 재설정 페이지
    @GetMapping("/pages/login/reset-password")
    public String resetPasswordPage() {
        return "pages/login/reset-password";
    }

    // 로그인 API
    @PostMapping("/api/auth/login")
    @ResponseBody
    public Map<String, Object> login(@RequestBody UserLoginForm loginForm,
            HttpServletRequest request,
            HttpServletResponse response) {
        Map<String, Object> responseMap = new HashMap<>();

        try {
            UserDto user = userService.login(loginForm.getLoginId(), loginForm.getPassword());

            if (user != null) {
                // 세션 고정 공격 방지: 로그인 전 세션 ID를 새 ID로 교체 (세션 속성은 유지됨)
                HttpSession session = request.getSession();
                request.changeSessionId();

                // 세션에 사용자 정보와 Spring Security 인증 정보 저장 (새로 로그인하면 항상 실제 권한으로 시작)
                session.setAttribute("loggedInUser", user);
                session.removeAttribute(SessionUtil.VIEW_AS_MEMBER);
                SessionUtil.saveAuthentication(session, user);

                // 로그인 상태 유지 설정
                if (loginForm.getKeepLogin() != null && loginForm.getKeepLogin()) {
                    // 로그인 상태 유지: 세션 타임아웃을 7일로 설정
                    session.setMaxInactiveInterval(KEEP_LOGIN_SECONDS);

                    // 세션 쿠키도 7일 유지되도록 다시 발급
                    // (application.yaml의 기본 세션 쿠키 max-age는 12시간이라 그대로 두면 12시간 뒤 로그아웃됨)
                    ResponseCookie sessionCookie = ResponseCookie.from("JSESSIONID", session.getId())
                            .path("/")
                            .maxAge(KEEP_LOGIN_SECONDS)
                            .httpOnly(true)
                            .sameSite("Lax")
                            .build();
                    response.addHeader(HttpHeaders.SET_COOKIE, sessionCookie.toString());
                } else {
                    // 기본 세션 타임아웃 (30분)
                    session.setMaxInactiveInterval(30 * 60); // 30분
                }

                // 아이디 저장 쿠키 설정
                if (loginForm.getSaveId() != null && loginForm.getSaveId()) {
                    Cookie saveIdCookie = new Cookie("savedLoginId", user.getLoginId());
                    saveIdCookie.setMaxAge(30 * 24 * 60 * 60); // 30일
                    saveIdCookie.setPath("/");
                    saveIdCookie.setHttpOnly(false); // JavaScript에서 읽을 수 있도록 설정
                    response.addCookie(saveIdCookie);
                    logger.debug("아이디 저장 쿠키 설정: {}", user.getLoginId());
                } else {
                    // 아이디 저장 해제 시 쿠키 삭제
                    Cookie saveIdCookie = new Cookie("savedLoginId", "");
                    saveIdCookie.setMaxAge(0);
                    saveIdCookie.setPath("/");
                    saveIdCookie.setHttpOnly(false);
                    response.addCookie(saveIdCookie);
                    logger.debug("아이디 저장 쿠키 삭제");
                }

                responseMap.put("success", true);
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("loginId", user.getLoginId());
                userMap.put("username", user.getUsername());
                userMap.put("email", user.getEmail());
                putRoleInfo(userMap, user, request);
                userMap.put("profileImage",
                        user.getProfileImage() != null ? user.getProfileImage() : "/images/defaultProfile.png");
                userMap.put("profile_image",
                        user.getProfileImage() != null ? user.getProfileImage() : "/images/defaultProfile.png");
                userMap.put("join_date", user.getJoinDate() != null ? user.getJoinDate().toString() : null);
                responseMap.put("user", userMap);
                responseMap.put("message", "로그인 성공");
            } else {
                responseMap.put("success", false);
                responseMap.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            }
        } catch (Exception e) {
            responseMap.put("success", false);
            responseMap.put("message", ErrorMessages.userMessage(e, "로그인 처리 중 오류가 발생했습니다."));
            logger.error("로그인 처리 중 오류가 발생했습니다", e);
        }

        return responseMap;
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
            response.put("message", ErrorMessages.userMessage(e, "회원가입 처리 중 오류가 발생했습니다."));
            logger.error("오류 발생", e);
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
            response.put("message", ErrorMessages.userMessage(e, "아이디 확인 중 오류가 발생했습니다."));
            logger.error("아이디 확인 중 오류가 발생했습니다", e);
        }

        return response;
    }

    // 로그인 상태 확인 API
    @GetMapping("/api/auth/check")
    @ResponseBody
    public Map<String, Object> checkLoginStatus(HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                UserDto user = (UserDto) session.getAttribute("loggedInUser");
                if (user != null) {
                    response.put("success", true);
                    response.put("loggedIn", true);
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("loginId", user.getLoginId());
                    userMap.put("username", user.getUsername());
                    userMap.put("email", user.getEmail());
                    putRoleInfo(userMap, user, request);
                    userMap.put("profileImage",
                            user.getProfileImage() != null ? user.getProfileImage() : "/images/defaultProfile.png");
                    userMap.put("profile_image",
                            user.getProfileImage() != null ? user.getProfileImage() : "/images/defaultProfile.png");
                    userMap.put("join_date", user.getJoinDate() != null ? user.getJoinDate().toString() : null);
                    response.put("user", userMap);
                    return response;
                }
            }

            response.put("success", true);
            response.put("loggedIn", false);
            response.put("message", "로그인되지 않았습니다.");
        } catch (Exception e) {
            logger.error("로그인 상태 확인 중 오류 발생", e);
            response.put("success", false);
            response.put("loggedIn", false);
            response.put("message", "로그인 상태 확인 중 오류가 발생했습니다.");
        }

        return response;
    }

    // 회원 시점 전환 API (관리자 전용 헤더 토글용). DB의 권한은 변경하지 않음
    @PostMapping("/api/users/me/view-mode")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateMyViewMode(@RequestBody Map<String, Object> requestBody,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        // 회원 시점에서도 되돌릴 수 있도록 계정의 실제 권한으로 확인
        if (!SessionUtil.isAdminAccount(request)) {
            response.put("success", false);
            response.put("message", "관리자만 사용할 수 있습니다.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        if (!(requestBody.get("viewAsMember") instanceof Boolean viewAsMember)) {
            response.put("success", false);
            response.put("message", "viewAsMember 값이 필요합니다.");
            return ResponseEntity.badRequest().body(response);
        }

        HttpSession session = request.getSession(false);
        UserDto user = SessionUtil.getLoginUser(request);
        session.setAttribute(SessionUtil.VIEW_AS_MEMBER, viewAsMember);
        SessionUtil.saveAuthentication(session, user);

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("loginId", user.getLoginId());
        userMap.put("username", user.getUsername());
        userMap.put("email", user.getEmail());
        putRoleInfo(userMap, user, request);
        userMap.put("profileImage",
                user.getProfileImage() != null ? user.getProfileImage() : "/images/defaultProfile.png");
        userMap.put("profile_image",
                user.getProfileImage() != null ? user.getProfileImage() : "/images/defaultProfile.png");
        userMap.put("join_date", user.getJoinDate() != null ? user.getJoinDate().toString() : null);

        response.put("success", true);
        response.put("message", viewAsMember ? "회원 시점으로 전환했습니다." : "관리자 시점으로 전환했습니다.");
        response.put("user", userMap);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자 정보 응답에 권한 항목을 넣습니다.
     * 본인 정보라면 회원 시점 상태를 반영하고, 헤더 토글 표시에 쓰는 항목을 함께 넣습니다.
     * - role, roleCode: 지금 적용되는 권한
     * - adminAccount: 계정의 실제 권한이 관리자인지
     * - viewAsMember: 회원 시점으로 보는 중인지
     */
    private void putRoleInfo(Map<String, Object> userMap, UserDto user, HttpServletRequest request) {
        boolean self = SessionUtil.isSelf(request, user.getId());
        boolean viewAsMember = self && SessionUtil.isViewAsMember(request);
        String roleCode = user.getRoleCode() != null ? user.getRoleCode() : "MEMBER";
        if (viewAsMember) {
            roleCode = "MEMBER";
        }
        userMap.put("role", roleCode);
        userMap.put("roleCode", roleCode);
        if (self) {
            userMap.put("adminAccount", "ADMIN".equals(user.getRoleCode()));
            userMap.put("viewAsMember", viewAsMember);
        }
    }

    // 로그아웃 API
    @PostMapping("/api/auth/logout")
    @ResponseBody
    public Map<String, Object> logout(HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
                logger.debug("세션 무효화 완료");
            }

            response.put("success", true);
            response.put("message", "로그아웃되었습니다.");
        } catch (Exception e) {
            logger.error("로그아웃 처리 중 오류 발생", e);
            response.put("success", false);
            response.put("message", "로그아웃 처리 중 오류가 발생했습니다.");
        }

        return response;
    }

    /**
     * 공개 프로필 조회 API (비로그인 허용)
     * GET /api/public/users/{userId}
     *
     * - 개인정보(이메일/전화/주소 등)는 노출하지 않음
     */
    @GetMapping("/api/public/users/{userId}")
    @ResponseBody
    public Map<String, Object> getPublicUserById(@org.springframework.web.bind.annotation.PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            UserDto user = userService.getUserById(userId);
            if (user != null) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("username", user.getUsername());
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
            response.put("message", ErrorMessages.userMessage(e, "공개 사용자 정보 조회 중 오류가 발생했습니다."));
            logger.error("오류 발생", e);
        }

        return response;
    }

    // 사용자 정보 조회 API
    @GetMapping("/api/users/{userId}")
    @ResponseBody
    public Map<String, Object> getUserById(@org.springframework.web.bind.annotation.PathVariable Long userId,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 개인정보가 포함되므로 본인(또는 관리자)만 조회 가능
            // 공개 정보가 필요하면 /api/public/users/{userId} 사용
            if (!SessionUtil.isSelf(request, userId) && !SessionUtil.isAdmin(request)) {
                response.put("success", false);
                response.put("message", "본인의 정보만 조회할 수 있습니다.");
                return response;
            }

            UserDto user = userService.getUserById(userId);
            if (user != null) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("loginId", user.getLoginId());
                userMap.put("username", user.getUsername());
                userMap.put("email", user.getEmail());
                userMap.put("phoneNumber", user.getPhoneNumber());
                userMap.put("address", user.getAddress());
                // birthDate는 DB에서 DATE 컬럼이므로 "yyyy-MM-dd" 형태로 내려보냄 (timezone 이슈 방지)
                userMap.put("birthDate",
                        user.getBirthDate() != null ? user.getBirthDate().toLocalDate().toString() : null);
                userMap.put("genderCode", user.getGenderCode());
                putRoleInfo(userMap, user, request);
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
            response.put("message", ErrorMessages.userMessage(e, "사용자 정보 조회 중 오류가 발생했습니다."));
            logger.error("오류 발생", e);
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
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 본인(또는 관리자)만 프로필을 수정할 수 있음
            if (!SessionUtil.isSelf(request, userId) && !SessionUtil.isAdmin(request)) {
                response.put("success", false);
                response.put("message", "본인의 프로필만 수정할 수 있습니다.");
                return response;
            }

            UserDto existingUser = userService.getUserById(userId);
            if (existingUser == null) {
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return response;
            }

            // UserDto 생성 (요청에 없는 항목은 기존 값 유지, 빈 문자열은 값 삭제)
            UserDto userDto = new UserDto();
            userDto.setUsername(username != null ? username : existingUser.getUsername());
            userDto.setEmail(email != null ? email : existingUser.getEmail());
            userDto.setPhoneNumber(phoneNumber != null ? phoneNumber : existingUser.getPhoneNumber());
            userDto.setAddress(address != null ? address : existingUser.getAddress());

            // 생년월일 변환
            if (birthDate == null) {
                userDto.setBirthDate(existingUser.getBirthDate());
            } else if (!birthDate.trim().isEmpty()) {
                try {
                    java.time.LocalDate date = java.time.LocalDate.parse(birthDate.trim());
                    userDto.setBirthDate(date.atStartOfDay());
                } catch (java.time.format.DateTimeParseException e) {
                    response.put("success", false);
                    response.put("message", "생년월일 형식이 올바르지 않습니다.");
                    return response;
                }
            }

            if (genderCode == null) {
                userDto.setGenderCode(existingUser.getGenderCode());
            } else if (!genderCode.trim().isEmpty()) {
                userDto.setGenderCode(genderCode);
            }

            // 프로필 업데이트
            UserDto updatedUser = userService.updateUserProfile(userId, userDto, profileImage);

            // 세션 사용자 정보도 최신화 (헤더/로그인상태 체크에서 사용)
            try {
                HttpSession session = request != null ? request.getSession(false) : null;
                if (session != null) {
                    Object sessionUserObj = session.getAttribute("loggedInUser");
                    if (sessionUserObj instanceof UserDto sessionUser) {
                        if (sessionUser.getId() != null && sessionUser.getId().equals(updatedUser.getId())) {
                            session.setAttribute("loggedInUser", updatedUser);
                        }
                    }
                }
            } catch (Exception e) {
                // 세션 갱신 실패해도 프로필 수정 자체는 성공 처리
                logger.debug("세션 사용자 정보 갱신 실패", e);
            }

            // 응답 생성
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", updatedUser.getId());
            userMap.put("loginId", updatedUser.getLoginId());
            userMap.put("username", updatedUser.getUsername());
            userMap.put("email", updatedUser.getEmail());
            userMap.put("phoneNumber", updatedUser.getPhoneNumber());
            userMap.put("address", updatedUser.getAddress());
            // birthDate는 DB에서 DATE 컬럼이므로 "yyyy-MM-dd" 형태로 내려보냄 (timezone 이슈 방지)
            userMap.put("birthDate",
                    updatedUser.getBirthDate() != null ? updatedUser.getBirthDate().toLocalDate().toString() : null);
            userMap.put("genderCode", updatedUser.getGenderCode());
            putRoleInfo(userMap, updatedUser, request);
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
            response.put("message", ErrorMessages.userMessage(e, "프로필 수정 중 오류가 발생했습니다."));
            logger.error("오류 발생", e);
        }

        return response;
    }

    // 아이디 찾기 API
    @PostMapping("/api/auth/find-id")
    @ResponseBody
    public Map<String, Object> findId(@RequestBody Map<String, String> request) {

        Map<String, Object> response = new HashMap<>();

        try {
            String username = request.get("username");
            String email = request.get("email");

            if ((username == null || username.trim().isEmpty()) &&
                    (email == null || email.trim().isEmpty())) {
                response.put("success", false);
                response.put("message", "이름 또는 이메일을 입력해주세요.");
                return response;
            }

            UserDto user = userService.findUserByUsernameOrEmail(username, email);

            if (user != null) {
                response.put("success", true);
                response.put("loginId", user.getLoginId());
                response.put("message", "아이디를 찾았습니다.");
            } else {
                response.put("success", false);
                response.put("message", "일치하는 사용자 정보를 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", ErrorMessages.userMessage(e, "아이디 찾기 중 오류가 발생했습니다."));
            logger.error("아이디 찾기 오류 발생", e);
        }

        return response;
    }

    // 비밀번호 재설정 API
    @PostMapping("/api/auth/reset-password")
    @ResponseBody
    public Map<String, Object> resetPassword(@RequestBody Map<String, String> request) {

        Map<String, Object> response = new HashMap<>();

        try {
            String loginId = request.get("loginId");
            String newPassword = request.get("newPassword");

            if (loginId == null || loginId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "아이디를 입력해주세요.");
                return response;
            }

            if (newPassword == null || newPassword.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "새 비밀번호를 입력해주세요.");
                return response;
            }

            if (newPassword.length() < 6 || newPassword.length() > 15) {
                response.put("success", false);
                response.put("message", "비밀번호는 6자 이상 15자 이하로 입력해주세요.");
                return response;
            }

            boolean success = userService.resetPassword(loginId, newPassword);

            if (success) {
                response.put("success", true);
                response.put("message", "비밀번호가 성공적으로 재설정되었습니다.");
            } else {
                response.put("success", false);
                response.put("message", "일치하는 사용자를 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", ErrorMessages.userMessage(e, "비밀번호 재설정 중 오류가 발생했습니다."));
            logger.error("비밀번호 재설정 오류 발생", e);
        }

        return response;
    }
}
