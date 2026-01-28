package com.busan.orora.spot.service;

import com.busan.orora.spot.dto.SpotRequestDto;
import com.busan.orora.spot.mapper.SpotRequestMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class SpotRequestService {
    @Autowired
    private SpotRequestMapper spotRequestMapper;

    // 모든 신청 목록 조회
    public List<SpotRequestDto> getAllRequests() {
        return spotRequestMapper.findAllRequests();
    }

    // 신청 ID로 조회
    public SpotRequestDto getRequestById(Long id) {
        return spotRequestMapper.findRequestById(id);
    }

    // 사용자별 신청 목록 조회
    public List<SpotRequestDto> getRequestsByUserId(Long userId) {
        return spotRequestMapper.findRequestsByUserId(userId);
    }

    // 상태별 신청 목록 조회
    public List<SpotRequestDto> getRequestsByStatus(String status) {
        return spotRequestMapper.findRequestsByStatus(status);
    }

    // 신청 유형별 조회
    public List<SpotRequestDto> getRequestsByType(String requestType) {
        return spotRequestMapper.findRequestsByType(requestType);
    }

    // 신청 추가
    @Transactional
    public SpotRequestDto addRequest(SpotRequestDto requestDto) {
        // 기본 상태 설정
        if (requestDto.getStatus() == null || requestDto.getStatus().isEmpty()) {
            requestDto.setStatus("pending");
        }
        spotRequestMapper.insertRequest(requestDto);
        return spotRequestMapper.findRequestById(requestDto.getId());
    }

    // 신청 상태 업데이트
    @Transactional
    public void updateRequestStatus(Long id, String status, String rejectReason) {
        spotRequestMapper.updateRequestStatus(id, status, rejectReason);
    }

    // 관광지 추가 신청 승인 시 생성된 관광지 ID 연결
    @Transactional
    public void updateRequestTouristSpotId(Long id, Long touristSpotId) {
        spotRequestMapper.updateRequestTouristSpotId(id, touristSpotId);
    }

    // 신청 삭제
    @Transactional
    public void deleteRequest(Long id) {
        spotRequestMapper.deleteRequest(id);
    }
}
