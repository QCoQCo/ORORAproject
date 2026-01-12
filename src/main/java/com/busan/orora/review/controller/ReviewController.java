package com.busan.orora.review.controller;

import com.busan.orora.review.dto.ReviewDto;
import com.busan.orora.review.service.ReviewService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    /**
     * 관광지별 리뷰 목록 조회
     * GET /api/reviews?touristSpotId={spotId}
     */
    @GetMapping("/reviews")
    @ResponseBody
    public Map<String, Object> getReviewsBySpotId(@RequestParam Long touristSpotId) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Map<String, Object>> reviews = reviewService.getReviewsBySpotId(touristSpotId);

            response.put("success", true);
            response.put("content", reviews);
            response.put("totalElements", reviews.size());
            response.put("totalPages", 1);
            response.put("currentPage", 0);

            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "리뷰를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
            return response;
        }
    }

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * 리뷰 작성
     * POST /api/reviews
     * multipart/form-data 또는 application/json 지원
     * multipart/form-data: touristSpotId, title, content, rating, userId, images (MultipartFile[])
     * application/json: { "touristSpotId": 1, "title": "제목", "content": "내용", "rating": 5, "userId": 1 }
     */
    @PostMapping("/reviews")
    @ResponseBody
    public Map<String, Object> createReview(
            HttpServletRequest request,
            @RequestParam(value = "touristSpotId", required = false) String touristSpotIdParam,
            @RequestParam(value = "title", required = false) String titleParam,
            @RequestParam(value = "content", required = false) String contentParam,
            @RequestParam(value = "rating", required = false) String ratingParam,
            @RequestParam(value = "userId", required = false) String userIdParam,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {
        Map<String, Object> response = new HashMap<>();

        try {
            Long userId = null;
            Long touristSpotId = null;
            String title = null;
            String content = null;
            Integer rating = null;

            // Content-Type 확인
            String contentType = request.getContentType();
            boolean isMultipart = contentType != null && contentType.toLowerCase().startsWith("multipart/form-data");

            if (isMultipart) {
                // multipart/form-data로 받은 경우
                if (userIdParam != null) {
                    userId = Long.parseLong(userIdParam);
                }
                if (touristSpotIdParam != null) {
                    touristSpotId = Long.parseLong(touristSpotIdParam);
                }
                title = titleParam;
                content = contentParam;
                if (ratingParam != null) {
                    rating = Integer.parseInt(ratingParam);
                }
            } else {
                // JSON으로 받은 경우
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> requestBody = (Map<String, Object>) objectMapper.readValue(request.getInputStream(), Map.class);
                    if (requestBody.containsKey("userId")) {
                        Object userIdObj = requestBody.get("userId");
                        if (userIdObj instanceof Number) {
                            userId = ((Number) userIdObj).longValue();
                        } else if (userIdObj instanceof String) {
                            userId = Long.parseLong((String) userIdObj);
                        }
                    }
                    if (requestBody.containsKey("touristSpotId")) {
                        Object spotIdObj = requestBody.get("touristSpotId");
                        if (spotIdObj instanceof Number) {
                            touristSpotId = ((Number) spotIdObj).longValue();
                        } else if (spotIdObj instanceof String) {
                            touristSpotId = Long.parseLong((String) spotIdObj);
                        }
                    }
                    title = (String) requestBody.get("title");
                    content = (String) requestBody.get("content");
                    if (requestBody.containsKey("rating")) {
                        Object ratingObj = requestBody.get("rating");
                        if (ratingObj instanceof Number) {
                            rating = ((Number) ratingObj).intValue();
                        } else if (ratingObj instanceof String) {
                            rating = Integer.parseInt((String) ratingObj);
                        }
                    }
                } catch (Exception e) {
                    response.put("success", false);
                    response.put("message", "요청 데이터를 파싱하는 중 오류가 발생했습니다: " + e.getMessage());
                    return response;
                }
            }

            // 유효성 검사
            if (userId == null) {
                response.put("success", false);
                response.put("message", "사용자 ID가 필요합니다.");
                return response;
            }
            if (touristSpotId == null) {
                response.put("success", false);
                response.put("message", "관광지 ID가 필요합니다.");
                return response;
            }
            if (title == null || title.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "제목을 입력해주세요.");
                return response;
            }
            if (content == null || content.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "내용을 입력해주세요.");
                return response;
            }
            if (rating == null || rating < 1 || rating > 5) {
                response.put("success", false);
                response.put("message", "평점은 1~5 사이의 값이어야 합니다.");
                return response;
            }

            // ReviewDto 생성
            ReviewDto reviewDto = new ReviewDto();
            reviewDto.setUserId(userId);
            reviewDto.setTouristSpotId(touristSpotId);
            reviewDto.setTitle(title.trim());
            reviewDto.setContent(content.trim());
            reviewDto.setRating(rating);
            reviewDto.setIsApproved(true);

            // 리뷰 생성
            ReviewDto createdReview = reviewService.createReview(reviewDto);

            // 이미지가 있으면 저장
            if (images != null && images.length > 0) {
                reviewService.saveReviewImages(createdReview.getId(), images);
            }

            response.put("success", true);
            response.put("message", "리뷰가 성공적으로 등록되었습니다.");
            response.put("review", createdReview);

            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "리뷰 작성 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
            return response;
        }
    }

    /**
     * 사용자별 리뷰 목록 조회
     * GET /api/users/{userId}/reviews
     */
    @GetMapping("/users/{userId}/reviews")
    @ResponseBody
    public Map<String, Object> getReviewsByUserId(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Map<String, Object>> reviews = reviewService.getReviewsByUserIdWithSpotInfo(userId);

            response.put("success", true);
            response.put("reviews", reviews);
            response.put("totalElements", reviews.size());

            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "리뷰를 불러오는 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
            return response;
        }
    }

    /**
     * 리뷰별 댓글 목록 조회
     * GET /api/reviews/{reviewId}/comments
     */
    @GetMapping("/reviews/{reviewId}/comments")
    @ResponseBody
    public Map<String, Object> getCommentsByReviewId(@PathVariable Long reviewId) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Map<String, Object>> comments = reviewService.getCommentsByReviewId(reviewId);

            response.put("success", true);
            response.put("comments", comments);

            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "댓글을 불러오는 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
            return response;
        }
    }

    /**
     * 댓글 작성
     * POST /api/reviews/{reviewId}/comments
     */
    @PostMapping("/reviews/{reviewId}/comments")
    @ResponseBody
    public Map<String, Object> createComment(@PathVariable Long reviewId, @RequestBody Map<String, Object> requestBody) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 요청 본문에서 데이터 추출
            Long userId = null;
            if (requestBody.containsKey("userId")) {
                Object userIdObj = requestBody.get("userId");
                if (userIdObj instanceof Number) {
                    userId = ((Number) userIdObj).longValue();
                } else if (userIdObj instanceof String) {
                    userId = Long.parseLong((String) userIdObj);
                }
            }

            String content = (String) requestBody.get("content");

            // 유효성 검사
            if (userId == null) {
                response.put("success", false);
                response.put("message", "사용자 ID가 필요합니다.");
                return response;
            }
            if (content == null || content.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "댓글 내용을 입력해주세요.");
                return response;
            }

            // 댓글 작성
            reviewService.createComment(reviewId, userId, content.trim());

            response.put("success", true);
            response.put("message", "댓글이 성공적으로 등록되었습니다.");

            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "댓글 작성 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
            return response;
        }
    }

    /**
     * 댓글 수정
     * PUT /api/comments/{commentId}
     */
    @PutMapping("/comments/{commentId}")
    @ResponseBody
    public Map<String, Object> updateComment(@PathVariable Long commentId, @RequestBody Map<String, Object> requestBody) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 요청 본문에서 데이터 추출
            Long userId = null;
            if (requestBody.containsKey("userId")) {
                Object userIdObj = requestBody.get("userId");
                if (userIdObj instanceof Number) {
                    userId = ((Number) userIdObj).longValue();
                } else if (userIdObj instanceof String) {
                    userId = Long.parseLong((String) userIdObj);
                }
            }

            String content = (String) requestBody.get("content");

            // 유효성 검사
            if (userId == null) {
                response.put("success", false);
                response.put("message", "사용자 ID가 필요합니다.");
                return response;
            }
            if (content == null || content.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "댓글 내용을 입력해주세요.");
                return response;
            }

            // 댓글 수정
            reviewService.updateComment(commentId, userId, content.trim());

            response.put("success", true);
            response.put("message", "댓글이 성공적으로 수정되었습니다.");

            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "댓글 수정 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
            return response;
        }
    }

    /**
     * 댓글 삭제
     * DELETE /api/comments/{commentId}
     */
    @DeleteMapping("/comments/{commentId}")
    @ResponseBody
    public Map<String, Object> deleteComment(@PathVariable Long commentId, @RequestBody Map<String, Object> requestBody) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 요청 본문에서 데이터 추출
            Long userId = null;
            if (requestBody.containsKey("userId")) {
                Object userIdObj = requestBody.get("userId");
                if (userIdObj instanceof Number) {
                    userId = ((Number) userIdObj).longValue();
                } else if (userIdObj instanceof String) {
                    userId = Long.parseLong((String) userIdObj);
                }
            }

            // 유효성 검사
            if (userId == null) {
                response.put("success", false);
                response.put("message", "사용자 ID가 필요합니다.");
                return response;
            }

            // 댓글 삭제
            reviewService.deleteComment(commentId, userId);

            response.put("success", true);
            response.put("message", "댓글이 성공적으로 삭제되었습니다.");

            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "댓글 삭제 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
            return response;
        }
    }

    /**
     * 댓글 신고
     * POST /api/comments/{commentId}/report
     */
    @PostMapping("/comments/{commentId}/report")
    @ResponseBody
    public Map<String, Object> reportComment(@PathVariable Long commentId, @RequestBody Map<String, Object> requestBody) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 요청 본문에서 데이터 추출
            Long userId = null;
            if (requestBody.containsKey("userId")) {
                Object userIdObj = requestBody.get("userId");
                if (userIdObj instanceof Number) {
                    userId = ((Number) userIdObj).longValue();
                } else if (userIdObj instanceof String) {
                    userId = Long.parseLong((String) userIdObj);
                }
            }

            String reason = (String) requestBody.get("reason");

            // 유효성 검사
            if (userId == null) {
                response.put("success", false);
                response.put("message", "사용자 ID가 필요합니다.");
                return response;
            }
            if (reason == null || reason.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "신고 사유를 입력해주세요.");
                return response;
            }

            // 댓글 신고
            reviewService.reportComment(commentId, userId, reason.trim());

            response.put("success", true);
            response.put("message", "신고가 접수되었습니다. 검토 후 조치하겠습니다.");

            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "신고 처리 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
            return response;
        }
    }

    /**
     * 리뷰 신고
     * POST /api/reviews/{reviewId}/report
     */
    @PostMapping("/reviews/{reviewId}/report")
    @ResponseBody
    public Map<String, Object> reportReview(@PathVariable Long reviewId, @RequestBody Map<String, Object> requestBody) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 요청 본문에서 데이터 추출
            Long userId = null;
            if (requestBody.containsKey("userId")) {
                Object userIdObj = requestBody.get("userId");
                if (userIdObj instanceof Number) {
                    userId = ((Number) userIdObj).longValue();
                } else if (userIdObj instanceof String) {
                    userId = Long.parseLong((String) userIdObj);
                }
            }

            String reason = (String) requestBody.get("reason");

            // 유효성 검사
            if (userId == null) {
                response.put("success", false);
                response.put("message", "사용자 ID가 필요합니다.");
                return response;
            }
            if (reason == null || reason.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "신고 사유를 입력해주세요.");
                return response;
            }

            // 리뷰 신고
            reviewService.reportReview(reviewId, userId, reason.trim());

            response.put("success", true);
            response.put("message", "신고가 접수되었습니다. 검토 후 조치하겠습니다.");

            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "신고 처리 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
            return response;
        }
    }
}
