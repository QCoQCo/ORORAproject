let listLoader = null;
let touristData = null;

/*************************
 * 상태 관리
 *************************/
const selectedRegionIds = new Set();

// 현재 페이지 위치에 따른 맵 경로 결정
function getMapPath() {
    const currentPath = window.location.pathname;
    const currentDir = window.location.pathname.split('/').slice(0, -1).join('/');

    // 루트 디렉토리인 경우
    if (currentPath === '/' || currentPath === '/index' || currentDir === '') {
        return './images/map.svg';
    }

    // pages 디렉토리 내부인 경우
    if (currentPath.includes('/pages/')) {
        return '../../images/map.svg';
    }

    // 기타 경우 (안전장치)
    return './images/map.svg';
}

// 현재 페이지 위치에 따른 데이터 경로 결정
function getDataPath() {
    const currentPath = window.location.pathname;
    const currentDir = window.location.pathname.split('/').slice(0, -1).join('/');

    // 루트 디렉토리인 경우
    if (currentPath === '/' || currentPath === '/index' || currentDir === '') {
        return './data/';
    }

    // pages 디렉토리 내부인 경우
    if (currentPath.includes('/pages/')) {
        return '../../data/';
    }

    // 기타 경우 (안전장치)
    return './data/';
}

// 컨트롤 패널 토글 기능 초기화
function initControlPanelToggle() {
    const toggleButton = document.getElementById('controlToggle');
    const controlContent = document.getElementById('controlContent');

    if (toggleButton && controlContent) {
        // 기본값: 접혀있음
        controlContent.classList.remove('active');
        toggleButton.classList.remove('active');

        toggleButton.addEventListener('click', function () {
            const isActive = controlContent.classList.contains('active');

            if (isActive) {
                // 접기
                controlContent.classList.remove('active');
                toggleButton.classList.remove('active');
            } else {
                // 펼치기
                controlContent.classList.add('active');
                toggleButton.classList.add('active');
            }
        });
    }
}

// 컨트롤 버튼 이벤트 초기화
function initControlButtons() {
    // 전체 해제 버튼
    const clearAllBtn = document.querySelector('.control-button-compact.btn-secondary-compact');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function () {
            // 모든 선택 해제
            selectedRegionIds.clear();

            // 지도에서 선택 표시 제거
            document.querySelectorAll('.c-click.selected').forEach((region) => {
                region.classList.remove('selected');
            });

            // 리스트 초기화
            const ul = document.getElementById('tourist-spots-list');
            if (ul) {
                ul.innerHTML =
                    '<li style="padding: 20px; text-align: center; color: #999;">지도에서 지역을 클릭하면 관광지가 나옵니다.</li>';
            }

            // 선택 정보 업데이트
            updateSelectionInfo();
        });
    }

    // 선택된 지역 보기 버튼
    const viewSelectedBtn = document.querySelector('.control-button-compact.btn-primary-compact');
    if (viewSelectedBtn) {
        viewSelectedBtn.addEventListener('click', function () {
            if (selectedRegionIds.size > 0) {
                fetchRegionSpots([...selectedRegionIds]);
            } else {
                alert('선택된 지역이 없습니다.');
            }
        });
    }
}

// 리스트 섹션 토글 기능 초기화
function initListToggle() {
    const listToggleBtn = document.getElementById('listToggleBtn');
    const listSection = document.querySelector('.list-section-sticky');

    if (listToggleBtn && listSection) {
        listToggleBtn.addEventListener('click', function () {
            listSection.classList.toggle('hidden');
        });
    }
}

// 리스트 섹션이 hero 섹션 위로 올라가지 않도록 처리
// function initListStickyBoundary() {
//     const listSection = document.querySelector('.list-section-sticky');
//     const heroSection = document.querySelector('.hero-section');

//     if (!listSection || !heroSection) return;

//     // 화면 크기에 따른 기본 top 값 반환
//     function getDefaultTop() {
//         const width = window.innerWidth;
//         if (width <= 480) return 10;
//         if (width <= 768) return 10;
//         if (width <= 1024) return 15;
//         return 110;
//     }

//     function updateListPosition() {
//         const heroBottom = heroSection.getBoundingClientRect().bottom;
//         const defaultTop = getDefaultTop();

//         // hero 섹션의 하단이 기본 top 값보다 크면 (아직 hero가 보이면)
//         // list를 hero 아래로 밀어냄
//         if (heroBottom > defaultTop) {
//             listSection.style.top = heroBottom + 'px';
//         } else {
//             listSection.style.top = defaultTop + 'px';
//         }
//     }

//     // 초기 위치 설정
//     updateListPosition();

//     // 스크롤 시 위치 업데이트
//     window.addEventListener('scroll', updateListPosition, { passive: true });

//     // 리사이즈 시 위치 업데이트
//     window.addEventListener('resize', updateListPosition, { passive: true });
// }

document.addEventListener('DOMContentLoaded', function () {
    // 컨트롤 패널 토글 기능 초기화
    initControlPanelToggle();

    // 컨트롤 버튼 이벤트 초기화
    initControlButtons();

    // 리스트 토글 기능 초기화
    initListToggle();

    // 리스트 섹션 스크롤 경계 초기화
    // initListStickyBoundary();

    // 지도 로드
    loadMap();
});

/*************************
 * 지도 로드
 *************************/
