package com.busan.orora.common.util;

import java.util.Locale;

/**
 * URL 관련 공통 유틸.
 */
public final class UrlUtil {

    private UrlUtil() {
    }

    /**
     * 화면에 링크(href)로 출력해도 안전한 URL인지 확인합니다.
     * 비어 있는 값과 "#"(링크 없음), http/https URL만 허용하고
     * javascript:, data: 등 스크립트를 실행할 수 있는 형식은 거부합니다.
     */
    public static boolean isSafeLinkUrl(String url) {
        if (url == null) {
            return true;
        }
        String trimmed = url.trim();
        if (trimmed.isEmpty() || "#".equals(trimmed)) {
            return true;
        }
        String lower = trimmed.toLowerCase(Locale.ROOT);
        return lower.startsWith("http://") || lower.startsWith("https://");
    }
}
