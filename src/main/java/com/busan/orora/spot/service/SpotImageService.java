package com.busan.orora.spot.service;

import com.busan.orora.common.service.FileService;
import com.busan.orora.spot.dto.SpotImageDto;
import com.busan.orora.spot.mapper.SpotImageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

/**
 * 관광지 이미지 처리를 담당하는 서비스
 */
@Service
public class SpotImageService {

    @Autowired
    private SpotImageMapper spotImageMapper;

    @Autowired
    private FileService fileService;

    @Value("${file.upload.spotImgLocation}")
    private String spotImgLocation;

    /**
     * 관광지 이미지를 저장합니다.
     * 
     * @param spotImageDto 이미지 메타데이터 DTO
     * @param spotImgFile 업로드된 이미지 파일
     * @throws Exception 파일 저장 또는 DB 저장 중 오류 발생 시
     */
    public void saveSpotImage(SpotImageDto spotImageDto, MultipartFile spotImgFile) throws Exception {
        String oriImgName = spotImgFile.getOriginalFilename();
        String imgName = "";
        String imgUrl = "";

        if (!spotImgFile.isEmpty()) {
            // 1. FileService를 통해 물리적 파일 저장
            imgName = fileService.uploadFile(spotImgLocation, oriImgName, spotImgFile.getBytes());

            // 2. 웹 접근 URL 생성
            imgUrl = "/images/upload/spots/" + imgName;
        }

        // 3. DTO에 정보 설정
        spotImageDto.setImgName(imgName);
        spotImageDto.setOriImgName(oriImgName);
        spotImageDto.setImageUrl(imgUrl);

        // 4. 데이터베이스에 이미지 정보 저장
        spotImageMapper.insertImage(spotImageDto);
    }

    /**
     * 여러 개의 관광지 이미지를 저장합니다.
     * 첫 번째 이미지는 대표 이미지로 설정됩니다.
     * 
     * @param spotId 관광지 ID
     * @param spotImgFiles 업로드된 이미지 파일 리스트
     * @throws Exception 파일 저장 또는 DB 저장 중 오류 발생 시
     */
    @Transactional(rollbackFor = Exception.class)
    public void saveSpotImages(Long spotId, List<MultipartFile> spotImgFiles) throws Exception {
        int repImageIndex = 0;
        
        for (MultipartFile spotImgFile : spotImgFiles) {
            if (spotImgFile == null || spotImgFile.isEmpty()) {
                continue;  // 빈 파일은 건너뛰기
            }

            SpotImageDto spotImageDto = new SpotImageDto();
            spotImageDto.setTouristSpotId(spotId);

            // 첫 번째 이미지를 대표 이미지로 설정
            if (repImageIndex == 0) {
                spotImageDto.setRepImgYn("Y");
            } else {
                spotImageDto.setRepImgYn("N");
            }

            // 이미지 저장
            saveSpotImage(spotImageDto, spotImgFile);
            repImageIndex++;
        }
    }

    /**
     * 관광지 ID로 모든 이미지를 조회합니다.
     * 
     * @param spotId 관광지 ID
     * @return 이미지 리스트
     */
    public List<SpotImageDto> getImagesBySpotId(Long spotId) {
        return spotImageMapper.findImagesBySpotId(spotId);
    }

    /**
     * 여러 관광지의 대표 이미지를 한번에 조회
     */
    public List<SpotImageDto> getRepImagesBySpotIds(List<Long> spotIds) {
        if (spotIds == null || spotIds.isEmpty()) {
            return List.of();
        }
        return spotImageMapper.findRepImagesBySpotIds(spotIds);
    }

