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
		} catch (Exception e) {
			logger.warn(".env 파일 로드 실패: {}", e.getMessage());
		}

		SpringApplication.run(OroraApplication.class, args);
	}

}
