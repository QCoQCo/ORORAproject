const likeBtn = document.querySelector(".likeBtn");
const like = document.querySelector(".like");
const sectionEl = document.querySelectorAll(".section");
// const photoEl = document.querySelector(".photo");
// const detailEl = document.querySelector(".detail");
// const locationEl = document.querySelector("#map-container");
// const commentEl = document.querySelector(".comment");
const sectionList = document.querySelectorAll(".sectionList");
//els{0,1,2,3}


// 버튼 눌렀을 때 위치 이동
sectionEl.forEach((el, i) => {
    el.addEventListener('click', function () {
        sectionList.forEach((e, idx) => {
            let minus = 0;
            if (idx === 0) {
                minus = 70;
            }
            if (i === idx) {
                let sectionTop = sectionList[idx].offsetTop - minus;
                window.scrollTo({ top: sectionTop, behavior: "smooth" });
            }
        })
        window.addEventListener('scroll', function () {
            sectionList.forEach((e, idx) => {
                if (sectionList[0].offsetTop - 70 > doc.scrollTop) {
                    sectionEl.forEach(se => se.classList.remove('active'));
                } else if (sectionList[0].offsetTop - 70 <= doc.scrollTop && sectionList[1].offsetTop > doc.scrollTop) {
                    sectionEl.forEach(se => se.classList.remove('active'));
                    sectionEl[0].classList.add('active');
                } else if (sectionList[1].offsetTop <= doc.scrollTop && sectionList[2].offsetTop > doc.scrollTop) {
                    sectionEl.forEach(se => se.classList.remove('active'));
                    sectionEl[1].classList.add('active');
                } else if (sectionList[2].offsetTop <= doc.scrollTop && sectionList[3].offsetTop > doc.scrollTop) {
                    sectionEl.forEach(se => se.classList.remove('active'));
                    sectionEl[2].classList.add('active');
                } else {
                    sectionEl.forEach(se => se.classList.remove('active'));
                    sectionEl[3].classList.add('active');
                }
            })
        })
    })

});

// 위치에 따라 버튼 체크
const doc = document.documentElement;
const docHeight = window.pageYOffset;

//   const scrollPosition = window.scrollY;

// sectionEl.forEach((el, i) => {
//     el.addEventListener('click', function () {
//         sectionEl.forEach(se => se.classList.remove('active'));
//         el.classList.add('active');

//         sectionList.forEach((e, idx) => {
//             let minus = 0;
//             if (idx === 0) {
//                 minus = 70;
//             }
//             if (i === idx) {
//                 let sectionTop = sectionList[idx].offsetTop - minus;
//                 window.scrollTo({ top: sectionTop, behavior: "smooth" });
//             }
//         })
//     })
// });

// function onReset() {
//   sectionsEl.forEach(({ el: otherEl }) => otherEl.classList.remove('on'));
// }

// function scrolls(){
//     const scrollPosition = window.scrollY;
//     sectionList.forEach(se => {
//         const sectionTop = sectionEl.offsetTop;
//         const sectionHeight = section.offsetHeight;
//         const offset = window.innerHeight * 0.2;

//         if(scrollPosition + offset >= sectionTop && scrollPosition < sectionTop + sectionHeight - offset){
//             onReset();
//             const tabId = section.id.replace('-section', '');
//             const activeTab = document.getElementById(tabId);
//             if(activeTab){
//                 activeTab.classList.add('on');
//             }
//             if(scrollPosition === 0){
//                 onReset();
//             }
//         }
//     })
// }
// window.addEventListener('scroll', updateActiveTab);





// 관광지 하트 눌렀을 때, 빈하트 -> 빨간하트
if (likeBtn) {
    like.addEventListener("click", () => {
        likeBtn.classList.toggle("likeBtnActive");
    });
}

// Swiper 인스턴스를 전역으로 관리
let swiperInstance = null;
let swiper2Instance = null;

// Swiper 초기화 함수
function initSwiper() {
    // 기존 Swiper 인스턴스가 있다면 제거
    if (swiperInstance) {
        swiperInstance.destroy(true, true);
        swiperInstance = null;
    }
    if (swiper2Instance) {
        swiper2Instance.destroy(true, true);
        swiper2Instance = null;
    }

    // Swiper 요소가 존재하는지 확인
    const thumbSwiper = document.querySelector(".mySwiper");
    const mainSwiper = document.querySelector(".mySwiper2");

    if (!thumbSwiper || !mainSwiper) {
        console.log('Swiper 요소를 찾을 수 없습니다.');
        return;
    }

    // 썸네일 Swiper 초기화
    swiperInstance = new Swiper(".mySwiper", {
        loop: true,
        spaceBetween: 10,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesProgress: true,
    });

    // 메인 Swiper 초기화
    swiper2Instance = new Swiper(".mySwiper2", {
        loop: true,
        spaceBetween: 10,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        thumbs: {
            swiper: swiperInstance,
        },
    });

    // 전역 변수에 저장
    window.swiperInstance = swiperInstance;
    window.swiper2Instance = swiper2Instance;
}

