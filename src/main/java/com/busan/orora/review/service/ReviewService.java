package com.busan.orora.review.service;

import com.busan.orora.common.service.FileService;
import com.busan.orora.review.dto.RatingStat;
import com.busan.orora.review.dto.ReviewDto;
import com.busan.orora.review.mapper.ReviewMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    private static final Logger logger = LoggerFactory.getLogger(ReviewService.class);

    /** 업로드된 리뷰 이미지의 URL 접두사 (이 경로의 파일만 삭제 대상) */
    private static final String REVIEW_IMAGE_URL_PREFIX = "/images/upload/reviews/";

    @Autowired
    private ReviewMapper reviewMapper;

    @Autowired
    private FileService fileService;

    @Value("${file.upload.reviewImgLocation}")
    private String reviewImgLocation;

    public List<Map<String, Object>> getReviewsBySpotId(Long spotId) {
        List<Map<String, Object>> reviews = reviewMapper.findReviewsBySpotId(spotId);
        if (reviews.isEmpty()) {
            return reviews;
        }

        // 각 리뷰에 이미지 정보 추가 (N+1 방지: 이미지를 한 번에 조회 후 리뷰별로 그룹핑)
        List<Long> reviewIds = new ArrayList<>();
        for (Map<String, Object> review : reviews) {
            reviewIds.add(((Number) review.get("id")).longValue());
        }

        Map<Long, List<Map<String, Object>>> imagesByReviewId = new HashMap<>();
        for (Map<String, Object> image : reviewMapper.findReviewImagesByReviewIds(reviewIds)) {
            Long reviewId = ((Number) image.get("reviewId")).longValue();
            imagesByReviewId.computeIfAbsent(reviewId, k -> new ArrayList<>()).add(image);
        }

        for (Map<String, Object> review : reviews) {
            Long reviewId = ((Number) review.get("id")).longValue();
            review.put("images", imagesByReviewId.getOrDefault(reviewId, new ArrayList<>()));
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

    public List<Map<String, Object>> getCommentsByUserId(Long userId) {
        return reviewMapper.findCommentsByUserId(userId);
    }

    public void createComment(Long reviewId, Long userId, String content) {
        reviewMapper.insertComment(reviewId, userId, content);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateComment(Long commentId, Long userId, String content) throws Exception {
        // 댓글 작성자 확인
        Long commentUserId = reviewMapper.findCommentUserId(commentId);
        if (commentUserId == null) {
            throw new IllegalArgumentException("댓글을 찾을 수 없습니다.");
        }
        if (!commentUserId.equals(userId)) {
            throw new IllegalStateException("본인의 댓글만 수정할 수 있습니다.");
        }
        reviewMapper.updateComment(commentId, userId, content);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteComment(Long commentId, Long userId) throws Exception {
        // 댓글 작성자 확인
        Long commentUserId = reviewMapper.findCommentUserId(commentId);
        if (commentUserId == null) {
            throw new IllegalArgumentException("댓글을 찾을 수 없습니다.");
        }
        if (!commentUserId.equals(userId)) {
            throw new IllegalStateException("본인의 댓글만 삭제할 수 있습니다.");
        }
        reviewMapper.deleteComment(commentId, userId);
    }

    /**
     * 관리자용 댓글 삭제 (작성자 확인 없이)
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteCommentByAdmin(Long commentId) throws Exception {
        Long commentUserId = reviewMapper.findCommentUserId(commentId);
        if (commentUserId == null) {
            throw new IllegalArgumentException("댓글을 찾을 수 없습니다.");
        }
        // 관리자는 작성자 확인 없이 삭제 가능
        reviewMapper.deleteComment(commentId, commentUserId);
    }

    public void reportComment(Long commentId, Long userId, String reason) throws Exception {
        // 중복 신고 확인
        Long existingReportId = reviewMapper.findCommentReportByUserAndComment(userId, commentId);
        if (existingReportId != null) {
            throw new IllegalStateException("이미 신고한 댓글입니다.");
        }
        reviewMapper.insertCommentReport(commentId, userId, reason);
    }

    public void reportReview(Long reviewId, Long userId, String reason) throws Exception {
        // 중복 신고 확인
        Long existingReportId = reviewMapper.findReviewReportByUserAndReview(userId, reviewId);
        if (existingReportId != null) {
            throw new IllegalStateException("이미 신고한 리뷰입니다.");
        }
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
    public void updateReview(Long reviewId, Long userId, String title, String content, Integer rating)
            throws Exception {
        // 리뷰 조회
        ReviewDto review = reviewMapper.findReviewById(reviewId);
        if (review == null) {
            throw new IllegalArgumentException("리뷰를 찾을 수 없습니다.");
        }

        // 작성자 확인
        if (!review.getUserId().equals(userId)) {
            throw new IllegalStateException("본인이 작성한 리뷰만 수정할 수 있습니다.");
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
     * @throws Exception 리뷰를 찾을 수 없거나 본인 리뷰가 아닌 경우
     */
    @Transactional(rollbackFor = Exception.class)
    public void updateReviewWithImages(Long reviewId, Long userId, String title, String content,
            Integer rating, List<Long> deleteImageIds, MultipartFile[] newImages) throws Exception {
        // 리뷰 조회
        ReviewDto review = reviewMapper.findReviewById(reviewId);
        if (review == null) {
            throw new IllegalArgumentException("리뷰를 찾을 수 없습니다.");
        }

        // 작성자 확인
        if (!review.getUserId().equals(userId)) {
            throw new IllegalStateException("본인이 작성한 리뷰만 수정할 수 있습니다.");
        }

        // 1. 리뷰 기본 정보 수정
        review.setTitle(title);
        review.setContent(content);
        review.setRating(rating);
        reviewMapper.updateReview(review);

        // 2. 이미지 삭제
        if (deleteImageIds != null && !deleteImageIds.isEmpty()) {
            // 이 리뷰에 속한 이미지 중 삭제 대상의 URL을 모아 두었다가 커밋 후 파일도 삭제
            List<String> deletedImageUrls = new ArrayList<>();
            for (Map<String, Object> image : reviewMapper.findReviewImagesByReviewId(reviewId)) {
                if (image.get("id") != null && deleteImageIds.contains(((Number) image.get("id")).longValue())) {
                    deletedImageUrls.add((String) image.get("imageUrl"));
                }
            }
            for (Long imageId : deleteImageIds) {
                // 다른 리뷰의 이미지가 삭제되지 않도록 review_id를 함께 조건으로 사용
                reviewMapper.deleteReviewImage(imageId, reviewId);
            }
            deleteImageFilesOnCompletion(deletedImageUrls, TransactionSynchronization.STATUS_COMMITTED);
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

            // 새 이미지 저장 (수정이 롤백되면 이번에 저장한 파일도 삭제)
            List<String> savedImageUrls = new ArrayList<>();
            deleteImageFilesOnCompletion(savedImageUrls, TransactionSynchronization.STATUS_ROLLED_BACK);
            int imageOrder = maxOrder + 1;
            for (MultipartFile imageFile : newImages) {
                if (imageFile == null || imageFile.isEmpty()) {
                    continue;
                }

                // 파일 저장
                String oriImgName = imageFile.getOriginalFilename();
                String imgName = fileService.uploadFile(reviewImgLocation, oriImgName, imageFile.getBytes());
                String imgUrl = REVIEW_IMAGE_URL_PREFIX + imgName;
                savedImageUrls.add(imgUrl);

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
            throw new IllegalArgumentException("리뷰를 찾을 수 없습니다.");
        }

        // 작성자 확인
        if (!review.getUserId().equals(userId)) {
            throw new IllegalStateException("본인이 작성한 리뷰만 삭제할 수 있습니다.");
        }

        // 리뷰 삭제 (관련 좋아요, 댓글, 이미지 행은 DB CASCADE로 삭제되고, 이미지 파일은 커밋 후 삭제)
        deleteReviewWithImageFiles(reviewId);
    }

    /**
     * 관리자용 리뷰 삭제 (작성자 확인 없이)
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteReviewByAdmin(Long reviewId) throws Exception {
        ReviewDto review = reviewMapper.findReviewById(reviewId);
        if (review == null) {
            throw new IllegalArgumentException("리뷰를 찾을 수 없습니다.");
        }
        // 관리자는 작성자 확인 없이 삭제 가능
        deleteReviewWithImageFiles(reviewId);
    }

    /**
     * 리뷰를 삭제하고, 커밋 후 리뷰에 첨부된 이미지 파일도 삭제합니다.
     */
    private void deleteReviewWithImageFiles(Long reviewId) {
        List<String> imageUrls = new ArrayList<>();
        for (Map<String, Object> image : reviewMapper.findReviewImagesByReviewId(reviewId)) {
            imageUrls.add((String) image.get("imageUrl"));
        }
        reviewMapper.deleteReview(reviewId);
        deleteImageFilesOnCompletion(imageUrls, TransactionSynchronization.STATUS_COMMITTED);
    }

    /**
     * 트랜잭션이 지정한 상태로 끝나면 리뷰 이미지 파일을 삭제합니다.
     * - STATUS_COMMITTED: DB에서 이미지를 지운 뒤, 커밋된 경우에만 파일 삭제 (롤백되면 파일 유지)
     * - STATUS_ROLLED_BACK: 이번 트랜잭션에서 저장한 파일을, 롤백된 경우에만 삭제
     * imageUrls는 트랜잭션이 끝나는 시점에 읽으므로, 등록 후 목록에 추가한 URL도 포함됩니다.
     * 업로드 경로(/images/upload/reviews/)의 파일만 삭제하고 기본 제공 이미지는 건드리지 않습니다.
     */
    private void deleteImageFilesOnCompletion(List<String> imageUrls, int targetStatus) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            if (targetStatus == TransactionSynchronization.STATUS_COMMITTED) {
                deleteImageFiles(imageUrls);
            }
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == targetStatus) {
                    deleteImageFiles(imageUrls);
                }
            }
        });
    }

    private void deleteImageFiles(List<String> imageUrls) {
        for (String imageUrl : imageUrls) {
            if (imageUrl == null || !imageUrl.startsWith(REVIEW_IMAGE_URL_PREFIX)) {
                continue;
            }
            String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            if (fileName.isEmpty() || fileName.contains("..")) {
                continue;
            }
            try {
                fileService.deleteFile(reviewImgLocation + File.separator + fileName);
            } catch (Exception e) {
                logger.warn("리뷰 이미지 파일 삭제 실패: {}", imageUrl, e);
            }
        }
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
     * 리뷰 작성 (이미지 포함)
     * 이미지 저장에 실패하면 리뷰 작성도 함께 롤백됩니다.
     *
     * @param reviewDto 리뷰 정보
     * @param images    업로드된 이미지 파일 배열 (선택사항)
     * @return 생성된 리뷰 정보
     * @throws Exception 파일 저장 또는 DB 저장 중 오류 발생 시
     */
    @Transactional(rollbackFor = Exception.class)
    public ReviewDto createReviewWithImages(ReviewDto reviewDto, MultipartFile[] images) throws Exception {
        ReviewDto createdReview = createReview(reviewDto);
        saveReviewImages(createdReview.getId(), images);
        return createdReview;
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

        // 저장 도중 실패해 롤백되면 이번에 저장한 파일도 삭제
        List<String> savedImageUrls = new ArrayList<>();
        deleteImageFilesOnCompletion(savedImageUrls, TransactionSynchronization.STATUS_ROLLED_BACK);

        int imageOrder = 1;
        for (MultipartFile imageFile : images) {
            if (imageFile == null || imageFile.isEmpty()) {
                continue;
            }

            // 파일 저장
            String oriImgName = imageFile.getOriginalFilename();
            String imgName = fileService.uploadFile(reviewImgLocation, oriImgName, imageFile.getBytes());
            String imgUrl = REVIEW_IMAGE_URL_PREFIX + imgName;
            savedImageUrls.add(imgUrl);

            // DB에 저장
            reviewMapper.insertReviewImage(reviewId, imgUrl, imageOrder, oriImgName);
            imageOrder++;
        }
    }
}
