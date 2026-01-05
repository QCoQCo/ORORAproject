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
                valid: true, // 선택사항이므로 기본값 true
            },
            userPhone: {
                element: document.getElementById('userPhone'),
                errorElement: null,
                rules: ['phoneFormat'],
                valid: true, // 선택사항이므로 기본값 true
            },
            userEmail: {
                element: document.getElementById('userEmail'),
                errorElement: null,
                rules: ['emailFormat'],
                valid: true, // 선택사항이므로 기본값 true
            },
            userAddress: {
                element: document.getElementById('userAddress'),
                errorElement: null,
                rules: [], // 선택사항이므로 validation 없음
                valid: true,
            },
            userGender: {
                element: document.getElementById('userGender'),
                errorElement: null,
                rules: [], // 선택사항이므로 validation 없음
                valid: true,
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

    async checkIdDuplicate() {
        const userId = this.fields.putId.element.value;
        if (!userId) {
            alert('아이디를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`/api/auth/check-id?userId=${encodeURIComponent(userId)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('아이디 확인 요청 실패');
            }

            const data = await response.json();

            if (data.available) {
                alert(data.message || '사용 가능한 아이디입니다.');
                this.fields.putId.duplicateChecked = true;
            } else {
                alert(data.message || '이미 사용 중인 아이디입니다.');
                this.fields.putId.duplicateChecked = false;
            }
        } catch (error) {
            console.error('아이디 중복 체크 오류:', error);
            alert('아이디 확인 중 오류가 발생했습니다.');
            this.fields.putId.duplicateChecked = false;
        }

        this.updateSubmitButton();
    }

    updateSubmitButton() {
        // 필수 필드만 체크 (putId, putPsw, putRePsw, userName)
        const requiredFields = ['putId', 'putPsw', 'putRePsw', 'userName'];
        const requiredFieldsValid = requiredFields.every(
            (fieldName) => {
                const field = this.fields[fieldName];
                return field && field.element && field.valid;
            }
        );

        // 아이디 중복 체크도 확인
        const idDuplicateChecked = this.fields.putId.duplicateChecked === true;

        const canSubmit = requiredFieldsValid && idDuplicateChecked;

        this.submitButton.disabled = !canSubmit;
        this.submitButton.style.opacity = canSubmit ? '1' : '0.5';
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

    async processSignup() {
        const formData = {
            loginId: this.fields.putId.element.value.trim(),
            password: this.fields.putPsw.element.value,
            username: this.fields.userName.element.value.trim(),
            birthDate: this.fields.userBirth.element.value.trim() || null,
            phoneNumber: this.fields.userPhone.element.value.trim() || null,
            email: this.fields.userEmail.element.value.trim() || null,
            address: this.fields.userAddress.element.value.trim() || null,
            genderCode: this.fields.userGender.element.value || null,
        };

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('회원가입 요청 실패');
            }

            const data = await response.json();

            if (data.success) {
                alert(data.message || '회원가입이 완료되었습니다!');
                // 로그인 페이지로 이동
                window.location.href = '/pages/login/login.html';
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
