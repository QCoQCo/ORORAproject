package com.busan.orora.user.form;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class UserLoginForm {
    @NotBlank(message = "아이디는 필수 입력 값입니다.")
    private String loginId;
    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    private String password;
}