package com.busan.orora.review.mapper;

import com.busan.orora.review.dto.ReviewDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Map;

@Mapper
public interface ReviewMapper {
    List<Map<String, Object>> findReviewsBySpotId(@Param("spotId") Long spotId);

    List<ReviewDto> findReviewsByUserId(@Param("userId") Long userId);

    ReviewDto findReviewById(@Param("id") Long id);

    void insertReview(ReviewDto reviewDto);

    void updateReview(ReviewDto reviewDto);

    void deleteReview(@Param("id") Long id);

    Double getAverageRating(@Param("spotId") Long spotId);

    Integer getRatingCount(@Param("spotId") Long spotId);

    List<Map<String, Object>> getRatingStatsBySpotIds(@Param("spotIds") List<Long> spotIds);

    // 신고 목록 조회 (관리자용)
    List<Map<String, Object>> findAllReports();

    // 댓글 신고 목록 조회 (관리자용)
    List<Map<String, Object>> findAllCommentReports();

    // 사용자별 리뷰 조회 (관광지 정보 포함)
    List<Map<String, Object>> findReviewsByUserIdWithSpotInfo(@Param("userId") Long userId);

    // 리뷰별 댓글 목록 조회
    List<Map<String, Object>> findCommentsByReviewId(@Param("reviewId") Long reviewId);

    // 댓글 작성
    void insertComment(@Param("reviewId") Long reviewId, @Param("userId") Long userId, @Param("content") String content);

    // 댓글 수정
    void updateComment(@Param("commentId") Long commentId, @Param("userId") Long userId, @Param("content") String content);

    // 댓글 삭제
    void deleteComment(@Param("commentId") Long commentId, @Param("userId") Long userId);

    // 댓글 작성자 확인
    Long findCommentUserId(@Param("commentId") Long commentId);

    // 댓글 신고
    void insertCommentReport(@Param("commentId") Long commentId, @Param("userId") Long userId, @Param("reason") String reason);

    // 리뷰 신고
    void insertReviewReport(@Param("reviewId") Long reviewId, @Param("userId") Long userId, @Param("reason") String reason);

    // 리뷰 신고 상태 업데이트
    void updateReviewReportStatus(@Param("reportId") Long reportId, @Param("statusCode") String statusCode);

    // 리뷰 신고 삭제
    void deleteReviewReport(@Param("reportId") Long reportId);

    // 댓글 신고 상태 업데이트
    void updateCommentReportStatus(@Param("reportId") Long reportId, @Param("statusCode") String statusCode);

    // 댓글 신고 삭제
    void deleteCommentReport(@Param("reportId") Long reportId);

    // 리뷰 이미지 저장
    void insertReviewImage(@Param("reviewId") Long reviewId, @Param("imageUrl") String imageUrl, 
                          @Param("imageOrder") Integer imageOrder, @Param("altText") String altText);

    // 리뷰 이미지 조회
    List<Map<String, Object>> findReviewImagesByReviewId(@Param("reviewId") Long reviewId);
}
