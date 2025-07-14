// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initScrollAnimations();
    initCardHoverEffects();
    initSmoothScrolling();
    initParallaxEffect();
    initHeroSlider();
    initJapaneseIntroEffects();
    initExperienceEffects();
    initTransportationEffects();
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

    // Observe Japanese introduction elements
    const introElements = document.querySelectorAll('.highlight-item, .distance-card, .travel-tips, .stat-item');
    introElements.forEach(element => {
        observer.observe(element);
    });

    // Observe experience elements
    const experienceElements = document.querySelectorAll('.experience-item');
    experienceElements.forEach(element => {
        observer.observe(element);
    });

    // Observe transportation elements
    const transportElements = document.querySelectorAll('.transport-card, .app-item');
    transportElements.forEach(element => {
        observer.observe(element);
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

// Japanese Introduction Section Effects
function initJapaneseIntroEffects() {
    // Statistics counter animation
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target.querySelector('.stat-number');
                if (statNumber && !statNumber.classList.contains('animated')) {
                    animateStatNumber(statNumber);
                    statNumber.classList.add('animated');
                }
            }
        });
    }, observerOptions);

    // Observe stat items
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        statsObserver.observe(item);
    });

    // Enhanced highlight items hover effects
    const highlightItems = document.querySelectorAll('.highlight-item');
    highlightItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.highlight-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });

        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.highlight-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });

    // Route animation effect
    const routeInfo = document.querySelector('.route-info');
    if (routeInfo) {
        const transportIcon = routeInfo.querySelector('.transport-icon');
        if (transportIcon) {
            setInterval(() => {
                transportIcon.style.transform = 'translateX(10px)';
                setTimeout(() => {
                    transportIcon.style.transform = 'translateX(0)';
                }, 1000);
            }, 3000);
        }
    }

    // Travel tips animation
    const travelTips = document.querySelector('.travel-tips');
    if (travelTips) {
        const listItems = travelTips.querySelectorAll('li');
        listItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 200);
        });
    }
}

// Animate stat numbers
function animateStatNumber(element) {
    const text = element.textContent;
    const hasPlus = text.includes('+');
    const isTime = text.includes('시간');
    const isDay = text.includes('일');
    
    let targetNumber;
    if (hasPlus) {
        targetNumber = parseInt(text.replace(/[^\d]/g, ''));
    } else if (isTime) {
        targetNumber = parseInt(text.replace(/[^\d]/g, ''));
    } else if (isDay) {
        targetNumber = parseInt(text.replace(/[^\d]/g, ''));
    } else {
        targetNumber = parseInt(text.replace(/[^\d]/g, ''));
    }

    let currentNumber = 0;
    const increment = targetNumber / 50;
    const duration = 2000;
    const stepTime = duration / 50;

    const counter = setInterval(() => {
        currentNumber += increment;
        
        if (currentNumber >= targetNumber) {
            currentNumber = targetNumber;
            clearInterval(counter);
        }

        let displayText;
        if (hasPlus) {
            displayText = Math.floor(currentNumber) + '만+';
        } else if (isTime) {
            displayText = Math.floor(currentNumber) + '시간';
        } else if (isDay) {
            displayText = Math.floor(currentNumber) + '일';
        } else {
            displayText = Math.floor(currentNumber) + '+';
        }

        element.textContent = displayText;
    }, stepTime);
}

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

// Experience Section Effects
function initExperienceEffects() {
    const experienceItems = document.querySelectorAll('.experience-item');
    
    experienceItems.forEach(item => {
        // Icon animation on hover
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.experience-icon');
            if (icon) {
                icon.style.animation = 'bounce 0.6s ease-in-out';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.experience-icon');
            if (icon) {
                icon.style.animation = '';
            }
        });
        
        // Highlight tags hover effect
        const highlights = item.querySelectorAll('.experience-highlights span');
        highlights.forEach(highlight => {
            highlight.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px) scale(1.05)';
            });
            
            highlight.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    });
}

// Transportation Section Effects
function initTransportationEffects() {
    const transportCards = document.querySelectorAll('.transport-card');
    const appItems = document.querySelectorAll('.app-item');
    
    // Transport card hover effects
    transportCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const image = this.querySelector('.transport-image');
            if (image) {
                image.style.transform = 'scale(1.1)';
                image.style.filter = 'brightness(1.1)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const image = this.querySelector('.transport-image');
            if (image) {
                image.style.transform = 'scale(1)';
                image.style.filter = 'brightness(1)';
            }
        });
    });
    
    // App item click effect
    appItems.forEach(item => {
        item.addEventListener('click', function() {
            // Add ripple effect
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(96, 165, 250, 0.4)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.marginLeft = '-10px';
            ripple.style.marginTop = '-10px';
            ripple.style.zIndex = '1';
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Parallax effect for transport apps section
    const transportApps = document.querySelector('.transport-apps');
    if (transportApps) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rect = transportApps.getBoundingClientRect();
            const speed = 0.1;
            
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                transportApps.style.transform = `translateY(${scrolled * speed}px)`;
            }
        });
    }
}

// Add CSS animation keyframes for bounce and ripple effects
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% { transform: translateY(0) scale(1); }
        25% { transform: translateY(-10px) scale(1.1); }
        50% { transform: translateY(-5px) scale(1.05); }
        75% { transform: translateY(-2px) scale(1.02); }
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .experience-item {
        cursor: pointer;
    }
    
    .app-item {
        cursor: pointer;
    }
    
    .experience-highlights span {
        cursor: pointer;
    }
`;
document.head.appendChild(style);

