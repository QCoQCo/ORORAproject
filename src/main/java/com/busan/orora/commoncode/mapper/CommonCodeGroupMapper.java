package com.busan.orora.commoncode.mapper;

import com.busan.orora.commoncode.dto.CommonCodeGroupDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface CommonCodeGroupMapper {
    List<CommonCodeGroupDto> findAllGroups();
    CommonCodeGroupDto findGroupByCode(@Param("groupCode") String groupCode);
    CommonCodeGroupDto findGroupById(@Param("id") Long id);
    void insertGroup(CommonCodeGroupDto groupDto);
    void updateGroup(CommonCodeGroupDto groupDto);
    void deleteGroup(@Param("id") Long id);
}
