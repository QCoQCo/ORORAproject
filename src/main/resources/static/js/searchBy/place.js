document.addEventListener('DOMContentLoaded', () => {
    loadMap();
});

// 지도 SVG를 불러오고 클릭 이벤트 바인딩
function loadMap() {
    const mapContainer = document.getElementById('mapSvg');
    if (!mapContainer) return;

    fetch('/images/map.svg')
        .then(res => res.text())
        .then(svgText => {
            mapContainer.innerHTML = svgText;
            bindRegionClick();
        })
        .catch(() => {
            mapContainer.innerHTML = '지도를 로드할 수 없습니다.';
        });
}

// 각 지역에 클릭 이벤트 바인딩
function bindRegionClick() {
    document.querySelectorAll('.c-click').forEach(region => {
        region.addEventListener('click', () => {
            const regionId = Number(region.getAttribute('sigungu-code'));
            console.log('클릭한 regionId:', regionId);
            fetchRegionSpots(regionId);
        });
    });
}

// 선택한 지역의 관광지 데이터를 가져와 렌더링
async function fetchRegionSpots(regionId) {
    const res = await fetch(`/api/regions/${regionId}/spots`);
    const spots = await res.json();
    console.log('받은 spots:', spots);
    renderSpotList(spots);
}

// 관광지 리스트 렌더링
function renderSpotList(spots) {
    const ul = document.getElementById('tourist-spots-list');
    ul.innerHTML = '';

    if (!spots || spots.length === 0) {
        ul.innerHTML = '<li>관광지가 없습니다.</li>';
        return;
    }

    spots.forEach(spot => {
        const li = document.createElement('li');
        li.textContent = spot.title;
        ul.appendChild(li);
    });
}