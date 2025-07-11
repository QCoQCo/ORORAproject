// 전역 변수
let listLoader = null;
let touristData = null;

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded 이벤트 발생');
    
    // 관광지 데이터 로드
    loadTouristData();
    
    // 지도 로드
    const mapContainer = document.getElementById('mapSvg');
    if (!mapContainer) {
        console.error('mapSvg 요소를 찾을 수 없습니다.');
        return;
    }
    
    console.log('SVG 로드 시작...');
    fetch('../../images/map.svg')
        .then(response => {
            console.log('SVG 응답 상태:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(svgText => {
            console.log('SVG 텍스트 로드 성공, 길이:', svgText.length);
            
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;
            
            // 파서 오류 확인
            const parserError = svgDoc.querySelector('parsererror');
            if (parserError) {
                console.error('SVG 파싱 오류:', parserError.textContent);
                return;
            }
            
            mapContainer.innerHTML = svgElement.innerHTML;
            console.log('SVG 삽입 완료');

            // 클래스 적용 및 디버깅
            const paths = mapContainer.querySelectorAll('path');
            console.log('전체 path 요소 수:', paths.length);
            
            paths.forEach((path, index) => {
                const classAttr = path.getAttribute('class');
                if (classAttr) {
                    const classes = classAttr.split(' ');
                    path.classList.add(...classes);
                    
                    // c-click 클래스가 있는 요소 로깅
                    if (classes.includes('c-click')) {
                        const regionName = path.getAttribute('sigungu-name');
                        const regionId = path.getAttribute('id');
                        console.log(`클릭 가능한 지역 발견: ${regionName} (${regionId})`);
                    }
                }
            });

            // 이벤트 리스너 등록
            setTimeout(() => {
                addMapInteractivity();
            }, 100); // 약간의 지연을 두어 DOM 업데이트 완료 대기
        })
        .catch(error => {
            console.error('SVG 로드 오류:', error);
            mapContainer.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="red">지도를 로드할 수 없습니다.</text>';
        });
});

// 관광지 데이터 로드
async function loadTouristData() {
    try {
        console.log('관광지 데이터 로드 시작...');
        const response = await fetch('../../data/busanTouristSpots.json');
        if (!response.ok) {
            throw new Error('데이터 로드 실패');
        }
        touristData = await response.json();
        console.log('관광지 데이터 로드 완료:', touristData);
    } catch (error) {
        console.error('관광지 데이터 로드 오류:', error);
    }
}

// 지역 ID를 데이터 키로 매핑하는 함수
function getRegionKey(regionId) {
    // SVG의 실제 ID에 맞춰 매핑
    const regionMapping = {
        'busanArea01': 'geumjeong',  // 기장군 -> 금정구 데이터 사용
        'busanArea02': 'geumjeong',  // 금정구
        'busanArea03': 'haeundae',   // 해운대구 (실제로는 기장군이지만 해운대 데이터 사용)
        'busanArea04': 'dongnae',    // 동래구
        'busanArea05': 'geumjeong',  // 북구 -> 금정구 데이터 사용  
        'busanArea06': 'seo',        // 강서구 -> 서구 데이터 사용
        'busanArea07': 'busanjin',   // 사상구 -> 부산진구 데이터 사용
        'busanArea08': 'busanjin',   // 부산진구
        'busanArea09': 'nam',        // 남구
        'busanArea10': 'seo',        // 사하구 -> 서구 데이터 사용
        'busanArea11': 'seo',        // 서구
        'busanArea12': 'suyeong',    // 수영구
        'busanArea13': 'busanjin',   // 연제구 -> 부산진구 데이터 사용
        'busanArea14': 'jung',       // 중구
        'busanArea15': 'dongnae',    // 동구 -> 동래구 데이터 사용
        'busanArea16': 'yeongdo'     // 영도구
    };
    
    console.log(`지역 ID "${regionId}"를 키 "${regionMapping[regionId]}"로 매핑`);
    return regionMapping[regionId] || null;
}

