package com.busan.orora.spot.mapper;

import com.busan.orora.spot.dto.SpotRequestDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SpotRequestMapper {
    // 신청 목록 조회 (관리자용 - 조인된 데이터 포함)
    List<SpotRequestDto> findAllRequests();
    
    // 신청 ID로 조회
    SpotRequestDto findRequestById(@Param("id") Long id);
    
    // 사용자별 신청 목록 조회
    List<SpotRequestDto> findRequestsByUserId(@Param("userId") Long userId);
    
    // 상태별 신청 목록 조회
    List<SpotRequestDto> findRequestsByStatus(@Param("status") String status);
    
    // 신청 유형별 조회
    List<SpotRequestDto> findRequestsByType(@Param("requestType") String requestType);
    
    // 신청 추가
    void insertRequest(SpotRequestDto requestDto);
    
    // 신청 상태 업데이트
    void updateRequestStatus(@Param("id") Long id, 
                            @Param("status") String status, 
                            @Param("rejectReason") String rejectReason);
    
    // 신청 삭제
    void deleteRequest(@Param("id") Long id);
}
