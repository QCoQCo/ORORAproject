package com.busan.orora.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    // Index page
    @GetMapping({"/", "/index.html"})
    public String index() {
        return "index";
    }

    // About Busan pages
    @GetMapping("/pages/about-busan/busan.html")
    public String busan(Model model) {
        model.addAttribute("breadcrumbCurrentPage", "부산은?");
        model.addAttribute("breadcrumbMenuTitle", "부산의 오늘");
        model.addAttribute("activeMenuGroup", "busan-today");
        model.addAttribute("activeMenuItem", "busan");
        return "pages/about-busan/busan";
    }

    @GetMapping("/pages/about-busan/basisinfo.html")
    public String basisinfo(Model model) {
        model.addAttribute("breadcrumbCurrentPage", "기본현황");
        model.addAttribute("breadcrumbMenuTitle", "부산의 오늘");
        model.addAttribute("activeMenuGroup", "busan-today");
        model.addAttribute("activeMenuItem", "basisinfo");
        return "pages/about-busan/basisinfo";
    }

    @GetMapping("/pages/about-busan/goals.html")
    public String goals(Model model) {
        model.addAttribute("breadcrumbCurrentPage", "도시비전과 목표");
        model.addAttribute("breadcrumbMenuTitle", "부산의 오늘");
        model.addAttribute("activeMenuGroup", "busan-today");
        model.addAttribute("activeMenuItem", "goals");
        return "pages/about-busan/goals";
    }

    @GetMapping("/pages/about-busan/symbol.html")
    public String symbol(Model model) {
        model.addAttribute("breadcrumbCurrentPage", "지역상징");
        model.addAttribute("breadcrumbMenuTitle", "부산의 상징");
        model.addAttribute("activeMenuGroup", "busan-symbol");
        model.addAttribute("activeMenuItem", "symbol");
        return "pages/about-busan/symbol";
    }

    @GetMapping("/pages/about-busan/character.html")
    public String character(Model model) {
        model.addAttribute("breadcrumbCurrentPage", "캐릭터 소개");
        model.addAttribute("breadcrumbMenuTitle", "소통 캐릭터");
        model.addAttribute("activeMenuGroup", "character");
        model.addAttribute("activeMenuItem", "character");
        return "pages/about-busan/character";
    }

    // Search Place pages
    @GetMapping("/pages/search-place/place.html")
    public String place() {
        return "pages/search-place/place";
    }

    @GetMapping("/pages/search-place/tag.html")
    public String tag() {
        return "pages/search-place/tag";
    }

    @GetMapping("/pages/search-place/theme.html")
    public String theme() {
        return "pages/search-place/theme";
    }

    // About Orora page
    @GetMapping("/pages/about-orora/orora-introduce.html")
    public String ororaIntroduce() {
        return "pages/about-orora/orora-introduce";
    }

    // Tip page
    @GetMapping("/pages/tip/tip.html")
    public String tip() {
        return "pages/tip/tip";
    }

    // List example pages
    @GetMapping("/pages/search-place/list-simple.html")
    public String listSimple() {
        return "pages/search-place/list-simple";
    }

    @GetMapping("/pages/search-place/list-test.html")
    public String listTest() {
        return "pages/search-place/list-test";
    }

    // Detailed pages
    @GetMapping("/pages/detailed/detailed.html")
    public String detailed() {
        return "pages/detailed/detailed";
    }

    @GetMapping("/pages/detailed/detailPage.html")
    public String detailPage() {
        return "pages/detailed/detailPage";
    }

    // MyPage
    @GetMapping("/pages/mypage/mypage.html")
    public String mypage() {
        return "pages/mypage/mypage";
    }
}
