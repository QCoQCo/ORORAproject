// DOM 요소들을 함수 내부에서 초기화하도록 변경
let likeBtn, like, sectionEl, sectionList, doc;

// DOM 요소 초기화 함수
function initDOMElements() {
    likeBtn = document.querySelector('.likeBtn');
    like = document.querySelector('.like');
    sectionEl = document.querySelectorAll('.section');
    sectionList = document.querySelectorAll('.sectionList');
    doc = document.documentElement;
}

// 상수 정의
const HEADER_OFFSET = 70;

// 스크롤 위치에 따른 섹션 활성화 함수
function updateActiveSection() {
    const scrollTop = doc.scrollTop;

    if (sectionList[0].offsetTop - HEADER_OFFSET > scrollTop) {
        sectionEl.forEach((se) => se.classList.remove('active'));
    } else if (
        sectionList[0].offsetTop - HEADER_OFFSET <= scrollTop &&
        sectionList[1].offsetTop > scrollTop
    ) {
        sectionEl.forEach((se) => se.classList.remove('active'));
        sectionEl[0].classList.add('active');
    } else if (sectionList[1].offsetTop <= scrollTop && sectionList[2].offsetTop > scrollTop) {
        sectionEl.forEach((se) => se.classList.remove('active'));
        sectionEl[1].classList.add('active');
    } else if (sectionList[2].offsetTop <= scrollTop && sectionList[3].offsetTop > scrollTop) {
        sectionEl.forEach((se) => se.classList.remove('active'));
        sectionEl[2].classList.add('active');
    } else {
        sectionEl.forEach((se) => se.classList.remove('active'));
        sectionEl[3].classList.add('active');
    }
}

// 섹션 클릭 시 스크롤 이동 함수
function scrollToSection(sectionIndex) {
    const targetSection = sectionList[sectionIndex];
    if (targetSection) {
        const offset = sectionIndex === 0 ? HEADER_OFFSET : 0;
        const sectionTop = targetSection.offsetTop - offset;
        window.scrollTo({ top: sectionTop, behavior: 'smooth' });
    }
}

// 이벤트 리스너 등록
function initSectionNavigation() {
    // DOM 요소 초기화
    initDOMElements();

    // 섹션 버튼 클릭 이벤트
    sectionEl.forEach((el, i) => {
        el.addEventListener('click', function () {
            scrollToSection(i);
        });
    });

    // 스크롤 이벤트 (throttle 적용)
    let scrollTimeout;
    window.addEventListener('scroll', function () {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateActiveSection, 10);
    });
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', initSectionNavigation);

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
    like.addEventListener('click', () => {
        likeBtn.classList.toggle('likeBtnActive');
    });
}

// save버튼 눌럿을 때
const save = document.querySelector('.save');
const saveBtn = document.querySelector('.saveBtn');

