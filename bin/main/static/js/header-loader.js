async function loadHeader() {
    try {
        // 현재 페이지의 위치에 따라 경로 조정
        const headerPath = getHeaderPath();
        const response = await fetch(headerPath);

        if (!response.ok) {
            throw new Error('헤더 로드 실패');
        }

        const headerHTML = await response.text();

        // 헤더 컨테이너에 HTML 삽입
        const headerContainer = document.getElementById('header-container');
        if (headerContainer) {
            headerContainer.innerHTML = headerHTML;

            // 헤더 로드 후 이벤트 초기화
            initHeaderEvents();

            // 언어 선택기 재설정 및 현재 언어 다시 적용
            if (window.languageManager) {
                window.languageManager.setupLanguageSelector();
                // 헤더 로드 후 현재 언어를 다시 적용하여 페이지 내용도 번역
                const currentLang = window.languageManager.currentLanguage;
                window.languageManager.applyLanguage(currentLang, true);
            }

            // header.js 동적 로드 후 검색 기능 초기화
            loadHeaderScript();

            // 로그인 상태에 따른 헤더 업데이트 (페이지 로드 시에만)
            if (typeof updateHeader === 'function' && !window.headerUpdated) {
                updateHeader();
                window.headerUpdated = true;
                // 드롭다운 메뉴 초기화
                setTimeout(() => {
                    if (typeof initUserDropdown === 'function') {
                        initUserDropdown();
                    }
                }, 200);
            }
        }
    } catch (error) {
        console.error('헤더 로드 중 오류:', error);
    }
}

// 현재 페이지 위치에 따른 헤더 경로 결정
function getHeaderPath() {
    const currentPath = window.location.pathname;
    const currentDir = window.location.pathname.split('/').slice(0, -1).join('/');

    // 루트 디렉토리인 경우
    if (currentPath === '/' || currentPath === '/index.html' || currentDir === '') {
        return './components/header.html';
    }

    // pages 디렉토리 내부인 경우
    if (currentPath.includes('/pages/')) {
        return '../../components/header.html';
    }

    // 기타 경우 (안전장치)
    return './components/header.html';
}

// header.js 동적 로드 함수
function loadHeaderScript() {
    const currentPath = window.location.pathname;
    const currentDir = window.location.pathname.split('/').slice(0, -1).join('/');
    let scriptPath;

    // 루트 디렉토리인 경우
    if (currentPath === '/' || currentPath === '/index.html' || currentDir === '') {
        scriptPath = './js/header.js';
    }
    // pages 디렉토리 내부인 경우
    else if (currentPath.includes('/pages/')) {
        scriptPath = '../../js/header.js';
    }
    // 기타 경우 (안전장치)
    else {
        scriptPath = './js/header.js';
    }

    // 이미 로드된 스크립트인지 확인
    if (document.querySelector(`script[src="${scriptPath}"]`)) {
        // console.log('header.js가 이미 로드되어 있습니다.');
        if (typeof initSearchBox === 'function') {
            initSearchBox();
        }
        return;
    }

    // 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = scriptPath;
    script.onload = function () {
        // console.log('header.js 로드 완료');
        // 검색 기능 초기화
        if (typeof initSearchBox === 'function') {
            setTimeout(initSearchBox, 100);
        }
    };
    script.onerror = function () {
        console.error('header.js 로드 실패:', scriptPath);
    };

    document.head.appendChild(script);
}

// 헤더 이벤트 초기화
function initHeaderEvents() {
    const nav = document.querySelector('#nav');
    if (!nav) return;

    const navList = nav.querySelectorAll('.d1 li');

    navList.forEach((li) => {
        const subMenu = li.querySelector('.sub');

        if (subMenu) {
            li.addEventListener('mouseenter', () => {
                setTimeout(() => {
                    subMenu.style.display = 'block';
                }, 10);
            });

            li.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    subMenu.style.display = 'none';
                }, 300);
            });
        }
    });
}

// DOM 로드 완료 후 헤더 로드
document.addEventListener('DOMContentLoaded', loadHeader);
