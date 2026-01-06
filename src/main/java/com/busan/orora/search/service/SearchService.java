package com.busan.orora.search.service;

import com.busan.orora.search.dto.SearchResultDto;
import com.busan.orora.search.mapper.SearchMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SearchService {
    @Autowired
    private SearchMapper searchMapper;

    public Map<String, Object> searchAll(String keyword) {
        Map<String, Object> result = new HashMap<>();
        
        if (keyword == null || keyword.trim().isEmpty()) {
            result.put("spots", new ArrayList<>());
            result.put("reviews", new ArrayList<>());
            result.put("hashtags", new ArrayList<>());
            result.put("comments", new ArrayList<>());
            result.put("totalCount", 0);
            return result;
        }

        String searchKeyword = keyword.trim();
        
        // 각 카테고리별 검색
        List<SearchResultDto> spots = searchMapper.searchSpots(searchKeyword);
        List<SearchResultDto> reviews = searchMapper.searchReviews(searchKeyword);
        List<SearchResultDto> hashtags = searchMapper.searchHashtags(searchKeyword);
        List<SearchResultDto> comments = searchMapper.searchComments(searchKeyword);
        
        int totalCount = spots.size() + reviews.size() + hashtags.size() + comments.size();
        
        result.put("spots", spots);
        result.put("reviews", reviews);
        result.put("hashtags", hashtags);
        result.put("comments", comments);
        result.put("totalCount", totalCount);
        result.put("keyword", searchKeyword);
        
        return result;
    }
}
