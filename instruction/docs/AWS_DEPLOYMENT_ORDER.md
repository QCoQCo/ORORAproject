# ORORA 프로젝트 AWS 배포 작업 순서

Spring Boot + MySQL + 파일 업로드 구조를 기준으로 한 AWS 배포 단계입니다.

---

## 1. 사전 준비 (로컬)

| 순서 | 작업 | 설명 |
|------|------|------|
| 1-1 | **프로파일 분리** | `application.yaml`에 `spring.profiles.active: prod` 또는 `application-prod.yaml` 생성해 운영 전용 설정 분리 |
| 1-2 | **환경변수 정리** | `.env` 대신 AWS에서 쓸 변수 목록 정리: `DB_*`, `KAKAO_*`, `GOOGLE_*`, `KAKAO_MAP_API_KEY` |
| 1-3 | **JAR 빌드 검증** | `./gradlew bootJar`로 JAR 생성 후 로컬에서 `java -jar build/libs/*.jar` 실행 확인 |
| 1-4 | **.env 제거 의존** | 배포 시 `.env` 파일 없이 동작하도록 환경변수/시크릿만으로 기동 가능한지 확인 (OroraApplication의 dotenv는 `ignoreIfMissing()`이므로, 환경변수만 설정하면 됨) |

---

## 2. AWS 계정 및 네트워크

| 순서 | 작업 | 설명 |
|------|------|------|
| 2-1 | **AWS 계정** | 계정 생성, MFA 설정, 결제/알림 설정 |
| 2-2 | **리전 선택** | 서비스할 리전 결정 (예: `ap-northeast-2` 서울) |
| 2-3 | **VPC** | 기본 VPC 사용 또는 새 VPC 생성 (퍼블릭/프라이빗 서브넷 구성) |
| 2-4 | **보안 그룹** | RDS용(3306), 애플리케이션/ALB용(80, 443) 보안 그룹 규칙 정의 |

---

## 3. 데이터베이스 (RDS MySQL)

| 순서 | 작업 | 설명 |
|------|------|------|
| 3-1 | **RDS 인스턴스 생성** | MySQL 8.x, 인스턴스 클래스·스토리지 크기 결정 |
| 3-2 | **서브넷/보안 그룹** | RDS를 프라이빗 서브넷에 두고, 애플리케이션 서버에서만 3306 접근 허용 |
| 3-3 | **파라미터 그룹** | 타임존 등 필요 시 파라미터 그룹 설정 (예: `time_zone=UTC`) |
| 3-4 | **DB 생성·초기화** | DB 이름 생성 후, 로컬 스키마/마이그레이션으로 테이블 생성 및 초기 데이터 반영 |
| 3-5 | **연결 정보 보관** | 엔드포인트, 포트, DB 이름, 사용자/비밀번호를 시크릿 또는 환경변수로 관리할 수 있게 정리 |

---

## 4. 애플리케이션 호스팅

**옵션 A: Amazon EC2**

| 순서 | 작업 | 설명 |
|------|------|------|
| 4A-1 | **EC2 인스턴스** | Amazon Linux 2023 또는 Ubuntu, Java 17 설치 |
| 4A-2 | **JAR 배포** | SCP/SFTP, CodeDeploy, 또는 CI에서 `build/libs/*.jar` 업로드 |
| 4A-3 | **systemd 서비스** | `java -jar`로 기동하는 서비스 유닛 작성, 재부팅 시 자동 기동 |
| 4A-4 | **리버스 프록시** | Nginx 또는 Apache로 80/443 수신 후 로컬 Spring Boot(8080)로 프록시 |

**옵션 B: AWS Elastic Beanstalk**

| 순서 | 작업 | 설명 |
|------|------|------|
| 4B-1 | **EB 환경 생성** | Java 17 플랫폼, Tomcat 또는 “Java SE” 타입 선택 |
| 4B-2 | **JAR 업로드** | `eb deploy` 또는 콘솔에서 JAR 업로드 |
| 4B-3 | **환경 변수** | EB 콘솔 또는 `.ebextensions`에서 DB/OAuth/카카오맵 등 환경변수 설정 |

---

## 5. 환경 변수 및 시크릿

