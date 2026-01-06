package com.busan.orora.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

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

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // 관광지 이미지 서빙
        registry.addResourceHandler("/images/upload/spots/**")
                .addResourceLocations("file:" + spotImgLocation + "/");

        // 사용자 프로필 이미지 서빙
        registry.addResourceHandler("/images/upload/profiles/**")
                .addResourceLocations("file:" + profileImgLocation + "/");

        // 정적 리소스 이미지 (기존 static/images 폴더)
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");
    }
}
