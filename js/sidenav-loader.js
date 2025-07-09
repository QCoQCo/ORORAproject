// 부산 소개 사이드 네비게이션 로더
class SideNavLoader {
    constructor(options = {}) {
        this.containerSelector = options.containerSelector || '#sidenav-container';
        this.autoActivate = options.autoActivate !== false; // 기본값 true
        this.onMenuClick = options.onMenuClick || null;
        this.animationDuration = 300; // 애니메이션 지속 시간
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
        this.initSubMenuDisplay();
    }

    // 현재 페이지에 따른 활성 메뉴 설정
    setActiveMenu() {
        const currentPath = window.location.pathname;
        const fileName = currentPath.split('/').pop();
        
        // 모든 active 클래스 제거
        const allMenuItems = document.querySelectorAll('#sideNav li');
        allMenuItems.forEach(item => item.classList.remove('active'));
        
        // 현재 페이지에 해당하는 메뉴 활성화
        let activeInfo = this.getActiveMenuInfo(fileName);
        
        if (activeInfo) {
            // 서브메뉴 활성화
            if (activeInfo.subMenuSelector) {
                const subMenuItem = document.querySelector(activeInfo.subMenuSelector);
                if (subMenuItem) {
                    subMenuItem.classList.add('active');
                }
            }
            
            // 부모 메뉴 활성화
            if (activeInfo.parentMenuSelector) {
                const parentMenuItem = document.querySelector(activeInfo.parentMenuSelector);
                if (parentMenuItem) {
                    parentMenuItem.classList.add('active');
                    // 부모 메뉴의 서브메뉴 표시
                    this.showSubMenu(parentMenuItem);
                }
            }
        }
    }

    // 파일명에 따른 활성 메뉴 정보 반환
    getActiveMenuInfo(fileName) {
        const menuMap = {
            'busan.html': {
                subMenuSelector: '#sideNav .bsInfo li:first-child',
                parentMenuSelector: '#sideNav > .sideNavMenu > ul > li:first-child'
            },
            'goals.html': {
                subMenuSelector: '#sideNav .bsInfo li:nth-child(2)',
                parentMenuSelector: '#sideNav > .sideNavMenu > ul > li:first-child'
            },
            'basisinfo.html': {
                subMenuSelector: '#sideNav .bsInfo li:nth-child(3)',
                parentMenuSelector: '#sideNav > .sideNavMenu > ul > li:first-child'
            },
            'symbol.html': {
                subMenuSelector: '#sideNav .symbol li:first-child',
                parentMenuSelector: '#sideNav > .sideNavMenu > ul > li:nth-child(2)'
            },
            'character.html': {
                parentMenuSelector: '#sideNav > .sideNavMenu > ul > li:nth-child(3)'
            }
        };
        
        return menuMap[fileName] || {
            subMenuSelector: '#sideNav .bsInfo li:first-child',
            parentMenuSelector: '#sideNav > .sideNavMenu > ul > li:first-child'
        };
    }

    // 서브메뉴 초기 표시 상태 설정
    initSubMenuDisplay() {
        const subMenus = document.querySelectorAll('.sideNavMenu ul ul');
        subMenus.forEach(subMenu => {
            const parentLi = subMenu.closest('li');
            if (parentLi && parentLi.classList.contains('active')) {
                this.showSubMenu(parentLi, false); // 애니메이션 없이 표시
            }
        });
    }

    // 서브메뉴 표시
    showSubMenu(parentLi, animated = true) {
        const subMenu = parentLi.querySelector('ul');
        const button = parentLi.querySelector('.btnMenuDropDown');
        
        if (subMenu && button) {
            if (animated) {
                subMenu.style.display = 'block';
                subMenu.style.animation = 'slideDown 0.3s ease';
            } else {
                subMenu.style.display = 'block';
            }
            button.textContent = '하위메뉴 닫기';
        }
    }

