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
	 * 경로를 절대 경로로 변환합니다.
	 * 이미 절대 경로인 경우 그대로 반환하고,
	 * 상대 경로인 경우 프로젝트 루트 기준으로 절대 경로를 생성합니다.
	 */
	private String getAbsolutePath(String path) {
		File file = new File(path);
		if (file.isAbsolute()) {
			return path;
		}
		String projectRoot = System.getProperty("user.dir");
		File absolutePath = new File(projectRoot, path);
		return absolutePath.getAbsolutePath();
	}

	/**
	 * 기존 upload 폴더의 절대 경로를 반환합니다.
	 * 기존에 업로드된 파일들을 계속 서빙하기 위해 사용됩니다.
	 */
	private String getLegacyUploadPath(String subFolder) {
		String projectRoot = System.getProperty("user.dir");
		return new File(projectRoot, "upload/" + subFolder).getAbsolutePath();
	}

	@Override
	public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
		// 새 업로드 경로 (application.yaml 설정)
		String newSpotImgLocation = getAbsolutePath(spotImgLocation);
		String newProfileImgLocation = getAbsolutePath(profileImgLocation);
		String newReviewImgLocation = getAbsolutePath(reviewImgLocation);

		// 기존 upload 폴더 경로 (레거시 파일용)
		String legacySpotPath = getLegacyUploadPath("spots");
		String legacyProfilePath = getLegacyUploadPath("profiles");
		String legacyReviewPath = getLegacyUploadPath("reviews");

		// 관광지 이미지 서빙 (새 경로 우선, 기존 경로 폴백)
		registry.addResourceHandler("/images/upload/spots/**")
				.addResourceLocations(
						"file:" + newSpotImgLocation + "/",
						"file:" + legacySpotPath + "/");

		// 사용자 프로필 이미지 서빙 (새 경로 우선, 기존 경로 폴백)
		registry.addResourceHandler("/images/upload/profiles/**")
				.addResourceLocations(
						"file:" + newProfileImgLocation + "/",
						"file:" + legacyProfilePath + "/");

		// 리뷰 이미지 서빙 (새 경로 우선, 기존 경로 폴백)
		registry.addResourceHandler("/images/upload/reviews/**")
				.addResourceLocations(
						"file:" + newReviewImgLocation + "/",
						"file:" + legacyReviewPath + "/");

		// 정적 리소스 이미지 (기존 static/images 폴더)
		registry.addResourceHandler("/images/**")
				.addResourceLocations("classpath:/static/images/");
	}
}
