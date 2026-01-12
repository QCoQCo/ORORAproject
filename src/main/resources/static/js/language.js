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
        // 초기화 시에는 애니메이션 없이 번역 적용
        this.applyLanguage(this.currentLanguage, true);

        // 헤더가 로드된 후 언어 선택기 설정
        this.setupLanguageSelectorWithRetry();
    }

    // 현재 페이지 위치에 따른 데이터 경로 결정
    getDataPath() {
        // Spring Boot 정적 리소스는 /static/ 폴더에서 루트 경로로 제공됨
        // 따라서 /lang/ 경로로 직접 접근
        return '/lang/';
    }

    async loadTranslations() {
        try {
            // 현재 페이지 위치에 따른 데이터 경로 결정
            const dataPath = this.getDataPath();
            console.log('번역 데이터 경로:', dataPath);

            // 영어 번역 데이터 로드
            const enUrl = `${dataPath}translations-en.json`;
            console.log('영어 번역 파일 로드 시도:', enUrl);
            const enResponse = await fetch(enUrl);
            if (!enResponse.ok) {
                throw new Error(`영어 번역 파일 로드 실패: ${enResponse.status} ${enResponse.statusText}`);
            }
            this.translations.en = await enResponse.json();
            console.log('영어 번역 데이터 로드 완료');

            // 일본어 번역 데이터 로드
            const jpUrl = `${dataPath}translations-jp.json`;
            console.log('일본어 번역 파일 로드 시도:', jpUrl);
            const jpResponse = await fetch(jpUrl);
            if (!jpResponse.ok) {
                throw new Error(`일본어 번역 파일 로드 실패: ${jpResponse.status} ${jpResponse.statusText}`);
            }
            this.translations.jp = await jpResponse.json();
            console.log('일본어 번역 데이터 로드 완료');

            // 한국어는 기본값으로 사용
            this.translations.ko = this.getKoreanTexts();
            console.log('모든 번역 데이터 로드 완료');
        } catch (error) {
            console.error('번역 데이터 로드 실패:', error);
            console.error('에러 상세:', error.message);
            // 에러가 발생해도 기본 한국어 텍스트는 사용 가능하도록
            this.translations.ko = this.getKoreanTexts();
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
            'japanese.stat_tourists_number': '200만+',
            'japanese.stat_travel_time': '3시간',
            'japanese.stat_weather_days': '365일',
            'japanese.stat_spots_count': '100+',
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

            // 부산 소개 페이지
            'about.title': 'about BUSAN',
            'about.hero_title': '부산의 오늘',
            'about.hero_subtitle': '부산의 역사와 문화를 만나보세요',
            'about.description': '부산은 대한민국 제2의 도시이자 최대의 항구도시입니다.',
            'about.history': '역사',
            'about.culture': '문화',
            'about.tourism': '관광',
            'about.economy': '경제',

            // 지역별 검색 페이지
            'place.title': '부산 지역별 관광지',
            'place.subtitle': '지도에서 원하는 지역을 선택하여 관광지를 탐색해보세요',
            'place.control_toggle': '지역 선택 옵션',
            'place.selection_info': '지도에서 지역을 클릭하여 선택/해제할 수 있습니다.',
            'place.district_filter': '구/군 필터',
            'place.all_districts': '전체',
            'place.search_placeholder': '관광지명을 입력하세요',
            'place.search_button': '검색',

            // 태그 검색 페이지
            'tag.title': '부산 관광지 태그 검색',
            'tag.category_label': '카테고리 선택:',
            'tag.category_all': '전체',
            'tag.category_attraction': '관광명소',
            'tag.category_nature': '자연/공원',
            'tag.category_culture': '문화/역사',
            'tag.category_food': '먹거리/시장',
            'tag.category_activity': '액티비티',
            'tag.category_shopping': '쇼핑',
            'tag.category_relaxation': '휴식/힐링',
            'tag.search_label': '태그 검색',
            'tag.search_placeholder': '예: 해수욕장, 야경, 카페, 가족여행...',
            'tag.search_button': '검색',
            'tag.popular_tags': '인기 태그',
            'tag.clear_all': '전체 해제',

            // 테마 검색 페이지
            'theme.title': '오로라 추천 테마',
            'theme.subtitle': '부산 대표 관광지',
            'theme.more_button': '더보기',

            // 여행팁 페이지
            'tip.transportation': '교통 · 지도',
            'tip.pass': '패스권',
            'tip.reservation': '식당 예약',
            'tip.delivery': '배달',
            'tip.photobooth': '포토부스',
            'tip.transportation_title': '교통 · 지도 · 패스권',
            'tip.transportation_section': '교통 · 지도',
            'tip.map_apps': '지도 앱',
            'tip.transportation_apps': '교통 앱',
            'tip.pass_section': '패스권',
            'tip.reservation_section': '식당 예약',
            'tip.delivery_section': '배달',
            'tip.photobooth_section': '포토부스',

            'tip.foreign_card_guide': '외국인 교통카드 구매법 :',
            'tip.card_purchase_desc':
                '선불 충전식 교통카드를 편의점(GS25, CU, 세븐일레븐, 이마트24 등)에서 구매할 수 있습니다',
            'tip.card_usage_desc':
                '카드 구매 후, 편의점이나 지하철 역사 등에서 현금으로 충전하여 사용합니다',
            'tip.transport_app_recommend': '교통 어플 추천',
            'tip.map_app_recommend': '지도 어플 추천',
            'tip.kakao_bus': '카카오버스',
            'tip.kakao_bus_desc':
                '버스의 현재 위치와 도착 예정 시간을 실시간으로 확인할 수 있어 편리합니다',
            'tip.kakao_bus_feature':
                '설정한 정류장 도착 전에 하차 알림을 받을 수 있어 처음 가는 길도 안심하고 이용할 수 있습니다',
            'tip.kakao_subway': '카카오지하철',
            'tip.kakao_subway_desc': '출발역과 도착역을 설정하면 최적의 경로를 신속하게 안내합니다',
            'tip.kakao_subway_feature':
                '카카오지하철 앱에서 카카오버스 노선 정보 및 도착 정보를 연동하여 확인할 수 있습니다',
            'tip.kakao_taxi': '카카오 T',
            'tip.kakao_taxi_desc':
                '미리 택시를 예약할 수 있어 원하는 시간과 장소에 맞춰 이용할 수 있습니다',
            'tip.kakao_taxi_feature':
                '외국인 전용 플랫폼 k.ride가 있어서 한국 전화번호나 한국 카드가 없어도 카카오 택시를 이용할 수 있습니다',
            'tip.naver_map': '네이버지도',
            'tip.naver_map_desc':
                '주변 정보 검색을 통해 주변 음식점, 카페, 편의점 등 다양한 시설 정보를 쉽게 얻을 수 있습니다',
            'tip.naver_map_feature':
                '가고 싶은 장소들을 주제별로 저장할수 있어 지도에서 보기가 편리합니다',
            'tip.kakao_map': '카카오맵',
            'tip.kakao_map_desc': '실시간 대중교통 정보의 정확성이 높습니다',
            'tip.kakao_map_feature':
                '지도를 확대하면 지하철의 움직임을 실시간으로 확인할 수 있어 정보를 직관적으로 확인할 수 있습니다',
            'tip.usage_method': '사용 방법',
            'tip.usage_method_foreigner': '사용 방법(외국인)',

            'tip.visit_busan_pass': '비짓부산패스',
            'tip.pass_desc': '부산 주요 유료 관광시설 42곳을 이용할 수 있습니다',
            'tip.pass_facilities':
                '주요 관광시설 : 송도해상케이블카, 해운대 블루라인파크 해변열차, 시티투어버스 이용권 등',
            'tip.pass_transport': '교통카드 기능까지 연계되어 부산 여행의 편의를 제공합니다',
            'tip.pass_types': '시간제한형 2종, 수량제한형 2종으로 나뉘어 있습니다',
            'tip.time_limited': '시간제한형',
            'tip.time_limited_desc':
                '추가비용 없이 제한된 시간 내 무료가맹점으로 등록된 관광시설을 자유롭게 관람, 입장, 이용하는 방식',
            'tip.quantity_limited': '수량제한형',
            'tip.quantity_limited_desc':
                '등록된 무료가맹점을 3곳 또는 5곳을 선택하여 자유롭게 이용하는 방식',
            'tip.pass_24h': 'VISIT BUSAN PASS 24H',
            'tip.pass_48h': 'VISIT BUSAN PASS 48H',
            'tip.pass_big3': 'VISIT BUSAN PASS BIG3',
            'tip.pass_big5': 'VISIT BUSAN PASS BIG5',
            'tip.purchase_method': '구매 방법',
            'tip.purchase_desc':
                '비짓부산패스 홈페이지에서 구매하거나 부산패스 어플에서 구매하실 수 있습니다',
            'tip.pickup_location': '수령처(카드 구매시)',
            'tip.pickup_desc':
                '부산시 공식 여행안내소, 부산은행 지정 지점, 키오스크에서 카드를 수령하실 수 있습니다',
            'tip.card_usage':
                '카드 패스 : 실물 카드 패스를 매표소에 제시하시면 무료 티켓 또는 할인 혜택을 받으실 수 있습니다',
            'tip.mobile_usage':
                '모바일 패스 : 매표소에서 모바일 패스를 제시하시면 무료 티켓 또는 할인 혜택을 받으실 수 있습니다',

            'tip.convenience': '편의',
            'tip.restaurant_reservation': '식당 예약',
            'tip.remote_waiting': '원격 웨이팅',
            'tip.waiting_desc':
                '인기 맛집의 경우, 직접 줄을 서지 않고 앱으로 원격 웨이팅을 신청하여 순서를 기다릴 수 있습니다',
            'tip.real_time_queue':
                '실시간으로 매장 입장 순서를 확인할 수 있어 효율적인 시간 관리가 가능합니다',
            'tip.reservation_apps': '식당 예약어플 추천',
            'tip.tabling': '테이블링',
            'tip.tabling_desc':
                '테이블링 앱을 통해 메뉴 주문부터 결제까지 간편하게 처리할 수 있습니다',
            'tip.tabling_feature':
                '매장별 대기 시간, 메뉴 정보, 예약 가능 여부 등을 앱 내에서 쉽게 확인할 수 있습니다',
            'tip.catch_table': '캐치테이블',
            'tip.catch_table_desc':
                '외국인 전용 어플이 있어서 외국인들도 편리하게 이용할 수 있습니다',
            'tip.catch_table_feature':
                '원격으로 웨이팅 등록을 하고, 실시간으로 대기 현황을 확인할 수 있어 시간을 효율적으로 활용할 수 있습니다',

            'tip.delivery': '배달',
            'tip.delivery_desc':
                '한국의 빠른 서비스 문화를 그대로 반영하여, 주문 후 30분~1시간 이내에 음식을 받아보는 것이 일반적입니다',
            'tip.late_night_delivery': '24시간 배달',
            'tip.late_night_desc':
                '늦은 시간 야식 배달이 매우 활성화되어 있어 24시간 배달이 가능한 음식점도 많습니다',
            'tip.motorcycle_delivery':
                '오토바이를 이용한 배달 라이더 시스템이 매우 잘 갖춰져 있습니다',
            'tip.delivery_apps': '배달어플 추천',
            'tip.baemin': '배달의민족',
            'tip.baemin_desc':
                '다양한 음식점, 카페, 편의점 등 광범위한 가맹점 네트워크를 보유하고 있습니다',
            'tip.baemin_feature':
                '비회원 해외카드 결제가 가능하여 외국인들도 서비스를 이용할 수 있습니다',
            'tip.shuttle_delivery': '셔틀딜리버리',
            'tip.shuttle_desc': '한국 전화번호 없이 가입이 가능하고 PayPal 사용이 가능합니다',

            'tip.photobooth': '포토부스',
            'tip.photobooth_desc':
                "한국에서 네컷사진은 단순히 사진을 찍는 행위를 넘어, 친구나 연인과 함께 소품을 활용하고 다양한 포즈를 취하며 추억을 만드는 '놀이 문화'로 자리 잡았습니다",
            'tip.natural_editing':
                '과도한 보정보다는 자연스러운 피부 보정이나 얼굴형 보정 기능이 주를 이룹니다',
            'tip.self_photo_booth':
                '24시간 무인 셀프 사진관이 대부분이라 언제든지 이용할 수 있습니다',
            'tip.photo_apps': '포토부스 추천',
            'tip.photoism': '포토이즘',
            'tip.photoism_desc':
                '포토이즘 스튜디오, 박스, 컬러드 등 목적과 취향에 따라 선택할 수 있는 옵션이 많습니다',
            'tip.photoism_feature':
                '유명 연예인들과 활발한 콜라보를 통해 다양한 한정판 프레임을 제공합니다',
            'tip.life_four_cuts': '인생네컷',
            'tip.life_four_cuts_desc': "'네컷사진'의 원조이자 가장 대중적인 브랜드 입니다",
            'tip.life_four_cuts_feature':
                '인생네컷 어플에서 자신만의 프레임을 제작하여 사용할 수 있습니다',

            'tag.popular_tags': '인기 태그',
            'tag.all_tags': '전체 태그',
            'tag.selected_tags': '선택된 태그',
            'tag.search_results': '검색 결과',
            'tag.sort_relevance': '관련도순',
            'tag.sort_name': '이름순',
            'tag.sort_region': '지역순',
            'tag.load_more': '더보기',
            'tag.clear_all_tags': '모든 태그 지우기',

            'theme.user_recommended': '유저 추천 테마',
            'theme.kpop_travel': 'K-POP 여행',
            'theme.culture_travel': '문화 여행',
            'theme.nature_travel': '자연 여행',
            'theme.food_travel': '음식 여행',
            'theme.shopping_travel': '쇼핑 여행',

            'place.busan_region_map': '부산 지역 지도',
            'place.click_region_desc': '지역을 클릭하여 관광지를 확인하세요',
            'place.busan_attractions': '부산 관광지',
            'place.clear_all': '전체 해제',
            'place.view_selected': '선택된 지역 보기',

            // 오로라 팀 소개
            'orora.title': '오로라 소개',
            'orora.vision_title': '우리의 비전',
            'orora.vision_content':
                '오로라는 다섯 명의 개성 넘치는 팀원들이 모여 밤하늘을 수놓는 오로라처럼 다채로운 빛깔의 아이디어와 혁신적인 해결책을 제시합니다. 각기 다른 강점과 시각을 지닌 팀원들이 조화를 이루어, 하나의 목표를 향해 나아갈 때 최상의 시너지를 발휘합니다. 마치 빛의 스펙트럼이 어우러져 경이로운 장관을 연출하듯이, 오로라는 고정관념을 깨고 새로운 가능성을 탐구하며 기대를 뛰어넘는 결과물을 만들어낼 것입니다.',
            'orora.arata_busan': 'ARATA BUSAN',
            'orora.arata_busan_desc':
                "ARATA BUSAN은 단순한 여행 가이드가 아닙니다. 일본어로 '새로움'을 의미하는 'あらた'와 부산 사투리로 '알았다'는 깨달음을 담은 '아라따'의 중의적인 의미처럼 일본인 관광객 여러분에게 부산의 숨겨진 매력을 '새롭게' 발견하고, 깊이 있는 '알았다'는 감동을 선사하고자 합니다. 평범한 명소를 넘어, 부산의 다채로운 면모를 오감으로 경험하고 진정한 부산의 매력을 알아갈 수 있도록 돕겠습니다. ARATA BUSAN과 함께라면 여러분은 부산을 새롭게 알아가는 여정 속에서 잊지 못할 추억과 진정한 감동을 만끽하실 수 있을 겁니다. 부산이 선사하는 새로운 이야기들을 지금 바로 ARATA BUSAN에서 경험해보세요!",
            'orora.team_intro': '팀원 소개',
            'orora.team_leader': '조장',
            'orora.team_member': '조원',
            'orora.kang_yonghoon': '강용훈',
            'orora.lee_jongwoo': '이종우',
            'orora.lee_jian': '이지안',
            'orora.jung_yujin': '정유진',
            'orora.cho_yujung': '조유정',
            'orora.lee_jongwoo_work1': '이 페이지 작성',
            'orora.lee_jongwoo_work2': '여행팁 페이지 작성',
            'orora.lee_jongwoo_work3': '여행팁 페이지 탭기능 구현',
            'orora.lee_jongwoo_work4': '그 외 여행팁 페이지 js구현',
            'orora.lee_jian_work1': 'tag페이지 담당',
            'orora.lee_jian_work2': '테그별 관광지 목록 제작',
            'orora.lee_jian_work3':
                '주제를 빠르게 탐색할 수 있도록 각 태그에 링크를 연결해 이동이 가능하도록 구현',
            'orora.lee_jian_work4': '이미지와 함께 배치하여, 사용자가 내용을 확인할 수 있도록 함',
            'orora.jung_yujin_work1': '부산의 오늘 페이지 제작',
            'orora.jung_yujin_work2': '부산의 상징 페이지 제작',
            'orora.jung_yujin_work3': '소통 캐릭터 페이지 제작',
            'orora.jung_yujin_work4': '세부 디자인 수정',
            'orora.cho_yujung_work1': '관광지 상세페이지 작성',
            'orora.cho_yujung_work2': '로그인페이지 작성',
            'orora.cho_yujung_work3': '회원가입페이지 작성',
            'orora.cho_yujung_work4': '빠진부분찾기',

            // Footer
            'footer.description1': '새로운 부산을 발견하다',
            'footer.description2': '부산의 숨겨진 매력을 함께 찾아보세요',
            'footer.quick_links': '빠른 링크',
            'footer.about_busan': '부산 소개',
            'footer.region_tourist': '지역별 관광지',
            'footer.tag_search': '태그별 검색',
            'footer.theme_search': '테마별 검색',
            'footer.project_info': '프로젝트 정보',
            'footer.orora_team': '오로라 팀 소개',
            'footer.travel_tips': '여행 팁',
            'footer.development_period': '개발 기간: 2025년 7월',
            'footer.platform_info': '부산 관광 정보 플랫폼',
            'footer.copyright': '© 2025 arataBUSAN by Team ORORA. All rights reserved.',
            'footer.disclaimer': '본 사이트는 교육 목적으로 제작되었습니다. 관광 정보는 참고용이며, 실제 여행 계획 시 공식 기관 정보를 확인해주세요.',
        };
    }

    async applyLanguage(language, skipAnimation = false) {
        console.log(
            `applyLanguage 호출: ${language}, skipAnimation: ${skipAnimation}, 현재 언어: ${this.currentLanguage}`
        );

        // 현재 언어와 같고 애니메이션을 건너뛰지 않는 경우에만 리턴
        if (this.currentLanguage === language && !skipAnimation) {
            console.log('언어가 같아서 리턴');
            return;
        }

        // 애니메이션을 건너뛰지 않는 경우에만 로딩 애니메이션 시작
        if (!skipAnimation) {
            this.showLoadingAnimation();
            // 애니메이션 시간을 위한 딜레이
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        this.currentLanguage = language;
        localStorage.setItem('selectedLanguage', language);
        console.log(`언어 변경됨: ${language}`);

        // HTML lang 속성 변경
        document.documentElement.lang = language === 'ko' ? 'ko' : language === 'en' ? 'en' : 'ja';

        // 모든 번역 가능한 요소 업데이트
        this.updateElements();

        // 애니메이션을 건너뛰지 않는 경우에만 로딩 화면 숨기기
        if (!skipAnimation) {
            setTimeout(() => {
                this.hideLoadingAnimation();
            }, 1500);
        }
    }

    updateElements() {
        const elements = document.querySelectorAll('[data-translate]');
        console.log(
            `번역 적용 중: ${this.currentLanguage} 언어로 ${elements.length}개 요소 업데이트`
        );
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
        console.log('번역 적용 완료');
    }

    getTranslation(key) {
        const translation = this.translations[this.currentLanguage]?.[key];
        return translation || this.translations.ko?.[key] || key;
    }

    setupLanguageSelector() {
        const languageSelector = document.getElementById('lang');
        if (languageSelector) {
            languageSelector.value = this.currentLanguage;

            // 기존 이벤트 리스너 제거 후 새로 추가
            languageSelector.removeEventListener('change', this.handleLanguageChange);
            this.handleLanguageChange = (e) => {
                this.applyLanguage(e.target.value);
            };
            languageSelector.addEventListener('change', this.handleLanguageChange);
        }
    }

    // 언어 선택기를 재시도하는 함수
    setupLanguageSelectorWithRetry(retryCount = 0) {
        const languageSelector = document.getElementById('lang');
        if (languageSelector) {
            // 언어 선택기를 찾았으면 설정
            languageSelector.value = this.currentLanguage;

            // 기존 이벤트 리스너 제거 후 새로 추가
            languageSelector.removeEventListener('change', this.handleLanguageChange);
            this.handleLanguageChange = (e) => {
                this.applyLanguage(e.target.value);
            };
            languageSelector.addEventListener('change', this.handleLanguageChange);

            console.log('언어 선택기 설정 완료:', this.currentLanguage);
        } else if (retryCount < 50) {
            // 최대 5초간 재시도 (50 * 100ms)
            // 언어 선택기를 찾지 못했으면 100ms 후 재시도
            console.log(`언어 선택기를 찾지 못했습니다. 재시도 중... (${retryCount + 1}/50)`);
            setTimeout(() => {
                this.setupLanguageSelectorWithRetry(retryCount + 1);
            }, 100);
        } else {
            console.warn('언어 선택기를 찾을 수 없습니다. 헤더가 로드되지 않았을 수 있습니다.');
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
            const logoText = loadingElement.querySelector('.logoText');

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
