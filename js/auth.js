// 인증 관련 공통 함수들

// 로그인 상태 확인
function isLoggedIn() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    return loggedInUser !== null;
}

// 현재 로그인한 사용자 정보 가져오기
function getCurrentUser() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
        try {
            return JSON.parse(loggedInUser);
        } catch (error) {
            console.error('사용자 정보 파싱 오류:', error);
            return null;
        }
    }
    return null;
}

// 관리자 권한 확인
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// 로그아웃
function logout() {
    sessionStorage.removeItem('loggedInUser');
    // 모든 페이지에서 로그아웃 후 메인 페이지로 이동
    window.location.href = '/index.html';
}

// 헤더 업데이트 함수
function updateHeader() {
    const headerContainer = document.getElementById('header-container');
    if (!headerContainer) return;

    const user = getCurrentUser();
    const isLoggedInUser = isLoggedIn();
    const isAdminUser = isAdmin();

    // 로그인 버튼과 사용자 정보 영역 찾기
    const loginBtn = headerContainer.querySelector('.btn1');
    const btnsContainer = headerContainer.querySelector('.btns');

    if (loginBtn && btnsContainer) {
        if (isLoggedInUser && user) {
            // 로그인된 상태: 사용자명과 로그아웃 버튼 표시
            loginBtn.innerHTML = `
                <div class="user-info">
                    <span class="username">${user.username}</span>
                    <button class="logout-btn" onclick="logout()">로그아웃</button>
                </div>
            `;
        } else {
            // 로그인되지 않은 상태: 로그인 버튼 표시
            loginBtn.innerHTML =
                '<a href="/pages/login/login.html" data-translate="header.login">로그인</a>';
        }
    }

    // 관리자 메뉴 표시/숨김
    const adminMenuItems = headerContainer.querySelectorAll('a[href*="admin"]');
    adminMenuItems.forEach((menuItem) => {
        const parentLi = menuItem.closest('li');
        if (parentLi) {
            if (isAdminUser) {
                parentLi.style.display = 'block';
            } else {
                parentLi.style.display = 'none';
            }
        }
    });
}

// 페이지 로드 시 헤더 업데이트
document.addEventListener('DOMContentLoaded', function () {
    // 헤더가 로드된 후 업데이트
    setTimeout(updateHeader, 100);
});

// 로그인 성공 후 헤더 업데이트를 위한 전역 함수
window.updateHeaderAfterLogin = updateHeader;
