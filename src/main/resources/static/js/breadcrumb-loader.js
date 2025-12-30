// 브레드크럼 로더 및 업데이트 함수
document.addEventListener('DOMContentLoaded', function () {
    loadBreadcrumb();
});

// 브레드크럼 컴포넌트 로드 함수
function loadBreadcrumb() {
    const breadcrumbContainer = document.getElementById('breadcrumb-container');
    if (!breadcrumbContainer) return;

    // 현재 경로에 따라 breadcrumb.html 경로 결정
    const breadcrumbPath = getBreadcrumbPath();
    
    fetch(breadcrumbPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            breadcrumbContainer.innerHTML = html;
            updateBreadcrumb();
        })
        .catch(error => {
            console.error('브레드크럼 로드 실패:', error);
        });
}

// 현재 페이지 위치에 따른 breadcrumb.html 경로 결정
function getBreadcrumbPath() {
    // components 디렉토리에서 로드 (다른 컴포넌트들과 일관성 유지)
    return '/components/breadcrumb.html';
}

// 브레드크럼 업데이트 함수
function updateBreadcrumb() {
    const currentPageElement = document.getElementById('current-page');
    if (!currentPageElement) return;

    // 현재 페이지 파일명 가져오기
    const pathSegments = window.location.pathname.split('/');
    const currentPage = pathSegments[pathSegments.length - 1];

    // 페이지별 타이틀 매핑
    const pageTitles = {
        'busan.html': '부산은?',
        'basisinfo.html': '기본현황',
        'character.html': '캐릭터 소개',
        'goals.html': '도시비전과 목표',
        'symbol.html': '지역상징'
    };

    const pageMenus = {
        'busan.html': { menu: '부산의 오늘', menuLink: './busan.html' },
        'basisinfo.html': { menu: '부산의 오늘', menuLink: './busan.html' },
        'goals.html': { menu: '부산의 오늘', menuLink: './busan.html' },
        'symbol.html': { menu: '부산의 상징', menuLink: './symbol.html' },
        'character.html': { menu: '소통 캐릭터', menuLink: './character.html' },
    };

    // 현재 페이지 타이틀 설정
    if (pageTitles[currentPage]) {
        currentPageElement.textContent = pageTitles[currentPage];
    }

    const menuLinkElement = document.querySelector('.breadcrumb-nav .breadcrumb-item:nth-child(3) .breadcrumb-link');
    if (menuLinkElement && pageMenus[currentPage]) {
        menuLinkElement.textContent = pageMenus[currentPage].menu;
        menuLinkElement.setAttribute('href', pageMenus[currentPage].menuLink);
    }
    // 브레드크럼 링크 경로 조정
    adjustBreadcrumbPaths();
}

// 브레드크럼 링크 경로 조정 함수
function adjustBreadcrumbPaths() {
    const breadcrumbLinks = document.querySelectorAll('.breadcrumb-link');
    const pathSegments = window.location.pathname.split('/');
    const currentPage = pathSegments[pathSegments.length - 1];

    breadcrumbLinks.forEach(link => {
        const href = link.getAttribute('href');

        // 홈 링크 조정
        if (href === '../../index.html') {
            // 현재 경로에 따라 홈 링크 경로 조정
            const depth = pathSegments.length - pathSegments.indexOf('pages') - 1;
            const homePrefix = '../'.repeat(depth);
            link.setAttribute('href', homePrefix + 'index.html');
        }

        // 부산소개 메인 페이지 링크 조정
        // if (href === '../pages/about-busan/busan.html') {
        //     // 현재 페이지가 부산소개 메인이 아닌 경우에만 링크 활성화
        //     if (currentPage !== 'busan.html') {
        //         link.setAttribute('href', '../pages/about-busan/busan.html');
        //     } else {
        //         // 현재 페이지가 부산소개 메인인 경우 링크 비활성화
        //         link.style.pointerEvents = 'none';
        //         link.style.color = '#6c757d';
        //     }
        // }
        //         const currentPageMenus = {
        //     'busan.html': './busan.html',
        //     'character.html': './character.html',
        //     'symbol.html': './symbol.html'
        // };

        // if (href && currentPageMenus[currentPage] && href === currentPageMenus[currentPage]) {

        //     link.style.pointerEvents = 'none';
        //     link.style.color = '#6c757d';
        // }
    });
}

// 브레드크럼 수동 업데이트 함수 (다른 스크립트에서 호출 가능)
function setBreadcrumbCurrentPage(title) {
    const currentPageElement = document.getElementById('current-page');
    if (currentPageElement) {
        currentPageElement.textContent = title;
    }
}

// 브레드크럼 경로 추가 함수
function addBreadcrumbItem(title, href = null) {
    const breadcrumbNav = document.querySelector('.breadcrumb-nav');
    if (!breadcrumbNav) return;

    // 기존 현재 페이지 아이템을 링크로 변경
    const currentItem = breadcrumbNav.querySelector('.breadcrumb-item:last-child');
    if (currentItem) {
        const currentSpan = currentItem.querySelector('.breadcrumb-current');
        if (currentSpan) {
            const currentTitle = currentSpan.textContent;
            currentItem.innerHTML = `<a href="#" class="breadcrumb-link">${currentTitle}</a>`;
        }
    }

    // 새 현재 페이지 아이템 추가
    const newItem = document.createElement('li');
    newItem.className = 'breadcrumb-item';

    if (href) {
        newItem.innerHTML = `<a href="${href}" class="breadcrumb-link">${title}</a>`;
    } else {
        newItem.innerHTML = `<span class="breadcrumb-current">${title}</span>`;
    }

    breadcrumbNav.appendChild(newItem);
} 