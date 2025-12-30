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
    // TODO: 백엔드 연결 시 API 호출로 변경
    // 백엔드 API 엔드포인트: POST /api/auth/logout
    // 요청 형식: { token: "jwt_token" }
    // 응답 형식: { success: true, message: string }

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
            // 로그인된 상태: 사용자명 드롭다운 메뉴 표시
            loginBtn.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-dropdown-btn">
                        <span class="username">${user.username}</span>
                        <span class="dropdown-arrow">▼</span>
                    </button>
                    <div class="user-dropdown-menu">
                        <a href="/pages/mypage/mypage.html" class="dropdown-item">
                            <span class="dropdown-icon">👤</span>
                            마이페이지
                        </a>
                        <button class="dropdown-item logout-item" onclick="logout()">
                            <span class="dropdown-icon">🚪</span>
                            로그아웃
                        </button>
                    </div>
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

// 사용자 드롭다운 메뉴 초기화
function initUserDropdown() {
    const userDropdownBtn = document.querySelector('.user-dropdown-btn');
    const userDropdownMenu = document.querySelector('.user-dropdown-menu');

    if (userDropdownBtn && userDropdownMenu) {
        // 드롭다운 버튼 클릭 이벤트
        userDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdownMenu.classList.toggle('active');
        });

        // 외부 클릭 시 드롭다운 닫기
        document.addEventListener('click', (e) => {
            if (!userDropdownBtn.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                userDropdownMenu.classList.remove('active');
            }
        });

        // 드롭다운 메뉴 항목 클릭 시 닫기
        const dropdownItems = userDropdownMenu.querySelectorAll('.dropdown-item');
        dropdownItems.forEach((item) => {
            item.addEventListener('click', () => {
                userDropdownMenu.classList.remove('active');
            });
        });
    }
}

// 페이지 로드 시 헤더 업데이트
document.addEventListener('DOMContentLoaded', function () {
    // 헤더가 로드된 후 업데이트
    setTimeout(() => {
        updateHeader();
        // 드롭다운 메뉴 초기화
        setTimeout(initUserDropdown, 200);
    }, 100);
});

// 로그인 성공 후 헤더 업데이트를 위한 전역 함수
window.updateHeaderAfterLogin = updateHeader;
