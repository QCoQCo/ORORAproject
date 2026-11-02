package com.busan.orora.common.util;

/**
 * API 응답에 담을 오류 메시지를 정하는 공통 유틸.
 *
 * 서비스에서 사용자 안내용으로 던진 IllegalArgumentException / IllegalStateException
 * (예: "본인이 작성한 리뷰만 수정할 수 있습니다.")은 메시지를 그대로 보여 주고,
 * 그 외 예외(SQL 오류 등 내부 정보가 담길 수 있음)는 기본 메시지로 대체합니다.
 * 원래 예외 내용은 서버 로그로만 남겨야 합니다.
 */
public final class ErrorMessages {

    private ErrorMessages() {
    }

    public static String userMessage(Exception e, String defaultMessage) {
        boolean userFacing = (e instanceof IllegalArgumentException || e instanceof IllegalStateException)
                // 숫자 변환 실패(NumberFormatException)는 IllegalArgumentException이지만 안내 문구가 아님
                && !(e instanceof NumberFormatException);
        if (userFacing && e.getMessage() != null && !e.getMessage().isBlank()) {
            return e.getMessage();
        }
        return defaultMessage;
    }
}