function loadMap() {
    const mapContainer = document.getElementById('mapSvg');
    if (!mapContainer) {
        console.error('mapSvg 요소를 찾을 수 없습니다.');
        return;
    }

    const mapPath = getMapPath();

    fetch(mapPath)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.text();
        })
        .then((svg) => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;

            // 파서 오류 확인
            const parserError = svgDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('SVG 파싱 오류');
            }

            // 기존 SVG 내용 제거 후 새 SVG 삽입
            mapContainer.innerHTML = '';
            mapContainer.appendChild(svgElement);

            // 지도 로드 후 클릭 이벤트 바인딩
            bindRegionClick();
        })
        .catch((err) => {
            console.error('지도 로드 오류:', err);
            mapContainer.innerHTML =
                '<p style="padding: 20px; text-align: center; color: #999;">지도를 로드할 수 없습니다.</p>';
        });
}

/*************************
 * 지도 클릭 이벤트 바인딩
 *************************/
function bindRegionClick() {
    const regions = document.querySelectorAll('.c-click');

    regions.forEach((region) => {
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
    if (!ul) {
        console.error('tourist-spots-list 요소를 찾을 수 없습니다.');
        return;
    }

    ul.innerHTML = '<li style="padding: 20px; text-align: center; color: #999;">로딩 중...</li>';

    if (regionIds.length === 0) {
        ul.innerHTML =
            '<li style="padding: 20px; text-align: center; color: #999;">지도에서 지역을 클릭하면 관광지가 나옵니다.</li>';
        return;
    }

    try {
        const query = regionIds.join(',');
        const res = await fetch(`/api/regions/spots?regionIds=${query}`);
        if (!res.ok) throw new Error('API 요청 실패');

        const spots = await res.json();;

        await renderSpotList(spots);
    } catch (e) {
        console.error('관광지 데이터 로드 오류:', e);
        ul.innerHTML =
            '<li style="padding: 20px; text-align: center; color: #999;">관광지 데이터를 불러오지 못했습니다.</li>';
    }
}

/*************************
 * 관광지 리스트 렌더링
 *************************/
async function renderSpotList(spots) {
    const ul = document.getElementById('tourist-spots-list');
    if (!ul) {
        console.error('tourist-spots-list 요소를 찾을 수 없습니다.');
        return;
    }

    ul.innerHTML = '';

    if (!spots || spots.length === 0) {
        ul.innerHTML =
            '<li style="padding: 20px; text-align: center; color: #999;">관광지가 없습니다.</li>';
        return;
    }

    // ListLoader를 사용하여 렌더링
    if (typeof ListLoader !== 'undefined') {
        try {
            // 데이터 변환
            const listData = spots.map((spot) => {
                // hashtags가 문자열인 경우 배열로 변환 (쉼표로 구분)
                let hashtagsArray = [];
                if (spot.hashtags) {
                    if (Array.isArray(spot.hashtags)) {
                        hashtagsArray = spot.hashtags;
                    } else if (typeof spot.hashtags === 'string') {
                        // 쉼표로 구분된 문자열을 배열로 변환
                        hashtagsArray = spot.hashtags
                            .split(',')
                            .map((tag) => '#' + tag.trim())
                            .filter((tag) => tag.length > 0);
                    }
                }

                return {
                    id: spot.id,
                    title: spot.title || '제목 없음',
                    description: spot.description || '',
                    hashtags: hashtagsArray,
                    img: spot.imageUrl || spot.image_url || '',
                    link: spot.linkUrl || spot.link_url || '#',
                    categoryCode: spot.categoryCode || spot.category_code || 'culture',
                    isActive: spot.isActive !== false,
                    categoryActive: spot.categoryActive !== false,
                };
            });

            // 매번 새로운 ListLoader 인스턴스 생성 (데이터가 변경될 때마다)
            listLoader = new ListLoader({
                containerSelector: '#tourist-spots-list',
                data: listData,
                fallbackImage: '../../images/logo.png',
                onItemClick: (itemData, event) => {
                    // 상세 페이지로 이동
                    window.location.href = `/pages/detailed/detailed?id=${itemData.id}`;
                },
                onLikeClick: (itemData, isLiked) => {
                    // 좋아요 기능 (필요시 구현)
                },
            });

            // 렌더링 실행
            await listLoader.render();
        } catch (err) {
            console.error('리스트 렌더링 오류:', err);
            // 폴백: 간단한 리스트로 표시
            spots.forEach((spot) => {
                const li = document.createElement('li');
                li.textContent = spot.title || '제목 없음';
                ul.appendChild(li);
            });
        }
    } else {
        // ListLoader가 없으면 간단한 리스트로 표시
        console.warn('ListLoader를 사용할 수 없습니다. 간단한 리스트로 표시합니다.');
        spots.forEach((spot) => {
            const li = document.createElement('li');
            li.textContent = spot.title || '제목 없음';
            ul.appendChild(li);
        });
    }
}

/*************************
 * 선택 정보 텍스트
 *************************/
function updateSelectionInfo() {
    const info = document.getElementById('selection-info');
    if (!info) return;
    
    const regionName = new Set();
    selectedRegionIds.forEach((id) => {
        const regionElement = document.querySelector(`.c-click[sigungu-code="${id}"]`);
        if (regionElement) {
            const name = regionElement.getAttribute('sigungu-name');
            if (name) {
                regionName.add(name);
            }
        }
    });

    if (selectedRegionIds.size === 0) {
        info.textContent = '지역을 클릭해 선택하세요.';
    } else {
        info.textContent = `선택된 지역 목록 (${selectedRegionIds.size}) : ${[...regionName].join(', ')}`;
    }
}
