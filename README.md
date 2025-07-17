# あらた釜山 (ARATA BUSAN) 🌊

> **새로운 부산을 발견하다** - 부산의 숨겨진 보석 같은 관광지와 특별한 경험을 찾아보세요

[![GitHub](https://img.shields.io/badge/GitHub-ORORAproject-blue)](https://github.com/QCoQCo/ORORAproject)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)](https://github.com/QCoQCo/ORORAproject/releases)

## 📖 프로젝트 소개

**あらた釜山**은 부산 관광 정보를 제공하는 종합 웹 플랫폼입니다. 일본어로 "새로운"을 의미하는 "あらた(아라타)"와 부산을 결합하여, 기존과는 다른 새로운 시각으로 부산의 매력을 소개하는 인터랙티브 관광 가이드입니다.

### 🎯 주요 목표
- 부산 16개 구·군의 708개 관광지 정보 체계적 제공
- 해시태그 기반 스마트 검색 시스템
- 카카오맵 연동을 통한 실시간 위치 기반 서비스
- 사용자 친화적 반응형 웹 인터페이스
- 관리자 시스템을 통한 효율적 콘텐츠 관리

## ✨ 주요 기능

### 🏖️ 다중 검색 시스템
- **지역별 검색**: 부산 16개 구·군별 관광지 정보 및 인터랙티브 지도
- **해시태그 검색**: 50+ 개의 태그를 통한 맞춤형 관광지 추천
- **테마별 검색**: K-POP 여행, 해변, 산/공원, 문화, 전통시장, 쇼핑 등 큐레이션된 테마

### 🗺️ 카카오맵 연동 서비스
- 실시간 지도 기반 관광지 표시
- 카테고리별 마커 필터링 (해변, 산/공원, 문화, 음식, 쇼핑)
- 해시태그 기반 자동 카테고리 분류 시스템
- 관광지 상세 정보 및 위치 안내

### 🎨 인터랙티브 사용자 경험
- **Hero 슬라이더**: 부산의 아름다운 풍경 5개 이미지 자동 전환
- **스크롤 애니메이션**: Intersection Observer API 활용
- **반응형 디자인**: 모든 디바이스 최적화
- **부산 사계절 섹션**: 인터랙티브 계절별 관광 정보

### 📱 상세 페이지 기능
- **Swiper 이미지 갤러리**: 관광지 고해상도 이미지 슬라이더
- **인터랙션 기능**: 좋아요, 조회수, 북마크, 공유 기능
- **소셜 기능**: 사용자 리뷰 및 평점 시스템
- **편의 기능**: 지도 연동, 인쇄, 저장 기능

### 👥 사용자 관리 시스템
- **회원가입/로그인**: 아이디 저장 기능 포함
- **권한 관리**: 일반사용자/관리자 역할 구분
- **관리자 대시보드**: 관광지 관리, 사용자 관리, 통계 기능
- **사용자 프로필**: 개인정보 및 활동 이력 관리

### 🏛️ 부산 소개 섹션
- **기본 정보**: 부산시 현황 및 지리적 특성
- **캐릭터**: 부산시 공식 캐릭터 '부기' 소개
- **목표 및 비전**: 부산시 발전 계획
- **상징**: 시 꽃, 나무, 새 등 부산의 상징물

## 🛠️ 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업 및 웹 접근성 고려
- **CSS3**: Custom Properties, Flexbox, Grid, 애니메이션
- **JavaScript (ES6+)**: 모듈화, 비동기 처리, DOM 조작
- **Pretendard Font**: 한국어 최적화 웹폰트

### Libraries & APIs
- **Kakao Maps API**: 지도 서비스 및 위치 정보
- **Swiper.js**: 터치 지원 슬라이더 컴포넌트
- **Font Awesome**: 벡터 아이콘 라이브러리
- **Intersection Observer API**: 스크롤 기반 애니메이션

### Data Management
- **JSON**: 관광지 및 사용자 데이터 구조화
- **로컬 스토리지**: 사용자 세션 및 설정 관리
- **모듈식 컴포넌트**: 헤더, 푸터, 사이드네비 등 재사용 컴포넌트

### Design System
- **CSS Custom Properties**: 일관된 디자인 토큰
- **Mobile-First**: 반응형 디자인 접근법
- **BEM 방법론**: CSS 클래스 네이밍 컨벤션

## 📁 프로젝트 구조

```
PJ01/
├── components/           # 재사용 가능한 HTML 컴포넌트
│   ├── header.html       # 네비게이션 헤더
│   ├── footer.html       # 사이트 푸터
│   ├── list-item.html    # 관광지 리스트 아이템
│   └── sidenav-busan.html # 부산 지역 사이드 네비게이션
├── css/                  # 스타일시트 파일
│   ├── reset.css         # CSS 초기화
│   ├── header.css        # 헤더 스타일
│   ├── footer.css        # 푸터 스타일
│   ├── index.css         # 메인페이지 스타일
│   ├── searchBy/         # 검색 페이지 스타일
│   │   ├── place.css     # 지역별 검색
│   │   └── theme.css     # 테마별 검색
│   ├── kakaoMap/         # 카카오맵 스타일
│   └── detailPage.css    # 상세페이지 스타일
├── js/                   # JavaScript 파일
│   ├── index.js          # 메인페이지 인터랙션
│   ├── header-loader.js  # 컴포넌트 로더
│   ├── footer-loader.js  # 푸터 로더
│   ├── kakaoMap/         # 카카오맵 기능
│   │   └── script.js     # 지도 API 처리
│   ├── searchBy/         # 검색 기능
│   │   └── place.js      # 지역별 검색 로직
│   ├── login.js          # 로그인 기능
│   ├── admin.js          # 관리자 기능
│   └── detailPage.js     # 상세페이지 인터랙션
├── pages/                # 개별 HTML 페이지
│   ├── about-busan/      # 부산 소개 섹션
│   │   ├── busan.html    # 부산 메인 소개
│   │   ├── basisinfo.html # 기본 정보
│   │   ├── character.html # 캐릭터 소개
│   │   ├── goals.html    # 목표 및 비전
│   │   └── symbol.html   # 상징물 소개
│   ├── about-orora/      # 팀 소개
│   │   └── orora-introduce.html
│   ├── search-place/     # 검색 페이지
│   │   ├── place.html    # 지역별 검색
│   │   ├── tag.html      # 태그별 검색
│   │   └── theme.html    # 테마별 검색
│   ├── detailed/         # 상세 정보
│   │   ├── detailed.html # 카카오맵 페이지
│   │   └── detailPage.html # 관광지 상세
│   ├── login/            # 인증 페이지
│   │   ├── login.html    # 로그인
│   │   └── signup.html   # 회원가입
│   ├── admin/            # 관리자 페이지
│   │   └── admin.html    # 관리자 대시보드
│   └── tip/              # 여행 팁
│       └── tip.html
├── data/                 # JSON 데이터 파일
│   ├── busanTouristSpots.json # 708개 관광지 데이터
│   ├── userReview.json   # 사용자 리뷰 데이터
│   └── users.json        # 사용자 계정 정보
├── images/               # 이미지 리소스
│   ├── 2025(1-26).jpg    # 관광지 이미지
│   ├── common(1-36).jpg  # 공통 이미지
│   ├── cafe(1-22).jpg    # 카페 이미지
│   └── main_*.jpg        # 메인 슬라이더 이미지
└── index.html            # 메인 페이지
```

## 🚀 시작하기

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/QCoQCo/ORORAproject.git
   cd ORORAproject
   ```

2. **카카오맵 API 키 설정**
   ```javascript
   // js/kakaoMap/script.js에서 API 키 설정
   // Kakao Developers에서 발급받은 JavaScript 키 입력
   ```

3. **로컬 서버 실행**
   ```bash
   # Python 3.x 사용
   python -m http.server 8000
   
   # Node.js http-server 사용
   npx http-server -p 8000
   
   # VS Code Live Server 확장 사용 (권장)
   ```

4. **브라우저에서 접속**
   ```
   http://localhost:8000
   ```

### 환경 설정

- **카카오맵 API**: [Kakao Developers](https://developers.kakao.com/)에서 API 키 발급 필요
- **브라우저 호환성**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **해상도 지원**: 320px ~ 2560px (모바일 ~ 데스크탑)

## 📱 페이지별 기능 상세

### 메인 페이지 (`index.html`)
- **Hero 슬라이더**: 5개 부산 대표 이미지 자동 전환
- **네비게이션 카드**: 주요 기능 바로가기
- **부산 소개**: 거리, 교통, 여행팁 정보
- **사계절 섹션**: 계절별 부산 여행 추천

### 지역별 검색 (`pages/search-place/place.html`)
- **인터랙티브 지도**: 16개 구·군 선택형 지도
- **실시간 필터링**: 선택 지역의 관광지 즉시 표시
- **리스트뷰**: 카드 형태의 관광지 정보

### 태그별 검색 (`pages/search-place/tag.html`)
- **카테고리 필터**: 관광명소, 자연/공원, 문화/역사 등
- **해시태그 클라우드**: 인기 태그 시각화
- **동적 검색**: 태그 조합을 통한 정밀 검색

### 테마별 검색 (`pages/search-place/theme.html`)
- **큐레이션 테마**: K-POP 여행 등 특별 기획
- **테마 그리드**: 시각적 테마 선택
- **추천 루트**: 테마별 관광 코스

### 카카오맵 페이지 (`pages/detailed/detailed.html`)
- **실시간 지도**: 모든 관광지 마커 표시
- **카테고리 필터**: 해변, 산/공원, 문화, 음식, 쇼핑
- **마커 클러스터링**: 지역별 관광지 그룹화
- **상세 정보 팝업**: 클릭 시 관광지 상세 정보

### 상세 페이지 (`pages/detailed/detailPage.html`)
- **이미지 갤러리**: Swiper 기반 고해상도 이미지
- **인터랙션**: 좋아요, 조회수, 북마크, 공유
- **사용자 리뷰**: 평점 및 후기 시스템
- **편의 기능**: 지도 보기, 인쇄, 저장

### 관리자 페이지 (`pages/admin/admin.html`)
- **관광지 관리**: 추가, 수정, 삭제 기능
- **사용자 관리**: 회원 정보 및 권한 관리
- **통계 대시보드**: 방문자 및 인기 관광지 통계
- **콘텐츠 관리**: 이미지 및 정보 업데이트

## 👥 팀 ORORA 소개

**오로라(ORORA)**는 부산의 새로운 매력을 발견하고 전달하는 것을 목표로 하는 5인 개발팀입니다. 다양한 색깔과 개성을 가진 팀원들이 모여 하나의 아름다운 오로라처럼 협력하여 프로젝트를 완성했습니다.

| 팀원 | 역할 | 담당 영역 | GitHub |
|------|------|-----------|--------|
| 강용훈 | 팀장 | 프로젝트 총괄, 시스템 설계 | [@QCoQCo](https://github.com/QCoQCo) |
| 이종우 | 백엔드 개발 | 데이터 구조, API 연동 | [@jongw0o0](https://github.com/jongw0o0) |
| 이지안 | 프론트엔드 개발 | UI/UX, 반응형 디자인 | [@jian080](https://github.com/jian080) |
| 정유진 | 풀스택 개발 | 지도 연동, 검색 기능 | [@levihisoka](https://github.com/levihisoka) |
| 조유정 | 디자인 및 기획 | 콘텐츠 기획, 사용자 경험 | [@JOYJ125](https://github.com/JOYJ125) |

## 🌟 기술적 특징

### 🎨 사용자 경험 (UX)
- **직관적 네비게이션**: 3단계 검색 방식 (지역/태그/테마)
- **반응형 디자인**: 모바일 퍼스트 접근법
- **접근성**: WCAG 2.1 AA 준수
- **로딩 최적화**: 이미지 지연 로딩, 컴포넌트 비동기 로딩

### 🔍 검색 및 필터링
- **다중 검색 엔진**: 3가지 독립적 검색 방식
- **실시간 필터링**: 즉시 결과 업데이트
- **해시태그 시스템**: 50+ 개 태그 기반 분류
- **지도 연동**: 위치 기반 검색 결과

### 📊 데이터 관리
- **구조화된 JSON**: 708개 관광지 체계적 분류
- **해시태그 매핑**: 자동 카테고리 분류 알고리즘
- **사용자 데이터**: 역할 기반 권한 관리
- **성능 최적화**: 지연 로딩 및 캐싱

### 🔧 개발 도구 및 방법론
- **모듈화**: 컴포넌트 기반 개발
- **버전 관리**: Git 브랜치 전략
- **코드 품질**: ESLint, Prettier 적용
- **반응형 테스트**: 다양한 디바이스 호환성 검증

## 📊 프로젝트 통계

- **관광지 데이터**: 708개 (16개 구·군)
- **이미지 리소스**: 200+ 개 고해상도 이미지
- **해시태그**: 50+ 개 분류 태그
- **페이지 수**: 20+ 개 완성된 페이지
- **컴포넌트**: 10+ 개 재사용 컴포넌트

## 🚀 주요 성과

### 기술적 성과
- ✅ 완전한 반응형 웹사이트 구현
- ✅ 카카오맵 API 완전 연동
- ✅ 3가지 검색 시스템 구현
- ✅ 사용자 관리 시스템 구축
- ✅ 관리자 대시보드 개발

### 사용자 경험 성과
- ✅ 직관적 3단계 검색 시스템
- ✅ 모바일 최적화 (100% 반응형)
- ✅ 빠른 로딩 속도 (이미지 최적화)
- ✅ 접근성 준수 (키보드 네비게이션)

## 📄 라이선스 및 저작권

이 프로젝트는 교육 목적으로 제작되었습니다. 

### 이미지 저작권
- 부산시 공식 이미지: 부산광역시청 제공
- 관광지 사진: 각 출처 표기
- 캐릭터 이미지: 부산시 공식 캐릭터 '부기'

### 데이터 출처
- 관광지 정보: 부산관광공사, 한국관광공사
- 지도 서비스: 카카오맵 API

**면책조항**: 모든 관광 정보는 참고용이며, 실제 여행 계획 시 공식 기관 정보를 확인해주세요.

## 🤝 기여하기

프로젝트 개선에 기여하고 싶으시다면:

1. **Fork** 프로젝트
2. **Feature 브랜치** 생성 (`git checkout -b feature/AmazingFeature`)
3. **변경사항 커밋** (`git commit -m 'Add some AmazingFeature'`)
4. **브랜치에 Push** (`git push origin feature/AmazingFeature`)
5. **Pull Request** 생성

### 기여 가이드라인
- 코드 스타일: Prettier 설정 준수
- 커밋 메시지: [Conventional Commits](https://www.conventionalcommits.org/) 형식
- 이슈 리포트: 버그 또는 기능 요청 시 상세한 설명 포함

## 📞 연락처 및 지원

- **프로젝트 링크**: [https://github.com/QCoQCo/ORORAproject](https://github.com/QCoQCo/ORORAproject)
- **이슈 리포트**: [GitHub Issues](https://github.com/QCoQCo/ORORAproject/issues)
- **기능 요청**: [GitHub Discussions](https://github.com/QCoQCo/ORORAproject/discussions)

### 버그 리포트
버그를 발견하셨다면 다음 정보와 함께 이슈를 등록해주세요:
- 사용 브라우저 및 버전
- 재현 단계
- 예상 결과 vs 실제 결과
- 스크린샷 (가능한 경우)

---

**© 2025 arataBUSAN by Team ORORA. All rights reserved.**

*부산의 새로운 매력을 발견하는 여정에 함께해주세요! 🌊*

---

### 🏗️ 개발 진행 상황

- [x] 프로젝트 기획 및 설계
- [x] 메인 페이지 개발
- [x] 검색 시스템 구현 (지역/태그/테마)
- [x] 카카오맵 API 연동
- [x] 상세 페이지 개발
- [x] 사용자 관리 시스템
- [x] 관리자 페이지
- [x] 반응형 디자인 적용
- [x] 성능 최적화
- [x] 브라우저 호환성 테스트
- [x] 배포 및 운영

**프로젝트 완료일**: 2025년 7월 