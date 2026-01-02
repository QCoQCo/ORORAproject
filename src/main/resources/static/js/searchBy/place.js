/*************************
 * 상태 관리
 *************************/
const selectedRegionIds = new Set();

/*************************
 * 초기 진입
 *************************/
document.addEventListener('DOMContentLoaded', () => {
    loadMap();
});

/*************************
 * 지도 로드
 *************************/
function loadMap() {
    const mapContainer = document.getElementById('mapSvg');
    if (!mapContainer) return;

    fetch('/images/map.svg')
        .then(res => res.text())
        .then(svg => {
            mapContainer.innerHTML = svg;
            bindRegionClick();
        })
        .catch(err => {
            console.error(err);
            mapContainer.innerHTML = '지도를 로드할 수 없습니다.';
        });
}

/*************************
 * 지도 클릭 이벤트 바인딩
 *************************/
function bindRegionClick() {
    const regions = document.querySelectorAll('.c-click');

    regions.forEach(region => {
        region.addEventListener('click', () => {
            const regionId = Number(region.getAttribute('sigungu-code'));
            const regionName = region.getAttribute('sigungu-name');

            if (selectedRegionIds.has(regionId)) {
                // 선택 해제
                selectedRegionIds.delete(regionId);
                region.classList.remove('selected');
            } else {
                // 선택
                selectedRegionIds.add(regionId);
                region.classList.add('selected');
            }

            console.log('선택된 지역:', [...selectedRegionIds]);

            fetchRegionSpots([...selectedRegionIds]);
            updateSelectionInfo();
        });
    });
}

/*************************
 * API 호출 (다중 지역)
 *************************/
async function fetchRegionSpots(regionIds) {
    const ul = document.getElementById('tourist-spots-list');
    ul.innerHTML = '';

    if (regionIds.length === 0) {
        ul.innerHTML = '<li>지도에서 지역을 클릭하면 관광지가 나옵니다.</li>';
        return;
    }

    try {
        const query = regionIds.join(',');
        const res = await fetch(`/api/regions/spots?regionIds=${query}`);
        if (!res.ok) throw new Error('API 터짐');

        const spots = await res.json();
        console.log('API 응답:', spots);

        renderSpotList(spots);
    } catch (e) {
        console.error(e);
        ul.innerHTML = '<li>관광지 데이터를 불러오지 못했습니다.</li>';
    }
}

/*************************
 * 관광지 리스트 렌더링
 *************************/
function renderSpotList(spots) {
    const ul = document.getElementById('tourist-spots-list');
    ul.innerHTML = '';

    if (!spots || spots.length === 0) {
        ul.innerHTML = '<li>관광지가 없습니다.</li>';
        return;
    }

    spots.forEach(spot => {
        const li = document.createElement('li');
        li.textContent = spot.title; // DTO 기준
        ul.appendChild(li);
    });
}

/*************************
 * 선택 정보 텍스트
 *************************/
function updateSelectionInfo() {
    const info = document.getElementById('selection-info');
    if (!info) return;

    if (selectedRegionIds.size === 0) {
        info.textContent = '지역을 클릭해 선택하세요.';
    } else {
        info.textContent = `선택된 지역 수: ${selectedRegionIds.size}`;
    }
}