package com.busan.orora.user.controller;

import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Autowired;
import com.busan.orora.user.service.UserService;
import com.busan.orora.user.dto.UserDto;
import com.busan.orora.user.form.UserJoinForm;
import com.busan.orora.user.form.UserLoginForm;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@Controller
public class UserController {
    @Autowired
    private UserService userService;

    // 로그인 페이지
    @GetMapping("/pages/login/login.html")
    public String loginPage() {
        return "pages/login/login";
    }

    // 회원가입 페이지
    @GetMapping("/pages/login/signup.html")
    public String signupPage() {
        return "pages/login/signup";
    }

    // 관리자 페이지
    @GetMapping("/pages/admin/admin.html")
    public String adminPage() {
        return "pages/admin/admin";
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
    public Map<String, Object> signup(@Valid @RequestBody UserJoinForm joinForm) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 아이디 중복 체크
            if (userService.isLoginIdExists(joinForm.getLoginId())) {
                response.put("success", false);
                response.put("message", "이미 사용 중인 아이디입니다.");
                return response;
            }

            // 이메일 중복 체크
            if (userService.isEmailExists(joinForm.getEmail())) {
                response.put("success", false);
                response.put("message", "이미 사용 중인 이메일입니다.");
                return response;
            }

            // 회원가입 처리
            UserDto userDto = new UserDto();
            userDto.setLoginId(joinForm.getLoginId());
            userDto.setUsername(joinForm.getUsername());
            userDto.setEmail(joinForm.getEmail());
            userDto.setPhoneNumber(joinForm.getPhoneNumber());
            userDto.setAddress(joinForm.getAddress());
            userDto.setBirthDate(joinForm.getBirthDateAsDateTime());
            userDto.setGenderCode(joinForm.getGenderCode());

            userService.insertUser(userDto, joinForm.getPassword());

            response.put("success", true);
            response.put("message", "회원가입이 완료되었습니다!");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "회원가입 처리 중 오류가 발생했습니다: " + e.getMessage());
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
            System.out.println(e.getMessage());
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
}