| 순서 | 작업 | 설명 |
|------|------|------|
| 5-1 | **필수 변수 목록** | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `KAKAO_MAP_API_KEY`, `KAKAO_CLIENT_*`, `GOOGLE_CLIENT_*` (리다이렉트 URI 포함) |
| 5-2 | **설정 방법** | EC2: systemd 유닛의 `Environment=` 또는 `/etc/environment` 등; Beanstalk: 환경 속성; ECS: 태스크 정의의 환경변수 |
| 5-3 | **비밀값** | AWS Secrets Manager 또는 Systems Manager Parameter Store에 DB 비밀번호 등 저장 후, 인스턴스/컨테이너에서 참조하도록 구성 (선택) |

---

## 6. 파일 업로드 스토리지 (권장: S3)

| 순서 | 작업 | 설명 |
|------|------|------|
| 6-1 | **S3 버킷 생성** | 업로드 전용 버킷 생성, 버전 관리/라이프사이클 정책 결정 |
| 6-2 | **IAM 정책** | 애플리케이션이 S3에 PutObject/GetObject 등 수행할 수 있는 역할/정책 부여 |
| 6-3 | **코드 수정** | 현재 로컬 경로(`upload/spots`, `upload/profiles`, `upload/reviews`) 대신 S3 업로드/URL 생성 로직 추가 (FileService 등) |
| 6-4 | **URL 서빙** | S3 객체 URL(퍼블릭 또는 서명된 URL) 또는 CloudFront를 통해 이미지 제공 |

*S3 도입 전까지는 EC2/Beanstalk 인스턴스의 디스크에 `upload/` 디렉터리를 두고 `application-prod.yaml`에서 절대 경로로 지정해도 됨. 단, 인스턴스 재생성 시 파일 유실을 막으려면 S3 또는 EFS 권장.*

---

## 7. 도메인 및 HTTPS

| 순서 | 작업 | 설명 |
|------|------|------|
| 7-1 | **도메인** | Route 53에서 도메인 구매 또는 호스팅 영역 생성 후 NS 설정 |
| 7-2 | **SSL 인증서** | AWS Certificate Manager(ACM)에서 인증서 요청 (도메인 검증) |
| 7-3 | **ALB/리버스 프록시** | ALB에 ACM 인증서 연결, 443 리스너 추가 후 타깃을 EC2/Beanstalk으로 지정 |
| 7-4 | **OAuth 리다이렉트 URI** | 카카오/구글 개발자 콘솔에 배포 도메인 기반 리다이렉트 URI 추가 (예: `https://your-domain.com/login/oauth2/code/kakao`) |

---

## 8. 배포 및 검증

| 순서 | 작업 | 설명 |
|------|------|------|
| 8-1 | **첫 배포** | JAR 배포 후 애플리케이션 기동, 로그에서 DB 연결·OAuth 초기화 확인 |
| 8-2 | **헬스 체크** | 메인 페이지, 로그인, API 호출이 정상 동작하는지 확인 |
| 8-3 | **세션/쿠키** | `application-prod.yaml`에서 `server.servlet.session.cookie.secure: true` 등 운영 환경에 맞게 설정 |
| 8-4 | **모니터링** | CloudWatch 로그, RDS/EC2 지표, 알람 설정 |

---

## 9. 요약: 권장 진행 순서 (한 줄 플로우)

1. 로컬에서 **JAR 빌드·프로파일 정리**  
2. **AWS 계정·리전·VPC·보안 그룹**  
3. **RDS MySQL 생성·스키마 적용·연결 정보 확보**  
4. **EC2 또는 Elastic Beanstalk**로 애플리케이션 호스팅  
5. **환경 변수/시크릿**으로 DB·OAuth·카카오맵 설정  
6. **파일 업로드**: 당장은 로컬 경로, 이후 **S3** 전환 권장  
7. **도메인·ACM·ALB**로 HTTPS 및 OAuth 리다이렉트 URI 반영  
8. **배포·동작 검증·모니터링**  

---

## 참고: 현재 프로젝트에서 필요한 환경변수

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
- `KAKAO_MAP_API_KEY`
- `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `KAKAO_REDIRECT_URI`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`

배포 시 `.env` 파일 없이 위 변수만 환경에 설정하면 `OroraApplication`의 dotenv 로드는 생략되고 시스템 프로퍼티/환경변수만 사용할 수 있습니다.