    // 서브메뉴 숨김
    hideSubMenu(parentLi, animated = true) {
        const subMenu = parentLi.querySelector('ul');
        const button = parentLi.querySelector('.btnMenuDropDown');
        
        if (subMenu && button) {
            if (animated) {
                subMenu.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => {
                    subMenu.style.display = 'none';
                }, this.animationDuration);
            } else {
                subMenu.style.display = 'none';
            }
            button.textContent = '하위메뉴 열기';
        }
    }

    // 메뉴 이벤트 초기화
    initMenuEvents() {
        const menuButtons = document.querySelectorAll('.btnMenuDropDown');
        
        menuButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const parentLi = button.closest('li');
                const subMenu = parentLi.querySelector('ul');
                
                if (subMenu) {
                    const isVisible = subMenu.style.display === 'block';
                    
                    // 다른 서브메뉴 모두 닫기
                    this.closeAllSubMenus(parentLi);
                    
                    // 현재 서브메뉴 토글
                    if (!isVisible) {
                        this.showSubMenu(parentLi);
                    } else {
                        this.hideSubMenu(parentLi);
                    }
                }
                
                // 콜백 함수 호출
                if (this.onMenuClick) {
                    this.onMenuClick(button, parentLi);
                }
            });
        });

        // 메뉴 링크 클릭 이벤트
        this.initLinkEvents();
        
        // 부모 메뉴 클릭 이벤트 (드롭다운 토글)
        this.initParentMenuEvents();
    }

    // 모든 서브메뉴 닫기
    closeAllSubMenus(excludeParent = null) {
        const allParentItems = document.querySelectorAll('#sideNav > .sideNavMenu > ul > li');
        
        allParentItems.forEach(parentLi => {
            if (parentLi !== excludeParent) {
                const subMenu = parentLi.querySelector('ul');
                const button = parentLi.querySelector('.btnMenuDropDown');
                
                if (subMenu && button) {
                    subMenu.style.display = 'none';
                    button.textContent = '하위메뉴 열기';
                }
            }
        });
    }

    // 링크 클릭 이벤트 초기화
    initLinkEvents() {
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
                            return;
                        }
                        
                        // 페이지 이동 전 로딩 효과
                        this.showLoadingEffect(link);
                    }
                }
            });
            
            // 호버 효과 개선
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'translateX(2px)';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateX(0)';
            });
        });
    }

    // 부모 메뉴 클릭 이벤트 (드롭다운 토글)
    initParentMenuEvents() {
        const parentMenus = document.querySelectorAll('#sideNav > .sideNavMenu > ul > li');
        
        parentMenus.forEach(parentLi => {
            const mainLink = parentLi.querySelector('> a');
            const subMenu = parentLi.querySelector('ul');
            
            if (mainLink && subMenu) {
                mainLink.addEventListener('click', (e) => {
                    // 서브메뉴가 있는 경우 드롭다운 토글
                    e.preventDefault();
                    
                    const button = parentLi.querySelector('.btnMenuDropDown');
                    if (button) {
                        button.click(); // 버튼 클릭 이벤트 트리거
                    }
                });
            }
        });
    }

    // 로딩 효과 표시
    showLoadingEffect(link) {
        const originalText = link.textContent;
        link.style.opacity = '0.6';
        link.style.pointerEvents = 'none';
        
        // 실제 페이지 이동은 브라우저가 처리
        setTimeout(() => {
            link.style.opacity = '1';
            link.style.pointerEvents = 'auto';
        }, 1000);
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
                this.showSubMenu(parentLi, false);
            }
        }
    }

    // 사이드네비게이션 새로고침
    refresh() {
        this.setActiveMenu();
        this.initSubMenuDisplay();
    }
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 1;
            max-height: 200px;
        }
        to {
            opacity: 0;
            max-height: 0;
        }
    }
    
    .sideNavMenu a {
        transition: all 0.3s ease, transform 0.2s ease !important;
    }
    
    .sideNavMenu .btnMenuDropDown {
        transition: all 0.3s ease !important;
    }
`;
document.head.appendChild(style);

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
        const sideNavLoader = await window.loadSideNav();
        
        // 전역 변수로 접근 가능하도록 설정
        window.sideNavLoader = sideNavLoader;
    }
}); 