const transEl = document.getElementById('trans');
const passEl = document.getElementById('pass');
const reserveEl = document.getElementById('reserve');
const deliverEl = document.getElementById('deliver');
const photobEl = document.getElementById('photob');
const section1El = document.getElementById('section1');
const section2El = document.getElementById('section2');
const section3El = document.getElementById('section3');
const section4El = document.getElementById('section4');
const section5El = document.getElementById('section5');

const content = document.querySelector('.transportation');
const tab = document.querySelector('.ktTabWrap');
// const tab = document.querySelector('.tapUl');
const sticky = tab.offsetTop;

function myFunction(){
  if (window.pageYOffset >= sticky) {
    tab.classList.add("sticky")
  } else {
    tab.classList.remove("sticky");
  }
}

window.addEventListener('scroll', myFunction)

transEl.addEventListener('click', () => {
    passEl.classList.remove('on');
    reserveEl.classList.remove('on');
    deliverEl.classList.remove('on');
    photobEl.classList.remove('on');
    transEl.classList.add('on');
    section1El.scrollIntoView({behavior : 'smooth'});
})
passEl.addEventListener('click', () => {
    transEl.classList.remove('on');
    reserveEl.classList.remove('on');
    deliverEl.classList.remove('on');
    photobEl.classList.remove('on');
    passEl.classList.add('on');
    section2El.scrollIntoView({behavior : 'smooth'});
})
reserveEl.addEventListener('click', () => {
    transEl.classList.remove('on');
    passEl.classList.remove('on');
    deliverEl.classList.remove('on');
    photobEl.classList.remove('on');
    reserveEl.classList.add('on');
    section3El.scrollIntoView({behavior : 'smooth'});
})
deliverEl.addEventListener('click', () => {
    transEl.classList.remove('on');
    passEl.classList.remove('on');
    reserveEl.classList.remove('on');
    photobEl.classList.remove('on');
    deliverEl.classList.add('on');
    section4El.scrollIntoView({behavior : 'smooth'});
})
photobEl.addEventListener('click', () => {
    transEl.classList.remove('on');
    passEl.classList.remove('on');
    reserveEl.classList.remove('on');
    deliverEl.classList.remove('on');
    photobEl.classList.add('on');
    section5El.scrollIntoView({behavior : 'smooth'});
})
