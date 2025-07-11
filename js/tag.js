// 1. 인기순

// 웹페이지가 다 열렸을 때 실행
document.addEventListener("DOMContentLoaded", function () {

  // select 박스를 가져옴 (id가 'apple'인 것)
  let selectBox = document.getElementById("apple");

  // content라는 박스를 가져옴 (숨겼다 보여줄 내용)
  let contentBox = document.querySelector(".popular01");

  // 처음에는 contentBox를 숨겨놓기
  contentBox.style.display = "none";

  // select 박스에서 선택이 바뀔 때 실행
  selectBox.addEventListener("change", function () {

    // 지금 선택된 값이 popular이면
    if (selectBox.value === "popular") {
      contentBox.style.display = "block"; // 보이게 하기
    } else {
      contentBox.style.display = "none"; // 숨기기
    }

  });
});

//2.최신순
document.addEventListener("DOMContentLoaded", function () {

  let selectBox = document.getElementById("apple");
  let contentBox = document.querySelector(".latest01");

  contentBox.style.display = "none";

  selectBox.addEventListener("change", function () {
    if (selectBox.value === "latest") {
      contentBox.style.display = "block"; // 보이게 하기
    } else {
      contentBox.style.display = "none"; // 숨기기
    }
  });
});

//3.추천순
document.addEventListener("DOMContentLoaded", function () {

  let selectBox = document.getElementById("apple");
  let contentBox = document.querySelector(".recommended01");

  contentBox.style.display = "none";

  selectBox.addEventListener("change", function () {
    if (selectBox.value === "recommended") {
      contentBox.style.display = "block"; // 보이게 하기
    } else {
      contentBox.style.display = "none"; // 숨기기
    }
  });
});
// 4. 카페 추천
document.addEventListener("DOMContentLoaded", function () {

  let selectBox = document.getElementById("apple");
  let contentBox = document.querySelector(".cafe22");

  contentBox.style.display = "none";

  selectBox.addEventListener("change", function () {
    if (selectBox.value === "cafe123") {
      contentBox.style.display = "block"; // 보이게 하기
    } else {
      contentBox.style.display = "none"; // 숨기기
    }
  });
});

// 4. 소품샵 소개
document.addEventListener("DOMContentLoaded", function () {

  let selectBox = document.getElementById("apple");
  let contentBox = document.querySelector(".Props01");

  contentBox.style.display = "none";

  selectBox.addEventListener("change", function () {
    if (selectBox.value === "Props") {
      contentBox.style.display = "block"; // 보이게 하기
    } else {
      contentBox.style.display = "none"; // 숨기기
    }
  });
});

//5. 부산 축제 일정
document.addEventListener("DOMContentLoaded", function () {

  let selectBox = document.getElementById("apple");
  let contentBox = document.querySelector(".Festival01");

  contentBox.style.display = "none";

  selectBox.addEventListener("change", function () {
    if (selectBox.value === "Festival") {
      contentBox.style.display = "block"; // 보이게 하기
    } else {
      contentBox.style.display = "none"; // 숨기기
    }
  });
});

// 인기순 이미지
document.addEventListener("DOMContentLoaded", function () {

  let selectBox = document.getElementById("apple");
  let contentBox = document.querySelector(".busan99");
  contentBox.style.display = "none";

  // select 박스에서 선택이 바뀔 때 실행
  selectBox.addEventListener("change", function () {
    if (selectBox.value === "popular") {
      contentBox.style.display = "block"; // 보이게 하기
    } else {
      contentBox.style.display = "none"; // 숨기기
    }

  });
});

// 최신순 이미지
document.addEventListener("DOMContentLoaded", function () {

  let selectBox = document.getElementById("apple");
  let contentBox = document.querySelector(".inquiry1");
  contentBox.style.display = "none";

  // select 박스에서 선택이 바뀔 때 실행
  selectBox.addEventListener("change", function () {
    if (selectBox.value === "latest") {
      contentBox.style.display = "block"; // 보이게 하기
    } else {
      contentBox.style.display = "none"; // 숨기기
    }

  });
});

// 추천순 이미지
document.addEventListener("DOMContentLoaded", function () {

  let selectBox = document.getElementById("apple");
  let contentBox = document.querySelector(".Trees");
  contentBox.style.display = "none";

  // select 박스에서 선택이 바뀔 때 실행
  selectBox.addEventListener("change", function () {
    if (selectBox.value === "recommended") {
      contentBox.style.display = "block"; // 보이게 하기
    } else {
      contentBox.style.display = "none"; // 숨기기
    }

  });
});
// 카페 이미지
document.addEventListener("DOMContentLoaded", function () {

  let selectBox = document.getElementById("apple");
  let contentBox = document.querySelector(".cafe55");
  contentBox.style.display = "none";

  // select 박스에서 선택이 바뀔 때 실행
  selectBox.addEventListener("change", function () {
    if (selectBox.value === "cafe123") {
      contentBox.style.display = "block"; // 보이게 하기
    } else {
      contentBox.style.display = "none"; // 숨기기
    }

  });
});

// 축제 일정 (이미지)
document.addEventListener("DOMContentLoaded", function () {

  let selectBox = document.getElementById("apple");
  let contentBox = document.querySelector(".picture");

  contentBox.style.display = "none";

  selectBox.addEventListener("change", function () {
    if (selectBox.value === "Festival") {
      contentBox.style.display = "block"; // 보이게 하기
    } else {
      contentBox.style.display = "none"; // 숨기기
    }
  });
});