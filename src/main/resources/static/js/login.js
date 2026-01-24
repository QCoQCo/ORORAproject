const putId = document.getElementById('putId');
const putPsw = document.getElementById('putPsw');
const loginBtn = document.getElementById('loginBtn');
const checkId = document.getElementById('checkId');
const checkLogin = document.getElementById('checkLogin');

// 쿠키 읽기 함수
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop().split(';').shift();
        return decodeURIComponent(cookieValue);
    }
    return null;
}

// 페이지 로드 시 저장된 아이디 복원
function restoreSavedId() {
    if (!putId || !checkId) {
        // 요소가 아직 준비되지 않았으면 다시 시도
        setTimeout(restoreSavedId, 100);
        return;
    }

    const savedLoginId = getCookie('savedLoginId');
    if (savedLoginId) {
        putId.value = savedLoginId;
        checkId.checked = true;
    }
}

// 페이지 로드 시 저장된 아이디 복원
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', restoreSavedId);
} else {
    // DOMContentLoaded가 이미 발생했으면 즉시 실행
    restoreSavedId();
}

// 엔터키로 로그인 버튼 클릭
putId.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        loginBtn.click();
    }
});

putPsw.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        loginBtn.click();
    }
});

// 패스워드 글자 6~15자, 영문, 숫자, 특수문자 최소 1회
// function strongPassword(str) {
//     return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,15}$/.test(str);
// }

// 로그인 버튼 클릭시
loginBtn.addEventListener('click', async function () {
    let userInputId = putId.value.trim();
    let userInputPsw = putPsw.value.trim();

    if (putId.value === '') {
        alert('아이디를 입력해 주세요.');
        return;
    }
    if (putPsw.value === '') {
        alert('비밀번호를 입력해 주세요.');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                loginId: userInputId,
                password: userInputPsw,
                saveId: checkId.checked, // 아이디 저장 체크박스 상태
                keepLogin: checkLogin.checked, // 로그인 상태 유지 체크박스 상태
            }),
            credentials: 'include', // 쿠키를 포함하여 요청
        });

        if (!response.ok) {
            throw new Error('로그인 요청 실패');
        }

        const data = await response.json();

        if (data.success) {
            alert(`${data.user.username}님 환영합니다!`);

            // 로그인 상태 유지에 따라 저장소 선택
            if (checkLogin.checked) {
                // 로그인 상태 유지: localStorage 사용 (브라우저 종료 후에도 유지)
                localStorage.setItem('loggedInUser', JSON.stringify(data.user));
            } else {
                // 일반 로그인: sessionStorage 사용 (브라우저 탭 종료 시 삭제)
                sessionStorage.setItem('loggedInUser', JSON.stringify(data.user));
            }

            // 헤더 업데이트 (auth.js의 함수 호출)
            if (typeof updateHeaderAfterLogin === 'function') {
                updateHeaderAfterLogin();
                // 드롭다운 메뉴 초기화
                setTimeout(() => {
                    if (typeof initUserDropdown === 'function') {
                        initUserDropdown();
                    }
                }, 100);
            }

            // 페이지 이동 전에 약간의 지연을 두어 헤더 업데이트가 완료되도록 함
            setTimeout(() => {
                window.location.href = '/'; // 메인 페이지로 이동
            }, 200);
        } else {
            alert(data.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        alert('로그인 처리 중 오류가 발생했습니다.');
    }
});
