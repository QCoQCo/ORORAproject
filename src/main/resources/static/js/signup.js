// 회원가입 유효성 검사 클래스
class SignupValidator {
    constructor() {
        this.fields = {
            putId: {
                element: document.getElementById('putId'),
                errorElement: document.getElementById('needId'),
                rules: ['required', 'minLength:4', 'maxLength:20'],
                valid: false,
                hasInteracted: false, // 사용자가 입력을 시작했는지 추적
            },
            putPsw: {
                element: document.getElementById('putPsw'),
                errorElement: document.getElementById('needPsw'),
                rules: ['required', 'strongPassword'],
                valid: false,
                hasInteracted: false,
            },
            putRePsw: {
                element: document.getElementById('putRePsw'),
                errorElement: document.getElementById('needRePsw'),
                rules: ['required', 'passwordMatch'],
                valid: false,
                hasInteracted: false,
            },
            userName: {
                element: document.getElementById('userName'),
                errorElement: null,
                rules: ['required', 'minLength:2'],
                valid: false,
                hasInteracted: false,
            },
            userBirth: {
                element: document.getElementById('userBirth'),
                errorElement: null,
                rules: ['dateFormat'],
                valid: true, // 선택사항이므로 기본값 true
                hasInteracted: false,
            },
            userPhone: {
                element: document.getElementById('userPhone'),
                errorElement: null,
                rules: ['phoneFormat'],
                valid: true, // 선택사항이므로 기본값 true
                hasInteracted: false,
            },
            userEmail: {
                element: document.getElementById('userEmail'),
                errorElement: document.getElementById('needEmail'),
                rules: ['required', 'emailFormat'],
                valid: false,
                hasInteracted: false,
            },
            userAddress: {
                element: document.getElementById('userAddress'),
                errorElement: null,
                rules: [], // 선택사항이므로 validation 없음
                valid: true,
                hasInteracted: false,
            },
            userGender: {
                element: document.getElementById('userGender'),
                errorElement: null,
                rules: [], // 선택사항이므로 validation 없음
                valid: true,
                hasInteracted: false,
            },
        };

        this.sameElement = document.getElementById('same');
        this.submitButton = document.getElementById('submit');
        this.overlapButton = document.getElementById('overlap');
        this.duplicateCheckResult = document.getElementById('duplicateCheckResult');

        this.init();
    }

