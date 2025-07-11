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
loginBtn.addEventListener('click', function () {
    let userInputId = putId.value.trim();
    let userInputPsw = putPsw.value.trim();

    if (putId.value === '') {
        alert('아이디를 입력해 주세요.');
    }else if (putPsw.value === '') {
        alert('비밀번호를 입력해 주세요.');
    }else{
        alert('로그인 버튼')
    }
    
})