function addMapInteractivity() {
    console.log('이벤트 리스너 등록 시작...');
    
    const regions = document.querySelectorAll('.c-click');
    console.log('클릭 가능한 지역 수:', regions.length);
    
    if (regions.length === 0) {
        console.warn('클릭 가능한 지역이 없습니다. SVG 로드 또는 클래스 설정에 문제가 있을 수 있습니다.');
        
        // 모든 path 요소 확인
        const allPaths = document.querySelectorAll('#mapSvg path');
        console.log('전체 path 요소:', allPaths.length);
        allPaths.forEach((path, index) => {
            const id = path.getAttribute('id');
            const className = path.getAttribute('class');
            console.log(`Path ${index}: id="${id}", class="${className}"`);
        });
        return;
    }
    
    let selectedRegions = new Set();

    regions.forEach((region, index) => {
        const regionName = region.getAttribute('sigungu-name');
        const regionCode = region.getAttribute('sigungu-code');
        const regionId = region.getAttribute('id');
        
        console.log(`지역 ${index + 1}: ${regionName} (${regionId})`);
        
        region.addEventListener('click', function (e) {
            console.log(`클릭 이벤트 발생: ${regionName} (${regionId})`);
            
            // 토글 방식
            if (this.classList.contains('selected')) {
                // 이미 선택된 지역이면 해제
                this.classList.remove('selected');
                selectedRegions.delete(regionId);
                console.log(`지역 해제: ${regionName}`);
                
                // 선택 해제 시 선택된 지역이 없으면 기본 메시지 표시
                if (selectedRegions.size === 0) {
                    resetListDisplay();
                } else {
                    // 다른 선택된 지역들 표시
                    displaySelectedRegionsTouristSpots();
                }
                
                // 선택 해제 이벤트 발생
                triggerRegionChange('deselected', regionName, regionCode, regionId);
            } else {
                // 새로운 지역 선택 (다중 선택 가능)
                this.classList.add('selected');
                selectedRegions.add(regionId);
                console.log(`지역 선택: ${regionName} (코드: ${regionCode})`);

                // 단일 지역 선택 시 해당 지역만 표시
                displayRegionTouristSpots(regionId, regionName);
                
                // 선택 이벤트 발생
                triggerRegionChange('selected', regionName, regionCode, regionId);
            }
        });
        
        // 마우스 이벤트도 추가하여 작동 확인
        region.addEventListener('mouseenter', function() {
            console.log(`마우스 진입: ${regionName}`);
        });
    });

    console.log('이벤트 리스너 등록 완료');

    // 컨트롤 버튼 이벤트
    const controlButtons = document.querySelectorAll('.control-button');
    console.log('컨트롤 버튼 수:', controlButtons.length);
    
    controlButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            console.log(`컨트롤 버튼 클릭: ${buttonText}`);
            
            if (buttonText === '전체 해제') {
                // 모든 선택 해제
                regions.forEach(region => region.classList.remove('selected'));
                selectedRegions.clear();
                resetListDisplay();
                updateSelectionInfo();
            } else if (buttonText === '선택된 지역 보기') {
                // 선택된 지역들의 관광지 통합 표시
                displaySelectedRegionsTouristSpots();
            }
        });
    });
}

// 특정 지역의 관광지 표시
async function displayRegionTouristSpots(regionId, regionName) {
    if (!touristData || !touristData.regions) {
        console.error('관광지 데이터가 없습니다.');
        return;
    }

    const regionKey = getRegionKey(regionId);
    const regionData = touristData.regions[regionKey];
    
    if (!regionData || !regionData.spots) {
        console.log(`${regionName}의 관광지 데이터가 없습니다.`);
        displayNoDataMessage(regionName);
        return;
    }

    // 리스트 헤더 업데이트
    updateListHeader(regionName, regionData.spots.length);

    // 리스트 로더 생성 및 렌더링
    try {
        listLoader = new ListLoader({
            containerSelector: '#tourist-spots-list',
            templateContainerSelector: '#list-template-container',
            data: regionData.spots,
            fallbackImage: '../../images/logo.png',
            onItemClick: (itemData, event) => {
                console.log('관광지 클릭:', itemData.title);
                // 필요시 상세 페이지로 이동하는 로직 추가
            },
            onLikeClick: (itemData, isLiked) => {
                console.log(`${itemData.title} 좋아요: ${isLiked}`);
                // 좋아요 상태 저장 로직 추가
            }
        });

        await listLoader.render();
        console.log(`${regionName} 관광지 ${regionData.spots.length}개 표시 완료`);
    } catch (error) {
        console.error('리스트 렌더링 오류:', error);
        displayErrorMessage(regionName);
    }
}

