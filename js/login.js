const putId = document.getElementById('putId');
const putPsw = document.getElementById('putPsw');
const loginBtn = document.getElementById('loginBtn');
const checkId = document.getElementById('checkId');
const checkLogin = document.getElementById('checkLogin');

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
        // TODO: 백엔드 연결 시 수정 필요 - API 엔드포인트로 변경
        // 예: const response = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({username, password}) });
        const response = await fetch('../../data/users.json');
        if (!response.ok) {
            throw new Error('사용자 데이터를 불러오는 데 실패했습니다.');
        }
        const data = await response.json();
        const users = data.users;

        const foundUser = users.find((user) => user.username === userInputId);

        // users.json의 비밀번호와 입력한 비밀번호가 일치하는지 확인
        if (foundUser && userInputPsw === foundUser.password) {
            alert(`${foundUser.username}님 환영합니다!`);
            // 로그인 성공 시 사용자 정보를 세션 스토리지에 저장
            sessionStorage.setItem('loggedInUser', JSON.stringify(foundUser));

            // 헤더 업데이트 (auth.js의 함수 호출)
            if (typeof updateHeaderAfterLogin === 'function') {
                updateHeaderAfterLogin();
            }

            window.location.href = '../../index.html'; // 메인 페이지로 이동
        } else {
            alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        alert('로그인 처리 중 오류가 발생했습니다.');
    }
});
