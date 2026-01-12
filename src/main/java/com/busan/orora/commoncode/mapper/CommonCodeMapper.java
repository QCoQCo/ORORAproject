package com.busan.orora.commoncode.mapper;

import com.busan.orora.commoncode.dto.CommonCodeDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface CommonCodeMapper {
    List<CommonCodeDto> findAllCodes();
    List<CommonCodeDto> findCodesByGroupCode(@Param("groupCode") String groupCode);
    CommonCodeDto findCodeById(@Param("id") Long id);
    CommonCodeDto findCodeByGroupAndCode(@Param("groupCode") String groupCode, @Param("code") String code);
    void insertCode(CommonCodeDto codeDto);
    void updateCode(CommonCodeDto codeDto);
    void deleteCode(@Param("id") Long id);
    void deleteCodesByGroupCode(@Param("groupCode") String groupCode);
}
