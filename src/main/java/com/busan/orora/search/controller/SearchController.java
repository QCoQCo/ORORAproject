package com.busan.orora.search.controller;

import com.busan.orora.search.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);
    
    @Autowired
    private SearchService searchService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam(value = "q", required = false) String keyword) {
        try {
            Map<String, Object> result = searchService.searchAll(keyword);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("검색 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
