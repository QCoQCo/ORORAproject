// 회원가입 유효성 검사 클래스
class SignupValidator {
    constructor() {
        this.fields = {
            putId: {
                element: document.getElementById('putId'),
                errorElement: document.getElementById('needId'),
                rules: ['required', 'minLength:4', 'maxLength:20'],
                valid: false,
            },
            putPsw: {
                element: document.getElementById('putPsw'),
                errorElement: document.getElementById('needPsw'),
                rules: ['required', 'strongPassword'],
                valid: false,
            },
            putRePsw: {
                element: document.getElementById('putRePsw'),
                errorElement: document.getElementById('needRePsw'),
                rules: ['required', 'passwordMatch'],
                valid: false,
            },
            userName: {
                element: document.getElementById('userName'),
                errorElement: null,
                rules: ['required', 'minLength:2'],
                valid: false,
            },
            userBirth: {
                element: document.getElementById('userBirth'),
                errorElement: null,
                rules: ['dateFormat'],
                valid: false,
            },
            userPhone: {
                element: document.getElementById('userPhone'),
                errorElement: null,
                rules: ['phoneFormat'],
                valid: false,
            },
            userEmail: {
                element: document.getElementById('userEmail'),
                errorElement: null,
                rules: ['emailFormat'],
                valid: false,
            },
        };

        this.sameElement = document.getElementById('same');
        this.submitButton = document.getElementById('submit');
        this.overlapButton = document.getElementById('overlap');

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
            if (!value) return true; // 선택사항
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
        this.updateSubmitButton();
    }

    setupEventListeners() {
        // 각 필드에 실시간 유효성 검사 이벤트 리스너 추가
        Object.keys(this.fields).forEach((fieldName) => {
            const field = this.fields[fieldName];
            if (field.element) {
                field.element.addEventListener('input', () => {
                    this.validateField(fieldName);
                    this.updateSubmitButton();
                });

                field.element.addEventListener('blur', () => {
                    this.validateField(fieldName);
                    this.updateSubmitButton();
                });
            }
        });

        // 비밀번호 일치 확인을 위한 특별 처리
        this.fields.putPsw.element.addEventListener('input', () => {
            this.clearPasswordMatch();
            this.validateField('putRePsw'); // 재입력 비밀번호도 다시 검사
        });

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
        if (!field || !field.element) return;

        const value = field.element.value;
        let isValid = true;
        let errorMessage = '';

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
            if (isValid) {
                field.errorElement.style.display = 'none';
            } else {
                field.errorElement.style.display = 'block';
                field.errorElement.textContent = errorMessage;
                field.errorElement.style.color = 'red';
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

    checkIdDuplicate() {
        const userId = this.fields.putId.element.value;
        if (!userId) {
            alert('아이디를 입력해주세요.');
            return;
        }

        // TODO: 백엔드 연결 시 API 호출로 변경
        // 백엔드 API 엔드포인트: GET /api/auth/check-id?userId={userId}
        // 응답 형식: { available: true/false, message: string }

        const isAvailable = this.checkIdAvailability(userId);

        if (isAvailable) {
            alert('사용 가능한 아이디입니다.');
            this.fields.putId.duplicateChecked = true;
        } else {
            alert('이미 사용 중인 아이디입니다.');
            this.fields.putId.duplicateChecked = false;
        }

        this.updateSubmitButton();
    }

    checkIdAvailability(userId) {
        // 임시 중복 체크 로직 (실제로는 서버 API 호출)
        const existingIds = ['admin', 'test', 'user123']; // 예시 데이터
        return !existingIds.includes(userId);
    }

    updateSubmitButton() {
        const allFieldsValid = Object.values(this.fields).every(
            (field) => !field.element || field.valid || field.rules.length === 0
        );

        const requiredFieldsValid = ['putId', 'putPsw', 'putRePsw'].every(
            (fieldName) => this.fields[fieldName].valid
        );

        this.submitButton.disabled = !requiredFieldsValid;
        this.submitButton.style.opacity = requiredFieldsValid ? '1' : '0.5';
    }

    handleSubmit() {
        // 전체 필드 재검증
        const allValid = Object.keys(this.fields).every((fieldName) =>
            this.validateField(fieldName)
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

    processSignup() {
        const formData = {
            id: this.fields.putId.element.value,
            password: this.fields.putPsw.element.value,
            name: this.fields.userName.element.value,
            birth: this.fields.userBirth.element.value,
            phone: this.fields.userPhone.element.value,
            email: this.fields.userEmail.element.value,
        };

        // TODO: 백엔드 연결 시 API 호출로 변경
        // 백엔드 API 엔드포인트: POST /api/auth/signup
        // 요청 형식: { userId, password, username, email, phoneNumber, birthDate, address }
        // 응답 형식: { success: true, user: { id, userId, username, ... }, message: string }

        console.log('회원가입 데이터:', formData);
        alert('회원가입이 완료되었습니다!');

        // 로그인 페이지로 이동
        window.location.href = './login.html';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new SignupValidator();
});
