package com.busan.orora.user.form;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;
import jakarta.validation.constraints.Email;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
public class UserJoinForm {

    @NotBlank(message = "아이디는 필수 입력 값입니다.")
    private String loginId;
    @NotBlank(message = "이름은 필수 입력 값입니다.")
    private String username;
    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    @Length(min = 6, max = 15, message = "비밀번호는 6자 이상 15자 이하로 입력해주세요.")
    private String password;
    @NotBlank(message = "이메일은 필수 입력 값입니다.")
    @Email(message = "이메일 형식에 맞지 않습니다.")
    private String email;
    private String address;
    private String birthDate; // 문자열로 받아서 변환
    private String phoneNumber;
    private String genderCode;
    
    // birthDate 문자열을 LocalDateTime으로 변환
    public LocalDateTime getBirthDateAsDateTime() {
        if (birthDate == null || birthDate.trim().isEmpty()) {
            return null;
        }
        try {
            LocalDate date = LocalDate.parse(birthDate, DateTimeFormatter.ISO_LOCAL_DATE);
            return date.atStartOfDay();
        } catch (Exception e) {
            return null;
        }
    }
}
