document.addEventListener('DOMContentLoaded', function () {
    const mapContainer = document.getElementById('mapSvg');
    fetch('../../images/map.svg')
        .then(response => response.text())
        .then(svgText => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;
            mapContainer.innerHTML = svgElement.innerHTML;

            const paths = mapContainer.querySelectorAll('path');
            paths.forEach(path => {
                if (path.getAttribute('class')) {
                    path.classList.add(...path.getAttribute('class').split(' '));
                }
            });

            addMapInteractivity();
            setupControlButtons();
        })
        .catch(error => {
            console.error('SVG 로드 오류:', error);
            mapContainer.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="red">지도를 로드할 수 없습니다.</text>';
        });
});

// 컨트롤 버튼 설정
function setupControlButtons() {
    const buttons = document.querySelectorAll('.control-button');
    
    // 전체 해제 버튼
    buttons[0].addEventListener('click', function() {
        const selectedRegions = document.querySelectorAll('.c-click.selected');
        selectedRegions.forEach(region => {
            region.classList.remove('selected');
        });
        
        // 리스트 초기화
        document.querySelector('.list-item').innerHTML = `
            <div class="empty-message">
                <h4>지역을 선택해주세요</h4>
                <p>지도에서 원하는 지역을 클릭하면 해당 지역의 관광지를 볼 수 있습니다.</p>
            </div>
        `;
        
        // 선택 정보 업데이트
        updateSelectionInfo();
    });
    
    // 선택된 지역 보기 버튼
    buttons[1].addEventListener('click', function() {
        const selectedRegions = getSelectedRegions();
        if (selectedRegions.length === 0) {
            alert('선택된 지역이 없습니다.\n지도에서 원하는 지역을 클릭해주세요.');
        } else {
            const regionNames = selectedRegions.map(r => r.name).join(', ');
            alert(`선택된 지역 (${selectedRegions.length}개):\n${regionNames}`);
        }
    });
}


function addMapInteractivity() {
    const regions = document.querySelectorAll('.c-click');
    // let selectedRegions = [];
    let selectedRegions = new Set();

    regions.forEach(region => {
        region.addEventListener('click', function () {
            const regionName = this.getAttribute('sigungu-name');
            const regionCode = this.getAttribute('sigungu-code');
            const regionId = this.getAttribute('id');

            // 토글 방식
            if (this.classList.contains('selected')) {
                // 이미 선택된 지역이면 해제
                this.classList.remove('selected');
                selectedRegions.delete(regionId);
                // console.log(`지역 해제: ${regionName} (코드: ${regionCode})`);

                // 선택 해제 이벤트 발생
                triggerRegionChange('deselected', regionName, regionCode, regionId);
            } else {
                // 선택되지 않은 지역이면 선택
                this.classList.add('selected');
                selectedRegions.add(regionId);
                console.log(`지역 선택: ${regionName} (코드: ${regionCode})`);

                // 선택 이벤트 발생
                triggerRegionChange('selected', regionName, regionCode, regionId);
            }

            // 선택된 지역들의 관광지 표시
            const selectedRegionsList = getSelectedRegions();
            if (selectedRegionsList.length === 1) {
                // 하나만 선택된 경우
                displayTouristSpots(selectedRegionsList[0].name);
            } else if (selectedRegionsList.length > 1) {
                // 여러 개 선택된 경우
                displayMultipleRegionSpots(selectedRegionsList);
            } else {
                // 아무것도 선택되지 않은 경우
                document.querySelector('.list-item').innerHTML = `
                    <div class="empty-message">
                        <h4>지역을 선택해주세요</h4>
                        <p>지도에서 원하는 지역을 클릭하면 해당 지역의 관광지를 볼 수 있습니다.</p>
                    </div>
                `;
            }
        });
    });
    
    // 초기 메시지 표시
    document.querySelector('.list-item').innerHTML = `
        <div class="empty-message">
            <h4>지역을 선택해주세요</h4>
            <p>지도에서 원하는 지역을 클릭하면 해당 지역의 관광지를 볼 수 있습니다.</p>
        </div>
    `;
}

