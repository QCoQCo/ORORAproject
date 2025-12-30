package com.busan.orora.user.form;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;
import jakarta.validation.constraints.Email;
import java.time.LocalDateTime;

@Data
public class UserJoinForm {

    @NotBlank(message = "아이디는 필수 입력 값입니다.")
    private String loginId;
    @NotBlank(message = "이름은 필수 입력 값입니다.")
    private String username;
    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    @Length(min = 4, max = 10, message = "비밀번호는 4자 이상 10자 이하로 입력해주세요.")
    private String password;
    @NotBlank(message = "이메일은 필수 입력 값입니다.")
    @Email(message = "이메일 형식에 맞지 않습니다.")
    private String email;
    private String address;
    private LocalDateTime birthDate;
    private String genderCode;
}
