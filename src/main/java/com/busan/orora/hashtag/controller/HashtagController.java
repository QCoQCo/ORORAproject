package com.busan.orora.hashtag.controller;

import org.springframework.web.bind.annotation.RestController;

import com.busan.orora.hashtag.dto.HashtagDto;
import com.busan.orora.hashtag.service.HashtagService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequiredArgsConstructor
public class HashtagController {
    // TODO: 해시태그 관련 API 구현

    @Autowired
    private HashtagService hashtagService;


    @GetMapping("/tourist-spots")
    public String getAllHashtags(HashtagDto hashtagDto) {
        System.out.println("hashtagDto = " + hashtagDto);
        hashtagService.getAllHashtags(hashtagDto);
        return "tag"; 
    }
    
    

}
