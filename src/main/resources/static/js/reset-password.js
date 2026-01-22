const loginId = document.getElementById('loginId');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');
const resetPasswordBtn = document.getElementById('resetPasswordBtn');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// 엔터키로 재설정 버튼 클릭
loginId.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        resetPasswordBtn.click();
    }
});

newPassword.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        resetPasswordBtn.click();
    }
});

confirmPassword.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        resetPasswordBtn.click();
    }
});

// showError, showSuccess, hideMessages 함수는 utils/notification.js에서 가져옴

// 비밀번호 재설정 버튼 클릭시
resetPasswordBtn.addEventListener('click', async function () {
    const id = loginId.value.trim();
    const newPsw = newPassword.value.trim();
    const confirmPsw = confirmPassword.value.trim();

    // 입력 검증
    if (id === '') {
        showError('아이디를 입력해주세요.', errorMessage, successMessage);
        return;
    }

    if (newPsw === '') {
        showError('새 비밀번호를 입력해주세요.', errorMessage, successMessage);
        return;
    }

    if (confirmPsw === '') {
        showError('비밀번호 확인을 입력해주세요.', errorMessage, successMessage);
        return;
    }

    // 비밀번호 길이 검증
    if (newPsw.length < 6 || newPsw.length > 15) {
        showError('비밀번호는 6자 이상 15자 이하로 입력해주세요.', errorMessage, successMessage);
        return;
    }

    // 비밀번호 일치 확인
    if (newPsw !== confirmPsw) {
        showError('비밀번호가 일치하지 않습니다.', errorMessage, successMessage);
        return;
    }

    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                loginId: id,
                newPassword: newPsw,
            }),
        });

        if (!response.ok) {
            throw new Error('비밀번호 재설정 요청 실패');
        }

        const data = await response.json();

        if (data.success) {
            showSuccess('비밀번호가 성공적으로 재설정되었습니다.', successMessage, errorMessage);
            // 2초 후 로그인 페이지로 이동
            setTimeout(() => {
                window.location.href = './login';
            }, 2000);
        } else {
            showError(data.message || '비밀번호 재설정에 실패했습니다.', errorMessage, successMessage);
        }
    } catch (error) {
        console.error('비밀번호 재설정 오류:', error);
        showError('비밀번호 재설정 처리 중 오류가 발생했습니다.', errorMessage, successMessage);
    }
});
