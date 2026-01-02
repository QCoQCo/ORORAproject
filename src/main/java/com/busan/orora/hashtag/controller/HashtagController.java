package com.busan.orora.hashtag.controller;

import com.busan.orora.hashtag.dto.HashtagDto;
import com.busan.orora.hashtag.service.HashtagService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class HashtagController {
    // TODO: 해시태그 관련 API 구현

    @Autowired
    private HashtagService hashtagService;

    // 화면 열어주는?용도
    @GetMapping("/tourist-spots")
    public String getTagPage(Model model) {
        System.out.println("===> 태그 페이지 접속 요청");
        return "pages/search-place/tag";
    }

    // 데이터 연결
    @GetMapping("/api/tourist-spots")
    @ResponseBody
    public Map<String, Object> getAllHashtagsApi() {
        List<HashtagDto> hashtagDtos = hashtagService.getAllHashtags();
        Map<String, Object> response = new HashMap<>();
        response.put("regions", hashtagDtos);
        System.out.println("===> JS 데이터 전송: " + hashtagDtos);
        
        return response;
    }

}