    // 유효성 검사 규칙
    validationRules = {
        required: (value) => value.trim() !== '',
        minLength: (value, length) => value.length >= length,
        maxLength: (value, length) => value.length <= length,
        strongPassword: (value) => {
            const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,15}$/;
            return regex.test(value);
        },
        passwordMatch: (value) => {
            const password = this.fields.putPsw.element.value;
            return value === password;
        },
        dateFormat: (value) => {
            if (!value) return true; // 선택사항
            const regex = /^\d{4}-\d{2}-\d{2}$/;
            return regex.test(value);
        },
        phoneFormat: (value) => {
            if (!value) return true; // 선택사항
            const regex = /^01[0-9]{8,9}$/;
            return regex.test(value);
        },
        emailFormat: (value) => {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(value);
        },
    };

    // 에러 메시지
    errorMessages = {
        required: '필수입력 사항입니다.',
        minLength: (length) => `최소 ${length}자 이상 입력해주세요.`,
        maxLength: (length) => `최대 ${length}자 이하로 입력해주세요.`,
        strongPassword: '비밀번호는 6-15자, 영문, 숫자, 특수문자(@$!%*#?&)를 포함해야 합니다.',
        passwordMatch: '비밀번호가 일치하지 않습니다.',
        dateFormat: '올바른 날짜 형식(YYYY-MM-DD)으로 입력해주세요.',
        phoneFormat: '올바른 휴대폰 번호 형식으로 입력해주세요.',
        emailFormat: '올바른 이메일 형식으로 입력해주세요.',
    };

    init() {
        this.setupEventListeners();
        this.setupProfileImagePreview();
        this.updateSubmitButton();
        // 초기 상태에서 모든 에러 메시지 숨김
        this.hideAllErrorMessages();
    }

    hideAllErrorMessages() {
        Object.keys(this.fields).forEach((fieldName) => {
            const field = this.fields[fieldName];
            if (field.errorElement) {
                field.errorElement.style.display = 'none';
            }
        });
    }

    setupProfileImagePreview() {
        const profileImageInput = document.getElementById('profileImage');
        const previewContainer = document.getElementById('profileImagePreview');
        const previewImg = document.getElementById('previewImg');

        if (profileImageInput && previewContainer && previewImg) {
            profileImageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // 파일 타입 검증
                    if (!file.type.startsWith('image/')) {
                        alert('이미지 파일만 업로드 가능합니다.');
                        e.target.value = '';
                        previewContainer.style.display = 'none';
                        return;
                    }

                    // 파일 크기 검증 (10MB)
                    if (file.size > 10 * 1024 * 1024) {
                        alert('파일 크기는 10MB 이하여야 합니다.');
                        e.target.value = '';
                        previewContainer.style.display = 'none';
                        return;
                    }

                    // 미리보기 표시
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        previewImg.src = event.target.result;
                        previewContainer.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                } else {
                    previewContainer.style.display = 'none';
                }
            });
        }
    }

    setupEventListeners() {
        // 각 필드에 실시간 유효성 검사 이벤트 리스너 추가
        Object.keys(this.fields).forEach((fieldName) => {
            const field = this.fields[fieldName];
            if (field.element) {
                // focus 이벤트: 사용자가 필드에 포커스를 주면 상호작용 시작으로 표시
                field.element.addEventListener('focus', () => {
                    field.hasInteracted = true;
                });

                // input 이벤트: 사용자가 입력을 시작하면 상호작용 시작으로 표시하고 검증
                field.element.addEventListener('input', () => {
                    field.hasInteracted = true;
                    this.validateField(fieldName);
                    this.updateSubmitButton();

                    // 아이디 필드의 경우, 입력 시 중복체크 결과 초기화
                    if (fieldName === 'putId') {
                        field.duplicateChecked = false;
                        if (this.duplicateCheckResult) {
                            this.duplicateCheckResult.style.display = 'none';
                        }
                    }
                });

                // blur 이벤트: 필드에서 포커스가 벗어날 때 검증
                field.element.addEventListener('blur', () => {
                    if (field.hasInteracted) {
                        this.validateField(fieldName);
                        this.updateSubmitButton();
                    }
                });
            }
        });

        // 비밀번호 일치 확인을 위한 특별 처리
        this.fields.putPsw.element.addEventListener('input', () => {
            this.clearPasswordMatch();
            this.validateField('putRePsw'); // 재입력 비밀번호도 다시 검사
        });

        // select 요소에 change 이벤트 추가
        if (this.fields.userGender && this.fields.userGender.element) {
            this.fields.userGender.element.addEventListener('change', () => {
                this.updateSubmitButton();
            });
        }

        // 중복체크 버튼
        this.overlapButton.addEventListener('click', () => {
            this.checkIdDuplicate();
        });

        // 회원가입 버튼
        this.submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    validateField(fieldName) {
        const field = this.fields[fieldName];
        if (!field || !field.element) return true; // 필드가 없으면 유효하다고 간주

        const value = field.element.value.trim();
        let isValid = true;
        let errorMessage = '';

        // 규칙이 없으면 항상 유효 (선택사항 필드)
        if (field.rules.length === 0) {
            field.valid = true;
            return true;
        }

        for (const rule of field.rules) {
            const [ruleName, ruleParam] = rule.split(':');
            const ruleFunction = this.validationRules[ruleName];

            if (ruleFunction) {
                const result = ruleParam
                    ? ruleFunction(value, parseInt(ruleParam))
                    : ruleFunction(value);

                if (!result) {
                    isValid = false;
                    errorMessage =
                        typeof this.errorMessages[ruleName] === 'function'
                            ? this.errorMessages[ruleName](ruleParam)
                            : this.errorMessages[ruleName];
                    break;
                }
            }
        }

        field.valid = isValid;
        this.showFieldError(fieldName, isValid, errorMessage);

        // 비밀번호 일치 확인 특별 처리
        if (fieldName === 'putRePsw' && isValid) {
            this.showPasswordMatch();
        }

        return isValid;
    }

    showFieldError(fieldName, isValid, errorMessage) {
        const field = this.fields[fieldName];

        if (field.errorElement) {
            // 사용자가 입력을 시작했을 때만 에러 메시지 표시
            if (!field.hasInteracted) {
                field.errorElement.style.display = 'none';
                return;
            }

            if (isValid) {
                field.errorElement.style.display = 'none';
            } else {
                field.errorElement.style.display = 'block';
                field.errorElement.textContent = errorMessage;
                field.errorElement.style.color = '#dc2626';
            }
        }
    }

    showPasswordMatch() {
        if (
            this.fields.putPsw.element.value &&
            this.fields.putRePsw.element.value &&
            this.fields.putPsw.element.value === this.fields.putRePsw.element.value
        ) {
            this.sameElement.style.display = 'block';
            this.sameElement.textContent = '비밀번호가 일치합니다.';
            this.sameElement.style.color = 'green';
        }
    }

    clearPasswordMatch() {
        this.sameElement.style.display = 'none';
        this.sameElement.textContent = '';
    }

    async checkIdDuplicate() {
        const userId = this.fields.putId.element.value.trim();

        // 아이디 입력 검증
        if (!userId) {
            this.showDuplicateCheckResult('아이디를 입력해주세요.', false);
            return;
        }

        // 아이디 길이 검증
        if (userId.length < 4 || userId.length > 20) {
            this.showDuplicateCheckResult('아이디는 4자 이상 20자 이하로 입력해주세요.', false);
            return;
        }

        // 중복체크 결과 메시지 숨기기
        if (this.duplicateCheckResult) {
            this.duplicateCheckResult.style.display = 'none';
        }

        // 버튼 비활성화 및 로딩 표시
        const originalButtonText = this.overlapButton.textContent;
        this.overlapButton.disabled = true;
        this.overlapButton.textContent = '확인 중...';

        try {
            const response = await fetch(
                `/api/auth/check-id?userId=${encodeURIComponent(userId)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('아이디 확인 요청 실패');
            }

            const data = await response.json();

            if (data.available) {
                this.showDuplicateCheckResult(data.message || '사용 가능한 아이디입니다.', true);
                this.fields.putId.duplicateChecked = true;
            } else {
                this.showDuplicateCheckResult(
                    data.message || '이미 사용 중인 아이디입니다.',
                    false,
                );
                this.fields.putId.duplicateChecked = false;
            }
        } catch (error) {
            console.error('아이디 중복 체크 오류:', error);
            this.showDuplicateCheckResult('아이디 확인 중 오류가 발생했습니다.', false);
            this.fields.putId.duplicateChecked = false;
        } finally {
            // 버튼 복원
            this.overlapButton.disabled = false;
            this.overlapButton.textContent = originalButtonText;
        }

        this.updateSubmitButton();
    }

    showDuplicateCheckResult(message, isSuccess) {
        if (!this.duplicateCheckResult) return;

        this.duplicateCheckResult.textContent = message;
        this.duplicateCheckResult.style.display = 'block';
        this.duplicateCheckResult.style.marginTop = '8px';
        this.duplicateCheckResult.style.fontSize = '13px';
        this.duplicateCheckResult.style.padding = '8px 12px';
        this.duplicateCheckResult.style.borderRadius = '6px';

        if (isSuccess) {
            this.duplicateCheckResult.style.color = '#059669';
            this.duplicateCheckResult.style.backgroundColor = '#f0fdf4';
            this.duplicateCheckResult.style.border = '1px solid #bbf7d0';
        } else {
            this.duplicateCheckResult.style.color = '#dc2626';
            this.duplicateCheckResult.style.backgroundColor = '#fef2f2';
            this.duplicateCheckResult.style.border = '1px solid #fecaca';
        }
    }

    updateSubmitButton() {
        // 필수 필드만 체크 (putId, putPsw, putRePsw, userName, userEmail)
        const requiredFields = ['putId', 'putPsw', 'putRePsw', 'userName', 'userEmail'];
        const requiredFieldsValid = requiredFields.every((fieldName) => {
            const field = this.fields[fieldName];
            return field && field.element && field.valid;
        });

        // 아이디 중복 체크도 확인
        const idDuplicateChecked = this.fields.putId.duplicateChecked === true;

        const canSubmit = requiredFieldsValid && idDuplicateChecked;

        this.submitButton.disabled = !canSubmit;
        this.submitButton.style.opacity = canSubmit ? '1' : '0.5';
    }

    handleSubmit() {
        // 제출 시 모든 필드를 상호작용한 것으로 표시하여 에러 메시지 표시
        Object.keys(this.fields).forEach((fieldName) => {
            this.fields[fieldName].hasInteracted = true;
        });

        // 전체 필드 재검증
        const allValid = Object.keys(this.fields).every((fieldName) =>
            this.validateField(fieldName),
        );

        if (!allValid) {
            alert('입력 정보를 확인해주세요.');
            return;
        }

        if (!this.fields.putId.duplicateChecked) {
            alert('아이디 중복 체크를 해주세요.');
            return;
        }

        // 회원가입 처리
        this.processSignup();
    }

    async processSignup() {
        // FormData 생성 (파일 업로드를 위해)
        const formData = new FormData();

        // 텍스트 필드 추가
        formData.append('loginId', this.fields.putId.element.value.trim());
        formData.append('password', this.fields.putPsw.element.value);
        formData.append('username', this.fields.userName.element.value.trim());

        const birthDate = this.fields.userBirth.element.value.trim();
        if (birthDate) {
            formData.append('birthDate', birthDate);
        }

        const phoneNumber = this.fields.userPhone.element.value.trim();
        if (phoneNumber) {
            formData.append('phoneNumber', phoneNumber);
        }

        const email = this.fields.userEmail.element.value.trim();
        formData.append('email', email);

        const address = this.fields.userAddress.element.value.trim();
        if (address) {
            formData.append('address', address);
        }

        const genderCode = this.fields.userGender.element.value;
        if (genderCode) {
            formData.append('genderCode', genderCode);
        }

        // 프로필 이미지 파일 추가 (선택사항)
        const profileImageInput = document.getElementById('profileImage');
        if (profileImageInput && profileImageInput.files && profileImageInput.files[0]) {
            formData.append('profileImage', profileImageInput.files[0]);
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                // FormData를 사용할 때는 Content-Type 헤더를 설정하지 않아야 브라우저가 자동으로 boundary를 설정합니다
                body: formData,
            });

            if (!response.ok) {
                throw new Error('회원가입 요청 실패');
            }

            const data = await response.json();

            if (data.success) {
                alert(data.message || '회원가입이 완료되었습니다!');
                // 로그인 페이지로 이동
                window.location.href = '/pages/login/login';
            } else {
                alert(data.message || '회원가입 처리 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            alert('회원가입 처리 중 오류가 발생했습니다.');
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new SignupValidator();
});