save.addEventListener('click', function () {
    if (!saveBtn.classList.contains('saveBtnActive')) {
        saveBtn.classList.add('saveBtnActive');
    } else {
        saveBtn.classList.remove('saveBtnActive');
    }
});

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
    const thumbSwiper = document.querySelector('.mySwiper');
    const mainSwiper = document.querySelector('.mySwiper2');

    if (!thumbSwiper || !mainSwiper) {
        console.log('Swiper 요소를 찾을 수 없습니다.');
        return;
    }

    // 썸네일 Swiper 초기화
    swiperInstance = new Swiper('.mySwiper', {
        loop: true,
        spaceBetween: 10,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesProgress: true,
    });

    // 메인 Swiper 초기화
    swiper2Instance = new Swiper('.mySwiper2', {
        loop: true,
        spaceBetween: 10,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
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
        const spotId = urlParams.get('id');
        const spotTitle = urlParams.get('title') || decodeURIComponent(urlParams.get('spot') || '');

        // ID가 있으면 백엔드 API를 통해 데이터 로드
        if (spotId) {
            try {
                const response = await fetch(`/api/tourist-spots/${spotId}`);
                if (response.ok) {
                    const spotData = await response.json();
                    // 백엔드 API 응답 형식에 맞게 데이터 변환
                    const spot = {
                        id: spotData.id,
                        title: spotData.title,
                        description: spotData.description || '',
                        hashtags: spotData.hashtags || [],
                        img:
                            spotData.images && spotData.images.length > 0
                                ? spotData.images[0].imageUrl
                                : spotData.imageUrl || '',
                        images: spotData.images || [],
                        region: spotData.region || { name: '' },
                    };
                    const regionName = spotData.region ? spotData.region.name : '';
                    updatePageContent(spot, regionName);
                    return;
                } else {
                    console.warn('백엔드 API 호출 실패, 대체 방법 사용:', response.status);
                }
            } catch (apiError) {
                console.warn('백엔드 API 호출 중 오류, 대체 방법 사용:', apiError);
            }
        }

        // ID가 없거나 API 호출 실패 시 기존 방식 사용 (title 기반)
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
                const spot = regionData.spots.find(
                    (s) => s.title === spotTitle || s.title.includes(spotTitle)
                );
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
// TODO: 백엔드 연결 시 수정 필요 - API 엔드포인트로 변경
function getDataPath() {
    const currentPath = window.location.pathname;

    // TODO: 백엔드 연결 시 '/api/tourist-spots'로 통일
    // 백엔드 API 엔드포인트: GET /api/tourist-spots
    // 응답 형식: { regions: { area01: { name: "기장군", spots: [...] }, ... } }
    if (currentPath.includes('/pages/')) {
        return '../../data/busanTouristSpots.json';
    } else {
        return './data/busanTouristSpots.json';
    }
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

btns.forEach((el) => {
    el.addEventListener('click', (e) => {
        // btns.forEach(e=>e.classList.remove('active'));
        if (!el.classList.contains('active')) {
            btns.forEach((e) => e.classList.remove('active'));
            el.classList.add('active');
        } else {
            btns.forEach((e) => e.classList.remove('active'));
            el.classList.remove('active');
        }
        // if(btns.forEach(e=>e.classList.contains('active')))
        // el.classList.toggle('active');
    });
});

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

    // 이미지 배열 구성
    let images = [];

    // 백엔드 API에서 받은 images 배열이 있으면 사용
    if (spot.images && Array.isArray(spot.images) && spot.images.length > 0) {
        images = spot.images.map((img) => img.imageUrl || img);
    } else if (spot.img) {
        // 단일 이미지가 있는 경우
        images = [spot.img];
    } else {
        // 기본 이미지들 (폴백)
        images = [
            getImagePath('spring.jpg'),
            getImagePath('summer.jpg'),
            getImagePath('fall.jpg'),
            getImagePath('winter.jpg'),
        ];
    }

    mainSlider.innerHTML = '';
    thumbSlider.innerHTML = '';

    images.forEach((imgSrc) => {
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
        spot.hashtags.forEach((tag) => {
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
                <p class="cont">${
                    spot.hashtags && spot.hashtags.includes('무료')
                        ? '무료'
                        : spot.hashtags && spot.hashtags.includes('유료')
                        ? '유료 (현장 문의)'
                        : '현장 문의'
                }</p>
            </li>
            <li>
                <p>주차</p>
                <p class="cont">${
                    spot.hashtags && spot.hashtags.includes('주차가능') ? '가능' : '현장 문의'
                }</p>
            </li>
            <li>
                <p>이용시간</p>
                <p class="cont">${
                    spot.hashtags && spot.hashtags.includes('실내')
                        ? '시설 운영시간 내'
                        : '상시 이용 가능'
                }</p>
            </li>
        </ul>
    `;
}

// 해시태그로부터 카테고리 추출
function getCategoryFromHashtags(hashtags) {
    if (!hashtags) return '관광지';

    if (hashtags.some((tag) => tag.includes('해수욕장') || tag.includes('바다')))
        return '해변/바다';
    if (hashtags.some((tag) => tag.includes('산') || tag.includes('공원'))) return '산/공원';
    if (
        hashtags.some(
            (tag) => tag.includes('문화') || tag.includes('사찰') || tag.includes('박물관')
        )
    )
        return '문화/역사';
    if (hashtags.some((tag) => tag.includes('카페') || tag.includes('음식'))) return '음식/카페';
    if (hashtags.some((tag) => tag.includes('시장') || tag.includes('쇼핑'))) return '쇼핑/시장';

    return '관광지';
}

// 카카오맵 스크립트 동적 로드 함수
function loadKakaoMapScript() {
    return new Promise((resolve, reject) => {
        // 이미 로드되어 있고 services도 준비되어 있으면 즉시 resolve
        if (
            typeof kakao !== 'undefined' &&
            typeof kakao.maps !== 'undefined' &&
            typeof kakao.maps.services !== 'undefined' &&
            typeof kakao.maps.services.Places !== 'undefined'
        ) {
            window.kakaoMapLoaded = true;
            resolve();
            return;
        }

        // 스크립트가 이미 추가되어 있는지 확인
        const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
        if (existingScript) {
            const isLoaded = existingScript.getAttribute('data-loaded') === 'true';

            if (isLoaded) {
                // 이미 로드되었지만 services가 없으면 load 호출
                if (
                    typeof kakao !== 'undefined' &&
                    typeof kakao.maps !== 'undefined' &&
                    typeof kakao.maps.load === 'function' &&
                    typeof kakao.maps.services === 'undefined'
                ) {
                    kakao.maps.load(function () {
                        window.kakaoMapLoaded = true;
                        resolve();
                    });
                } else {
                    resolve();
                }
                return;
            }

            // 기존 스크립트의 로드 이벤트 대기
            existingScript.addEventListener('load', function () {
                existingScript.setAttribute('data-loaded', 'true');
                // kakao.maps.load() 호출하여 라이브러리 초기화
                if (
                    typeof kakao !== 'undefined' &&
                    typeof kakao.maps !== 'undefined' &&
                    typeof kakao.maps.load === 'function'
                ) {
                    kakao.maps.load(function () {
                        window.kakaoMapLoaded = true;
                        resolve();
                    });
                } else {
                    window.kakaoMapLoaded = true;
                    resolve();
                }
            });
            existingScript.addEventListener('error', function () {
                console.error('카카오맵 스크립트 로드 실패');
                reject(new Error('카카오맵 스크립트 로드 실패'));
            });
            return;
        }

        // 스크립트 동적 로드
        // API 키는 HTML의 data 속성에서 가져오기
        const wrapper = document.getElementById('Wrapper');
        let apiKey = null;

        if (wrapper) {
            apiKey = wrapper.getAttribute('data-kakao-api-key');
        }

        // API 키가 없으면 기본값 사용
        if (!apiKey || apiKey === 'null' || apiKey === 'undefined') {
            apiKey = '${kakao.map.api-key}';
        }

        const scriptUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = scriptUrl;
        script.async = false; // 동기 로드로 변경하여 순서 보장
        // crossOrigin 속성 제거 - 스크립트 태그는 기본적으로 CORS를 처리하므로 설정하면 오히려 문제 발생

        script.onload = function () {
            script.setAttribute('data-loaded', 'true');

            if (
                typeof kakao !== 'undefined' &&
                typeof kakao.maps !== 'undefined' &&
                typeof kakao.maps.load === 'function'
            ) {
                kakao.maps.load(function () {
                    window.kakaoMapLoaded = true;
                    resolve();
                });
            } else {
                reject(new Error('kakao.maps.load 함수를 찾을 수 없습니다.'));
            }
        };

        script.onerror = function () {
            reject(new Error('카카오맵 스크립트 로드 실패'));
        };

        if (document.body) {
            document.body.appendChild(script);
        } else {
            document.head.appendChild(script);
        }
    });
}

// 카카오 지도 초기화
function initKakaoMap(spotTitle) {
    const mapContainer = document.getElementById('kakao-map');
    if (!mapContainer) {
        console.error('카카오맵 컨테이너를 찾을 수 없습니다.');
        return;
    }

    loadKakaoMapScript()
        .then(() => {
            try {
                const mapOption = {
                    center: new kakao.maps.LatLng(35.1796, 129.0756),
                    level: 3,
                };

                const map = new kakao.maps.Map(mapContainer, mapOption);
                const ps = new kakao.maps.services.Places();

                ps.keywordSearch(`부산 ${spotTitle}`, (data, status) => {
                    if (status === kakao.maps.services.Status.OK) {
                        const coords = new kakao.maps.LatLng(data[0].y, data[0].x);
                        const marker = new kakao.maps.Marker({
                            map: map,
                            position: coords,
                        });
                        const infowindow = new kakao.maps.InfoWindow({
                            content: `<div style="width:150px;text-align:center;padding:6px 0;">${spotTitle}</div>`,
                        });
                        infowindow.open(map, marker);
                        map.setCenter(coords);
                    }
                });
            } catch (error) {
                console.error('카카오맵 초기화 중 오류:', error);
            }
        })
        .catch((error) => {
            console.error('카카오맵 스크립트 로드 실패:', error);
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
                    window.location.href = '../../';
                } else {
                    window.location.href = './';
                }
            }
        });
    }
}

// 리뷰 관련 변수
let currentSpotId = null;
let currentSpotTitle = '';
let selectedRating = 0;
let reviews = [];

// 리뷰 데이터 로드
async function loadReviews() {
    if (!currentSpotId) {
        console.warn('관광지 ID가 없어 리뷰를 불러올 수 없습니다.');
        showNoReviewsMessage();
        return;
    }

    try {
        // 백엔드 API를 통해 리뷰 데이터 로드
        const response = await fetch(`/api/reviews?touristSpotId=${currentSpotId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // API 응답 형식에 따라 리뷰 배열 추출
        let spotReviews = [];
        if (data.content && Array.isArray(data.content)) {
            spotReviews = data.content;
        } else if (data.reviews && Array.isArray(data.reviews)) {
            spotReviews = data.reviews;
        } else if (Array.isArray(data)) {
            spotReviews = data;
        }

        reviews = spotReviews;

        // 리뷰 표시
        displayReviews(spotReviews);

        // 리뷰 카운트 업데이트
        updateReviewCount(spotReviews.length);
    } catch (error) {
        console.error('리뷰 데이터 로드 중 오류:', error);
        showNoReviewsMessage();
    }
}

// 리뷰 표시
function displayReviews(spotReviews) {
    const reviewsContainer = document.getElementById('reviews-container');
    const noReviewsMessage = document.getElementById('no-reviews-message');

    if (!reviewsContainer) return;

    if (spotReviews.length === 0) {
        showNoReviewsMessage();
        return;
    }

    // 리뷰가 있으면 no-reviews 메시지 숨기기
    if (noReviewsMessage) {
        noReviewsMessage.style.display = 'none';
    }

    // 리뷰를 최신순으로 정렬
    spotReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    reviewsContainer.innerHTML = '';

    spotReviews.forEach((review) => {
        const reviewElement = createReviewElement(review);
        reviewsContainer.appendChild(reviewElement);
    });
}

// 리뷰 요소 생성
function createReviewElement(review) {
    const reviewDiv = document.createElement('div');
    reviewDiv.className = 'userReview';
    reviewDiv.setAttribute('data-review-id', review.id);

    const stars = '★'.repeat(review.rating || 0) + '☆'.repeat(5 - (review.rating || 0));

    // API 응답 형식에 맞게 필드명 처리
    const userName = review.userName || review.user_name || '익명';
    const likes = review.likes || review.likeCount || 0;
    const replies = review.replies || review.comments || review.commentCount || 0;
    const isLiked = review.isLiked || false;
    const likeClass = isLiked ? 'reviewLikeBtn active' : 'reviewLikeBtn';

    reviewDiv.innerHTML = `
        <div class="userReviewTop">
            <p class="userImage"></p>
            <div class="userInfo">
                <p class="userId"><strong>${userName}</strong></p>
                <div class="reviewRating">${stars} (${review.rating || 0}/5)</div>
                <p class="reviewTitle">${review.title || ''}</p>
            </div>
            <p class="reviewDate">${formatDate(
                review.createdAt || review.created_at || new Date().toISOString()
            )}</p>
        </div>
        <div class="reviewContent">
            <p>${review.content || ''}</p>
        </div>
        <div class="reviewActions">
            <div class="reviewInteractions">
                <div class="reviewLike">
                    <button class="${likeClass}" onclick="toggleReviewLike(${review.id})"></button>
                    <p class="reviewLikeCount">${likes}</p>
                </div>
                <div class="reviewRe">
                    <button onclick="toggleReviewReply(${review.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.34737 2.46818C4.94215 2.46818 1.36821 6.04213 1.36821 10.4473C1.36821 14.7616 4.19681 18.4265 8.68711 18.4265H8.94846L10.7383 20.9075C10.9438 21.2069 11.2834 21.4018 11.6705 21.4018C12.0576 21.4018 12.3972 21.2069 12.6027 20.9075L14.3926 18.4265H15.3142C19.8045 18.4265 22.6331 14.7616 22.6331 10.4473C22.6331 6.04162 19.0586 2.46818 14.6458 2.46818H9.34737ZM2.76821 10.4473C2.76821 6.81533 5.71535 3.86818 9.34737 3.86818H14.6458C18.2864 3.86818 21.2331 6.81584 21.2331 10.4473C21.2331 14.1703 18.8611 17.0265 15.3142 17.0265H14.0344H13.6762L13.4667 17.317L11.6705 19.8068L9.87431 17.317L9.66477 17.0265H9.30661H8.68711C5.14017 17.0265 2.76821 14.1703 2.76821 10.4473ZM8.00003 11.5C8.55232 11.5 9.00003 11.0523 9.00003 10.5C9.00003 9.94772 8.55232 9.5 8.00003 9.5C7.44775 9.5 7.00003 9.94772 7.00003 10.5C7.00003 11.0523 7.44775 11.5 8.00003 11.5ZM12 11.5C12.5523 11.5 13 11.0523 13 10.5C13 9.94772 12.5523 9.5 12 9.5C11.4477 9.5 11 9.94772 11 10.5C11 11.0523 11.4477 11.5 12 11.5ZM17 10.5C17 11.0523 16.5523 11.5 16 11.5C15.4477 11.5 15 11.0523 15 10.5C15 9.94772 15.4477 9.5 16 9.5C16.5523 9.5 17 9.94772 17 10.5Z" fill="#333333"></path>
                        </svg>
                    </button>
                    <p class="reviewReCount">${replies}</p>
                </div>
                <div class="reportBtn">
                    <button onclick="reportReview(${review.id})">신고</button>
                </div>
            </div>
        </div>
    `;

    return reviewDiv;
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR').replace(/\./g, '.').slice(0, -1);
}

// 리뷰 없음 메시지 표시
function showNoReviewsMessage() {
    const reviewsContainer = document.getElementById('reviews-container');
    const noReviewsMessage = document.getElementById('no-reviews-message');

    if (reviewsContainer) {
        reviewsContainer.innerHTML = '';
    }

    if (noReviewsMessage) {
        noReviewsMessage.style.display = 'block';
    }
}

// 리뷰 카운트 업데이트
function updateReviewCount(count) {
    const reviewCountElement = document.getElementById('review-count');
    if (reviewCountElement) {
        reviewCountElement.textContent = count;
    }
}

// 별점 선택 기능 초기화
function initRatingSystem() {
    const stars = document.querySelectorAll('.star');
    const ratingText = document.querySelector('.rating-text');

    stars.forEach((star, index) => {
        star.addEventListener('click', function () {
            selectedRating = parseInt(this.getAttribute('data-rating'));
            updateStarDisplay(selectedRating);

            if (ratingText) {
                const ratingTexts = [
                    '',
                    '별로예요',
                    '보통이에요',
                    '좋아요',
                    '매우 좋아요',
                    '최고예요',
                ];
                ratingText.textContent = ratingTexts[selectedRating];
            }
        });

        star.addEventListener('mouseover', function () {
            const hoverRating = parseInt(this.getAttribute('data-rating'));
            updateStarDisplay(hoverRating);
        });
    });

    // 마우스가 별점 영역을 벗어났을 때
    document.querySelector('.stars').addEventListener('mouseleave', function () {
        updateStarDisplay(selectedRating);
    });
}

// 별점 표시 업데이트
function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// 글자수 카운트 기능
function initCharCount() {
    const textarea = document.getElementById('review-content');
    const charCount = document.getElementById('char-count');

    if (textarea && charCount) {
        textarea.addEventListener('input', function () {
            const currentLength = this.value.length;
            charCount.textContent = currentLength;

            // 글자수가 950자를 넘으면 경고색으로 변경
            if (currentLength > 950) {
                charCount.style.color = '#ef4444';
            } else {
                charCount.style.color = 'var(--neutral-500)';
            }
        });
    }
}

// 리뷰 작성 기능
function initReviewSubmission() {
    const submitBtn = document.getElementById('submit-review');
    const titleInput = document.getElementById('review-title');
    const contentInput = document.getElementById('review-content');

    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            submitReview();
        });
    }

    // 입력 검증
    function validateInputs() {
        const title = titleInput?.value.trim();
        const content = contentInput?.value.trim();

        if (submitBtn) {
            if (title && content && selectedRating > 0) {
                submitBtn.disabled = false;
            } else {
                submitBtn.disabled = true;
            }
        }
    }

    // 입력 필드 이벤트 리스너
    if (titleInput) {
        titleInput.addEventListener('input', validateInputs);
    }
    if (contentInput) {
        contentInput.addEventListener('input', validateInputs);
    }

    // 초기 상태 설정
    validateInputs();
}

// 리뷰 제출
function submitReview() {
    const titleInput = document.getElementById('review-title');
    const contentInput = document.getElementById('review-content');

    const title = titleInput?.value.trim();
    const content = contentInput?.value.trim();

    if (!title || !content || selectedRating === 0) {
        alert('제목, 내용, 별점을 모두 입력해주세요.');
        return;
    }

    if (!currentSpotTitle) {
        alert('관광지 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    // TODO: 백엔드 연결 시 API 호출로 변경
    // 백엔드 API 엔드포인트: POST /api/reviews
    // 요청 형식: { spotTitle, title, content, rating, userId }
    // 응답 형식: { success: true, review: { id, ... } }

    // 새로운 리뷰 객체 생성
    const newReview = {
        id: Date.now(), // 간단한 ID 생성
        userId: Math.floor(Math.random() * 1000) + 100, // 임시 사용자 ID
        userName: '익명의 여행자', // 실제로는 로그인 사용자 정보 사용
        spotTitle: currentSpotTitle,
        title: title,
        content: content,
        rating: selectedRating,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        likes: 0,
        replies: 0,
    };

    // 로컬 스토리지에서 기존 리뷰 가져오기
    const localReviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
    localReviews.push(newReview);
    localStorage.setItem('userReviews', JSON.stringify(localReviews));

    // 리뷰 목록에 추가
    reviews.push(newReview);

    // 화면 업데이트
    const spotReviews = reviews.filter((review) => review.spotTitle === currentSpotTitle);
    displayReviews(spotReviews);
    updateReviewCount(spotReviews.length);

    // 폼 초기화
    resetReviewForm();

    alert('리뷰가 성공적으로 등록되었습니다!');
}

// 리뷰 폼 초기화
function resetReviewForm() {
    const titleInput = document.getElementById('review-title');
    const contentInput = document.getElementById('review-content');
    const charCount = document.getElementById('char-count');
    const ratingText = document.querySelector('.rating-text');

    if (titleInput) titleInput.value = '';
    if (contentInput) contentInput.value = '';
    if (charCount) charCount.textContent = '0';
    if (ratingText) ratingText.textContent = '별점을 선택해주세요';

    selectedRating = 0;
    updateStarDisplay(0);

    // 제출 버튼 비활성화
    const submitBtn = document.getElementById('submit-review');
    if (submitBtn) {
        submitBtn.disabled = true;
    }
}

// 리뷰 좋아요 토글
function toggleReviewLike(reviewId) {
    // TODO: 백엔드 연결 시 API 호출로 변경
    // 백엔드 API 엔드포인트: POST /api/reviews/{reviewId}/like
    // 요청 형식: { userId, action: 'like' | 'unlike' }
    // 응답 형식: { success: true, likes: number }

    // 로컬 스토리지에서 좋아요 정보 관리
    const likedReviews = JSON.parse(localStorage.getItem('likedReviews') || '[]');
    const isLiked = likedReviews.includes(reviewId);

    if (isLiked) {
        // 좋아요 취소
        const index = likedReviews.indexOf(reviewId);
        likedReviews.splice(index, 1);
    } else {
        // 좋아요 추가
        likedReviews.push(reviewId);
    }

    localStorage.setItem('likedReviews', JSON.stringify(likedReviews));

    // 화면의 좋아요 수 업데이트
    const reviewElement = document.querySelector(`[data-review-id="${reviewId}"]`);
    if (reviewElement) {
        const likeBtn = reviewElement.querySelector('.reviewLikeBtn');
        const likeCount = reviewElement.querySelector('.reviewLikeCount');

        if (likeBtn && likeCount) {
            let currentCount = parseInt(likeCount.textContent) || 0;

            if (isLiked) {
                // currentCount--;
                likeBtn.classList.remove('active');
            } else {
                // currentCount++;
                likeBtn.classList.add('active');
            }

            likeCount.textContent = currentCount;
        }
    }
}

// 리뷰 신고
function reportReview(reviewId) {
    if (confirm('이 리뷰를 신고하시겠습니까?')) {
        // TODO: 백엔드 연결 시 API 호출로 변경
        // 백엔드 API 엔드포인트: POST /api/reviews/{reviewId}/report
        // 요청 형식: { userId, reason: string }
        // 응답 형식: { success: true, message: string }

        alert('신고가 접수되었습니다. 검토 후 조치하겠습니다.');
    }
}

// 페이지 콘텐츠 업데이트 함수 수정 (기존 함수에 currentSpotTitle 설정 추가)
function updatePageContent(spot, regionName) {
    // 현재 관광지 ID와 제목 설정
    currentSpotId = spot.id;
    currentSpotTitle = spot.title;

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

    // 카카오 지도 초기화 (스크립트 로드 대기 포함)
    initKakaoMap(spot.title);

    // Swiper 재초기화
    setTimeout(() => {
        initSwiper();
    }, 100);

    // 리뷰 로드
    setTimeout(() => {
        loadReviews();
    }, 200);
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function () {
    // 뒤로가기 버튼 초기화
    initBackButton();

    // 리뷰 관련 기능 초기화
    initRatingSystem();
    initCharCount();
    initReviewSubmission();

    // URL 파라미터가 있으면 동적 데이터 로드 (detailed.html용)
    const urlParams = new URLSearchParams(window.location.search);
    const spotId = urlParams.get('id');
    const spotTitle = urlParams.get('title') || urlParams.get('spot');

    if (spotId || spotTitle) {
        loadTouristSpotDetail();
    } else {
        // URL 파라미터가 없으면 기본 Swiper만 초기화 (detailPage.html용)
        setTimeout(() => {
            initSwiper();
        }, 100);
    }
});
