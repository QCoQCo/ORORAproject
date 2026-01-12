package com.busan.orora.commoncode.service;

import com.busan.orora.commoncode.dto.CommonCodeDto;
import com.busan.orora.commoncode.mapper.CommonCodeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommonCodeService {
    @Autowired
    private CommonCodeMapper codeMapper;

    public List<CommonCodeDto> getAllCodes() {
        return codeMapper.findAllCodes();
    }

    public List<CommonCodeDto> getCodesByGroupCode(String groupCode) {
        return codeMapper.findCodesByGroupCode(groupCode);
    }

    public CommonCodeDto getCodeById(Long id) {
        return codeMapper.findCodeById(id);
    }

    public CommonCodeDto getCodeByGroupAndCode(String groupCode, String code) {
        return codeMapper.findCodeByGroupAndCode(groupCode, code);
    }

    @Transactional
    public void addCode(CommonCodeDto codeDto) {
        if (codeDto.getCreatedAt() == null) {
            codeDto.setCreatedAt(LocalDateTime.now());
        }
        if (codeDto.getUpdatedAt() == null) {
            codeDto.setUpdatedAt(LocalDateTime.now());
        }
        if (codeDto.getIsActive() == null) {
            codeDto.setIsActive(true);
        }
        if (codeDto.getSortOrder() == null) {
            codeDto.setSortOrder(0);
        }
        codeMapper.insertCode(codeDto);
    }

    @Transactional
    public void updateCode(CommonCodeDto codeDto) {
        codeDto.setUpdatedAt(LocalDateTime.now());
        codeMapper.updateCode(codeDto);
    }

    @Transactional
    public void deleteCode(Long id) {
        codeMapper.deleteCode(id);
    }

    @Transactional
    public void deleteCodesByGroupCode(String groupCode) {
        codeMapper.deleteCodesByGroupCode(groupCode);
    }
}
