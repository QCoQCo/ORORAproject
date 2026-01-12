package com.busan.orora.review.form;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewForm {
    @NotBlank(message = "제목을 입력해주세요.")
    @Size(max = 80, message = "제목은 80자 이하로 입력해주세요.")
    private String title;

    @NotBlank(message = "내용을 입력해주세요.")
    private String content;

    @NotNull(message = "평점을 선택해주세요.")
    @Min(value = 1, message = "평점은 1 이상이어야 합니다.")
    @Max(value = 5, message = "평점은 5 이하여야 합니다.")
    private Integer rating;

    private Long touristSpotId;
}
