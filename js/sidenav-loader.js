// 부산 소개 사이드 네비게이션 로더
class SideNavLoader {
    constructor(options = {}) {
        this.containerSelector = options.containerSelector || '#sidenav-container';
        this.autoActivate = options.autoActivate !== false; // 기본값 true
        this.onMenuClick = options.onMenuClick || null;
    }

    // 사이드 네비게이션 템플릿 로드
    async loadSideNav() {
        try {
            const sideNavPath = this.getSideNavPath();
            const response = await fetch(sideNavPath);
            
            if (!response.ok) {
                throw new Error('사이드 네비게이션 로드 실패');
            }
            
            const sideNavHTML = await response.text();
            
            // 사이드 네비게이션 컨테이너에 HTML 삽입
            const sideNavContainer = document.querySelector(this.containerSelector);
            if (sideNavContainer) {
                sideNavContainer.innerHTML = sideNavHTML;
                
                // 로드 후 초기화
                this.initSideNav();
                
                return true;
            } else {
                throw new Error(`사이드 네비게이션 컨테이너를 찾을 수 없습니다: ${this.containerSelector}`);
            }
        } catch (error) {
            console.error('사이드 네비게이션 로드 중 오류:', error);
            return false;
        }
    }

    // 현재 페이지 위치에 따른 사이드 네비게이션 경로 결정
    getSideNavPath() {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('/pages/about-busan/')) {
            return '../../components/sidenav-busan.html';
        } else if (currentPath.includes('/pages/')) {
            return '../components/sidenav-busan.html';
        } else {
            return './components/sidenav-busan.html';
        }
    }

    // 사이드 네비게이션 초기화
    initSideNav() {
        if (this.autoActivate) {
            this.setActiveMenu();
        }
        
        this.initMenuEvents();
    }

    // 현재 페이지에 따른 활성 메뉴 설정
    setActiveMenu() {
        const currentPath = window.location.pathname;
        const fileName = currentPath.split('/').pop();
        
        // 모든 active 클래스 제거
        const allMenuItems = document.querySelectorAll('#sideNav li');
        allMenuItems.forEach(item => item.classList.remove('active'));
        
        // 현재 페이지에 해당하는 메뉴 활성화
        let activeSelector = null;
        
        switch (fileName) {
            case 'busan.html':
                activeSelector = '#sideNav .bsInfo li:first-child';
                // 부모 메뉴도 활성화
                document.querySelector('#sideNav > .sideNavMenu > ul > li:first-child')?.classList.add('active');
                break;
            case 'goals.html':
                activeSelector = '#sideNav .bsInfo li:nth-child(2)';
                document.querySelector('#sideNav > .sideNavMenu > ul > li:first-child')?.classList.add('active');
                break;
            case 'basisinfo.html':
                activeSelector = '#sideNav .bsInfo li:nth-child(3)';
                document.querySelector('#sideNav > .sideNavMenu > ul > li:first-child')?.classList.add('active');
                break;
            case 'symbol.html':
                activeSelector = '#sideNav .symbol li:first-child';
                document.querySelector('#sideNav > .sideNavMenu > ul > li:nth-child(2)')?.classList.add('active');
                break;
            case 'character.html':
                activeSelector = '#sideNav > .sideNavMenu > ul > li:nth-child(3)';
                break;
            default:
                // 기본값: 첫 번째 메뉴 활성화
                activeSelector = '#sideNav .bsInfo li:first-child';
                document.querySelector('#sideNav > .sideNavMenu > ul > li:first-child')?.classList.add('active');
        }
        
        if (activeSelector) {
            const activeElement = document.querySelector(activeSelector);
            if (activeElement) {
                activeElement.classList.add('active');
            }
        }
    }

    // 메뉴 이벤트 초기화
    initMenuEvents() {
        const menuButtons = document.querySelectorAll('.btnMenuDropDown');
        
        menuButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const parentLi = button.closest('li');
                const subMenu = parentLi.querySelector('ul');
                
                if (subMenu) {
                    const isOpen = subMenu.style.display === 'block';
                    
                    // 다른 서브메뉴 모두 닫기
                    document.querySelectorAll('.sideNavMenu ul ul').forEach(menu => {
                        menu.style.display = 'none';
                    });
                    
                    // 모든 버튼 텍스트 업데이트
                    document.querySelectorAll('.btnMenuDropDown').forEach(btn => {
                        btn.textContent = '하위메뉴 열기';
                    });
                    
                    // 현재 서브메뉴 토글
                    if (!isOpen) {
                        subMenu.style.display = 'block';
                        button.textContent = '하위메뉴 닫기';
                    } else {
                        subMenu.style.display = 'none';
                        button.textContent = '하위메뉴 열기';
                    }
                }
                
                // 콜백 함수 호출
                if (this.onMenuClick) {
                    this.onMenuClick(button, parentLi);
                }
            });
        });

        // 메뉴 링크 클릭 이벤트
        const menuLinks = document.querySelectorAll('#sideNav a');
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // 외부 링크가 아닌 경우에만 처리
                if (!link.hasAttribute('target')) {
                    const href = link.getAttribute('href');
                    if (href && href !== '#') {
                        // 현재 페이지와 같은 링크인 경우 페이지 이동 방지
                        const currentFileName = window.location.pathname.split('/').pop();
                        if (href === currentFileName) {
                            e.preventDefault();
                        }
                    }
                }
            });
        });
    }

    // 특정 메뉴 활성화
    activateMenu(menuId) {
        // 모든 active 클래스 제거
        const allMenuItems = document.querySelectorAll('#sideNav li');
        allMenuItems.forEach(item => item.classList.remove('active'));
        
        // 지정된 메뉴 활성화
        const targetMenu = document.querySelector(`#sideNav [data-menu-id="${menuId}"]`);
        if (targetMenu) {
            targetMenu.classList.add('active');
            
            // 부모 메뉴도 활성화
            const parentLi = targetMenu.closest('li');
            if (parentLi) {
                parentLi.classList.add('active');
            }
        }
    }
}

// 간편 사용을 위한 전역 함수
window.loadSideNav = async function(options = {}) {
    const loader = new SideNavLoader(options);
    const success = await loader.loadSideNav();
    return success ? loader : null;
};

// DOM 로드 완료 후 자동 실행
document.addEventListener('DOMContentLoaded', async () => {
    // about-busan 페이지에서만 자동 로드
    if (window.location.pathname.includes('/about-busan/')) {
        await window.loadSideNav();
    }
}); 