// 상세 페이지 데이터 로드 및 초기화
async function loadTouristSpotDetail() {
    try {
        // URL 파라미터에서 관광지 정보 가져오기
        const urlParams = new URLSearchParams(window.location.search);
        const spotTitle = urlParams.get('title') || decodeURIComponent(urlParams.get('spot') || '');

        if (!spotTitle) {
            console.error('관광지 정보가 없습니다.');
            return;
        }

        // JSON 데이터 로드 (경로 자동 감지)
        const dataPath = getDataPath();
        const response = await fetch(dataPath);
        const data = await response.json();

        // 해당 관광지 찾기
        let foundSpot = null;
        let regionName = '';

        for (const [regionKey, regionData] of Object.entries(data.regions)) {
            if (regionData.spots) {
                const spot = regionData.spots.find(s => s.title === spotTitle || s.title.includes(spotTitle));
                if (spot) {
                    foundSpot = spot;
                    regionName = regionData.name;
                    break;
                }
            }
        }

        if (!foundSpot) {
            console.error('해당 관광지를 찾을 수 없습니다:', spotTitle);
            return;
        }

        // 페이지 데이터 설정
        updatePageContent(foundSpot, regionName);

    } catch (error) {
        console.error('데이터 로드 중 오류:', error);
    }
}

// 현재 경로에 따른 데이터 파일 경로 결정
function getDataPath() {
    const currentPath = window.location.pathname;

    if (currentPath.includes('/pages/')) {
        return '../../data/busanTouristSpots.json';
    } else {
        return './data/busanTouristSpots.json';
    }
}

// 페이지 콘텐츠 업데이트
function updatePageContent(spot, regionName) {
    // 기본 정보 업데이트
    const spotTitle = document.getElementById('spot-title');
    const spotLocation = document.getElementById('spot-location');
    const spotDescription = document.getElementById('spot-description');
    const detailedDescription = document.getElementById('detailed-description');

    if (spotTitle) spotTitle.textContent = spot.title;
    if (spotLocation) spotLocation.textContent = `부산 ${regionName}`;
    if (spotDescription) spotDescription.textContent = spot.description;
    if (detailedDescription) detailedDescription.textContent = spot.description;

    // 이미지 설정
    updateImages(spot);

    // 해시태그 설정
    updateHashtags(spot);

    // 관광지 정보 설정
    updateSpotInfo(spot, regionName);

    // 카카오 지도 초기화
    if (typeof kakao !== 'undefined') {
        initKakaoMap(spot.title);
    }

    // Swiper 재초기화
    setTimeout(() => {
        initSwiper();
    }, 100);
}

// 좋아요 별로예요 버튼
const good = document.querySelector('.good');
const likeIco = document.querySelector('.likeIco');
const bad = document.querySelector('.bad');
const dislikeIco = document.querySelector('.dislikeIco');
const btns = document.querySelectorAll('.right button');


// good.addEventListener('click', function () {
//     likeIco.classList.toggle('active');
//     dislikeIco.classList.remove('active');
// })


// bad.addEventListener('click', function () {
//     dislikeIco.classList.toggle('active');
//     likeIco.classList.remove('active');
// })

btns.forEach(el => {
    el.addEventListener('click', e => {
        // btns.forEach(e=>e.classList.remove('active'));
        if (!el.classList.contains('active')) {
            btns.forEach(e => e.classList.remove('active'));
            el.classList.add('active');
        }
        else {
            btns.forEach(e => e.classList.remove('active'));
            el.classList.remove('active');
        }
        // if(btns.forEach(e=>e.classList.contains('active')))
        // el.classList.toggle('active');
    })
})

// function likeDislike(el,btn){
//     btn.addEventListener('click',()=>{
//         dislikeIco.classList.remove('active');
//         likeIco.classList.remove('active');
//         el.classList.toggle('active');
//     })
// }



// 이미지 업데이트
function updateImages(spot) {
    const mainSlider = document.getElementById('main-slider');
    const thumbSlider = document.getElementById('thumb-slider');

    if (!mainSlider || !thumbSlider) return;

    // 기본 이미지들 (실제로는 spot.img나 여러 이미지를 사용)
    const images = [
        spot.img,
        getImagePath('spring.jpg'),
        getImagePath('summer.jpg'),
        getImagePath('fall.jpg'),
        getImagePath('winter.jpg')
    ];

    mainSlider.innerHTML = '';
    thumbSlider.innerHTML = '';

    images.forEach(imgSrc => {
        // 메인 슬라이더
        const mainSlide = document.createElement('div');
        mainSlide.className = 'swiper-slide';
        mainSlide.innerHTML = `<img src="${imgSrc}" alt="${spot.title}" />`;
        mainSlider.appendChild(mainSlide);

        // 썸네일 슬라이더
        const thumbSlide = document.createElement('div');
        thumbSlide.className = 'swiper-slide';
        thumbSlide.innerHTML = `<img src="${imgSrc}" alt="${spot.title}" />`;
        thumbSlider.appendChild(thumbSlide);
    });
}

