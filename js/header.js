const nav = document.querySelector('#nav');
const navList = nav.querySelectorAll('.d1 li');

navList.forEach(li => {
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

function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    
    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
        
        // 서브메뉴 토글 (모바일에서)
        const menuItems = nav.querySelectorAll('.d1 > li');
        menuItems.forEach(item => {
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

// 윈도우 로드 후에도 한 번 더 시도
window.addEventListener('load', initSearchBox);

// 검색 기능 초기화 상태 추적
let searchBoxInitialized = false;

// 검색 기능
function initSearchBox() {
    console.log('initSearchBox 함수 실행됨');
    
    // 이미 초기화되었다면 종료
    if (searchBoxInitialized) {
        console.log('검색 기능이 이미 초기화되었습니다.');
        return;
    }
    
    // 약간의 지연을 두고 요소를 찾기
    setTimeout(() => {
        const searchBtn = document.querySelector('#header .btns .btn2');
        const searchBox = document.querySelector('.search-box');
        
        console.log('검색 버튼:', searchBtn);
        console.log('검색 박스:', searchBox);
        console.log('헤더 요소:', document.querySelector('#header'));
        
                if (searchBtn && searchBox) {
            const searchInput = searchBox.querySelector('input');
            const searchSubmitBtn = searchBox.querySelector('button');
            
            console.log('검색 입력창:', searchInput);
            console.log('검색 실행 버튼:', searchSubmitBtn);
            
            // 초기화 성공 플래그 설정
            searchBoxInitialized = true;
            console.log('검색 기능 초기화 완료!');
            
            // 검색 버튼 클릭 시 검색 박스 토글
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('검색 버튼 클릭됨');
            searchBox.classList.toggle('active');
            
            // 검색 박스가 활성화되면 입력창에 포커스
            if (searchBox.classList.contains('active')) {
                setTimeout(() => {
                    if (searchInput) {
                        searchInput.focus();
                    }
                }, 300);
            }
        });
        
        // 검색 실행 버튼 클릭
        if (searchSubmitBtn) {
            searchSubmitBtn.addEventListener('click', () => {
                performSearch();
            });
        }
        
        // 엔터 키로 검색 실행
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
        
        // 검색 박스 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!searchBox.contains(e.target) && !searchBtn.contains(e.target)) {
                searchBox.classList.remove('active');
            }
        });
        } else {
            console.error('검색 버튼 또는 검색 박스를 찾을 수 없습니다.');
            console.log('사용 가능한 버튼들:', document.querySelectorAll('button'));
            console.log('사용 가능한 .search-box:', document.querySelectorAll('.search-box'));
        }
    }, 100); // setTimeout 종료
}

// 검색 실행 함수
function performSearch() {
    const searchInput = document.querySelector('.search-box input');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        console.log('검색어:', searchTerm);
        
        // window.location.href = `/pages/search-place/place.html?search=${encodeURIComponent(searchTerm)}`;
        
        
        // 검색 박스 닫기
        document.querySelector('.search-box').classList.remove('active');
        
        // 입력창 초기화
        searchInput.value = '';
    } else {
        alert('검색어를 입력해주세요.');
        searchInput.focus();
    }
}

