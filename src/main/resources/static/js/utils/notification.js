/**
 * 알림 메시지 유틸리티
 */

/**
 * 알림 메시지를 표시합니다 (admin.js 스타일)
 * @param {string} message - 표시할 메시지
 * @param {string} type - 알림 타입 ('success', 'error', 'info', 'warning')
 */
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // 스타일 적용
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;

    // 타입별 색상
    const colors = {
        success: 'linear-gradient(45deg, #27ae60, #2ecc71)',
        error: 'linear-gradient(45deg, #e74c3c, #c0392b)',
        info: 'linear-gradient(45deg, #3498db, #2980b9)',
        warning: 'linear-gradient(45deg, #f39c12, #e67e22)',
    };

    notification.style.background = colors[type] || colors.info;

    document.body.appendChild(notification);

    // 3초 후 자동 제거
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

/**
 * 에러 메시지를 표시합니다 (DOM 요소 기반, find-id.js, reset-password.js 스타일)
 * @param {string} message - 표시할 메시지
 * @param {HTMLElement} errorElement - 에러 메시지를 표시할 요소
 * @param {HTMLElement} successElement - 성공 메시지 요소 (있으면 숨김)
 */
function showError(message, errorElement = null, successElement = null) {
    if (errorElement) {
        // DOM 요소 기반 표시
        if (successElement) {
            successElement.style.display = 'none';
            successElement.textContent = '';
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        // 알림 방식으로 표시
        showNotification(message, 'error');
    }
}

/**
 * 성공 메시지를 표시합니다 (DOM 요소 기반)
 * @param {string} message - 표시할 메시지
 * @param {HTMLElement} successElement - 성공 메시지를 표시할 요소
 * @param {HTMLElement} errorElement - 에러 메시지 요소 (있으면 숨김)
 */
function showSuccess(message, successElement = null, errorElement = null) {
    if (successElement) {
        // DOM 요소 기반 표시
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
        successElement.textContent = message;
        successElement.style.display = 'block';
    } else {
        // 알림 방식으로 표시
        showNotification(message, 'success');
    }
}

/**
 * 메시지를 숨깁니다
 * @param {HTMLElement} errorElement - 에러 메시지 요소
 * @param {HTMLElement} successElement - 성공 메시지 요소
 */
function hideMessages(errorElement = null, successElement = null) {
    if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.textContent = '';
    }
    if (successElement) {
        successElement.style.display = 'none';
        successElement.textContent = '';
    }
}

// 애니메이션 CSS 추가 (동적으로)
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}
