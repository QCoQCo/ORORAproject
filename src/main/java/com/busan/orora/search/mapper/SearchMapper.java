package com.busan.orora.search.mapper;

import com.busan.orora.search.dto.SearchResultDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SearchMapper {
    // 관광지 검색
    List<SearchResultDto> searchSpots(@Param("keyword") String keyword);

    // 리뷰 검색
    List<SearchResultDto> searchReviews(@Param("keyword") String keyword);

    // 태그 검색
    List<SearchResultDto> searchHashtags(@Param("keyword") String keyword);

    // 댓글 검색
    List<SearchResultDto> searchComments(@Param("keyword") String keyword);
}
