package com.busan.orora.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.busan.orora.spot.dto.SpotRequestDto;
import com.busan.orora.spot.service.SpotImageService;
import com.busan.orora.spot.service.SpotRequestService;
import com.busan.orora.spot.service.SpotService;

/**
 * 관리자 API 테스트: 신청 재처리 차단, 링크 URL 검증
 */
@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private SpotRequestService spotRequestService;
    @Mock
    private SpotImageService spotImageService;
    @Mock
    private SpotService spotService;

    @InjectMocks
    private AdminController adminController;

    @Test
    void 이미_승인된_신청은_다시_승인할_수_없다() {
        when(spotRequestService.getRequestById(1L)).thenReturn(photoRequest("approved"));

        Map<String, Object> response = adminController.approveSpotRequest(1L, null);

        assertEquals(false, response.get("success"));
        assertEquals("이미 처리된 신청입니다.", response.get("message"));
        verifyNoInteractions(spotImageService);
        verify(spotRequestService, never()).updateRequestStatus(any(), anyString(), any());
    }

    @Test
    void 이미_처리된_신청은_거부할_수_없다() {
        when(spotRequestService.getRequestById(1L)).thenReturn(photoRequest("approved"));

        Map<String, Object> response = adminController.rejectSpotRequest(1L, Map.of("reason", "중복"));

        assertEquals(false, response.get("success"));
        verify(spotRequestService, never()).updateRequestStatus(any(), anyString(), any());
    }

    @Test
    void 대기중인_사진_신청은_승인된다() {
        when(spotRequestService.getRequestById(1L)).thenReturn(photoRequest("pending"));
        when(spotImageService.getImagesBySpotId(5L)).thenReturn(List.of());

        Map<String, Object> response = adminController.approveSpotRequest(1L, null);

        assertEquals(true, response.get("success"));
        verify(spotImageService).addImageByUrl(5L, "/images/upload/spots/a.jpg", true);
        verify(spotRequestService).updateRequestStatus(1L, "approved", null);
    }

    @Test
    void 관광지_추가_시_javascript_링크는_거부된다() {
        Map<String, Object> response = adminController.addTouristSpot(Map.of(
                "regionKey", "area01", "title", "테스트", "linkUrl", "javascript:alert(1)"));

        assertEquals(false, response.get("success"));
        verifyNoInteractions(spotService);
    }

    private SpotRequestDto photoRequest(String status) {
        SpotRequestDto request = new SpotRequestDto();
        request.setId(1L);
        request.setRequestType("photo");
        request.setTouristSpotId(5L);
        request.setImageUrl("/images/upload/spots/a.jpg");
        request.setStatus(status);
        return request;
    }
}
