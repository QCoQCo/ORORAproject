// 프로필 수정 페이지 JavaScript

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function () {
    // 로그인 상태 확인
    if (!isLoggedIn()) {
        alert('로그인이 필요합니다.');
        window.location.href = '/pages/login/login';
        return;
    }

    // 사용자 정보 로드
    loadUserInfo();

    // 이벤트 리스너 등록
    setupEventListeners();
});

// 사용자 정보 로드
async function loadUserInfo() {
    const user = getCurrentUser();
    if (!user) {
        alert('사용자 정보를 불러올 수 없습니다.');
        window.location.href = '/pages/mypage/mypage';
        return;
    }

    try {
        // 최신 사용자 정보 가져오기
        const response = await fetch(`/api/users/${user.id}`);
        const data = await response.json();

        if (data.success && data.user) {
            const userInfo = data.user;

            // 폼에 사용자 정보 채우기
            document.getElementById('username').value = userInfo.username || '';
            document.getElementById('email').value = userInfo.email || '';
            document.getElementById('phoneNumber').value = userInfo.phoneNumber || '';
            document.getElementById('address').value = userInfo.address || '';

            // 생년월일 설정
            if (userInfo.birthDate) {
                const birthDate = new Date(userInfo.birthDate);
                const formattedDate = birthDate.toISOString().split('T')[0];
                document.getElementById('birthDate').value = formattedDate;
            }

            // 성별 설정
            if (userInfo.genderCode) {
                document.getElementById('genderCode').value = userInfo.genderCode;
            }

            // 프로필 이미지 설정
            const profileImageUrl = userInfo.profileImage || userInfo.profile_image || '/images/defaultProfile.png';
            document.getElementById('current-profile-image').src = profileImageUrl;
        }
    } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
        alert('사용자 정보를 불러오는 중 오류가 발생했습니다.');
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 프로필 이미지 미리보기
    const profileImageInput = document.getElementById('profileImage');
    profileImageInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const previewImg = document.getElementById('previewImg');
                const previewDiv = document.getElementById('profileImagePreview');
                previewImg.src = e.target.result;
                previewDiv.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            document.getElementById('profileImagePreview').style.display = 'none';
        }
    });

    // 이메일 유효성 검사
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', function () {
        validateEmail();
    });

    // 취소 버튼
    document.getElementById('cancelBtn').addEventListener('click', function () {
        if (confirm('수정을 취소하시겠습니까?')) {
            window.location.href = '/pages/mypage/mypage';
        }
    });

    // 저장 버튼
    document.getElementById('submitBtn').addEventListener('click', function () {
        saveProfile();
    });
}

// 이메일 유효성 검사
function validateEmail() {
    const email = document.getElementById('email').value;
    const emailError = document.getElementById('emailError');

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.style.display = 'block';
        return false;
    } else {
        emailError.style.display = 'none';
        return true;
    }
}

// 프로필 저장
async function saveProfile() {
    const user = getCurrentUser();
    if (!user) {
        alert('사용자 정보를 불러올 수 없습니다.');
        return;
    }

    // 이메일 유효성 검사
    if (!validateEmail()) {
        alert('이메일 형식을 확인해주세요.');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '저장 중...';

    try {
        const formData = new FormData();

        // 프로필 이미지
        const profileImageInput = document.getElementById('profileImage');
        if (profileImageInput.files.length > 0) {
            formData.append('profileImage', profileImageInput.files[0]);
        }

        // 사용자 정보
        formData.append('username', document.getElementById('username').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('phoneNumber', document.getElementById('phoneNumber').value);
        formData.append('address', document.getElementById('address').value);

        // 생년월일
        const birthDate = document.getElementById('birthDate').value;
        if (birthDate) {
            formData.append('birthDate', birthDate);
        }

        // 성별
        const genderCode = document.getElementById('genderCode').value;
        if (genderCode) {
            formData.append('genderCode', genderCode);
        }

        const response = await fetch(`/api/users/${user.id}/profile`, {
            method: 'PUT',
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            alert('프로필이 성공적으로 수정되었습니다.');

            // sessionStorage 업데이트
            if (data.user) {
                sessionStorage.setItem('loggedInUser', JSON.stringify(data.user));
            }

            // 마이페이지로 이동
            window.location.href = '/pages/mypage/mypage';
        } else {
            alert(data.message || '프로필 수정 중 오류가 발생했습니다.');
            submitBtn.disabled = false;
            submitBtn.textContent = '저장';
        }
    } catch (error) {
        console.error('프로필 저장 오류:', error);
        alert('프로필 수정 중 오류가 발생했습니다.');
        submitBtn.disabled = false;
        submitBtn.textContent = '저장';
    }
}
