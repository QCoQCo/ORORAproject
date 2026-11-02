package com.busan.orora.review.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import com.busan.orora.common.service.FileService;
import com.busan.orora.review.dto.ReviewDto;
import com.busan.orora.review.mapper.ReviewMapper;

/**
 * 리뷰 이미지 파일 정리 테스트 (삭제 커밋 후 파일 삭제, 저장 실패 롤백 시 새 파일 삭제)
 */
@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    private static final String LOCATION = "upload/reviews";

    @Mock
    private ReviewMapper reviewMapper;
    @Mock
    private FileService fileService;

    @InjectMocks
    private ReviewService reviewService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(reviewService, "reviewImgLocation", LOCATION);
        TransactionSynchronizationManager.initSynchronization();
    }

    @AfterEach
    void tearDown() {
        TransactionSynchronizationManager.clearSynchronization();
    }

    @Test
    void 리뷰를_삭제하면_커밋_후_업로드된_이미지_파일만_삭제된다() throws Exception {
        when(reviewMapper.findReviewById(1L)).thenReturn(review(7L));
        when(reviewMapper.findReviewImagesByReviewId(1L)).thenReturn(List.of(
                Map.of("id", 1L, "imageUrl", "/images/upload/reviews/a.jpg"),
                Map.of("id", 2L, "imageUrl", "/images/default.jpg")));

        reviewService.deleteReview(1L, 7L);
        verify(fileService, never()).deleteFile(anyString()); // 커밋 전에는 삭제하지 않음

        complete(TransactionSynchronization.STATUS_COMMITTED);
        verify(fileService).deleteFile(LOCATION + File.separator + "a.jpg");
        verify(fileService, never()).deleteFile(LOCATION + File.separator + "default.jpg");
    }

    @Test
    void 리뷰_삭제가_롤백되면_파일은_그대로_둔다() throws Exception {
        when(reviewMapper.findReviewById(1L)).thenReturn(review(7L));
        when(reviewMapper.findReviewImagesByReviewId(1L)).thenReturn(List.of(
                Map.of("id", 1L, "imageUrl", "/images/upload/reviews/a.jpg")));

        reviewService.deleteReview(1L, 7L);
        complete(TransactionSynchronization.STATUS_ROLLED_BACK);

        verify(fileService, never()).deleteFile(anyString());
    }

    @Test
    void 이미지_저장_중_실패해_롤백되면_먼저_저장한_파일이_삭제된다() throws Exception {
        MultipartFile ok = new MockMultipartFile("images", "ok.jpg", "image/jpeg", new byte[] { 1 });
        MultipartFile bad = new MockMultipartFile("images", "bad.html", "text/html", new byte[] { 1 });
        when(fileService.uploadFile(eq(LOCATION), eq("ok.jpg"), any())).thenReturn("saved.jpg");
        when(fileService.uploadFile(eq(LOCATION), eq("bad.html"), any()))
                .thenThrow(new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다."));

        assertThrows(IllegalArgumentException.class,
                () -> reviewService.saveReviewImages(1L, new MultipartFile[] { ok, bad }));
        complete(TransactionSynchronization.STATUS_ROLLED_BACK);

        verify(fileService).deleteFile(LOCATION + File.separator + "saved.jpg");
    }

    @Test
    void 이미지_저장이_커밋되면_파일을_삭제하지_않는다() throws Exception {
        MultipartFile ok = new MockMultipartFile("images", "ok.jpg", "image/jpeg", new byte[] { 1 });
        when(fileService.uploadFile(eq(LOCATION), eq("ok.jpg"), any())).thenReturn("saved.jpg");

        reviewService.saveReviewImages(1L, new MultipartFile[] { ok });
        complete(TransactionSynchronization.STATUS_COMMITTED);

        verify(fileService, never()).deleteFile(anyString());
    }

    private ReviewDto review(Long userId) {
        ReviewDto review = new ReviewDto();
        review.setId(1L);
        review.setUserId(userId);
        return review;
    }

    /** 트랜잭션 종료를 흉내 내어 등록된 후처리를 실행 */
    private void complete(int status) {
        for (TransactionSynchronization synchronization : TransactionSynchronizationManager.getSynchronizations()) {
            synchronization.afterCompletion(status);
        }
    }
}
