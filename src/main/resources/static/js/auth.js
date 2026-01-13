// 인증 관련 공통 함수들

// 로그인 상태 확인
function isLoggedIn() {
    // localStorage와 sessionStorage 모두 확인
    const loggedInUser = localStorage.getItem('loggedInUser') || sessionStorage.getItem('loggedInUser');
    return loggedInUser !== null;
}

// 현재 로그인한 사용자 정보 가져오기
function getCurrentUser() {
    // localStorage를 먼저 확인 (로그인 상태 유지 시)
    let loggedInUser = localStorage.getItem('loggedInUser');
    // localStorage에 없으면 sessionStorage 확인
    if (!loggedInUser) {
        loggedInUser = sessionStorage.getItem('loggedInUser');
    }
    
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
    return user && (user.role === 'admin' || user.role === 'ADMIN' || user.roleCode === 'ADMIN');
}

// 로그아웃
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // 응답은 확인하지만 실패해도 로그아웃은 진행
        if (response.ok) {
            const data = await response.json();
            console.log(data.message);
        }
    } catch (error) {
        console.error('로그아웃 API 호출 오류:', error);
    }

    // localStorage와 sessionStorage 모두에서 사용자 정보 삭제
    localStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('loggedInUser');
    // 모든 페이지에서 로그아웃 후 메인 페이지로 이동
    window.location.href = '/';
}

// 헤더 업데이트 함수
function updateHeader() {
    // header-container 또는 직접 #header 찾기
    const headerContainer = document.getElementById('header-container');
    const header = document.getElementById('header');
    const container = headerContainer || header;
    
    if (!container) {
        console.warn('헤더를 찾을 수 없습니다. header-container 또는 #header를 확인하세요.');
        return;
    }

    const user = getCurrentUser();
    const isLoggedInUser = isLoggedIn();
    const isAdminUser = isAdmin();

    // 로그인 버튼과 사용자 정보 영역 찾기
    const loginBtn = container.querySelector('.btn1');
    const btnsContainer = container.querySelector('.btns');

    if (loginBtn && btnsContainer) {
        if (isLoggedInUser && user) {
            // 로그인된 상태: 사용자명 드롭다운 메뉴 표시
            loginBtn.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-dropdown-btn">
                        <span class="username">${user.username || '사용자'}</span>
                        <span class="dropdown-arrow">▼</span>
                    </button>
                    <div class="user-dropdown-menu">
                        <a href="/pages/mypage/mypage" class="dropdown-item">
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
            // 드롭다운 메뉴 초기화 (DOM 업데이트 후)
            setTimeout(() => {
                initUserDropdown();
            }, 100);
        } else {
            // 로그인되지 않은 상태: 로그인 버튼 표시
            loginBtn.innerHTML =
                '<a href="/pages/login/login" data-translate="header.login">로그인</a>';
        }
    } else {
        console.warn('로그인 버튼을 찾을 수 없습니다:', { loginBtn, btnsContainer });
    }

    // 관리자 메뉴 표시/숨김
    const adminMenuItem = container.querySelector('#admin-menu-item');
    if (adminMenuItem) {
        if (isAdminUser) {
            adminMenuItem.style.display = 'block';
        } else {
            adminMenuItem.style.display = 'none';
        }
    }
}

// 사용자 드롭다운 메뉴 초기화
function initUserDropdown() {
    const userDropdownBtn = document.querySelector('.user-dropdown-btn');
    const userDropdownMenu = document.querySelector('.user-dropdown-menu');

    if (!userDropdownBtn || !userDropdownMenu) {
        // 요소가 아직 준비되지 않았을 수 있으므로 경고만 출력
        return;
    }

    // 기존 이벤트 리스너 제거를 위해 새 핸들러 함수 생성
    const toggleDropdown = function(e) {
        e.preventDefault();
        e.stopPropagation();
        userDropdownMenu.classList.toggle('active');
    };

    // 기존 이벤트 리스너 제거 후 새로 추가
    const newBtn = userDropdownBtn.cloneNode(true);
    userDropdownBtn.parentNode.replaceChild(newBtn, userDropdownBtn);
    
    // 새로운 버튼 참조
    const btn = document.querySelector('.user-dropdown-btn');
    const menu = document.querySelector('.user-dropdown-menu');

    if (!btn || !menu) {
        console.error('드롭다운 요소를 다시 찾을 수 없습니다.');
        return;
    }

    // 드롭다운 버튼 클릭 이벤트
    btn.addEventListener('click', toggleDropdown);

    // 외부 클릭 시 드롭다운 닫기 (한 번만 등록)
    if (!window.userDropdownClickHandler) {
        window.userDropdownClickHandler = function(e) {
            const currentBtn = document.querySelector('.user-dropdown-btn');
            const currentMenu = document.querySelector('.user-dropdown-menu');
            if (currentBtn && currentMenu && !currentBtn.contains(e.target) && !currentMenu.contains(e.target)) {
                currentMenu.classList.remove('active');
            }
        };
        document.addEventListener('click', window.userDropdownClickHandler);
    }

    // 드롭다운 메뉴 항목 클릭 시 닫기
    const dropdownItems = menu.querySelectorAll('.dropdown-item');
    dropdownItems.forEach((item) => {
        item.addEventListener('click', function() {
            menu.classList.remove('active');
        });
    });
}

// 헤더 업데이트 중복 방지 플래그
let headerUpdateInProgress = false;
let headerUpdated = false;

// 페이지 언로드 시 플래그 리셋 (다음 페이지 로드 시 업데이트 허용)
window.addEventListener('beforeunload', function() {
    headerUpdated = false;
    window.headerUpdated = false;
});

// 페이지 로드 시 헤더 업데이트
function tryUpdateHeader() {
    // 이미 업데이트되었거나 업데이트 중이면 스킵
    if (headerUpdateInProgress || headerUpdated) {
        return false;
    }
    
    const headerContainer = document.getElementById('header-container');
    const header = document.getElementById('header');
    
    if (headerContainer || header) {
        headerUpdateInProgress = true;
        updateHeader();
        setTimeout(() => {
            initUserDropdown();
            headerUpdateInProgress = false;
            headerUpdated = true;
        }, 200);
        return true;
    }
    return false;
}

// 페이지 로드 시 한 번만 헤더 업데이트
document.addEventListener('DOMContentLoaded', function () {
    // 헤더가 로드된 후 업데이트 (최대 5번 시도)
    let attempts = 0;
    const maxAttempts = 5;
    
    const interval = setInterval(() => {
        attempts++;
        if (tryUpdateHeader() || attempts >= maxAttempts) {
            clearInterval(interval);
        }
    }, 200);
});

// 로그인 성공 후 헤더 업데이트를 위한 전역 함수
window.updateHeaderAfterLogin = function() {
    headerUpdated = false; // 로그인 후에는 다시 업데이트 허용
    updateHeader();
    // updateHeader() 내부에서 이미 initUserDropdown()을 호출하므로 여기서는 불필요
    // 하지만 확실하게 하기 위해 추가 호출
    setTimeout(() => {
        initUserDropdown();
    }, 300);
};
