const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const findIdBtn = document.getElementById('findIdBtn');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// 엔터키로 찾기 버튼 클릭
userName.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        findIdBtn.click();
    }
});

userEmail.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        findIdBtn.click();
    }
});

// showError, showSuccess, hideMessages 함수는 utils/notification.js에서 가져옴

// 아이디 찾기 버튼 클릭시
findIdBtn.addEventListener('click', async function () {
    const name = userName.value.trim();
    const email = userEmail.value.trim();

    // 입력 검증
    if (name === '' && email === '') {
        showError('이름 또는 이메일을 입력해주세요.', errorMessage, successMessage);
        return;
    }

    // 이메일 형식 검증 (이메일이 입력된 경우)
    if (email !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('올바른 이메일 형식을 입력해주세요.', errorMessage, successMessage);
            return;
        }
    }

    try {
        const response = await fetch('/api/auth/find-id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: name,
                email: email,
            }),
        });

        if (!response.ok) {
            throw new Error('아이디 찾기 요청 실패');
        }

        const data = await response.json();

        if (data.success) {
            showSuccess(`아이디를 찾았습니다: ${data.loginId}`, successMessage, errorMessage);
        } else {
            showError(data.message || '일치하는 사용자 정보를 찾을 수 없습니다.', errorMessage, successMessage);
        }
    } catch (error) {
        console.error('아이디 찾기 오류:', error);
        showError('아이디 찾기 처리 중 오류가 발생했습니다.', errorMessage, successMessage);
    }
});
