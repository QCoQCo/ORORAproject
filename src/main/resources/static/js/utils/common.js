/**
 * 공통 유틸리티 함수
 */

/**
 * 쿠키를 읽습니다.
 * @param {string} name - 쿠키 이름
 * @returns {string|null} 쿠키 값
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop().split(';').shift();
        return decodeURIComponent(cookieValue);
    }
    return null;
}

/**
 * 쿠키를 설정합니다.
 * @param {string} name - 쿠키 이름
 * @param {string} value - 쿠키 값
 * @param {number} days - 유효 기간(일)
 */
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

/**
 * 쿠키를 삭제합니다.
 * @param {string} name - 쿠키 이름
 */
function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

/**
 * 디바운스 함수
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간(ms)
 * @returns {Function} 디바운스된 함수
 */
function debounce(func, wait) {
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

/**
 * 스로틀 함수
 * @param {Function} func - 실행할 함수
 * @param {number} limit - 제한 시간(ms)
 * @returns {Function} 스로틀된 함수
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 텍스트에서 키워드를 하이라이트합니다.
 * @param {string} text - 원본 텍스트
 * @param {string} keyword - 하이라이트할 키워드
 * @returns {string} 하이라이트된 HTML 문자열
 */
function highlightKeyword(text, keyword) {
    if (!text || !keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

/**
 * 엔터키로 버튼 클릭 이벤트를 바인딩합니다.
 * @param {HTMLElement} inputElement - 입력 요소
 * @param {HTMLElement} buttonElement - 클릭할 버튼 요소
 */
function bindEnterKeyToButton(inputElement, buttonElement) {
    if (!inputElement || !buttonElement) return;
    
    inputElement.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            buttonElement.click();
        }
    });
}
