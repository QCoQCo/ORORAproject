// ============================================
// 부산 소개 사이드 네비게이션 이벤트 리스너
// sidenav은 이제 Thymeleaf fragment로 서버에서 렌더링됩니다.
// 이 파일은 메뉴 이벤트 리스너만 제공합니다.
// ============================================

// 부산 소개 사이드 네비게이션 이벤트 관리자
class SideNavLoader {
    constructor(options = {}) {
        this.onMenuClick = options.onMenuClick || null;
        this.animationDuration = 300; // 애니메이션 지속 시간
    }

    // 사이드 네비게이션 초기화 (이벤트 리스너만 설정)
    initSideNav() {
        this.initMenuEvents();
        this.initSubMenuDisplay();
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
            // 번역 시스템 사용
            this.updateButtonText(button, 'close');
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
            // 번역 시스템 사용
            this.updateButtonText(button, 'open');
        }
    }

    // 버튼 텍스트 업데이트 (번역 지원)
    updateButtonText(button, state) {
        if (!button) return;
        
        // 번역 시스템이 있는 경우
        if (window.languageManager) {
            const key = state === 'open' 
                ? 'about.sidenav.submenu_open' 
                : 'about.sidenav.submenu_close';
            const translation = window.languageManager.getTranslation(key);
            if (translation) {
                button.textContent = translation;
                return;
            }
        }
        
        // 번역 시스템이 없는 경우 기본값
        button.textContent = state === 'open' ? '하위메뉴 열기' : '하위메뉴 닫기';
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
                    this.updateButtonText(button, 'open');
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
            const mainLink = parentLi.querySelector('.sideNavMenuTitle > a');
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
            } else if (mainLink && !subMenu) {
                // 서브메뉴가 없는 경우 일반 링크로 작동 (character.html 같은 경우)
                mainLink.addEventListener('click', (e) => {
                    const href = mainLink.getAttribute('href');
                    const currentFileName = window.location.pathname.split('/').pop();
                    
                    if (href === currentFileName) {
                        e.preventDefault(); // 같은 페이지인 경우 이동 방지
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

    // 특정 메뉴 활성화 (필요한 경우에만 사용)
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
                
                // 서브메뉴가 있는 경우에만 표시
                const hasSubMenu = parentLi.querySelector('ul');
                if (hasSubMenu) {
                    this.showSubMenu(parentLi, false);
                }
            }
        }
    }

    // 사이드네비게이션 새로고침 (이벤트 리스너만 재초기화)
    refresh() {
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
window.initSideNav = function(options = {}) {
    const loader = new SideNavLoader(options);
    loader.initSideNav();
    return loader;
};

// DOM 로드 완료 후 자동 실행
document.addEventListener('DOMContentLoaded', () => {
    // about-busan 페이지에서만 이벤트 리스너 초기화
    if (window.location.pathname.includes('/about-busan/')) {
        const sideNavLoader = window.initSideNav();
        
        // 전역 변수로 접근 가능하도록 설정
        window.sideNavLoader = sideNavLoader;
    }
}); 