// 개별 지역 선택/해제 이벤트 발생 함수
function triggerRegionChange(action, regionName, regionCode, regionId) {
    const event = new CustomEvent('regionChange', {//질문 
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

// 지역별 관광지 데이터 (예시 데이터)
const touristSpotsByRegion = {
    '중구': [
        {
            name: '자갈치시장',
            description: '부산 대표 수산시장으로 신선한 해산물을 맛볼 수 있습니다.',
            image: '../../images/common (1).jpg',
            tags: '#자연 #아홉산숲',
            link: '../../pages/detailed/detailPage.html'
        },
        {
            name: '용두산공원',
            description: '부산타워가 있는 시내 중심가의 공원입니다.',
            image: '../../images/common (2).jpg',
            tags: '#경상권 #이아와함께',
            link: '../../pages/detailed/detailPage.html'
        }
    ],
    '해운대구': [
        {
            name: '해운대해수욕장',
            description: '부산의 대표 해수욕장으로 매년 수많은 관광객이 찾는 곳입니다.',
            image: '../../images/common (3).jpg',
            tags: '#해운대해수욕장 #부산',
            link: '../../pages/detailed/detailPage.html'
        },
        {
            name: '달맞이길',
            description: '부산 해운대구',
            image: '../../images/common (4).jpg',
            tags: '#해운대달맞이길 #야경',
            link: '../../pages/detailed/detailPage.html'
        }
    ],
    '수영구': [
        {
            name: '광안리해수욕장',
            description: '부산 수영구',
            image: '../../images/common (5).jpg',
            tags: '#광안리해수욕장 #야경',
            link: '../../pages/detailed/detailPage.html'
        },
        {
            name: '광안대교',
            description: '부산 수영구',
            image: '../../images/common (6).jpg',
            tags: '#광안리해수욕장 #야경 #광안대교',
            link: '../../pages/detailed/detailPage.html'
        }
    ],
    '영도구': [
        {
            name: '국립해양박물관',
            description: '부산 영도구',
            image: '../../images/common (7).jpg',
            tags: '#경상권 #이아와함께',
            link: '../../pages/detailed/detailPage.html'
        },
        {
            name: '태종대',
            description: '부산의 대표 관광지로 절경으로 유명합니다.',
            image: '../../images/common (8).jpg',
            tags: '#태종대 #자연경관',
            link: '../../pages/detailed/detailPage.html'
        }
    ],
    '사하구': [
        {
            name: '아홉산숲',
            description: '부산 기장군',
            image: '../../images/common (9).jpg',
            tags: '#자연 #아홉산숲',
            link: '../../pages/detailed/detailPage.html'
        },
        {
            name: '감천문화마을',
            description: '부산의 마추픽추라 불리는 알록달록한 문화마을입니다.',
            image: '../../images/common (10).jpg',
            tags: '#감천문화마을 #부산마추픽추',
            link: '../../pages/detailed/detailPage.html'
        }
    ],
    '서구': [
        {
            name: '송도해수욕장',
            description: '부산 최초의 해수욕장으로 역사가 깊습니다.',
            image: '../../images/common (11).jpg',
            tags: '#송도해수욕장 #해수욕장',
            link: '../../pages/detailed/detailPage.html'
        },
        {
            name: '송도구름산책로',
            description: '송도해수욕장의 명물 구름산책로입니다.',
            image: '../../images/common (12).jpg',
            tags: '#송도구름산책로 #산책',
            link: '../../pages/detailed/detailPage.html'
        }
    ],
    '남구': [
        {
            name: '오륙도 스카이워크',
            description: '부산 남구',
            image: '../../images/common (13).jpg',
            tags: '#오륙도 #스카이워크',
            link: '../../pages/detailed/detailPage.html'
        }
    ],
    '동래구': [
        {
            name: '범어사',
            description: '금정산 기슭에 위치한 천년고찰입니다.',
            image: '../../images/common (14).jpg',
            tags: '#범어사 #사찰',
            link: '../../pages/detailed/detailPage.html'
        }
    ],
    '부산진구': [
        {
            name: '서면',
            description: '부산의 중심 상업지구입니다.',
            image: '../../images/common (15).jpg',
            tags: '#서면 #쇼핑',
            link: '../../pages/detailed/detailPage.html'
        }
    ],
    '북구': [
        {
            name: '낙동강 생태공원',
            description: '도심 속 자연을 만날 수 있는 생태공원입니다.',
            image: '../../images/common (16).jpg',
            tags: '#낙동강 #생태공원',
            link: '../../pages/detailed/detailPage.html'
        }
    ],
    '금정구': [
        {
            name: '금정산성',
            description: '조선시대에 축성된 산성입니다.',
            image: '../../images/common (17).jpg',
            tags: '#금정산성 #역사',
            link: '../../pages/detailed/detailPage.html'
        }
    ],
    '연제구': [
        {
            name: '온천천 시민공원',
            description: '시민들의 휴식 공간입니다.',
            image: '../../images/common (18).jpg',
            tags: '#온천천 #공원',
            link: '../../pages/detailed/detailPage.html'
        }
    ],
    '동구': [
        {
            name: '부산역',
            description: '부산의 관문 역할을 하는 중앙역입니다.',
            image: '../../images/common (19).jpg',
            tags: '#부산역 #교통',
            link: '../../pages/detailed/detailPage.html'
        }
    ],
    '사상구': [
        {
            name: '삼락생태공원',
            description: '낙동강변의 대규모 생태공원입니다.',
            image: '../../images/common (20).jpg',
            tags: '#삼락생태공원 #자연',
            link: '../../pages/detailed/detailPage.html'
        }
    ],
    '강서구': [
        {
            name: '가덕도',
            description: '부산 최남단의 섬입니다.',
            image: '../../images/common.jpg',
            tags: '#가덕도 #섬',
            link: '../../pages/detailed/detailPage.html'
        }
    ],
    '기장군': [
        {
            name: '해동용궁사',
            description: '바다 위에 세워진 아름다운 사찰입니다.',
            image: '../../images/common (1).jpg',
            tags: '#해동용궁사 #사찰',
            link: '../../pages/detailed/detailPage.html'
        }
    ]
};

// list-item 템플릿 로드 함수
async function loadListItemTemplate() {
    try {
        const response = await fetch('../../components/list-item.html');
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        return doc.querySelector('#list-item');
    } catch (error) {
        console.error('템플릿 로드 오류:', error);
        return null;
    }
}

// 관광지 리스트 표시 함수
async function displayTouristSpots(regionName) {
    const listContainer = document.querySelector('.list-item');
    const template = await loadListItemTemplate();
    
    if (!template) {
        console.error('템플릿을 찾을 수 없습니다.');
        return;
    }
    
    // 리스트 초기화
    listContainer.innerHTML = '';
    
    // 선택된 지역의 관광지 데이터 가져오기
    const spots = touristSpotsByRegion[regionName] || [];
    
    if (spots.length === 0) {
        // 관광지가 없을 때 메시지 표시
        listContainer.innerHTML = `
            <div class="empty-message">
                <h4>${regionName} 지역의 관광지 정보가 없습니다.</h4>
                <p>다른 지역을 선택해주세요.</p>
            </div>
        `;
        return;
    }
    
    // 각 관광지에 대해 리스트 아이템 생성
    spots.forEach(spot => {
        const clone = template.content.cloneNode(true);
        
        // 데이터 설정
        clone.querySelector('.item-link').href = spot.link;
        clone.querySelector('.item-photo img').src = spot.image;
        clone.querySelector('.item-photo img').alt = spot.name;
        clone.querySelector('.item-title').textContent = spot.name;
        clone.querySelector('.item-description').textContent = spot.description;
        clone.querySelector('.hash-tag').textContent = spot.tags;
        
        // 좋아요 버튼 이벤트
        const likeBtn = clone.querySelector('.likeBtn');
        likeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
        });
        
        listContainer.appendChild(clone);
    });
}

// 여러 지역이 선택됐을 때 모든 관광지 표시
async function displayMultipleRegionSpots(regions) {
    const listContainer = document.querySelector('.list-item');
    const template = await loadListItemTemplate();
    
    if (!template) {
        console.error('템플릿을 찾을 수 없습니다.');
        return;
    }
    
    // 리스트 초기화
    listContainer.innerHTML = '';
    
    // 모든 선택된 지역의 관광지 수집
    let allSpots = [];
    regions.forEach(region => {
        const spots = touristSpotsByRegion[region.name] || [];
        allSpots = allSpots.concat(spots);
    });
    
    if (allSpots.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-message">
                <h4>선택한 지역들의 관광지 정보가 없습니다.</h4>
                <p>다른 지역을 선택해주세요.</p>
            </div>
        `;
        return;
    }
    
    // 각 관광지에 대해 리스트 아이템 생성
    allSpots.forEach(spot => {
        const clone = template.content.cloneNode(true);
        
        // 데이터 설정
        clone.querySelector('.item-link').href = spot.link;
        clone.querySelector('.item-photo img').src = spot.image;
        clone.querySelector('.item-photo img').alt = spot.name;
        clone.querySelector('.item-title').textContent = spot.name;
        clone.querySelector('.item-description').textContent = spot.description;
        clone.querySelector('.hash-tag').textContent = spot.tags;
        
        // 좋아요 버튼 이벤트
        const likeBtn = clone.querySelector('.likeBtn');
        likeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
        });
        
        listContainer.appendChild(clone);
    });
}
