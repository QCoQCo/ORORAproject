// 푸터를 로드하고 초기화하는 함수
async function loadFooter() {
    try {
        // 현재 페이지의 위치에 따라 경로 조정
        const footerPath = getFooterPath();
        const response = await fetch(footerPath);
        
        if (!response.ok) {
            throw new Error('푸터 로드 실패');
        }
        
        const footerHTML = await response.text();
        
        // 푸터 컨테이너에 HTML 삽입
        const footerContainer = document.getElementById('footer-container');
        if (footerContainer) {
            footerContainer.innerHTML = footerHTML;
            
            // 푸터 로드 후 이벤트 초기화
            initFooterEvents();
        } else {
            // 푸터 컨테이너가 없으면 기존 footer 태그를 찾아서 교체
            const existingFooter = document.getElementById('footer');
            if (existingFooter) {
                existingFooter.outerHTML = footerHTML;
                initFooterEvents();
            }
        }
    } catch (error) {
        console.error('푸터 로드 중 오류:', error);
    }
}

// 현재 페이지 위치에 따른 푸터 경로 결정
function getFooterPath() {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/pages/')) {
        return '../../components/footer.html';
    } else {
        return './components/footer.html';
    }
}

// 푸터 이벤트 초기화
function initFooterEvents() {
    // 소셜 링크 클릭 이벤트 (분석 등을 위한 트래킹)
    const socialLinks = document.querySelectorAll('.footer-social a');
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const platform = link.title || 'Unknown';
            console.log(`소셜 링크 클릭: ${platform}`);
            // 여기에 분석 코드 추가 가능
        });
    });

    // 내부 링크 클릭 이벤트
    const internalLinks = document.querySelectorAll('.footer-links a, .footer-info a[href^="/"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const linkText = link.textContent.trim();
            console.log(`푸터 내부 링크 클릭: ${linkText}`);
            // 여기에 분석 코드 추가 가능
        });
    });

    // 현재 연도 자동 업데이트
    updateCopyright();
    
    // 스크롤 투 탑 기능 (선택사항)
    addScrollToTopFeature();
}

// 저작권 연도 자동 업데이트
function updateCopyright() {
    const currentYear = new Date().getFullYear();
    const copyrightElements = document.querySelectorAll('.footer-bottom-content p');
    
    copyrightElements.forEach(element => {
        if (element.textContent.includes('2024')) {
            element.textContent = element.textContent.replace('2024', currentYear);
        }
    });
}

// 스크롤 투 탑 기능 추가 (선택사항)
function addScrollToTopFeature() {
    // 푸터 로고 클릭 시 맨 위로 스크롤
    const footerLogo = document.querySelector('.footer-logo');
    if (footerLogo) {
        footerLogo.style.cursor = 'pointer';
        footerLogo.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// 푸터 애니메이션 효과 (선택사항)
function initFooterAnimations() {
    // Intersection Observer를 사용한 애니메이션
    const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // 푸터 섹션들에 애니메이션 적용
    const footerSections = document.querySelectorAll('.footer-section');
    footerSections.forEach((section, index) => {
        // 초기 상태 설정
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
        
        // 관찰 시작
        footerObserver.observe(section);
    });
}

// DOM 로드 완료 후 푸터 로드
document.addEventListener('DOMContentLoaded', async () => {
    await loadFooter();
    
    // 애니메이션 초기화 (선택사항)
    setTimeout(() => {
        initFooterAnimations();
    }, 100);
});

// 전역 함수로 내보내기 (필요한 경우)
window.loadFooter = loadFooter; 