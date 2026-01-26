package com.busan.orora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class OroraApplication {

	private static final Logger logger = LoggerFactory.getLogger(OroraApplication.class);

	public static void main(String[] args) {
		try {
			Dotenv dotenv = Dotenv.configure()
					.directory("./")
					.ignoreIfMissing()
					.load();

			System.setProperty("DB_HOST", dotenv.get("DB_HOST", "localhost"));
			System.setProperty("DB_PORT", dotenv.get("DB_PORT", "3306"));
			System.setProperty("DB_NAME", dotenv.get("DB_NAME", "arata_busan"));
			System.setProperty("DB_USERNAME", dotenv.get("DB_USERNAME", "root"));
			System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD", "1111"));
			// 카카오맵 API 키 전달 (.env에 KAKAO_MAP_API_KEY가 없으면 빈 값)
			System.setProperty("KAKAO_MAP_API_KEY", dotenv.get("KAKAO_MAP_API_KEY", ""));
			// OAuth2 환경변수 전달
			String kakaoClientId = dotenv.get("KAKAO_CLIENT_ID", "");
			String kakaoClientSecret = dotenv.get("KAKAO_CLIENT_SECRET", "");
			String kakaoRedirectUri = dotenv.get("KAKAO_REDIRECT_URI", "");
			String googleClientId = dotenv.get("GOOGLE_CLIENT_ID", "");
			String googleClientSecret = dotenv.get("GOOGLE_CLIENT_SECRET", "");
			String googleRedirectUri = dotenv.get("GOOGLE_REDIRECT_URI",
					"");

			System.setProperty("KAKAO_CLIENT_ID", kakaoClientId);
			System.setProperty("KAKAO_CLIENT_SECRET", kakaoClientSecret);
			System.setProperty("KAKAO_REDIRECT_URI", kakaoRedirectUri);
			System.setProperty("GOOGLE_CLIENT_ID", googleClientId);
			System.setProperty("GOOGLE_CLIENT_SECRET", googleClientSecret);
			System.setProperty("GOOGLE_REDIRECT_URI", googleRedirectUri);

			// 디버깅: OAuth2 환경변수 로드 확인
			// if (!kakaoClientId.isEmpty()) {
			// logger.info("카카오 OAuth2 클라이언트 ID 로드됨: {}",
			// kakaoClientId.substring(0, Math.min(10, kakaoClientId.length())) + "...");
			// } else {
			// logger.warn("카카오 OAuth2 클라이언트 ID가 설정되지 않았습니다.");
			// }
			// if (!googleClientId.isEmpty()) {
			// logger.info("구글 OAuth2 클라이언트 ID 로드됨: {}",
			// googleClientId.substring(0, Math.min(20, googleClientId.length())) + "...");
			// } else {
			// logger.warn("구글 OAuth2 클라이언트 ID가 설정되지 않았습니다.");
			// }
		} catch (Exception e) {
			logger.warn(".env 파일 로드 실패: {}", e.getMessage());
		}

		SpringApplication.run(OroraApplication.class, args);
	}

}
