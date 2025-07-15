const transEl = document.getElementById('trans');
const passEl = document.getElementById('pass');
const reserveEl = document.getElementById('reserve');
const deliverEl = document.getElementById('deliver');
const photobEl = document.getElementById('photob');
const section1El = document.getElementById('trans-section');
const section2El = document.getElementById('pass-section');
const section3El = document.getElementById('reserve-section');
const section4El = document.getElementById('deliver-section');
const section5El = document.getElementById('photob-section');

const tab = document.querySelector('.tabUl');
const sticky = tab.offsetTop;

// 탭 메뉴 상단 고정 함수
function tabSticky() {
  if (window.pageYOffset >= sticky) {
    tab.classList.add("sticky")
  } else {
    tab.classList.remove("sticky");
  }
}
window.addEventListener('scroll', tabSticky);


const sectionsEl = [
  { el: transEl, section: section1El },
  { el: passEl, section: section2El },
  { el: reserveEl, section: section3El },
  { el: deliverEl, section: section4El },
  { el: photobEl, section: section5El }
]

// on 클래스 제거 초기화 함수
function onReset() {
  sectionsEl.forEach(({ el: otherEl }) => otherEl.classList.remove('on'));
}
// 탭 클릭시 on 클래스 추가 함수
sectionsEl.forEach(({ el, section }) => {
  el.addEventListener('click', () => {
    onReset();
    el.classList.add('on');
    section.scrollIntoView({ behavior: 'smooth' });
  });
});


// 해당 탭에 스크롤 됐을 때 on 클래스 추가 함수
const sections = document.querySelectorAll('.section');
function updateActiveTab() {
  const scrollPosition = window.scrollY;
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const offset = window.innerHeight * 0.15;

    if (scrollPosition + offset >= sectionTop && scrollPosition < sectionTop + sectionHeight - offset) {
      onReset();
      const tabId = section.id.replace('-section', '');
      const activeTab = document.getElementById(tabId);
      if (activeTab) {
        activeTab.classList.add('on');
      }
      if (scrollPosition === 0) {
        onReset();
      }
    }
  })
}
window.addEventListener('scroll', updateActiveTab);





// sectionsEl.forEach(({ el, section }) => {
//   el.addEventListener('click', () => {
//     sectionsEl.forEach(({ el: otherEl }) => otherEl.classList.remove('on'));
//     el.classList.add('on');
//     section.scrollIntoView({ behavior: 'smooth' });
//   });
// });

// transEl.addEventListener('click', () => {
//     passEl.classList.remove('on');
//     reserveEl.classList.remove('on');
//     deliverEl.classList.remove('on');
//     photobEl.classList.remove('on');
//     transEl.classList.add('on');
//     section1El.scrollIntoView({behavior : 'smooth'});
// })
// passEl.addEventListener('click', () => {
//     transEl.classList.remove('on');
//     reserveEl.classList.remove('on');
//     deliverEl.classList.remove('on');
//     photobEl.classList.remove('on');
//     passEl.classList.add('on');
//     section2El.scrollIntoView({behavior : 'smooth'});
// })
// reserveEl.addEventListener('click', () => {
//     transEl.classList.remove('on');
//     passEl.classList.remove('on');
//     deliverEl.classList.remove('on');
//     photobEl.classList.remove('on');
//     reserveEl.classList.add('on');
//     section3El.scrollIntoView({behavior : 'smooth'});
// })
// deliverEl.addEventListener('click', () => {
//     transEl.classList.remove('on');
//     passEl.classList.remove('on');
//     reserveEl.classList.remove('on');
//     photobEl.classList.remove('on');
//     deliverEl.classList.add('on');
//     section4El.scrollIntoView({behavior : 'smooth'});
// })
// photobEl.addEventListener('click', () => {
//     transEl.classList.remove('on');
//     passEl.classList.remove('on');
//     reserveEl.classList.remove('on');
//     deliverEl.classList.remove('on');
//     photobEl.classList.add('on');
//     section5El.scrollIntoView({behavior : 'smooth'});
// })
