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
        })
        .catch(error => {
            console.error('SVG 로드 오류:', error);
            mapContainer.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="red">지도를 로드할 수 없습니다.</text>';
        });
});



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


        });

    });
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
