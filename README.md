# あらた釜山 (ARATA BUSAN) 🌊

> **새로운 부산을 발견하다** - 부산의 숨겨진 보석 같은 관광지와 특별한 경험을 찾아보세요

[![GitHub](https://img.shields.io/badge/GitHub-ORORAproject-blue)](https://github.com/QCoQCo/ORORAproject)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)](https://github.com/QCoQCo/ORORAproject/releases)

## 📖 프로젝트 소개

**あらた釜山**은 부산 관광 정보를 제공하는 웹 플랫폼입니다. 일본어로 "새로운"을 의미하는 "あらた(아라타)"와 부산을 결합하여, 기존과는 다른 새로운 시각으로 부산의 매력을 소개합니다.

### 🎯 주요 목표
- 부산의 다양한 관광지 정보를 체계적으로 제공
- 사용자 친화적인 인터페이스로 쉬운 관광지 검색
- 테마별, 지역별, 태그별 다양한 검색 옵션 제공
- 부산의 사계절 매력을 시각적으로 표현

## ✨ 주요 기능

### 🏖️ 관광지 검색
- **지역별 검색**: 부산 16개 구·군별 관광지 정보
- **태그별 검색**: 관심사에 따른 맞춤형 검색
- **테마별 검색**: 해변, 산/공원, 문화, 전통시장, 쇼핑 등

### 🗺️ 인터랙티브 지도
- 카카오맵 API를 활용한 실시간 지도 서비스
- 카테고리별 관광지 마커 표시
- 상세 정보 및 위치 안내

### 🎨 시각적 경험
- 부산의 아름다운 풍경을 담은 히어로 슬라이더
- 반응형 디자인으로 모든 기기에서 최적화된 경험
- 부산의 사계절을 표현한 인터랙티브 섹션

### 👥 사용자 관리
- 회원가입 및 로그인 시스템
- 관리자 페이지를 통한 콘텐츠 관리
- 사용자 권한별 차별화된 서비스

## 🛠️ 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: 현대적 스타일링 및 애니메이션
- **JavaScript (ES6+)**: 동적 인터랙션 및 API 연동
- **Pretendard Font**: 한국어 최적화 폰트

### API & Services
- **Kakao Maps API**: 지도 서비스 및 위치 정보
- **JSON**: 관광지 데이터 관리

### Design System
- **CSS Custom Properties**: 일관된 디자인 토큰
- **Responsive Design**: 모바일 퍼스트 접근법
- **Accessibility**: 웹 접근성 고려한 UI/UX

## 📁 프로젝트 구조

```
PJ01/
├── components/           # 재사용 가능한 컴포넌트
│   ├── header.html
│   ├── footer.html
│   ├── list-item.html
│   └── sidenav-busan.html
├── css/                 # 스타일시트
│   ├── reset.css
│   ├── header.css
│   ├── footer.css
│   ├── index.css
│   └── searchBy/
├── js/                  # JavaScript 파일
│   ├── index.js
│   ├── header-loader.js
│   ├── footer-loader.js
│   └── kakaoMap/
├── pages/               # 개별 페이지
│   ├── about-busan/     # 부산 소개
│   ├── about-orora/     # 팀 소개
│   ├── search-place/    # 검색 페이지
│   ├── detailed/        # 상세 정보
│   ├── login/           # 로그인/회원가입
│   └── admin/           # 관리자 페이지
├── data/                # 데이터 파일
│   ├── busanTouristSpots.json
│   └── users.json
├── images/              # 이미지 리소스
└── index.html           # 메인 페이지
```

## 🚀 시작하기

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/QCoQCo/ORORAproject.git
   cd ORORAproject
   ```

2. **로컬 서버 실행**
   ```bash
   # Python 3.x
   python -m http.server 8000
   
   # Node.js (http-server 패키지 필요)
   npx http-server -p 8000
   
   # Live Server (VS Code 확장) 사용 권장
   ```

3. **브라우저에서 접속**
   ```
   http://localhost:8000
   ```

### 환경 설정

- **카카오맵 API 키**: `js/kakaoMap/script.js`에서 API 키 설정 필요
- **브라우저 호환성**: Chrome, Firefox, Safari, Edge 최신 버전 지원

## 📱 페이지 구성

### 메인 페이지 (`index.html`)
- 히어로 슬라이더로 부산의 아름다운 풍경 소개
- 주요 기능별 네비게이션 카드
- 부산의 사계절 특징 소개

### 부산 소개 (`pages/about-busan/`)
- 부산의 역사와 문화
- 도시 비전과 목표
- 기본 현황 및 상징

### 관광지 검색 (`pages/search-place/`)
- 지역별 검색 (인터랙티브 지도)
- 태그별 검색
- 테마별 검색

### 상세 정보 (`pages/detailed/`)
- 카카오맵 기반 관광지 지도
- 카테고리별 필터링
- 상세 관광지 정보

## 👥 팀 ORORA 소개

**오로라**는 5명의 개발자가 모여 다양한 색깔과 개성을 가진 팀입니다.

| 이름 | 역할 | GitHub |
|------|------|--------|
| 강용훈 | 팀장 | [@QCoQCo](https://github.com/QCoQCo) |
| 이종우 | 팀원 | [@jongw0o0](https://github.com/jongw0o0) |
| 이지안 | 팀원 | [@jian080](https://github.com/jian080) |
| 정유진 | 팀원 | [@levihisoka](https://github.com/levihisoka) |
| 조유정 | 팀원 | [@JOYJ125](https://github.com/JOYJ125) |

## 🌟 주요 특징

### 🎨 디자인
- **모던 UI/UX**: 깔끔하고 직관적인 인터페이스
- **반응형 디자인**: 모든 디바이스에서 최적화된 경험
- **접근성**: 웹 접근성 가이드라인 준수

### 🔍 검색 기능
- **다중 검색 옵션**: 지역, 태그, 테마별 검색
- **실시간 필터링**: 동적 검색 결과 업데이트
- **지도 연동**: 위치 기반 관광지 정보

### 📊 관리 시스템
- **관리자 페이지**: 콘텐츠 및 사용자 관리
- **사용자 권한**: 역할별 차별화된 접근 권한
- **데이터 관리**: JSON 기반 효율적 데이터 구조

## 🔧 개발 정보

### 브라우저 지원
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 성능 최적화
- 이미지 최적화 및 지연 로딩
- CSS/JS 파일 최적화
- 반응형 이미지 적용

## 📄 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다. 모든 관광 정보는 참고용이며, 실제 여행 계획 시 공식 기관 정보를 확인해주세요.

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📞 연락처

- **프로젝트 링크**: [https://github.com/QCoQCo/ORORAproject](https://github.com/QCoQCo/ORORAproject)
- **이슈 리포트**: [GitHub Issues](https://github.com/QCoQCo/ORORAproject/issues)

---

**© 2025 arataBUSAN by Team ORORA. All rights reserved.**

*부산의 새로운 매력을 발견하는 여정에 함께해주세요! 🌊* 