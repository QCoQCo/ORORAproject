package com.busan.orora.controller;

import org.springframework.stereotype.Controller;
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
    public String busan() {
        return "pages/about-busan/busan";
    }

    @GetMapping("/pages/about-busan/symbol.html")
    public String symbol() {
        return "pages/about-busan/symbol";
    }

    @GetMapping("/pages/about-busan/character.html")
    public String character() {
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

    // Admin page
    @GetMapping("/pages/admin/admin.html")
    public String admin() {
        return "pages/admin/admin";
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

    // Login pages
    @GetMapping("/pages/login/login.html")
    public String login() {
        return "pages/login/login";
    }

    @GetMapping("/pages/login/signup.html")
    public String signup() {
        return "pages/login/signup";
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
