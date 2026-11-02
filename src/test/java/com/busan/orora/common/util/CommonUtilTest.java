package com.busan.orora.common.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

/**
 * UrlUtil(링크 URL 검증), ErrorMessages(응답 오류 메시지) 테스트
 */
class CommonUtilTest {

    @Test
    void http_https_빈값_샵은_안전한_링크로_허용된다() {
        assertTrue(UrlUtil.isSafeLinkUrl(null));
        assertTrue(UrlUtil.isSafeLinkUrl(""));
        assertTrue(UrlUtil.isSafeLinkUrl("#"));
        assertTrue(UrlUtil.isSafeLinkUrl("https://www.visitbusan.net"));
        assertTrue(UrlUtil.isSafeLinkUrl("  HTTP://example.com  "));
    }

    @Test
    void 스크립트를_실행할_수_있는_링크는_거부된다() {
        assertFalse(UrlUtil.isSafeLinkUrl("javascript:alert(1)"));
        assertFalse(UrlUtil.isSafeLinkUrl(" JavaScript:alert(1)"));
        assertFalse(UrlUtil.isSafeLinkUrl("data:text/html,<script>alert(1)</script>"));
        assertFalse(UrlUtil.isSafeLinkUrl("//evil.com"));
    }

    @Test
    void 서비스의_안내_메시지는_그대로_보여준다() {
        assertEquals("본인의 댓글만 수정할 수 있습니다.",
                ErrorMessages.userMessage(new IllegalStateException("본인의 댓글만 수정할 수 있습니다."), "기본"));
        assertEquals("이미 사용 중인 이메일입니다.",
                ErrorMessages.userMessage(new IllegalArgumentException("이미 사용 중인 이메일입니다."), "기본"));
    }

    @Test
    void 내부_오류_메시지는_기본_메시지로_대체된다() {
        assertEquals("기본", ErrorMessages.userMessage(new RuntimeException("SQLSyntaxErrorException: Table 'users'"), "기본"));
        assertEquals("기본", ErrorMessages.userMessage(new NumberFormatException("For input string: \"abc\""), "기본"));
        assertEquals("기본", ErrorMessages.userMessage(new IllegalStateException(), "기본"));
    }
}
