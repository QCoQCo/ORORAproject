// 아이디 중복체크
// let sameCheck = [];
let overlap = document.getElementById('overlap');

overlap.addEventListener('click', function () {
    alert('사용가능합니다');
})


// 비밀번호 중복확인
const putPsw = document.getElementById('putPsw');
const putRePsw = document.getElementById('putRePsw');
let same = document.getElementById('same');
const submit = document.getElementById('submit');

function pwOnChange() {
    same.style.display = 'none';
    same.textContent = '';
}

submit.addEventListener('click', () => {
    if (putPsw.length >= 6 && putPsw.length <= 15) {
        if (putPsw.value && putRePsw.value) {
            same.style.display = 'none';
            if (putPsw.value == putRePsw.value) {

                same.style.display = 'block';
                same.textContent = '비밀번호가 일치합니다';
                same.style.color = 'green';
            } else {
                same.style.display = 'block';
                same.textContent = '비밀번호가 일치하지 않습니다';
                same.style.color = 'red';
            }
        } else {
            same.style.display = 'block';
            same.textContent = '비밀번호를 입력하세요.';
            same.style.color = 'red';
        }
    }else{
        same.style.display = 'block';
        same.textContent = '6자리이상, 15자리 이하로 입력하세요'
        same.style.color = 'red';
    }
})


// 필수입력사항입니다.
const putId = document.getElementById('putId');
const needId = document.getElementById('needId');
const needPsw = document.getElementById('needPsw');
const needRePsw = document.getElementById('needRePsw');

putId.addEventListener('input', function () {
    if (putId.value) {
        needId.style.display = 'none';
    }
})
putPsw.addEventListener('input', function () {
    if (putPsw.value) {
        needPsw.style.display = 'none';
    }
})
putRePsw.addEventListener('input', function () {
    if (putRePsw.value) {
        needRePsw.style.display = 'none';
    }
})