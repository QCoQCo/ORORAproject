// 카카오맵 초기화
let map;
let markers = [];
let currentCategory = 'all';
let busanTouristSpots = {};

// 해시태그 기반 카테고리 매핑
const hashtagToCategory = {
    해수욕장: 'beach',
    해변: 'beach',
    바다: 'beach',
    해안: 'beach',
    산: 'mountain',
    공원: 'mountain',
    등산: 'mountain',
    자연: 'mountain',
    사찰: 'culture',
    문화: 'culture',
    역사: 'culture',
    전통: 'culture',
    박물관: 'culture',
    영화: 'culture',
    시장: 'food',
    먹거리: 'food',
    맛집: 'food',
    음식: 'food',
    쇼핑: 'shopping',
    백화점: 'shopping',
    상가: 'shopping',
    쇼핑몰: 'shopping',
};

// 해시태그로 카테고리 추정
function getCategoryFromHashtags(hashtags) {
    if (!hashtags || !Array.isArray(hashtags)) return 'culture';

    for (const hashtag of hashtags) {
        const cleanTag = hashtag.trim();
        for (const [keyword, category] of Object.entries(hashtagToCategory)) {
            if (cleanTag.includes(keyword)) {
                return category;
            }
        }
    }
    return 'culture'; // 기본값
}

async function loadTouristSpots() {
    try {
        // TODO: 백엔드 연결 시 수정 필요 - API 엔드포인트로 변경
        // 예: const response = await fetch('/api/tourist-spots');
        const response = await fetch('../../data/busanTouristSpots.json');
        if (!response.ok) {
            throw new Error('JSON 파일을 불러올 수 없습니다.');
        }
        const data = await response.json();
        busanTouristSpots = data.regions || {};
    } catch (error) {
        console.error('관광지 데이터 로드 실패:', error);
    }
}

async function initMap() {
    // 부산 중심 좌표 (부산시청 기준)
    const busanCenter = new kakao.maps.LatLng(35.1796, 129.0756);

    // 지도 옵션
    const mapOption = {
        center: busanCenter,
        level: 8, // 확대 레벨 (1~14, 숫자가 작을수록 확대)
    };

    // 지도 생성
    map = new kakao.maps.Map(document.getElementById('map'), mapOption);

    // 지도 타입 컨트롤 추가 (일반지도, 스카이뷰)
    const mapTypeControl = new kakao.maps.MapTypeControl();
    map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

    // 확대/축소 컨트롤 추가
    const zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

    // 관광지 데이터 로드 후 마커 표시
    await loadTouristSpots();

    // 모든 관광지 표시
    showAllTouristSpots();
}

function showAllTouristSpots() {
    clearMarkers();

    Object.values(busanTouristSpots).forEach((region) => {
        if (region.spots && Array.isArray(region.spots)) {
            region.spots.forEach((spot) => {
                createMarker(spot);
            });
        }
    });

    updateActiveButton('all');
}

function showTouristSpots(category) {
    currentCategory = category;

    if (category === 'all') {
        showAllTouristSpots();
        return;
    }

    clearMarkers();

    // 모든 지역을 순회하면서 해당 카테고리의 관광지 찾기
    Object.values(busanTouristSpots).forEach((region) => {
        if (region.spots && Array.isArray(region.spots)) {
            region.spots.forEach((spot) => {
                const spotCategory = getCategoryFromHashtags(spot.hashtags);
                if (spotCategory === category) {
                    createMarker(spot);
                }
            });
        }
    });

    updateActiveButton(category);
}

