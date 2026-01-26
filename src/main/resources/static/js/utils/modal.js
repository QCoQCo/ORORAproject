/**
 * 모달 관련 유틸리티
 */

/**
 * 이미지 모달을 엽니다.
 * @param {string} imageUrl - 표시할 이미지 URL
 * @param {number} zIndex - z-index 값 (기본값: 2000)
 */
function openImageModal(imageUrl, zIndex = 2000) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        z-index: ${zIndex};
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    `;

    modal.innerHTML = `
        <div style="position: relative; max-width: 90%; max-height: 90%;">
            <span onclick="this.parentElement.parentElement.remove()" 
                  style="position: absolute; top: -40px; right: 0; color: #fff; font-size: 40px; font-weight: bold; cursor: pointer; z-index: ${zIndex + 1};">&times;</span>
            <img src="${imageUrl}" 
                 style="max-width: 100%; max-height: 90vh; border-radius: 8px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
        </div>
    `;

    document.body.appendChild(modal);

    // 배경 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // ESC 키로 닫기
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

/**
 * 모달을 안전하게 엽니다 (DOM이 준비될 때까지 재시도)
 * @param {string} modalId - 모달 요소의 ID
 * @param {Function} callback - 모달이 열렸을 때 실행할 콜백 함수
 * @param {number} maxAttempts - 최대 시도 횟수 (기본값: 50)
 * @param {number} interval - 재시도 간격(ms) (기본값: 100)
 */
function tryOpenModal(modalId, callback, maxAttempts = 50, interval = 100) {
    let attempts = 0;

    const tryOpen = () => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            // 배경 스크롤 방지
            document.body.style.overflow = 'hidden';

            if (callback && typeof callback === 'function') {
                callback(modal);
            }
        } else {
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(tryOpen, interval);
            } else {
                console.error(`모달을 찾을 수 없습니다: ${modalId}`);
            }
        }
    };

    tryOpen();
}

/**
 * 모달을 닫습니다.
 * @param {string} modalId - 모달 요소의 ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        // 배경 스크롤 복원
        document.body.style.overflow = '';
    }
}

/**
 * 모달 닫기 이벤트를 초기화합니다.
 * @param {string} modalId - 모달 요소의 ID
 * @param {string} closeButtonId - 닫기 버튼의 ID (기본값: null, 자동 감지)
 */
function initModalCloseEvents(modalId, closeButtonId = null) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // 닫기 버튼 찾기
    const closeBtn = closeButtonId
        ? document.getElementById(closeButtonId)
        : modal.querySelector('.close, [data-close-modal]');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal(modalId);
        });
    }

    // 배경 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modalId);
        }
    });

    // ESC 키로 닫기
    const handleEsc = (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal(modalId);
        }
    };
    document.addEventListener('keydown', handleEsc);
}
