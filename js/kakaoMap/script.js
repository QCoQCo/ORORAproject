// 카카오맵 초기화
let map;
let markers = [];
let currentCategory = 'all';
let busanTouristSpots = {}; 


async function loadTouristSpots() {
    try {
        const response = await fetch('../../data/busanTouristSpots.json');
        if (!response.ok) {
            throw new Error('JSON 파일을 불러올 수 없습니다.');
        }
        busanTouristSpots = await response.json();
        console.log('관광지 데이터 로드 완료:', busanTouristSpots);
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
        level: 8 // 확대 레벨 (1~14, 숫자가 작을수록 확대)
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
    
    Object.values(busanTouristSpots).forEach(spots => {
        spots.forEach(spot => {
            createMarker(spot);
        });
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
    
    const spots = busanTouristSpots[category];
    if (spots) {
        spots.forEach(spot => {
            createMarker(spot);
        });
    }
    
    updateActiveButton(category);
}

function createMarker(spot) {
    const position = new kakao.maps.LatLng(spot.lat, spot.lng);
    
    // 마커 이미지
    const markerImageSrc = getMarkerImageSrc(spot.category);
    const markerImage = new kakao.maps.MarkerImage(markerImageSrc, new kakao.maps.Size(30, 35));
    
    // 마커 생성
    const marker = new kakao.maps.Marker({
        position: position,
        map: map,
        image: markerImage
    });


    const categoryColor = getCategoryColor(spot.category);


    const infoContent = `
        <div class="custom-overlay">
            <span class="category-tag" style="background-color: ${categoryColor};">${spot.category}</span>
            <h3>${spot.name}</h3>
            <p>${spot.description}</p>
        </div>
    `;


    const infowindow = new kakao.maps.InfoWindow({
        content: infoContent,
        removable: true
    });

    // 마커 클릭 이벤트
    kakao.maps.event.addListener(marker, 'click', function() {
        // 다른 정보창 닫기
        closeAllInfoWindows();
        
        // 현재 정보창 열기
        infowindow.open(map, marker);
        
        // 지도 중심을 마커 위치로 이동
        map.setCenter(position);
    });

    // 마커와 정보창을 배열에 저장
    markers.push({
        marker: marker,
        infowindow: infowindow
    });
}

function getMarkerImageSrc(category) {
    // 카테고리별 커스텀 색상 마커 (SVG 데이터 URI 사용)
    const colors = {
        '해변': createCustomMarker('#3498db'), 
        '산/공원': createCustomMarker('#27ae60'), 
        '문화': createCustomMarker('#e74c3c'), 
        '전통시장': createCustomMarker('#f39c12'), 
        '쇼핑': createCustomMarker('#9b59b6') 
    };
    
    return colors[category] || createCustomMarker('#e74c3c');
}

function createCustomMarker(color) {
    // SVG 마커 생성
    const svg = `
        <svg width="30" height="35" viewBox="0 0 30 35" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 20 15 20s15-11.716 15-20C30 6.716 23.284 0 15 0z" 
                  fill="${color}" stroke="#fff" stroke-width="2"/>
            <circle cx="15" cy="15" r="6" fill="#fff"/>
        </svg>
    `;
    
    // SVG를 base64로 인코딩하여 데이터 URI 생성
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

function getCategoryColor(category) {
    // 카테고리별 색상 반환 (마커와 동일한 색상)
    const colors = {
        '해변': '#3498db',   
        '산/공원': '#27ae60', 
        '문화': '#e74c3c',   
        '전통시장': '#f39c12',   
        '쇼핑': '#9b59b6'    
    };
    
    return colors[category] || '#e74c3c';
}

function clearMarkers() {
    markers.forEach(item => {
        item.marker.setMap(null);
    });
    markers = [];
}

function closeAllInfoWindows() {
    markers.forEach(item => {
        item.infowindow.close();
    });
}

function updateActiveButton(category) {
    document.querySelectorAll('.category-buttons button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = document.querySelector(`[onclick="showTouristSpots('${category}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

window.addEventListener('load', async function() {
    if (typeof kakao !== 'undefined' && kakao.maps) {
        await initMap();
    } else {
        console.error('카카오맵 API가 로드되지 않았습니다.');
    }
});

function resizeMap() {
    if (map) {
        map.relayout();
    }
}

window.addEventListener('resize', resizeMap);
