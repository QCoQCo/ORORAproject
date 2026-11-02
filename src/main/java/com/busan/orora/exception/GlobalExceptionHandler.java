package com.busan.orora.exception;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import java.util.HashMap;
import java.util.Map;

/**
 * 컨트롤러에서 잡지 못한 예외를 API 응답 형식({success: false, message})으로 바꿔 주는 전역 예외 처리.
 * 내부 오류 내용은 서버 로그로만 남기고, 사용자에게는 일반 메시지만 보냅니다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 업로드 용량 초과 (application.yaml의 multipart 제한: 10MB)
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUploadSize(MaxUploadSizeExceededException e) {
        return error(HttpStatus.PAYLOAD_TOO_LARGE, "업로드 용량(최대 10MB)을 초과했습니다.");
    }

    /**
     * 필수 값 누락, 값 형식 오류 등 잘못된 요청
     */
    @ExceptionHandler({ MissingServletRequestParameterException.class, MissingServletRequestPartException.class,
            MethodArgumentTypeMismatchException.class, HttpMessageNotReadableException.class })
    public ResponseEntity<Map<String, Object>> handleBadRequest(Exception e) {
        logger.warn("잘못된 요청: {}", e.getMessage());
        return error(HttpStatus.BAD_REQUEST, "요청 값이 올바르지 않습니다.");
    }

    /**
     * 그 외 처리되지 않은 예외
     * - API(/api/**) 요청만 JSON으로 응답
     * - 페이지 요청이나 404/405 등 상태 코드가 정해진 프레임워크 예외(ErrorResponse)는 기본 처리에 맡김
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e, HttpServletRequest request)
            throws Exception {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        if (!path.startsWith("/api/") || e instanceof ErrorResponse) {
            throw e;
        }
        logger.error("처리되지 않은 오류: {} {}", request.getMethod(), path, e);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "요청 처리 중 오류가 발생했습니다.");
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
