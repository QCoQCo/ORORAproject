// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initScrollAnimations();
    initCardHoverEffects();
    initSmoothScrolling();
    initParallaxEffect();
    initHeroSlider();
});

// Intersection Observer for scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe navigation cards
    const cards = document.querySelectorAll('.nav-card');
    cards.forEach(card => {
        observer.observe(card);
    });

    // Observe feature items
    const features = document.querySelectorAll('.feature-item');
    features.forEach(feature => {
        observer.observe(feature);
    });
}

// Enhanced card hover effects
function initCardHoverEffects() {
    const cards = document.querySelectorAll('.nav-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add subtle scale effect
            this.style.transform = 'translateY(-8px) scale(1.02)';
            
            // Add glow effect
            this.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 20px rgba(59, 130, 196, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
        });
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Parallax effect for hero section
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.2;
            
            // Apply parallax to current active slide
            const activeSlide = hero.querySelector('.hero-slide.active');
            if (activeSlide) {
                activeSlide.style.transform = `translateY(${rate}px)`;
            }
        });
    }
}

// Hero Slider functionality
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.indicator');
    let currentSlide = 0;
    let slideInterval;

    // Function to show specific slide
    function showSlide(index) {
        // Remove active class from all slides and indicators
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Add active class to current slide and indicator
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        
        currentSlide = index;
    }

    // Function to go to next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Auto-play functionality
    function startSlideshow() {
        slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    function stopSlideshow() {
        clearInterval(slideInterval);
    }

    // Add click event listeners to indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
            stopSlideshow();
            startSlideshow(); // Restart the slideshow timer
        });
    });

    // Pause slideshow on hover
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mouseenter', stopSlideshow);
        hero.addEventListener('mouseleave', startSlideshow);
    }

    // Start the slideshow
    startSlideshow();

    // Preload images for smooth transitions
    slides.forEach(slide => {
        const bgImage = slide.style.backgroundImage;
        if (bgImage) {
            const imageUrl = bgImage.slice(4, -1).replace(/["']/g, "");
            const img = new Image();
            img.src = imageUrl;
        }
    });
}

// Dynamic greeting based on time
function setDynamicGreeting() {
    const hour = new Date().getHours();
    const subtitle = document.querySelector('.hero-subtitle');
    
    if (subtitle) {
        let greeting = '새로운 부산을 발견하다';
        
        if (hour >= 5 && hour < 12) {
            greeting = '좋은 아침! 부산과 함께 시작하세요';
        } else if (hour >= 12 && hour < 18) {
            greeting = '오늘 부산에서 특별한 하루를';
        } else if (hour >= 18 && hour < 22) {
            greeting = '부산의 아름다운 저녁을 만끽하세요';
        } else {
            greeting = '부산의 밤이 당신을 기다립니다';
        }
        
        subtitle.textContent = greeting;
    }
}

// Call dynamic greeting on load
setDynamicGreeting();

// Loading animation for images
function initImageLoading() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
            this.style.transform = 'scale(1)';
        });
        
        // Set initial styles
        img.style.opacity = '0';
        img.style.transform = 'scale(0.9)';
        img.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
}

// Initialize image loading
initImageLoading();

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        // Add focus styles for keyboard navigation
        const style = document.createElement('style');
        style.innerHTML = `
            .nav-card:focus {
                outline: 3px solid #60a5fa;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }
});

// Performance optimization: throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll events
const throttledParallax = throttle(initParallaxEffect, 16);
window.addEventListener('scroll', throttledParallax);

