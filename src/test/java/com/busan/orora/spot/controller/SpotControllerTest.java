package com.busan.orora.spot.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;

import com.busan.orora.common.service.FileService;
import com.busan.orora.common.util.SessionUtil;
import com.busan.orora.commoncode.dto.CommonCodeDto;
import com.busan.orora.commoncode.service.CommonCodeService;
import com.busan.orora.hashtag.service.HashtagService;
import com.busan.orora.region.service.RegionService;
import com.busan.orora.spot.dto.SpotDto;
import com.busan.orora.spot.service.SpotImageService;
import com.busan.orora.spot.service.SpotRequestService;
import com.busan.orora.spot.service.SpotService;
import com.busan.orora.user.dto.UserDto;

/**
 * 관광지 상세 API의 비활성 관광지/카테고리 접근 제한 테스트
 * (관리자 여부는 요청 파라미터가 아닌 세션으로 판단)
 */
@ExtendWith(MockitoExtension.class)
class SpotControllerTest {

    @Mock
    private SpotService spotService;
    @Mock
    private SpotImageService spotImageService;
    @Mock
    private HashtagService hashtagService;
    @Mock
    private RegionService regionService;
    @Mock
    private SpotRequestService spotRequestService;
    @Mock
    private FileService fileService;
    @Mock
    private CommonCodeService commonCodeService;

    @InjectMocks
    private SpotController spotController;

    @Test
    void 비활성_관광지는_비로그인_사용자에게_403() {
        when(spotService.getSpotById(1L)).thenReturn(spot(false));

        ResponseEntity<Map<String, Object>> response = spotController.getTouristSpotDetail(1L, requestAs(null));

        assertEquals(403, response.getStatusCode().value());
        verify(spotService, never()).incrementViewCount(any());
    }

    @Test
    void 비활성_관광지는_일반_회원에게_403() {
        when(spotService.getSpotById(1L)).thenReturn(spot(false));

        ResponseEntity<Map<String, Object>> response = spotController.getTouristSpotDetail(1L, requestAs("MEMBER"));

        assertEquals(403, response.getStatusCode().value());
    }

    @Test
    void 비활성_관광지도_관리자는_조회할_수_있다() {
        when(spotService.getSpotById(1L)).thenReturn(spot(false));
        when(commonCodeService.getCodeByGroupAndCode("SPOT_CATEGORY", "BEACH")).thenReturn(category(true));

        ResponseEntity<Map<String, Object>> response = spotController.getTouristSpotDetail(1L, requestAs("ADMIN"));

        assertEquals(200, response.getStatusCode().value());
        assertEquals(false, response.getBody().get("isActive"));
        verify(spotService).incrementViewCount(1L);
    }

    @Test
    void 비활성_카테고리의_관광지는_일반_회원에게_403() {
        when(spotService.getSpotById(1L)).thenReturn(spot(true));
        when(commonCodeService.getCodeByGroupAndCode("SPOT_CATEGORY", "BEACH")).thenReturn(category(false));

        ResponseEntity<Map<String, Object>> response = spotController.getTouristSpotDetail(1L, requestAs("MEMBER"));

        assertEquals(403, response.getStatusCode().value());
    }

    @Test
    void 비활성_카테고리의_관광지도_관리자는_조회할_수_있다() {
        when(spotService.getSpotById(1L)).thenReturn(spot(true));
        when(commonCodeService.getCodeByGroupAndCode("SPOT_CATEGORY", "BEACH")).thenReturn(category(false));

        ResponseEntity<Map<String, Object>> response = spotController.getTouristSpotDetail(1L, requestAs("ADMIN"));

        assertEquals(200, response.getStatusCode().value());
        assertEquals(false, response.getBody().get("categoryActive"));
    }

    @Test
    void 요청_파라미터로_ADMIN을_보내도_권한이_생기지_않는다() {
        when(spotService.getSpotById(1L)).thenReturn(spot(false));
        MockHttpServletRequest request = requestAs(null);
        request.setParameter("userRole", "ADMIN");

        ResponseEntity<Map<String, Object>> response = spotController.getTouristSpotDetail(1L, request);

        assertEquals(403, response.getStatusCode().value());
    }

    @Test
    void 관리자도_회원_시점이면_비활성_관광지를_볼_수_없다() {
        when(spotService.getSpotById(1L)).thenReturn(spot(false));
        MockHttpServletRequest request = requestAs("ADMIN");
        request.getSession().setAttribute(SessionUtil.VIEW_AS_MEMBER, true);

        ResponseEntity<Map<String, Object>> response = spotController.getTouristSpotDetail(1L, request);

        assertEquals(403, response.getStatusCode().value());
    }

    @Test
    void 활성_관광지는_누구나_조회할_수_있다() {
        when(spotService.getSpotById(1L)).thenReturn(spot(true));
        when(commonCodeService.getCodeByGroupAndCode("SPOT_CATEGORY", "BEACH")).thenReturn(category(true));

        ResponseEntity<Map<String, Object>> response = spotController.getTouristSpotDetail(1L, requestAs(null));

        assertEquals(200, response.getStatusCode().value());
    }

    private SpotDto spot(boolean active) {
        SpotDto spot = new SpotDto();
        spot.setId(1L);
        spot.setTitle("해운대");
        spot.setCategoryCode("BEACH");
        spot.setIsActive(active);
        spot.setViewCount(0);
        return spot;
    }

    private CommonCodeDto category(boolean active) {
        CommonCodeDto code = new CommonCodeDto();
        code.setCode("BEACH");
        code.setIsActive(active);
        return code;
    }

    /** roleCode가 null이면 비로그인, 아니면 해당 권한으로 로그인한 세션을 가진 요청 */
    private MockHttpServletRequest requestAs(String roleCode) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        if (roleCode != null) {
            UserDto user = new UserDto();
            user.setId(10L);
            user.setRoleCode(roleCode);
            MockHttpSession session = new MockHttpSession();
            session.setAttribute(SessionUtil.LOGIN_USER, user);
            request.setSession(session);
        }
        return request;
    }
}
