package com.busan.orora.region.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;



@Controller
public class RegionPageController {

    @GetMapping("/regions")
    public String regionPage() {
        return "pages/search-place/place";
    }
}