    /**
     * 특정 이미지를 업데이트합니다.
     * 
     * @param imageId 이미지 ID
     * @param spotImageDto 이미지 메타데이터 DTO
     * @param spotImgFile 업로드된 새 이미지 파일 (null이면 파일 업데이트 안 함)
     * @throws Exception 파일 저장 또는 DB 저장 중 오류 발생 시
     */
    @Transactional(rollbackFor = Exception.class)
    public void updateSpotImage(Long imageId, SpotImageDto spotImageDto, MultipartFile spotImgFile) throws Exception {
        if (spotImgFile != null && !spotImgFile.isEmpty()) {
            // 기존 이미지 정보 조회
            List<SpotImageDto> existingImages = spotImageMapper.findImagesBySpotId(spotImageDto.getTouristSpotId());
            SpotImageDto existingImage = existingImages.stream()
                    .filter(img -> img.getId().equals(imageId))
                    .findFirst()
                    .orElse(null);

            // 기존 파일 삭제
            if (existingImage != null && existingImage.getImgName() != null) {
                String filePath = spotImgLocation + File.separator + existingImage.getImgName();
                fileService.deleteFile(filePath);
            }

            // 새 파일 업로드
            String oriImgName = spotImgFile.getOriginalFilename();
            String imgName = fileService.uploadFile(spotImgLocation, oriImgName, spotImgFile.getBytes());
            String imgUrl = "/images/upload/spots/" + imgName;

            spotImageDto.setImgName(imgName);
            spotImageDto.setOriImgName(oriImgName);
            spotImageDto.setImageUrl(imgUrl);
        }

        // 데이터베이스 업데이트는 Mapper에 updateImage 메서드가 필요합니다
        // 현재는 insertImage만 있으므로, 필요시 추가 구현 필요
    }

    /**
     * 특정 이미지를 삭제합니다.
     * 
     * @param imageId 이미지 ID
     * @throws Exception 파일 삭제 또는 DB 삭제 중 오류 발생 시
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteSpotImage(Long imageId) throws Exception {
        // 이미지 정보 조회 (파일 삭제를 위해)
        // 현재 Mapper에 findImageById가 없으므로, 필요시 추가 구현 필요
        
        // 데이터베이스에서 삭제
        spotImageMapper.deleteImage(imageId);
    }

    /**
     * 특정 이미지를 삭제합니다. (관리자용 alias)
     */
    public void deleteImage(Long imageId) throws Exception {
        deleteSpotImage(imageId);
    }

    /**
     * 대표 이미지를 설정합니다.
     * 
     * @param imageId 대표 이미지로 설정할 이미지 ID
     */
    @Transactional(rollbackFor = Exception.class)
    public void setRepresentativeImage(Long imageId) {
        // 1. 해당 이미지의 관광지 ID 조회
        SpotImageDto image = spotImageMapper.findImageById(imageId);
        if (image == null) {
            throw new RuntimeException("이미지를 찾을 수 없습니다.");
        }

        // 2. 해당 관광지의 모든 이미지 대표 여부를 N으로 변경
        spotImageMapper.resetRepImages(image.getTouristSpotId());

        // 3. 해당 이미지를 대표 이미지로 설정
        spotImageMapper.setRepImage(imageId);
    }

    /**
     * 관광지의 모든 이미지를 삭제합니다.
     * 
     * @param spotId 관광지 ID
     * @throws Exception 파일 삭제 또는 DB 삭제 중 오류 발생 시
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteSpotImagesBySpotId(Long spotId) throws Exception {
        // 기존 이미지 정보 조회
        List<SpotImageDto> existingImages = spotImageMapper.findImagesBySpotId(spotId);

        // 물리적 파일 삭제
        for (SpotImageDto image : existingImages) {
            if (image.getImgName() != null) {
                String filePath = spotImgLocation + File.separator + image.getImgName();
                fileService.deleteFile(filePath);
            }
        }

        // 데이터베이스에서 삭제
        spotImageMapper.deleteImagesBySpotId(spotId);
    }

    /**
     * URL로 관광지 이미지를 추가합니다. (사진 추가 신청 승인 시 사용)
     * 
     * @param spotId 관광지 ID
     * @param imageUrl 이미지 URL
     * @param isRepresentative 대표 이미지 여부
     */
    @Transactional(rollbackFor = Exception.class)
    public void addImageByUrl(Long spotId, String imageUrl, boolean isRepresentative) {
        SpotImageDto spotImageDto = new SpotImageDto();
        spotImageDto.setTouristSpotId(spotId);
        spotImageDto.setImageUrl(imageUrl);
        spotImageDto.setRepImgYn(isRepresentative ? "Y" : "N");
        
        // URL에서 파일명 추출 (마지막 / 이후 부분)
        String imgName = imageUrl;
        if (imageUrl != null && imageUrl.contains("/")) {
            imgName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
        }
        spotImageDto.setImgName(imgName);
        spotImageDto.setOriImgName(imgName);
        
        spotImageMapper.insertImage(spotImageDto);
    }
}
