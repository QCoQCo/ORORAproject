function initNavHoverMenus() {
    const nav = document.querySelector('#nav');
    if (!nav) return;

    const navList = nav.querySelectorAll('.d1 li');

    navList.forEach((li) => {
        const subMenu = li.querySelector('.sub');

        // 서브메뉴가 있는 경우에만 이벤트 추가
        if (subMenu) {
            li.addEventListener('mouseenter', () => {
                // CSS 애니메이션을 위해 약간의 지연
                setTimeout(() => {
                    subMenu.style.display = 'block';
                }, 10);
            });

            li.addEventListener('mouseleave', () => {
                // 애니메이션 완료 후 숨기기
                setTimeout(() => {
                    subMenu.style.display = 'none';
                }, 300);
            });
        }
    });
}

initNavHoverMenus();

function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('active');
        });

        // 서브메뉴 토글 (모바일에서)
        const menuItems = nav.querySelectorAll('.d1 > li');
        menuItems.forEach((item) => {
            const link = item.querySelector('a');
            const subMenu = item.querySelector('.sub');

            if (subMenu && window.innerWidth <= 768) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    subMenu.classList.toggle('active');
                });
            }
        });
    }
}

initMobileMenu();

// 검색 기능 초기화 - 여러 방법으로 시도
// function tryInitSearchBox() {
//     // 1. 즉시 시도
//     initSearchBox();

//     // 2. 짧은 지연 후 시도
//     setTimeout(initSearchBox, 100);

//     // 3. 더 긴 지연 후 시도
//     setTimeout(initSearchBox, 500);

//     // 4. 헤더 로더 완료 후 시도
//     setTimeout(initSearchBox, 1000);
// }

// // DOM 로드 상태에 따라 초기화
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', tryInitSearchBox);
// } else {
//     tryInitSearchBox();
// }

// DOMContentLoaded와 load 이벤트 모두에서 초기화 시도
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initSearchBox, 0);
    });
} else {
    setTimeout(initSearchBox, 0);
}

// 윈도우 로드 후에도 한 번 더 시도
window.addEventListener('load', () => {
    setTimeout(initSearchBox, 0);
});

// 검색 기능 (이벤트 위임으로 DOM 교체에도 안전하게)
function initSearchBox() {
    if (window.__ororaSearchBoxBound === true) return;
    window.__ororaSearchBoxBound = true;

    const searchBtnSelector = '#header .btns .btn2';
    const searchBoxSelector = '.search-box';
    const searchInputSelector = '.search-box input';
    const searchSubmitBtnSelector = '.search-box button';

    function getEls() {
        const searchBtn = document.querySelector(searchBtnSelector);
        const searchBox = document.querySelector(searchBoxSelector);
        const searchInput = document.querySelector(searchInputSelector);
        const searchSubmitBtn = document.querySelector(searchSubmitBtnSelector);
        return { searchBtn, searchBox, searchInput, searchSubmitBtn };
    }

    function openSearchBox() {
        const { searchBox, searchInput } = getEls();
        if (!searchBox) return;
        searchBox.classList.add('active');
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 0);
        }
    }

    function toggleSearchBox() {
        const { searchBox, searchInput } = getEls();
        if (!searchBox) return;
        searchBox.classList.toggle('active');
        if (searchBox.classList.contains('active') && searchInput) {
            setTimeout(() => searchInput.focus(), 0);
        }
    }

    // 클릭 위임
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof Element)) return;

        const { searchBtn, searchBox } = getEls();
        if (!searchBtn || !searchBox) return;

        const clickedSearchBtn = target.closest(searchBtnSelector);
        const clickedSubmitBtn = target.closest(searchSubmitBtnSelector);
        const clickedInsideSearchBox = target.closest(searchBoxSelector);

        // 검색 버튼: 토글
        if (clickedSearchBtn) {
            e.preventDefault();
            toggleSearchBox();
            return;
        }

        // 검색 실행 버튼: 검색
        if (clickedSubmitBtn && clickedInsideSearchBox) {
            e.preventDefault();
            performSearch();
            return;
        }

        // 외부 클릭: 닫기
        if (!clickedInsideSearchBox) {
            searchBox.classList.remove('active');
        }
    });

    // 엔터 키로 검색 실행 (위임)
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const target = e.target;
        if (!(target instanceof Element)) return;
        if (!target.matches(searchInputSelector)) return;

        e.preventDefault();
        performSearch();
    });

    // 초기 상태에서 요소가 이미 있으면 포커스 편의 제공 (선택 사항)
    // (요소가 동적으로 교체돼도 위임으로 계속 동작함)
    const { searchBox } = getEls();
    if (searchBox && searchBox.classList.contains('active')) {
        openSearchBox();
    }
}

// 검색 실행 함수
function performSearch() {
    const searchInput = document.querySelector('.search-box input');
    const searchBox = document.querySelector('.search-box');

    if (!searchInput || !searchBox) {
        console.error('검색 입력창 또는 검색 박스를 찾을 수 없습니다.');
        return;
    }

    const searchTerm = searchInput.value.trim();

    if (searchTerm) {
        // 통합 검색 페이지로 이동
        window.location.href = `/pages/search-place/search?q=${encodeURIComponent(searchTerm)}`;

        // 검색 박스 닫기
        searchBox.classList.remove('active');

        // 입력창 초기화
        searchInput.value = '';
    } else {
        alert('검색어를 입력해주세요.');
        searchInput.focus();
    }
}
