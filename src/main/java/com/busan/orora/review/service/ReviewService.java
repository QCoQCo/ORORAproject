package com.busan.orora.review.service;

import com.busan.orora.common.service.FileService;
import com.busan.orora.review.dto.RatingStat;
import com.busan.orora.review.dto.ReviewDto;
import com.busan.orora.review.mapper.ReviewMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {
    @Autowired
    private ReviewMapper reviewMapper;

    @Autowired
    private FileService fileService;

    @Value("${file.upload.reviewImgLocation}")
    private String reviewImgLocation;

    public List<Map<String, Object>> getReviewsBySpotId(Long spotId) {
        List<Map<String, Object>> reviews = reviewMapper.findReviewsBySpotId(spotId);

        // 각 리뷰에 이미지 정보 추가
        for (Map<String, Object> review : reviews) {
            Long reviewId = ((Number) review.get("id")).longValue();
            List<Map<String, Object>> images = reviewMapper.findReviewImagesByReviewId(reviewId);
            review.put("images", images);
        }

        return reviews;
    }

    public List<ReviewDto> getReviewsByUserId(Long userId) {
        return reviewMapper.findReviewsByUserId(userId);
    }

    public List<Map<String, Object>> getReviewsByUserIdWithSpotInfo(Long userId) {
        return reviewMapper.findReviewsByUserIdWithSpotInfo(userId);
    }

    public List<Map<String, Object>> getCommentsByReviewId(Long reviewId) {
        return reviewMapper.findCommentsByReviewId(reviewId);
    }

    public void createComment(Long reviewId, Long userId, String content) {
        reviewMapper.insertComment(reviewId, userId, content);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateComment(Long commentId, Long userId, String content) throws Exception {
        // 댓글 작성자 확인
        Long commentUserId = reviewMapper.findCommentUserId(commentId);
        if (commentUserId == null) {
            throw new Exception("댓글을 찾을 수 없습니다.");
        }
        if (!commentUserId.equals(userId)) {
            throw new Exception("본인의 댓글만 수정할 수 있습니다.");
        }
        reviewMapper.updateComment(commentId, userId, content);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteComment(Long commentId, Long userId) throws Exception {
        // 댓글 작성자 확인
        Long commentUserId = reviewMapper.findCommentUserId(commentId);
        if (commentUserId == null) {
            throw new Exception("댓글을 찾을 수 없습니다.");
        }
        if (!commentUserId.equals(userId)) {
            throw new Exception("본인의 댓글만 삭제할 수 있습니다.");
        }
        reviewMapper.deleteComment(commentId, userId);
    }

    public void reportComment(Long commentId, Long userId, String reason) {
        reviewMapper.insertCommentReport(commentId, userId, reason);
    }

    public void reportReview(Long reviewId, Long userId, String reason) {
        reviewMapper.insertReviewReport(reviewId, userId, reason);
    }

    public List<Map<String, Object>> getAllCommentReports() {
        return reviewMapper.findAllCommentReports();
    }

    public ReviewDto getReviewById(Long id) {
        return reviewMapper.findReviewById(id);
    }

    /**
     * 관광지별 평균 평점 조회
     * 
     * @param spotId 관광지 ID
     * @return 평균 평점 (리뷰가 없으면 0.0)
     */
    public Double getAverageRating(Long spotId) {
        return reviewMapper.getAverageRating(spotId);
    }

    /**
     * 관광지별 평점 개수 조회
     * 
     * @param spotId 관광지 ID
     * @return 평점 개수
     */
    public Integer getRatingCount(Long spotId) {
        return reviewMapper.getRatingCount(spotId);
    }

    /**
     * 여러 관광지의 평점 통계를 한번에 조회
     */
    public List<RatingStat> getRatingStatsBySpotIds(List<Long> spotIds) {
        if (spotIds == null || spotIds.isEmpty()) {
            return List.of();
        }
        List<Map<String, Object>> rows = reviewMapper.getRatingStatsBySpotIds(spotIds);
        List<RatingStat> stats = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            Long id = row.get("touristSpotId") != null ? ((Number) row.get("touristSpotId")).longValue() : null;
            Double avg = row.get("ratingAvg") != null ? ((Number) row.get("ratingAvg")).doubleValue() : 0.0;
            Integer cnt = row.get("ratingCount") != null ? ((Number) row.get("ratingCount")).intValue() : 0;
            stats.add(new RatingStat(id, avg, cnt));
        }
        return stats;
    }

    /**
     * 리뷰 작성
     * 
     * @param reviewDto 리뷰 정보
     * @return 생성된 리뷰 정보
     */
    public ReviewDto createReview(ReviewDto reviewDto) {
        // 기본값 설정
        if (reviewDto.getIsApproved() == null) {
            reviewDto.setIsApproved(true);
        }

        reviewMapper.insertReview(reviewDto);
        return reviewMapper.findReviewById(reviewDto.getId());
    }

    /**
     * 리뷰 이미지 저장
     * 
     * @param reviewId 리뷰 ID
     * @param images   업로드된 이미지 파일 배열
     * @throws Exception 파일 저장 또는 DB 저장 중 오류 발생 시
     */
    @Transactional(rollbackFor = Exception.class)
    public void saveReviewImages(Long reviewId, MultipartFile[] images) throws Exception {
        if (images == null || images.length == 0) {
            return;
        }

        int imageOrder = 1;
        for (MultipartFile imageFile : images) {
            if (imageFile == null || imageFile.isEmpty()) {
                continue;
            }

            // 파일 저장
            String oriImgName = imageFile.getOriginalFilename();
            String imgName = fileService.uploadFile(reviewImgLocation, oriImgName, imageFile.getBytes());
            String imgUrl = "/images/upload/reviews/" + imgName;

            // DB에 저장
            reviewMapper.insertReviewImage(reviewId, imgUrl, imageOrder, oriImgName);
            imageOrder++;
        }
    }
}
