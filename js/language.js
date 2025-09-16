// 다국어 지원 시스템
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'ko';
        this.translations = {};
        this.init();
    }

    async init() {
        // 언어별 번역 데이터 로드
        await this.loadTranslations();
        this.applyLanguage(this.currentLanguage);
        this.setupLanguageSelector();
    }

    async loadTranslations() {
        try {
            // 영어 번역 데이터 로드
            const enResponse = await fetch('/data/translations-en.json');
            this.translations.en = await enResponse.json();

            // 일본어 번역 데이터 로드
            const jpResponse = await fetch('/data/translations-jp.json');
            this.translations.jp = await jpResponse.json();

            // 한국어는 기본값으로 사용
            this.translations.ko = this.getKoreanTexts();
        } catch (error) {
            console.error('번역 데이터 로드 실패:', error);
        }
    }

    getKoreanTexts() {
        // 현재 페이지의 한국어 텍스트들을 수집
        return {
            // 헤더
            'header.about_busan': 'about BUSAN',
            'header.busan_today': '부산의 오늘',
            'header.busan_symbol': '부산의 상징',
            'header.communication_character': '소통 캐릭터',
            'header.tourist_search': '부산 관광지 검색',
            'header.region_search': '지역 검색',
            'header.tag_search': '관광지 태그 검색',
            'header.theme_search': '관광지 테마 검색',
            'header.orora_intro': '오로라 소개',
            'header.travel_tips': '여행팁',
            'header.admin': '관리자',
            'header.login': '로그인',
            'header.search': '검색',
            'header.search_placeholder': '검색어를 입력하세요.',

            // 메인 페이지
            'main.hero_title': 'あらた釜山',
            'main.hero_subtitle': '새로운 부산을 발견하다',
            'main.hero_description': '부산의 숨겨진 보석 같은 관광지와 특별한 경험을 찾아보세요',
            'main.travel_guide': '부산 여행 가이드',
            'main.about_busan': '부산 소개',
            'main.about_busan_desc': '부산의 역사와 문화를 알아보세요',
            'main.tourist_search': '관광지 검색',
            'main.tourist_search_desc': '부산의 다양한 관광명소를 찾아보세요',
            'main.detailed_info': '상세 정보',
            'main.detailed_info_desc': '관광지의 자세한 정보를 확인하세요',
            'main.tag_search': '태그 검색',
            'main.tag_search_desc': '태그로 원하는 관광지를 찾아보세요',
            'main.theme_search': '테마 검색',
            'main.theme_search_desc': '테마별로 부산을 탐험해보세요',
            'main.recommended_list': '추천 리스트',
            'main.recommended_list_desc': '엄선된 부산 여행 코스를 확인하세요',

            // 일본인 소개 섹션
            'japanese.welcome_title': '日本の皆様、釜山へようこそ！',
            'japanese.welcome_subtitle': '일본 여러분, 부산에 오신 것을 환영합니다!',
            'japanese.description':
                '부산은 일본에서 가장 가까운 한국의 대도시입니다. 후쿠오카에서 고속선으로 단 3시간이면 도착할 수 있는 매력적인 관광 도시입니다.',
            'japanese.history_culture': '역사와 문화',
            'japanese.history_culture_desc':
                '일본과 깊은 역사적 연관이 있는 부산의 문화유산을 만나보세요',
            'japanese.delicious_food': '맛있는 음식',
            'japanese.delicious_food_desc': '부산의 신선한 해산물과 한국 전통 요리를 경험해보세요',
            'japanese.easy_travel': '쉬운 여행',
            'japanese.easy_travel_desc':
                '일본어 안내와 친절한 서비스로 편안한 부산 여행을 도와드립니다',
            'japanese.route_description':
                '고속선으로 후쿠오카에서 부산까지\n가장 빠르고 편리한 여행',
            'japanese.special_services': '🌟 일본인 관광객을 위한 특별 서비스',
            'japanese.japanese_guide': '일본어 관광 안내 서비스',
            'japanese.yen_payment': '엔화 사용 가능 매장 정보',
            'japanese.japanese_accommodation': '일본식 숙박시설 추천',
            'japanese.busan_pass_discount': '부산 관광패스 할인 혜택',
            'japanese.tourists_per_year': '연간 일본인 관광객',
            'japanese.travel_time': '후쿠오카에서 소요시간',
            'japanese.warm_weather': '따뜻한 부산 날씨',
            'japanese.recommended_spots': '추천 관광지',
            'japanese.history_culture': '역사와 문화',
            'japanese.history_culture_desc':
                '일본과 깊은 역사적 연관이 있는 부산의 문화유산을 만나보세요',
            'japanese.delicious_food': '맛있는 음식',
            'japanese.delicious_food_desc': '부산의 신선한 해산물과 한국 전통 요리를 경험해보세요',
            'japanese.easy_travel': '쉬운 여행',
            'japanese.easy_travel_desc':
                '일본어 안내와 친절한 서비스로 편안한 부산 여행을 도와드립니다',
            'japanese.route_description':
                '고속선으로 후쿠오카에서 부산까지\n가장 빠르고 편리한 여행',
            'japanese.special_services': '🌟 일본인 관광객을 위한 특별 서비스',
            'japanese.japanese_guide': '일본어 관광 안내 서비스',
            'japanese.yen_payment': '엔화 사용 가능 매장 정보',
            'japanese.japanese_accommodation': '일본식 숙박시설 추천',
            'japanese.busan_pass_discount': '부산 관광패스 할인 혜택',

            // 계절 섹션
            'seasons.title': '부산의 계절',
            'seasons.spring': '봄',
            'seasons.spring_desc': '벚꽃이 만개하는 아름다운 부산의 봄',
            'seasons.summer': '여름',
            'seasons.summer_desc': '시원한 바다와 해변을 만끽하는 여름',
            'seasons.fall': '가을',
            'seasons.fall_desc': '단풍으로 물든 부산의 가을 정취',
            'seasons.winter': '겨울',
            'seasons.winter_desc': '따뜻한 부산에서 즐기는 겨울 여행',

            // 체험 섹션
            'experience.title': '부산에서 꼭 해야 할 체험',
            'experience.food_tour': '부산 음식 탐방',
            'experience.food_tour_desc':
                '돼지국밥, 밀면, 씨앗호떡 등 부산만의 특별한 맛을 경험해보세요',
            'experience.beach_activity': '해변 액티비티',
            'experience.beach_activity_desc':
                '해운대, 광안리 해수욕장에서 즐기는 다양한 해양 레저 활동',
            'experience.culture_art': '문화 예술 체험',
            'experience.culture_art_desc': '감천문화마을, 벽화골목에서 만나는 부산의 예술과 문화',
            'experience.skyline': '스카이 라인',
            'experience.skyline_desc': '부산 에어크루즈와 송도 스카이워크에서 즐기는 하늘 여행',
            'experience.shopping': '쇼핑 & 엔터테인먼트',
            'experience.shopping_desc': '신세계센텀시티, 롯데백화점에서 즐기는 쇼핑과 엔터테인먼트',
            'experience.night_view': '야경 명소',
            'experience.night_view_desc': '광안대교, 부산항대교에서 감상하는 부산의 아름다운 야경',

            // 교통 섹션
            'transport.title': '부산 교통 가이드',
            'transport.intro_title': '편리한 부산 교통 시스템',
            'transport.intro_desc':
                '부산은 지하철, 버스, 택시 등 다양한 교통수단으로 쉽게 이동할 수 있습니다. 일본인 관광객을 위한 특별한 교통 서비스도 제공됩니다.',
            'transport.card_title': '부산 교통카드',
            'transport.card_desc': '지하철, 버스, 택시에서 사용 가능한 통합 교통카드',
            'transport.card_feature1': '✓ 지하철 + 버스 환승 할인',
            'transport.card_feature2': '✓ 관광지 입장료 할인',
            'transport.card_feature3': '✓ 일본어 안내 서비스',
            'transport.pass24_title': '24시간 패스',
            'transport.pass24_desc': '하루 종일 무제한 이용 가능한 교통 패스',
            'transport.pass24_feature1': '✓ 지하철 + 버스 무제한',
            'transport.pass24_feature2': '✓ 관광 명소 할인',
            'transport.pass24_feature3': '✓ 24시간 유효',
            'transport.pass48_title': '48시간 패스',
            'transport.pass48_desc': '2일간 이용 가능한 관광객 전용 패스',
            'transport.pass48_feature1': '✓ 48시간 무제한 이용',
            'transport.pass48_feature2': '✓ 관광지 입장료 할인',
            'transport.pass48_feature3': '✓ 일본어 관광 지도 제공',
            'transport.apps_title': '유용한 교통 앱',
            'transport.kakao_map': '카카오맵',
            'transport.kakao_map_desc': '실시간 교통 정보와 길찾기',
            'transport.kakao_bus': '카카오버스',
            'transport.kakao_bus_desc': '실시간 버스 도착 정보',
            'transport.kakao_subway': '카카오지하철',
            'transport.kakao_subway_desc': '지하철 노선도 및 시간표',
            'transport.kakao_taxi': '카카오택시',
            'transport.kakao_taxi_desc': '간편한 택시 호출 서비스',
        };
    }

    async applyLanguage(language) {
        // 현재 언어와 같으면 애니메이션 없이 리턴
        if (this.currentLanguage === language) return;

        // 로딩 애니메이션 시작
        this.showLoadingAnimation();

        // 애니메이션 시간을 위한 딜레이
        await new Promise((resolve) => setTimeout(resolve, 100));

        this.currentLanguage = language;
        localStorage.setItem('selectedLanguage', language);

        // HTML lang 속성 변경
        document.documentElement.lang = language === 'ko' ? 'ko' : language === 'en' ? 'en' : 'ja';

        // 모든 번역 가능한 요소 업데이트
        this.updateElements();

        // 애니메이션 완료 후 로딩 화면 숨기기
        setTimeout(() => {
            this.hideLoadingAnimation();
        }, 1500);
    }

    updateElements() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach((element) => {
            const key = element.getAttribute('data-translate');
            const translation = this.getTranslation(key);
            if (translation) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    getTranslation(key) {
        const translation = this.translations[this.currentLanguage]?.[key];
        return translation || this.translations.ko?.[key] || key;
    }

    setupLanguageSelector() {
        const languageSelector = document.getElementById('lang');
        if (languageSelector) {
            languageSelector.value = this.currentLanguage;
            languageSelector.addEventListener('change', (e) => {
                this.applyLanguage(e.target.value);
            });
        }
    }

    // 특정 키의 번역을 가져오는 메서드
    translate(key) {
        return this.getTranslation(key);
    }

    // 로딩 애니메이션 표시
    showLoadingAnimation() {
        console.log('로딩 애니메이션 시작');
        const loadingElement = document.getElementById('languageLoading');
        if (loadingElement) {
            console.log('로딩 엘리먼트 찾음');
            loadingElement.classList.add('active');

            // 애니메이션을 다시 시작하기 위해 클래스 재설정
            const waveOverlay = loadingElement.querySelector('.wave-overlay');
            const logoWrapper = loadingElement.querySelector('.logoWrapper');
            const loadingLogo = loadingElement.querySelector('.loading-logo');
            const logoText = loadingElement.querySelector('.logo-text');

            if (waveOverlay && logoWrapper) {
                // 기존 애니메이션 제거
                waveOverlay.style.animation = 'none';
                logoWrapper.style.animation = 'none';
                if (loadingLogo) loadingLogo.style.animation = 'none';
                if (logoText) logoText.style.animation = 'none';

                // 강제로 리플로우를 발생시켜 DOM 업데이트
                void waveOverlay.offsetHeight;
                void logoWrapper.offsetHeight;
                if (loadingLogo) void loadingLogo.offsetHeight;
                if (logoText) void logoText.offsetHeight;

                // 약간의 딜레이 후 애니메이션 다시 추가
                setTimeout(() => {
                    waveOverlay.style.animation = 'logoSlide 1.5s ease';
                    logoWrapper.style.animation = 'upAndDown 1.5s ease infinite';
                    if (loadingLogo) loadingLogo.style.animation = 'spin2 1.5s ease';
                    if (logoText) logoText.style.animation = 'upAndDown 1.5s ease infinite';
                }, 50);
            }
        }
    }

    // 로딩 애니메이션 숨기기
    hideLoadingAnimation() {
        const loadingElement = document.getElementById('languageLoading');
        if (loadingElement) {
            loadingElement.classList.remove('active');
        }
    }
}

// 전역 언어 관리자 인스턴스
window.languageManager = new LanguageManager();
