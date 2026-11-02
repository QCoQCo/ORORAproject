// 인증 관련 공통 함수들

// 서버에서 로그인 상태 확인
let serverLoginStatusChecked = false;
let serverLoginStatus = null;

async function checkServerLoginStatus() {
    if (serverLoginStatusChecked && serverLoginStatus !== null) {
        return serverLoginStatus;
    }

    try {
        const response = await fetch('/api/auth/check', {
            method: 'GET',
            credentials: 'include', // 쿠키를 포함하여 요청
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            serverLoginStatus = data.loggedIn === true;
            serverLoginStatusChecked = true;

            // 서버에서 로그인 상태가 확인되면 클라이언트 스토리지 동기화
            if (data.loggedIn && data.user) {
                // 로그인 상태 유지 여부 확인 (localStorage에 있으면 유지, 없으면 sessionStorage)
                const hasLocalStorage = localStorage.getItem('loggedInUser') !== null;
                if (hasLocalStorage) {
                    localStorage.setItem('loggedInUser', JSON.stringify(data.user));
                } else {
                    sessionStorage.setItem('loggedInUser', JSON.stringify(data.user));
                }
            } else {
                // 서버에서 로그인되지 않았으면 클라이언트 스토리지도 삭제
                localStorage.removeItem('loggedInUser');
                sessionStorage.removeItem('loggedInUser');
            }

            return serverLoginStatus;
        } else {
            // 서버 응답 실패 시 클라이언트 스토리지만 확인
            serverLoginStatus = false;
            serverLoginStatusChecked = true;
            return false;
        }
    } catch (error) {
        console.error('서버 로그인 상태 확인 오류:', error);
        // 오류 발생 시 클라이언트 스토리지만 확인
        serverLoginStatus = false;
        serverLoginStatusChecked = true;
        return false;
    }
}

// 로그인 상태 확인
function isLoggedIn() {
    // 먼저 클라이언트 스토리지 확인 (빠른 응답)
    const loggedInUser =
        localStorage.getItem('loggedInUser') || sessionStorage.getItem('loggedInUser');
    return loggedInUser !== null;
}

// 비동기 로그인 상태 확인 (서버 확인 포함)
async function isLoggedInAsync() {
    // 클라이언트 스토리지 먼저 확인
    const hasClientStorage = isLoggedIn();

    // 서버 상태 확인
    const serverStatus = await checkServerLoginStatus();

    // 서버 상태가 우선 (서버가 false면 클라이언트 스토리지 삭제)
    return serverStatus;
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
            credentials: 'include', // 쿠키를 포함하여 요청
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // 응답은 확인하지만 실패해도 로그아웃은 진행
        if (response.ok) {
            const data = await response.json();
        }
    } catch (error) {
        console.error('로그아웃 API 호출 오류:', error);
    }

    // 서버 상태 확인 플래그 리셋
    serverLoginStatusChecked = false;
    serverLoginStatus = null;

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
        return;
    }

    const user = getCurrentUser();
    const isLoggedInUser = isLoggedIn();
    const isAdminUser = isAdmin();
    const roleCode = user && (user.roleCode || user.role) ? String(user.roleCode || user.role).toUpperCase() : 'MEMBER';
    const isAdminRole = roleCode === 'ADMIN';

    // 로그인 버튼과 사용자 정보 영역 찾기
    const loginBtn = container.querySelector('.btn1');
    const btnsContainer = container.querySelector('.btns');

    if (loginBtn && btnsContainer) {
        if (isLoggedInUser && user) {
            // 로그인된 상태: 사용자명 드롭다운 메뉴 표시
            loginBtn.innerHTML = `
                <div class="user-controls">
                    ${user.adminAccount === true ? `
                    <div class="role-toggle" title="관리자/회원 시점 전환 (실제 권한은 바뀌지 않습니다)">
                        <span class="role-chip role-member ${!isAdminRole ? 'active' : ''}">USER</span>
                        <label class="role-switch" aria-label="관리자/회원 시점 전환">
                            <input class="role-switch-input" type="checkbox" ${isAdminRole ? 'checked' : ''} />
                            <span class="role-switch-slider"></span>
                        </label>
                        <span class="role-chip role-admin ${isAdminRole ? 'active' : ''}">ADMIN</span>
                    </div>` : ''}
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
                </div>
            `;
            // 드롭다운 메뉴 초기화 (DOM 업데이트 후)
            setTimeout(() => {
                initUserDropdown();
                initRoleSwitch();
            }, 100);
        } else {
            // 로그인되지 않은 상태: 로그인 버튼 표시
            loginBtn.innerHTML =
                '<a href="/pages/login/login" data-translate="header.login">로그인</a>';
        }
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
    const toggleDropdown = function (e) {
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
    btn.addEventListener('click', function (e) {
        // 검색창이 열려있으면 닫기
        const searchBox = document.querySelector('.search-box');
        if (searchBox && searchBox.classList.contains('active')) {
            searchBox.classList.remove('active');
        }
        // 드롭다운 토글
        toggleDropdown(e);
    });

    // 외부 클릭 시 드롭다운 닫기 (한 번만 등록)
    if (!window.userDropdownClickHandler) {
        window.userDropdownClickHandler = function (e) {
            const currentBtn = document.querySelector('.user-dropdown-btn');
            const currentMenu = document.querySelector('.user-dropdown-menu');
            if (
                currentBtn &&
                currentMenu &&
                !currentBtn.contains(e.target) &&
                !currentMenu.contains(e.target)
            ) {
                currentMenu.classList.remove('active');
            }
        };
        document.addEventListener('click', window.userDropdownClickHandler);
    }

    // 드롭다운 메뉴 항목 클릭 시 닫기
    const dropdownItems = menu.querySelectorAll('.dropdown-item');
    dropdownItems.forEach((item) => {
        item.addEventListener('click', function () {
            menu.classList.remove('active');
        });
    });
}

// 관리자 계정의 회원 시점 전환 (실제 권한은 바뀌지 않음)
async function updateMyViewMode(viewAsMember) {
    const response = await fetch('/api/users/me/view-mode', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ viewAsMember }),
    });

    let data = null;
    try {
        data = await response.json();
    } catch (e) {
        // ignore
    }

    if (!response.ok || !data || data.success !== true) {
        const message = data && data.message ? data.message : '시점 전환에 실패했습니다.';
        throw new Error(message);
    }

    return data.user;
}

