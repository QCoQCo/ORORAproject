package com.busan.orora.hashtag.mapper;

import com.busan.orora.hashtag.dto.HashtagDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface HashtagMapper {
    List<HashtagDto> findAllHashtags();
    HashtagDto findHashtagById(Long id);
    HashtagDto findHashtagByName(String name);
    List<HashtagDto> findHashtagsBySpotId(@Param("spotId") Long spotId);
    void insertHashtag(HashtagDto hashtagDto);
    void insertSpotHashtag(@Param("spotId") Long spotId, @Param("hashtagId") Long hashtagId);
    void deleteSpotHashtags(@Param("spotId") Long spotId);
}