// 선택된 모든 지역의 관광지 표시
async function displaySelectedRegionsTouristSpots() {
    const selectedRegions = getSelectedRegions();
    
    if (selectedRegions.length === 0) {
        resetListDisplay();
        return;
    }

    let allSpots = [];
    let regionNames = [];

    selectedRegions.forEach(region => {
        const regionKey = getRegionKey(region.id);
        const regionData = touristData.regions[regionKey];
        
        if (regionData && regionData.spots) {
            allSpots = allSpots.concat(regionData.spots);
            regionNames.push(region.name);
        }
    });

    if (allSpots.length === 0) {
        displayNoDataMessage(regionNames.join(', '));
        return;
    }

    // 리스트 헤더 업데이트
    updateListHeader(`${regionNames.join(', ')}`, allSpots.length);

    // 리스트 렌더링
    try {
        listLoader = new ListLoader({
            containerSelector: '#tourist-spots-list',
            templateContainerSelector: '#list-template-container',
            data: allSpots,
            fallbackImage: '../../images/logo.png'
        });

        await listLoader.render();
        console.log(`선택된 지역들의 관광지 ${allSpots.length}개 표시 완료`);
    } catch (error) {
        console.error('리스트 렌더링 오류:', error);
    }
}

// 리스트 헤더 업데이트
function updateListHeader(regionName, spotCount) {
    const titleElement = document.getElementById('region-title');
    const subtitleElement = document.getElementById('region-subtitle');
    
    if (titleElement && subtitleElement) {
        titleElement.textContent = `${regionName} 관광지`;
        subtitleElement.textContent = `총 ${spotCount}개의 관광지를 확인하실 수 있습니다.`;
    }
}

// 기본 상태로 리셋
function resetListDisplay() {
    const titleElement = document.getElementById('region-title');
    const subtitleElement = document.getElementById('region-subtitle');
    const listContainer = document.getElementById('tourist-spots-list');
    
    if (titleElement && subtitleElement) {
        titleElement.textContent = '지역을 선택해주세요';
        subtitleElement.textContent = '지도에서 지역을 클릭하면 해당 지역의 관광지를 확인할 수 있습니다.';
    }
    
    if (listContainer) {
        listContainer.innerHTML = '';
    }
}

// 데이터 없음 메시지 표시
function displayNoDataMessage(regionName) {
    const titleElement = document.getElementById('region-title');
    const subtitleElement = document.getElementById('region-subtitle');
    const listContainer = document.getElementById('tourist-spots-list');
    
    if (titleElement && subtitleElement) {
        titleElement.textContent = `${regionName}`;
        subtitleElement.textContent = '현재 해당 지역의 관광지 정보가 준비되지 않았습니다.';
    }
    
    if (listContainer) {
        listContainer.innerHTML = '<li style="padding: 20px; text-align: center; color: #666;">관광지 정보가 없습니다.</li>';
    }
}

// 오류 메시지 표시
function displayErrorMessage(regionName) {
    const titleElement = document.getElementById('region-title');
    const subtitleElement = document.getElementById('region-subtitle');
    const listContainer = document.getElementById('tourist-spots-list');
    
    if (titleElement && subtitleElement) {
        titleElement.textContent = `${regionName}`;
        subtitleElement.textContent = '관광지 정보를 불러오는 중 오류가 발생했습니다.';
    }
    
    if (listContainer) {
        listContainer.innerHTML = '<li style="padding: 20px; text-align: center; color: #e74c3c;">데이터 로드 오류</li>';
    }
}

// 개별 지역 선택/해제 이벤트 발생 함수
function triggerRegionChange(action, regionName, regionCode, regionId) {
    const event = new CustomEvent('regionChange', {
        detail: {
            action: action, // 'selected' 또는 'deselected'
            regionName: regionName,
            regionCode: regionCode,
            regionId: regionId,
        }
    });
    document.dispatchEvent(event);
}

//선택된 지역 정보 가져오기
function getSelectedRegions() {
    const selectedElements = document.querySelectorAll('.c-click.selected');
    return Array.from(selectedElements).map(item => ({
        id: item.getAttribute('id'),
        name: item.getAttribute('sigungu-name'),
        code: item.getAttribute('sigungu-code')
    }));
}

//선택된 지역 정보출력
document.addEventListener('regionChange', event => {
    const { action, regionName, regionCode, regionId } = event.detail;
    console.log(`Region ${action}: ${regionName} (코드: ${regionCode}) (ID: ${regionId})`);
    updateSelectionInfo();
});

//텍스트 업데이트
function updateSelectionInfo() {
    const infoElement = document.getElementById('selection-info');
    const selectedRegions = getSelectedRegions();

    if (selectedRegions.length === 0) {
        infoElement.innerHTML = '지역을 클릭하여 선택/해제할 수 있습니다.';
        infoElement.style.color = '#000';
    } else {
        const regionNames = selectedRegions.map(region => region.name).join(', ');
        infoElement.innerHTML = `선택된 지역 (${selectedRegions.length}개): ${regionNames}`;
    }
}
