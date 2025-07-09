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

