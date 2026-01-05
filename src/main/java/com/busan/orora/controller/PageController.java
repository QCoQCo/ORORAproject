package com.busan.orora.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    // Index page
    @GetMapping({ "/", "/index" })
    public String index() {
        return "index";
    }

    // About Busan pages
    @GetMapping("/pages/about-busan/busan")
    public String busan(Model model) {
        model.addAttribute("breadcrumbCurrentPage", "부산은?");
        model.addAttribute("breadcrumbMenuTitle", "부산의 오늘");
        model.addAttribute("activeMenuGroup", "busan-today");
        model.addAttribute("activeMenuItem", "busan");
        return "pages/about-busan/busan";
    }

    @GetMapping("/pages/about-busan/basisinfo")
    public String basisinfo(Model model) {
        model.addAttribute("breadcrumbCurrentPage", "기본현황");
        model.addAttribute("breadcrumbMenuTitle", "부산의 오늘");
        model.addAttribute("activeMenuGroup", "busan-today");
        model.addAttribute("activeMenuItem", "basisinfo");
        return "pages/about-busan/basisinfo";
    }

    @GetMapping("/pages/about-busan/goals")
    public String goals(Model model) {
        model.addAttribute("breadcrumbCurrentPage", "도시비전과 목표");
        model.addAttribute("breadcrumbMenuTitle", "부산의 오늘");
        model.addAttribute("activeMenuGroup", "busan-today");
        model.addAttribute("activeMenuItem", "goals");
        return "pages/about-busan/goals";
    }

    @GetMapping("/pages/about-busan/symbol")
    public String symbol(Model model) {
        model.addAttribute("breadcrumbCurrentPage", "지역상징");
        model.addAttribute("breadcrumbMenuTitle", "부산의 상징");
        model.addAttribute("activeMenuGroup", "busan-symbol");
        model.addAttribute("activeMenuItem", "symbol");
        return "pages/about-busan/symbol";
    }

    @GetMapping("/pages/about-busan/character")
    public String character(Model model) {
        model.addAttribute("breadcrumbCurrentPage", "캐릭터 소개");
        model.addAttribute("breadcrumbMenuTitle", "소통 캐릭터");
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
    public String tag() {
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
    public String detailed() {
        return "pages/detailed/detailed";
    }

    // MyPage
    @GetMapping("/pages/mypage/mypage")
    public String mypage() {
        return "pages/mypage/mypage";
    }

    // Admin page
    @GetMapping("/pages/admin/management")
    public String adminManagement() {
        return "pages/admin/admin";
    }
}
