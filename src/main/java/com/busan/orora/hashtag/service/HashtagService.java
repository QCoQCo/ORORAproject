package com.busan.orora.hashtag.service;

import com.busan.orora.hashtag.dto.HashtagDto;
import com.busan.orora.hashtag.mapper.HashtagMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HashtagService {
    @Autowired
    private HashtagMapper hashtagMapper;

    public List<HashtagDto> getAllHashtags() {
        return hashtagMapper.findAllHashtags();
    }

    public HashtagDto getHashtagById(Long id) {
        return hashtagMapper.findHashtagById(id);
    }

    public HashtagDto getHashtagByName(String name) {
        return hashtagMapper.findHashtagByName(name);
    }

    public List<HashtagDto> getHashtagsBySpotId(Long spotId) {
        return hashtagMapper.findHashtagsBySpotId(spotId);
    }

  


}
