let swiper = new Swiper(".main_bg", {
      spaceBetween: 30,
      centeredSlides: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      effect: "fade",
      fadeEffect: {
        crossFade: true
      },
      speed: 1500,
});

document.addEventListener('DOMContentLoaded', () => {
    // 페이드인 애니메이션을 위한 요소 선택
    const description = document.querySelector('.busan .description');
    const contentSections = document.querySelectorAll('.busan .description > ul');
    
    // 스크롤 이벤트에 따른 패럴랙스 효과
    const mainBg = document.querySelector('.main_bg');
    const title = document.querySelector('.title');
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        
        // 배경 패럴랙스 효과 - 수정된 부분
        if (mainBg) {
            // 스크롤 위치에 따라 배경 위치 조정 (더 느리게 이동하도록 계수 조정)
            const translateY = scrollPosition * 0.15;
            // transform 대신 background-position 사용
            mainBg.style.transform = `translateY(0)`;
            
            // 배경 이미지들에 직접 적용
            const slides = mainBg.querySelectorAll('.swiper-slide img');
            slides.forEach(slide => {
                slide.style.transform = `scale(1.05) translateY(-${translateY}px)`;
            });
        }
        
        // 타이틀 텍스트 패럴랙스 효과
        if (title) {
            const opacity = 1 - (scrollPosition / 500);
            const translateY = scrollPosition * 0.5;
            title.style.opacity = opacity > 0 ? opacity : 0;
            title.style.transform = `translate(-50%, calc(-50% + ${translateY}px))`;
        }
    });
    
    // 콘텐츠 섹션 순차적 애니메이션
    if (contentSections.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 지연 시간을 계산하여 순차적으로 나타나게 함
                    const index = Array.from(contentSections).indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.classList.add('fade-in');
                    }, index * 200);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '-50px'
        });
        
        contentSections.forEach(section => {
            observer.observe(section);
        });
    }
    
    // 전체 description 컨테이너에 fade-in 클래스 추가
    if (description) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        observer.observe(description);
    }
    
    // 스크롤 탑 버튼 기능
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // 스크롤 위치에 따라 버튼 표시/숨김
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
    }
});