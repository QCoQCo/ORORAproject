package com.busan.orora.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.busan.orora.commoncode.dto.CommonCodeDto;
import com.busan.orora.commoncode.service.CommonCodeService;

@Controller
public class PageController {

    @Value("${kakao.map.api-key}")
    private String kakaoMapApiKey;

    @Autowired
    private CommonCodeService commonCodeService;

    // Index page
    @GetMapping({ "/", "/index" })
    public String index(Model model) {
        List<CommonCodeDto> allCodes = commonCodeService.getAllCodes();
        
        Long randId = 1L;
        
        if (allCodes != null && !allCodes.isEmpty()) {
            int randomIndex = (int)(Math.random() * allCodes.size());
            randId = allCodes.get(randomIndex).getId(); 
        }
        
        model.addAttribute("randId", randId);
        return "index";
    }

    // About Busan pages
    @GetMapping("/pages/about-busan/busan")
    public String busan(Model model) {
        model.addAttribute("breadcrumbCurrentPage", "부산은?");
        model.addAttribute("breadcrumbCurrentPageKey", "about.breadcrumb.what_is_busan");
        model.addAttribute("breadcrumbMenuTitle", "부산의 오늘");
        model.addAttribute("breadcrumbMenuTitleKey", "about.breadcrumb.busan_today");
        model.addAttribute("activeMenuGroup", "busan-today");
        model.addAttribute("activeMenuItem", "busan");
        return "pages/about-busan/busan";
    }

    @GetMapping("/pages/about-busan/basisinfo")
    public String basisinfo(Model model) {
        model.addAttribute("breadcrumbCurrentPage", "기본현황");
        model.addAttribute("breadcrumbCurrentPageKey", "about.breadcrumb.basic_info");
        model.addAttribute("breadcrumbMenuTitle", "부산의 오늘");
        model.addAttribute("breadcrumbMenuTitleKey", "about.breadcrumb.busan_today");
        model.addAttribute("activeMenuGroup", "busan-today");
        model.addAttribute("activeMenuItem", "basisinfo");
        return "pages/about-busan/basisinfo";
    }

    @GetMapping("/pages/about-busan/goals")
    public String goals(Model model) {
        model.addAttribute("breadcrumbCurrentPage", "도시비전과 목표");
        model.addAttribute("breadcrumbCurrentPageKey", "about.breadcrumb.vision_goals");
        model.addAttribute("breadcrumbMenuTitle", "부산의 오늘");
        model.addAttribute("breadcrumbMenuTitleKey", "about.breadcrumb.busan_today");
        model.addAttribute("activeMenuGroup", "busan-today");
        model.addAttribute("activeMenuItem", "goals");
        return "pages/about-busan/goals";
    }

    @GetMapping("/pages/about-busan/symbol")
    public String symbol(Model model) {
        model.addAttribute("breadcrumbCurrentPage", "지역상징");
        model.addAttribute("breadcrumbCurrentPageKey", "about.breadcrumb.regional_symbol");
        model.addAttribute("breadcrumbMenuTitle", "부산의 상징");
        model.addAttribute("breadcrumbMenuTitleKey", "about.breadcrumb.busan_symbol");
        model.addAttribute("activeMenuGroup", "busan-symbol");
        model.addAttribute("activeMenuItem", "symbol");
        return "pages/about-busan/symbol";
    }

    @GetMapping("/pages/about-busan/character")
    public String character(Model model) {
        model.addAttribute("breadcrumbCurrentPage", "캐릭터 소개");
        model.addAttribute("breadcrumbCurrentPageKey", "about.breadcrumb.character_intro");
        model.addAttribute("breadcrumbMenuTitle", "소통 캐릭터");
        model.addAttribute("breadcrumbMenuTitleKey", "about.breadcrumb.communication_character");
        model.addAttribute("activeMenuGroup", "character");
        model.addAttribute("activeMenuItem", "character");
        return "pages/about-busan/character";
    }

    // Search Place pages
    @GetMapping("/pages/search-place/place")
    public String place() {
        return "pages/search-place/place";
    }

    @GetMapping("/pages/search-place/tag")
    public String tag(Model model) {
        // SPOT_CATEGORY 공통코드 목록을 모델에 추가
        List<CommonCodeDto> categories = commonCodeService.getCodesByGroupCode("SPOT_CATEGORY");
        model.addAttribute("categories", categories);
        return "pages/search-place/tag";
    }

    @GetMapping("/pages/search-place/theme")
    public String theme() {
        return "pages/search-place/theme";
    }

    @GetMapping("/pages/search-place/search")
    public String search() {
        return "pages/search-place/search";
    }

    // About Orora page
    @GetMapping("/pages/about-orora/orora-introduce")
    public String ororaIntroduce() {
        return "pages/about-orora/orora-introduce";
    }

    // Tip page
    @GetMapping("/pages/tip/tip")
    public String tip() {
        return "pages/tip/tip";
    }

    // List example pages
    @GetMapping("/pages/search-place/list-simple")
    public String listSimple() {
        return "pages/search-place/list-simple";
    }

    @GetMapping("/pages/search-place/list-test")
    public String listTest() {
        return "pages/search-place/list-test";
    }

    // Detailed pages
    @GetMapping("/pages/detailed/detailed")
    public String detailed(@RequestParam("id") String id, Model model) {
        model.addAttribute("kakaoMapApiKey", kakaoMapApiKey);
        model.addAttribute("spotId", id);
        return "pages/detailed/detailed";
    }

    // MyPage
    @GetMapping("/pages/mypage/mypage")
    public String mypage(Model model) {
        model.addAttribute("kakaoMapApiKey", kakaoMapApiKey);
        return "pages/mypage/mypage";
    }

    // User Profile (다른 유저의 프로필 보기)
    @GetMapping("/pages/profile/{userId}")
    public String userProfile(@PathVariable Long userId, Model model) {
        model.addAttribute("kakaoMapApiKey", kakaoMapApiKey);
        model.addAttribute("profileUserId", userId);
        return "pages/mypage/mypage";
    }

    // Admin page
    @GetMapping("/pages/admin/management")
    public String adminManagement(Model model) {
        model.addAttribute("kakaoMapApiKey", kakaoMapApiKey);
        return "pages/admin/admin";
    }
}