// 이미지 경로 자동 감지
function getImagePath(imageName) {
    const currentPath = window.location.pathname;

    if (currentPath.includes('/pages/')) {
        return `../../images/${imageName}`;
    } else {
        return `./images/${imageName}`;
    }
}

// 해시태그 업데이트
function updateHashtags(spot) {
    const hashtagsContainer = document.getElementById('hashtags');
    if (!hashtagsContainer) return;

    hashtagsContainer.innerHTML = '';

    if (spot.hashtags) {
        spot.hashtags.forEach(tag => {
            const button = document.createElement('button');
            button.textContent = tag;
            hashtagsContainer.appendChild(button);
        });
    }
}

// 관광지 정보 업데이트
function updateSpotInfo(spot, regionName) {
    const spotInfoContainer = document.getElementById('spot-info');
    if (!spotInfoContainer) return;

    spotInfoContainer.innerHTML = `
        <ul>
            <li>
                <p>지역</p>
                <p class="cont">부산 ${regionName}</p>
            </li>
            <li>
                <p>카테고리</p>
                <p class="cont">${getCategoryFromHashtags(spot.hashtags)}</p>
            </li>
            <li>
                <p>이용요금</p>
                <p class="cont">${spot.hashtags && spot.hashtags.includes('#무료') ? '무료' : spot.hashtags && spot.hashtags.includes('#유료') ? '유료 (현장 문의)' : '현장 문의'}</p>
            </li>
            <li>
                <p>주차</p>
                <p class="cont">${spot.hashtags && spot.hashtags.includes('#주차가능') ? '가능' : '현장 문의'}</p>
            </li>
            <li>
                <p>이용시간</p>
                <p class="cont">${spot.hashtags && spot.hashtags.includes('#실내') ? '시설 운영시간 내' : '상시 이용 가능'}</p>
            </li>
        </ul>
    `;
}

// 해시태그로부터 카테고리 추출
function getCategoryFromHashtags(hashtags) {
    if (!hashtags) return '관광지';

    if (hashtags.some(tag => tag.includes('해수욕장') || tag.includes('바다'))) return '해변/바다';
    if (hashtags.some(tag => tag.includes('산') || tag.includes('공원'))) return '산/공원';
    if (hashtags.some(tag => tag.includes('문화') || tag.includes('사찰') || tag.includes('박물관'))) return '문화/역사';
    if (hashtags.some(tag => tag.includes('카페') || tag.includes('음식'))) return '음식/카페';
    if (hashtags.some(tag => tag.includes('시장') || tag.includes('쇼핑'))) return '쇼핑/시장';

    return '관광지';
}

// 카카오 지도 초기화
function initKakaoMap(spotTitle) {
    const mapContainer = document.getElementById('kakao-map');
    if (!mapContainer || typeof kakao === 'undefined') return;

    const mapOption = {
        center: new kakao.maps.LatLng(35.1796, 129.0756), // 부산 중심 좌표
        level: 3
    };

    const map = new kakao.maps.Map(mapContainer, mapOption);

    // 장소 검색 객체 생성
    const ps = new kakao.maps.services.Places();

    // 키워드로 장소를 검색
    ps.keywordSearch(`부산 ${spotTitle}`, (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(data[0].y, data[0].x);

            // 마커 생성
            const marker = new kakao.maps.Marker({
                map: map,
                position: coords
            });

            // 인포윈도우 생성
            const infowindow = new kakao.maps.InfoWindow({
                content: `<div style="width:150px;text-align:center;padding:6px 0;">${spotTitle}</div>`
            });
            infowindow.open(map, marker);

            // 지도 중심을 결과값으로 이동
            map.setCenter(coords);
        }
    });
}

// 뒤로가기 버튼 기능 개선
function initBackButton() {
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', function (e) {
            e.preventDefault();

            // 브라우저 히스토리가 있으면 뒤로가기, 없으면 메인 페이지로
            if (window.history.length > 1) {
                window.history.back();
            } else {
                // 현재 경로에 따라 메인 페이지 경로 결정
                const currentPath = window.location.pathname;
                if (currentPath.includes('/pages/')) {
                    window.location.href = '../../index.html';
                } else {
                    window.location.href = './index.html';
                }
            }
        });
    }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function () {
    // 뒤로가기 버튼 초기화
    initBackButton();

    // URL 파라미터가 있으면 동적 데이터 로드 (detailed.html용)
    const urlParams = new URLSearchParams(window.location.search);
    const spotTitle = urlParams.get('title') || urlParams.get('spot');

    if (spotTitle) {
        loadTouristSpotDetail();
    } else {
        // URL 파라미터가 없으면 기본 Swiper만 초기화 (detailPage.html용)
        setTimeout(() => {
            initSwiper();
        }, 100);
    }
});


