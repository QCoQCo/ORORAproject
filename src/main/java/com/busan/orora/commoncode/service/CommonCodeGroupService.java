package com.busan.orora.commoncode.service;

import com.busan.orora.commoncode.dto.CommonCodeGroupDto;
import com.busan.orora.commoncode.mapper.CommonCodeGroupMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommonCodeGroupService {
    @Autowired
    private CommonCodeGroupMapper groupMapper;

    public List<CommonCodeGroupDto> getAllGroups() {
        return groupMapper.findAllGroups();
    }

    public CommonCodeGroupDto getGroupByCode(String groupCode) {
        return groupMapper.findGroupByCode(groupCode);
    }

    public CommonCodeGroupDto getGroupById(Long id) {
        return groupMapper.findGroupById(id);
    }

    @Transactional
    public void addGroup(CommonCodeGroupDto groupDto) {
        if (groupDto.getCreatedAt() == null) {
            groupDto.setCreatedAt(LocalDateTime.now());
        }
        if (groupDto.getUpdatedAt() == null) {
            groupDto.setUpdatedAt(LocalDateTime.now());
        }
        if (groupDto.getIsActive() == null) {
            groupDto.setIsActive(true);
        }
        if (groupDto.getSortOrder() == null) {
            groupDto.setSortOrder(0);
        }
        groupMapper.insertGroup(groupDto);
    }

    @Transactional
    public void updateGroup(CommonCodeGroupDto groupDto) {
        groupDto.setUpdatedAt(LocalDateTime.now());
        groupMapper.updateGroup(groupDto);
    }

    @Transactional
    public void deleteGroup(Long id) {
        groupMapper.deleteGroup(id);
    }
}
