package com.busan.orora.user.controller;

import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Autowired;
import com.busan.orora.user.mapper.UserMapper;
import com.busan.orora.user.service.UserService;
import com.busan.orora.user.dto.UserDto;
import com.busan.orora.user.form.UserJoinForm;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/join")
    public String join(UserJoinForm userJoinForm) {
        UserDto userDto = new UserDto();
        userDto.setLoginId(userJoinForm.getLoginId());
        userDto.setUsername(userJoinForm.getUsername());
        userDto.setEmail(userJoinForm.getEmail());
        userDto.setPasswordHash(userJoinForm.getPassword());
        userService.insertUser(userDto);
        return "redirect:/login";
    }
}
