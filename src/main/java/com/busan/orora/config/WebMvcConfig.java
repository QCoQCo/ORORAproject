package com.busan.orora.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * Web MVC 설정 클래스
 * 정적 리소스 핸들러를 설정하여 업로드된 이미지 파일을 서빙합니다.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload.spotImgLocation}")
    private String spotImgLocation;

    @Value("${file.upload.profileImgLocation}")
    private String profileImgLocation;

    @Value("${file.upload.reviewImgLocation}")
    private String reviewImgLocation;

    /**
     * 상대 경로를 절대 경로로 변환합니다.
     * 프로젝트 루트 기준으로 절대 경로를 생성합니다.
     */
    private String getAbsolutePath(String relativePath) {
        String projectRoot = System.getProperty("user.dir");
        File path = new File(projectRoot, relativePath);
        return path.getAbsolutePath();
    }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // 절대 경로로 변환
        String absoluteSpotImgLocation = getAbsolutePath(spotImgLocation);
        String absoluteProfileImgLocation = getAbsolutePath(profileImgLocation);
        String absoluteReviewImgLocation = getAbsolutePath(reviewImgLocation);

        // 관광지 이미지 서빙
        registry.addResourceHandler("/images/upload/spots/**")
                .addResourceLocations("file:" + absoluteSpotImgLocation + "/");

        // 사용자 프로필 이미지 서빙
        registry.addResourceHandler("/images/upload/profiles/**")
                .addResourceLocations("file:" + absoluteProfileImgLocation + "/");

        // 리뷰 이미지 서빙
        registry.addResourceHandler("/images/upload/reviews/**")
                .addResourceLocations("file:" + absoluteReviewImgLocation + "/");

        // 정적 리소스 이미지 (기존 static/images 폴더)
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");
    }
}
