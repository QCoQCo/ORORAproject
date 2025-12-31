package com.busan.orora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class OroraApplication {

	public static void main(String[] args) {
		// .env 파일 로드
		try {
			Dotenv dotenv = Dotenv.configure()
					.directory("./")
					.ignoreIfMissing()
					.load();
			
			// 환경 변수 설정
			System.setProperty("DB_HOST", dotenv.get("DB_HOST", "localhost"));
			System.setProperty("DB_PORT", dotenv.get("DB_PORT", "3306"));
			System.setProperty("DB_NAME", dotenv.get("DB_NAME", "arata_busan"));
			System.setProperty("DB_USERNAME", dotenv.get("DB_USERNAME", "root"));
			System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD", ""));
		} catch (Exception e) {
			System.err.println(".env 파일 로드 실패: " + e.getMessage());
			// .env 파일이 없어도 기본값으로 실행
		}
		
		SpringApplication.run(OroraApplication.class, args);
	}

}