function persistCurrentUser(user) {
    const userJson = JSON.stringify(user);
    const hasLocalStorage = localStorage.getItem('loggedInUser') !== null;
    if (hasLocalStorage) {
        localStorage.setItem('loggedInUser', userJson);
    } else {
        sessionStorage.setItem('loggedInUser', userJson);
    }
}

function initRoleSwitch() {
    const input = document.querySelector('.role-switch-input');
    if (!input) return;
    if (input.dataset.bound === 'true') return;
    input.dataset.bound = 'true';

    input.addEventListener('change', async function () {
        const checked = input.checked;

        input.disabled = true;
        try {
            // 체크(ADMIN 쪽) = 관리자 시점, 해제(USER 쪽) = 회원 시점
            const updatedUser = await updateMyViewMode(!checked);
            if (updatedUser) {
                persistCurrentUser(updatedUser);
            }

            // 화면 내용이 권한에 따라 달라지므로 새로고침 (관리자 페이지는 회원 시점에서 볼 수 없으므로 메인으로 이동)
            if (!checked && window.location.pathname.startsWith('/pages/admin')) {
                window.location.href = '/';
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            // 실패 시 토글 원복
            input.checked = !checked;
            input.disabled = false;
            alert(error.message || '시점 전환 중 오류가 발생했습니다.');
        }
    });
}

// 헤더 업데이트 중복 방지 플래그
let headerUpdateInProgress = false;
let headerUpdated = false;

// 페이지 언로드 시 플래그 리셋 (다음 페이지 로드 시 업데이트 허용)
window.addEventListener('beforeunload', function () {
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
            initRoleSwitch();
            headerUpdateInProgress = false;
            headerUpdated = true;
        }, 200);
        return true;
    }
    return false;
}

// 페이지 로드 시 한 번만 헤더 업데이트
document.addEventListener('DOMContentLoaded', async function () {
    // 서버에서 로그인 상태 확인 후 헤더 업데이트
    await checkServerLoginStatus();

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
window.updateHeaderAfterLogin = function () {
    headerUpdated = false; // 로그인 후에는 다시 업데이트 허용
    updateHeader();
    // updateHeader() 내부에서 이미 initUserDropdown()을 호출하므로 여기서는 불필요
    // 하지만 확실하게 하기 위해 추가 호출
    setTimeout(() => {
        initUserDropdown();
        initRoleSwitch();
    }, 300);
};
