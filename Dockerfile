# 1단계: 빌드 환경 (Builder)
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# Gradle 관련 파일 및 소스 코드 복사
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
COPY src src

# gradlew 실행 권한 부여 및 애플리케이션 빌드
# (테스트를 생략하여 빌드 속도를 높입니다)
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# 2단계: 실행 환경 (Runner)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 빌드 단계에서 생성된 jar 파일을 복사
COPY --from=builder /app/build/libs/*-SNAPSHOT.jar app.jar

# JVM 메모리 최적화 옵션 (프리티어 메모리 부족 방지)
ENV JAVA_OPTS="-Xms512m -Xmx512m -XX:+UseZGC"

# Spring Boot 서버 포트 개방
EXPOSE 8080

# 컨테이너 실행 명령어
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]
