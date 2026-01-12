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

    public List<Map<String, Object>> getLikedReviewsByUserId(Long userId) {
        return reviewMapper.findLikedReviewsByUserId(userId);
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
     * 리뷰 수정
     * 
     * @param reviewId 리뷰 ID
     * @param userId   사용자 ID (작성자 확인용)
     * @param title    수정할 제목
     * @param content  수정할 내용
     * @param rating   수정할 평점
     * @throws Exception 리뷰를 찾을 수 없거나 본인 리뷰가 아닌 경우
     */
    @Transactional(rollbackFor = Exception.class)
    public void updateReview(Long reviewId, Long userId, String title, String content, Integer rating) throws Exception {
        // 리뷰 조회
        ReviewDto review = reviewMapper.findReviewById(reviewId);
        if (review == null) {
            throw new Exception("리뷰를 찾을 수 없습니다.");
        }
        
        // 작성자 확인
        if (!review.getUserId().equals(userId)) {
            throw new Exception("본인이 작성한 리뷰만 수정할 수 있습니다.");
        }
        
        // 수정할 데이터 설정
        review.setTitle(title);
        review.setContent(content);
        review.setRating(rating);
        
        reviewMapper.updateReview(review);
    }

    /**
     * 리뷰 수정 (이미지 포함)
     * 
     * @param reviewId       리뷰 ID
     * @param userId         사용자 ID (작성자 확인용)
     * @param title          수정할 제목
     * @param content        수정할 내용
     * @param rating         수정할 평점
     * @param deleteImageIds 삭제할 이미지 ID 목록
     * @param newImages      새로 추가할 이미지 파일 배열
     * @throws Exception     리뷰를 찾을 수 없거나 본인 리뷰가 아닌 경우
     */
    @Transactional(rollbackFor = Exception.class)
    public void updateReviewWithImages(Long reviewId, Long userId, String title, String content, 
            Integer rating, List<Long> deleteImageIds, MultipartFile[] newImages) throws Exception {
        // 리뷰 조회
        ReviewDto review = reviewMapper.findReviewById(reviewId);
        if (review == null) {
            throw new Exception("리뷰를 찾을 수 없습니다.");
        }
        
        // 작성자 확인
        if (!review.getUserId().equals(userId)) {
            throw new Exception("본인이 작성한 리뷰만 수정할 수 있습니다.");
        }
        
        // 1. 리뷰 기본 정보 수정
        review.setTitle(title);
        review.setContent(content);
        review.setRating(rating);
        reviewMapper.updateReview(review);

        // 2. 이미지 삭제
        if (deleteImageIds != null && !deleteImageIds.isEmpty()) {
            for (Long imageId : deleteImageIds) {
                reviewMapper.deleteReviewImage(imageId);
            }
        }

        // 3. 새 이미지 추가
        if (newImages != null && newImages.length > 0) {
            // 현재 이미지 순서 조회 (삭제 후 남은 이미지의 최대 순서)
            List<Map<String, Object>> existingImages = reviewMapper.findReviewImagesByReviewId(reviewId);
            int maxOrder = 0;
            if (existingImages != null) {
                for (Map<String, Object> img : existingImages) {
                    Object orderObj = img.get("imageOrder");
                    if (orderObj != null) {
                        int order = ((Number) orderObj).intValue();
                        if (order > maxOrder) {
                            maxOrder = order;
                        }
                    }
                }
            }

            // 새 이미지 저장
            int imageOrder = maxOrder + 1;
            for (MultipartFile imageFile : newImages) {
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

    /**
     * 리뷰 삭제
     * 
     * @param reviewId 리뷰 ID
     * @param userId   사용자 ID (작성자 확인용)
     * @throws Exception 리뷰를 찾을 수 없거나 본인 리뷰가 아닌 경우
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteReview(Long reviewId, Long userId) throws Exception {
        // 리뷰 조회
        ReviewDto review = reviewMapper.findReviewById(reviewId);
        if (review == null) {
            throw new Exception("리뷰를 찾을 수 없습니다.");
        }
        
        // 작성자 확인
        if (!review.getUserId().equals(userId)) {
            throw new Exception("본인이 작성한 리뷰만 삭제할 수 있습니다.");
        }
        
        // 리뷰 삭제 (관련 좋아요, 댓글, 이미지는 CASCADE 또는 별도 처리 필요)
        reviewMapper.deleteReview(reviewId);
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