function createMarker(spot) {
    // 새로운 JSON 구조에는 lat, lng가 없으므로 임시 좌표 사용
    // 실제 사용시에는 각 관광지의 실제 좌표를 추가해야 함
    const defaultCoords = {
        '해동 용궁사': { lat: 35.1884, lng: 129.2231 },
        '기장 해안선': { lat: 35.2448, lng: 129.2224 },
        금정산: { lat: 35.2558, lng: 129.0162 },
        범어사: { lat: 35.2558, lng: 129.0162 },
        '해운대 해수욕장': { lat: 35.1587, lng: 129.1603 },
        '부산국제영화제 거리': { lat: 35.0969, lng: 129.0348 },
        '신세계 센텀시티': { lat: 35.1691, lng: 129.1309 },
        동래온천: { lat: 35.2063, lng: 129.0856 },
        동래읍성: { lat: 35.2063, lng: 129.0856 },
        구포시장: { lat: 35.2063, lng: 129.0856 },
        김해공항: { lat: 35.1795, lng: 128.9384 },
        강서습지생태공원: { lat: 35.1795, lng: 128.9384 },
        삼락생태공원: { lat: 35.1901, lng: 128.9695 },
        '서면 지하상가': { lat: 35.1579, lng: 129.0594 },
        부평깡통시장: { lat: 35.1579, lng: 129.0594 },
        UN기념공원: { lat: 35.1368, lng: 129.0969 },
        이기대공원: { lat: 35.1368, lng: 129.0969 },
        몰운대: { lat: 35.0944, lng: 128.9692 },
        '동구 전망대': { lat: 35.1147, lng: 129.0456 },
        송도해수욕장: { lat: 35.0757, lng: 129.0175 },
        감천문화마을: { lat: 35.0976, lng: 129.0107 },
        자갈치시장: { lat: 35.0969, lng: 129.0304 },
        국제시장: { lat: 35.0969, lng: 129.0304 },
        용두산공원: { lat: 35.1007, lng: 129.032 },
        '온천천 시민공원': { lat: 35.1631, lng: 129.0751 },
        '연산동 맛집거리': { lat: 35.1631, lng: 129.0751 },
        '광안리 해수욕장': { lat: 35.1533, lng: 129.1186 },
        광안대교: { lat: 35.1533, lng: 129.1186 },
        태종대: { lat: 35.051, lng: 129.0864 },
        흰여울문화마을: { lat: 35.051, lng: 129.0864 },
    };

    const coords = defaultCoords[spot.title] || { lat: 35.1796, lng: 129.0756 };
    const position = new kakao.maps.LatLng(coords.lat, coords.lng);

    // 마커 이미지
    const category = getCategoryFromHashtags(spot.hashtags);
    const markerImageSrc = getMarkerImageSrc(category);
    const markerImage = new kakao.maps.MarkerImage(markerImageSrc, new kakao.maps.Size(30, 35));

    // 마커 생성
    const marker = new kakao.maps.Marker({
        position: position,
        map: map,
        image: markerImage,
    });

    const categoryColor = getCategoryColor(category);

    // 인포윈도우 내용
    const infoWindowContent = `
        <div style="padding:10px; min-width:200px; font-family: 'Pretendard', sans-serif;">
            <h3 style="margin:0 0 8px 0; color:#333; font-size:16px; font-weight:600;">${
                spot.title
            }</h3>
            <p style="margin:0 0 8px 0; color:#666; font-size:14px; line-height:1.4;">${
                spot.description
            }</p>
            <div style="margin-top:8px;">
                ${
                    spot.hashtags
                        ? spot.hashtags
                              .map(
                                  (tag) =>
                                      `<span style="display:inline-block; background:${categoryColor}; color:white; padding:2px 6px; border-radius:12px; font-size:12px; margin-right:4px; margin-bottom:2px;">${tag}</span>`
                              )
                              .join('')
                        : ''
                }
            </div>
        </div>
    `;

    const infoWindow = new kakao.maps.InfoWindow({
        content: infoWindowContent,
        removable: true,
    });

    // 마커 클릭 이벤트
    kakao.maps.event.addListener(marker, 'click', function () {
        closeAllInfoWindows();
        infoWindow.open(map, marker);
    });

    // 마커와 인포윈도우를 배열에 저장
    markers.push({
        marker: marker,
        infoWindow: infoWindow,
    });
}

function getMarkerImageSrc(category) {
    const markerImages = {
        beach: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png',
        mountain: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_green.png',
        culture: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
        food: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_yellow.png',
        shopping: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_purple.png',
    };

    return markerImages[category] || markerImages.culture;
}

function createCustomMarker(color) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 30;
    canvas.height = 35;

    // 마커 모양 그리기
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(15, 15, 12, 0, 2 * Math.PI);
    ctx.fill();

    return canvas.toDataURL();
}

function getCategoryColor(category) {
    const colors = {
        beach: '#4A90E2',
        mountain: '#7ED321',
        culture: '#D0021B',
        food: '#F5A623',
        shopping: '#9013FE',
    };

    return colors[category] || colors.culture;
}

function clearMarkers() {
    markers.forEach((item) => {
        item.marker.setMap(null);
    });
    markers = [];
}

function closeAllInfoWindows() {
    markers.forEach((item) => {
        item.infoWindow.close();
    });
}

function updateActiveButton(category) {
    // 모든 버튼의 active 클래스 제거
    document.querySelectorAll('.filter-btn').forEach((btn) => {
        btn.classList.remove('active');
    });

    // 선택된 카테고리 버튼에 active 클래스 추가
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// 페이지 로드 시 지도 초기화
document.addEventListener('DOMContentLoaded', function () {
    initMap();
});

// 윈도우 리사이즈 시 지도 크기 조정
window.addEventListener('resize', resizeMap);

function resizeMap() {
    if (map) {
        map.relayout();
    }
}
