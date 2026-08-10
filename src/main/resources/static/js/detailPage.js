// DOM 요소들을 함수 내부에서 초기화하도록 변경
let likeBtn, sectionEl, sectionList, doc;

// DOM 요소 초기화 함수
function initDOMElements() {
    likeBtn = document.querySelector('.likeBtn');
    sectionEl = document.querySelectorAll('.section');
    sectionList = document.querySelectorAll('.sectionList');
    doc = document.documentElement;
}

// 상수 정의
const HEADER_OFFSET = 70;

// XSS 방지: 사용자 입력값을 innerHTML에 넣기 전에 반드시 이스케이프
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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
        // URL 파라미터에서 관광지 ID 가져오기 (title 기반 검색은 사용하지 않음)
        const urlParams = new URLSearchParams(window.location.search);
        const spotId = urlParams.get('id');
        const userId = getCurrentUser()?.id;
        const userRole = getCurrentUser()?.roleCode || null;

        // ID가 없으면 에러
        if (!spotId) {
            console.error('관광지 ID가 없습니다. URL에 id 파라미터가 필요합니다.');
            alert('관광지 정보를 불러올 수 없습니다. ID가 필요합니다.');
            return;
        }

        // 백엔드 API를 통해 데이터 로드 (ADMIN인 경우 userRole 전송)
        try {
            let apiUrl = `/api/tourist-spots/${spotId}`;
            if (userRole) {
                apiUrl += `?userRole=${userRole}`;
            }
            const response = await fetch(apiUrl);
            if (response.status === 403) {
                // 비활성화된 카테고리인 경우
                const errorData = await response.json();
                alert(errorData.error || '비활성화된 카테고리의 관광지는 접근할 수 없습니다.');
                window.location.href = '/';
                return;
            }
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
                    latitude: spotData.latitude || null,
                    longitude: spotData.longitude || null,
                    address: spotData.address || null,
                    viewCount: spotData.viewCount || 0,
                    categoryActive: spotData.categoryActive,
                };
                const regionName = spotData.region ? spotData.region.name : '';
                updatePageContent(spot, regionName);

                // 비활성화된 카테고리인 경우 경고 배너 표시 (ADMIN만 볼 수 있음)
                if (spotData.categoryActive === false) {
                    showInactiveCategoryBanner();
                }

                const likeWrap = document.querySelector('.like');
                const likeBtn = likeWrap?.querySelector('.likeBtn') || document.querySelector('.likeBtn');
                const likeCount =
                    likeWrap?.querySelector('.likeCount') || document.querySelector('.likeCount');

                // like 전체 영역(하트 + 카운트 + 여백)을 클릭 가능하게 처리
                if (!likeWrap || !likeBtn) return;

                // 좋아요 상태 호출 (사용자 식별은 서버가 세션에서 처리)
                const likeResponse = await fetch(`/api/tourist-spots/${spotId}/like`);
                const likeData = await likeResponse.json();

                likeBtn.classList.toggle('likeBtnActive', likeData.liked);
                if (likeCount) {
                    likeCount.textContent = likeData.likeCount;
                }

                // 좋아요 토글
                likeWrap.addEventListener('click', async () => {
                    if (!userId) {
                        alert('로그인이 필요합니다');
                        return;
                    }

                    const res = await fetch(`/api/tourist-spots/${spotId}/like`, {
                        method: 'POST',
                    });

                    if (!res.ok) {
                        console.error('좋아요 토글 실패', res.status);
                        return;
                    }

                    const data = await res.json();

                    if (typeof data.likeCount === 'number') {
                        likeCount.textContent = data.likeCount;
                    }

                    likeBtn.classList.toggle('likeBtnActive', data.liked);
                    if (likeCount) {
                        likeCount.textContent = data.likeCount;
                    }
                });
            } else {
                console.error('백엔드 API 호출 실패:', response.status);
                alert('관광지 정보를 불러올 수 없습니다.');
            }
        } catch (apiError) {
            console.error('백엔드 API 호출 중 오류:', apiError);
            alert('관광지 정보를 불러오는 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('데이터 로드 중 오류:', error);
        alert('관광지 정보를 불러오는 중 오류가 발생했습니다.');
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

            // 좋아요 버튼 클릭 시 비슷한 관광지 표시
            if (el.classList.contains('good')) {
                showSimilarSpots();
            } else {
                // 별로예요 버튼 클릭 시 비슷한 관광지 섹션 숨기기
                hideSimilarSpots();
            }
        } else {
            btns.forEach((e) => e.classList.remove('active'));
            el.classList.remove('active');
            // 버튼 비활성화 시 비슷한 관광지 섹션 숨기기
            hideSimilarSpots();
        }
        // if(btns.forEach(e=>e.classList.contains('active')))
        // el.classList.toggle('active');
    });
});

// ========== 비슷한 관광지 추천 기능 ==========

// 비슷한 관광지 섹션 표시
async function showSimilarSpots() {
    const section = document.getElementById('similar-spots-section');
    const container = document.getElementById('similar-spots-container');

    if (!section || !container) return;

    // 섹션 표시 및 로딩 상태
    section.style.display = 'block';
    container.innerHTML = `
        <div class="similar-spots-loading">
            <div class="spinner"></div>
            <p>비슷한 관광지를 찾고 있어요...</p>
        </div>
    `;

    try {
        // 모든 관광지 데이터 가져오기
        const response = await fetch('/api/tag-spots');
        if (!response.ok) throw new Error('데이터를 불러올 수 없습니다.');

        const data = await response.json();
        const allSpots = extractAllSpots(data);

        // 비슷한 관광지 필터링
        const similarSpots = findSimilarSpots(allSpots, currentSpotId, currentSpotHashtags);

        // 결과 표시
        displaySimilarSpots(container, similarSpots);
    } catch (error) {
        console.error('비슷한 관광지 로드 실패:', error);
        container.innerHTML = `
            <div class="no-similar-spots">
                <p>😢 비슷한 관광지를 불러오는 중 오류가 발생했습니다.</p>
            </div>
        `;
    }
}

// 비슷한 관광지 섹션 숨기기
function hideSimilarSpots() {
    const section = document.getElementById('similar-spots-section');
    if (section) {
        section.style.display = 'none';
    }
}

// 모든 관광지 추출 (지역별로 그룹화된 데이터에서)
function extractAllSpots(data) {
    const spots = [];

    if (data.regions && Array.isArray(data.regions)) {
        data.regions.forEach((region) => {
            if (region.spots && Array.isArray(region.spots)) {
                region.spots.forEach((spot) => {
                    spots.push({
                        ...spot,
                        regionName: region.name,
                    });
                });
            }
        });
    }

    return spots;
}

// 비슷한 관광지 찾기 (공통 태그 기반)
function findSimilarSpots(allSpots, currentId, currentHashtags) {
    if (!currentHashtags || currentHashtags.length === 0) {
        return [];
    }

    const currentTagSet = new Set(currentHashtags.map((tag) => tag.toLowerCase()));

    const scoredSpots = allSpots
        .filter((spot) => spot.id !== currentId) // 현재 관광지 제외
        .map((spot) => {
            const spotTags = Array.isArray(spot.hashtags) ? spot.hashtags : [];
            const matchedTags = spotTags.filter((tag) => currentTagSet.has(tag.toLowerCase()));

            return {
                ...spot,
                matchedTags,
                matchScore: matchedTags.length,
            };
        })
        .filter((spot) => spot.matchScore > 0) // 공통 태그가 있는 것만
        .sort((a, b) => b.matchScore - a.matchScore) // 공통 태그 많은 순
        .slice(0, 8); // 최대 8개

    return scoredSpots;
}

// 비슷한 관광지 표시
function displaySimilarSpots(container, spots) {
    if (spots.length === 0) {
        container.innerHTML = `
            <div class="no-similar-spots">
                <p>😅 비슷한 태그를 가진 관광지가 없습니다.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = spots
        .map((spot) => {
            const imageUrl = spot.imageUrl || '/images/logo.png';
            const tags = Array.isArray(spot.hashtags) ? spot.hashtags : [];
            const matchedTagSet = new Set(spot.matchedTags.map((t) => t.toLowerCase()));

            const tagsHtml = tags
                .slice(0, 4)
                .map((tag) => {
                    const isMatched = matchedTagSet.has(tag.toLowerCase());
                    return `<span class="spot-tag ${isMatched ? 'matched' : ''}">#${escapeHtml(tag)}</span>`;
                })
                .join('');

            return `
            <a href="/pages/detailed/detailed?id=${spot.id}" class="similar-spot-card">
                <img src="${imageUrl}" alt="${escapeHtml(spot.title)}" class="spot-image"
                     onerror="this.src='/images/logo.png'">
                <div class="spot-info">
                    <h4 class="spot-title">${escapeHtml(spot.title)}</h4>
                    <div class="spot-tags">
                        ${tagsHtml}
                    </div>
                </div>
            </a>
        `;
        })
        .join('');
}

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
        mainSlide.innerHTML = `<img src="${imgSrc}" alt="${escapeHtml(spot.title)}" />`;
        mainSlider.appendChild(mainSlide);

        // 썸네일 슬라이더
        const thumbSlide = document.createElement('div');
        thumbSlide.className = 'swiper-slide';
        thumbSlide.innerHTML = `<img src="${imgSrc}" alt="${escapeHtml(spot.title)}" />`;
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
            button.textContent = '#' + tag;
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
            (tag) => tag.includes('문화') || tag.includes('사찰') || tag.includes('박물관'),
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
        try {
            const apiKey = getKakaoMapApiKey();
            if (!apiKey) {
                reject(new Error('카카오 맵 API 키를 가져올 수 없습니다.'));
                return;
            }

            const scriptUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
            loadScript(scriptUrl, resolve, reject);
        } catch (error) {
            reject(error);
        }
    });
}

// 카카오 맵 API 키 가져오기 (HTML의 data 속성에서만 가져옴)
function getKakaoMapApiKey() {
    const wrapper = document.getElementById('Wrapper');
    if (!wrapper) {
        throw new Error('Wrapper 요소를 찾을 수 없습니다.');
    }

    const apiKey = wrapper.getAttribute('data-kakao-api-key');
    if (!apiKey || apiKey === 'null' || apiKey === 'undefined' || apiKey.trim() === '') {
        throw new Error('카카오 맵 API 키를 찾을 수 없습니다. 서버 설정을 확인해주세요.');
    }

    return apiKey;
}

// 스크립트 로드 헬퍼 함수
function loadScript(scriptUrl, resolve, reject) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = scriptUrl;
    script.async = false;

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
}

// 중복 함수 제거됨 - 532번째 줄의 loadKakaoMapScript() 함수 사용

// 카카오 지도 초기화
function initKakaoMap(spotTitle, latitude, longitude) {
    const mapContainer = document.getElementById('kakao-map');
    if (!mapContainer) {
        console.error('카카오맵 컨테이너를 찾을 수 없습니다.');
        return;
    }

    loadKakaoMapScript()
        .then(() => {
            try {
                // 위도/경도가 있으면 사용, 없으면 부산 중심 좌표 사용
                const defaultLat = 35.1796;
                const defaultLng = 129.0756;

                const mapOption = {
                    center: new kakao.maps.LatLng(latitude || defaultLat, longitude || defaultLng),
                    level: 3,
                };

                const map = new kakao.maps.Map(mapContainer, mapOption);

                // 위도/경도가 있으면 직접 마커 표시
                if (latitude && longitude) {
                    const coords = new kakao.maps.LatLng(latitude, longitude);
                    const marker = new kakao.maps.Marker({
                        map: map,
                        position: coords,
                    });
                    const infowindow = new kakao.maps.InfoWindow({
                        content: `<div style="width:150px;text-align:center;padding:6px 0;">${escapeHtml(spotTitle)}</div>`,
                    });
                    infowindow.open(map, marker);
                    map.setCenter(coords);
                } else {
                    // 위도/경도가 없으면 키워드 검색
                    const ps = new kakao.maps.services.Places();
                    ps.keywordSearch(`부산 ${spotTitle}`, (data, status) => {
                        if (status === kakao.maps.services.Status.OK) {
                            const coords = new kakao.maps.LatLng(data[0].y, data[0].x);
                            const marker = new kakao.maps.Marker({
                                map: map,
                                position: coords,
                            });
                            const infowindow = new kakao.maps.InfoWindow({
                                content: `<div style="width:150px;text-align:center;padding:6px 0;">${escapeHtml(spotTitle)}</div>`,
                            });
                            infowindow.open(map, marker);
                            map.setCenter(coords);
                        }
                    });
                }
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
let currentSpotHashtags = [];
let selectedRating = 0;
let reviews = [];
let reviewImages = []; // 리뷰에 첨부할 이미지 파일들

// 리뷰 데이터 로드
async function loadReviews() {
    if (!currentSpotId) {
        showNoReviewsMessage();
        return;
    }

    try {
        // 로그인한 사용자 ID 가져오기
        const user = getCurrentUser();
        const userId = user?.id;

        // 백엔드 API를 통해 리뷰 데이터 로드 (로그인 상태면 서버가 세션으로 좋아요 여부도 함께 조회)
        const apiUrl = `/api/reviews?touristSpotId=${currentSpotId}`;
        const response = await fetch(apiUrl);

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

        // 리뷰 정보 업데이트 (평균 평점 및 총 개수)
        updateReviewInfo(spotReviews);

        // 포토리뷰 업데이트
        updatePhotoReviews(spotReviews);
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

    // 이미지가 있는 리뷰(포토리뷰)는 제외하고 필터링
    const textOnlyReviews = spotReviews.filter((review) => {
        const hasImages = review.images && Array.isArray(review.images) && review.images.length > 0;
        return !hasImages;
    });

    if (textOnlyReviews.length === 0) {
        showNoReviewsMessage();
        return;
    }

    // 리뷰가 있으면 no-reviews 메시지 숨기기
    if (noReviewsMessage) {
        noReviewsMessage.style.display = 'none';
    }

    // 리뷰를 최신순으로 정렬
    textOnlyReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    reviewsContainer.innerHTML = '';

    textOnlyReviews.forEach((review) => {
        const reviewElement = createReviewElement(review);
        reviewsContainer.appendChild(reviewElement);
    });
}

// 리뷰 요소 생성
function createReviewElement(review) {
    const reviewDiv = document.createElement('div');

    // 현재 로그인한 사용자 정보 가져오기
    const user = getCurrentUser();
    const currentUserId = user ? user.id : null;

    // 리뷰 작성자 ID 가져오기
    const reviewUserId = review.userId || review.user_id;
    const isMyReview = currentUserId && reviewUserId && currentUserId == reviewUserId;

    // 본인 리뷰인 경우 클래스 추가
    reviewDiv.className = isMyReview ? 'userReview my-review' : 'userReview';
    reviewDiv.setAttribute('data-review-id', review.id);

    const stars = '★'.repeat(review.rating || 0) + '☆'.repeat(5 - (review.rating || 0));

    // API 응답 형식에 맞게 필드명 처리 (사용자 입력값은 XSS 방지를 위해 이스케이프)
    const userName = escapeHtml(review.userName || review.user_name || '익명');
    // const userProfileImage = review.userProfileImage || '/images/defaultProfile.png';
    const likes = review.likes || review.likeCount || 0;
    const replies = review.replies || review.comments || review.commentCount || 0;
    const isLiked = review.isLiked || false;
    const likeClass = isLiked ? 'reviewLikeBtn active' : 'reviewLikeBtn';
    // 클릭 가능한 프로필 요소 (본인/타인 모두)
    const profileClickable = !!reviewUserId;
    const profileClickHandler = profileClickable ? `onclick="goToUserProfile(${reviewUserId})"` : '';
    const profileCursorStyle = profileClickable ? 'style="cursor: pointer;"' : '';
    
    const userImageHTML = review.userProfileImage
        ? `<p class="userImage clickable-profile" ${profileClickHandler} ${profileCursorStyle}>
           <img src="${review.userProfileImage}"
                alt="${userName}"
                class="comment-user-image">
       </p>`
        : `<p class="userImage"></p>`;

    // 본인 리뷰인 경우: 수정/삭제 버튼 표시, 신고 버튼 숨김
    const myReviewButtonsHTML = isMyReview
        ? `<div class="myReviewBtns">
            <button class="editReviewBtn" onclick="openEditReviewModal(${review.id})">수정</button>
            <button class="deleteReviewBtn" onclick="deleteReview(${review.id})">삭제</button>
        </div>`
        : '';

    const reportButtonHTML = isMyReview
        ? ''
        : `<div class="reportBtn">
            <button onclick="reportReview(${review.id})">신고</button>
        </div>`;

    // 수정 날짜 처리
    const createdAt = review.createdAt || review.created_at;
    const updatedAt = review.updatedAt || review.updated_at;
    const createdDateStr = formatDate(createdAt || new Date().toISOString(), 'dot');
    const updatedDateStr = formatDate(updatedAt, 'dot');

    // 수정 날짜가 생성 날짜와 다른 경우에만 표시
    const isEdited = updatedAt && createdDateStr !== updatedDateStr;
    const dateHTML = isEdited
        ? `<p class="reviewDate">${createdDateStr}</p>
           <p class="reviewDateEdited">(수정: ${updatedDateStr})</p>`
        : `<p class="reviewDate">${createdDateStr}</p>`;

    reviewDiv.innerHTML = `
        <div class="userReviewTop">
            ${userImageHTML}
            <div class="userInfo">
                <p class="userId ${profileClickable ? 'clickable-profile' : ''}" ${profileClickHandler} ${profileCursorStyle}><strong>${userName}</strong>${
                    isMyReview ? ' <span class="my-review-badge">내 리뷰</span>' : ''
                }</p>
                <div class="reviewRating">${stars} (${review.rating || 0}/5)</div>
                <p class="reviewTitle">${escapeHtml(review.title || '')}</p>
            </div>
            <div class="reviewDateContainer">
                ${dateHTML}
            </div>
        </div>
        <div class="reviewContent">
            <p>${escapeHtml(review.content || '')}</p>
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
                ${myReviewButtonsHTML}
                ${reportButtonHTML}
            </div>
        </div>
    `;

    return reviewDiv;
}

// 날짜 포맷팅 (한국 시간 기준, 시간대 변환 방지)
// formatDate 함수는 utils/date.js에서 가져옴

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

// 리뷰 평균 평점 계산
function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) {
        return 0;
    }

    const totalRating = reviews.reduce((sum, review) => {
        const rating = review.rating || 0;
        return sum + rating;
    }, 0);

    return totalRating / reviews.length;
}

// 리뷰 정보 업데이트 (평균 평점 및 총 개수)
function updateReviewInfo(reviews) {
    const reviewInfo = document.getElementById('review-info');
    const reviewAverage = document.querySelector('.review-average');
    const reviewTotalCount = document.getElementById('review-total-count');

    if (!reviewInfo || !reviewAverage || !reviewTotalCount) return;

    const reviewCount = reviews ? reviews.length : 0;
    const averageRating = calculateAverageRating(reviews);

    // 총 리뷰 개수 업데이트
    reviewTotalCount.textContent = reviewCount;

    // 평균 평점 업데이트
    if (reviewCount === 0) {
        reviewAverage.textContent = '평점 없음';
    } else {
        // 평균 평점을 소수점 첫째 자리까지 표시
        const formattedRating = averageRating.toFixed(1);
        reviewAverage.textContent = `${formattedRating}점`;
    }
}

// 리뷰 정보 클릭 시 리뷰 섹션으로 스크롤
function initReviewInfoClick() {
    const reviewInfo = document.getElementById('review-info');
    if (reviewInfo) {
        reviewInfo.addEventListener('click', function () {
            // 리뷰 섹션은 sectionList[3] (인덱스 3)
            scrollToSection(3);
        });
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

            // 별점 선택 시 제출 버튼 활성화 상태 확인
            validateReviewForm();
        });

        star.addEventListener('mouseover', function () {
            const hoverRating = parseInt(this.getAttribute('data-rating'));
            updateStarDisplay(hoverRating);
        });
    });

    // 마우스가 별점 영역을 벗어났을 때
    const starsContainer = document.querySelector('.stars');
    if (starsContainer) {
        starsContainer.addEventListener('mouseleave', function () {
            updateStarDisplay(selectedRating);
        });
    }
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

// 리뷰 폼 유효성 검사 함수 (전역으로 사용 가능하도록)
function validateReviewForm() {
    const submitBtn = document.getElementById('submit-review');
    const titleInput = document.getElementById('review-title');
    const contentInput = document.getElementById('review-content');

    if (!submitBtn) return;

    const title = titleInput?.value.trim();
    const content = contentInput?.value.trim();

    if (title && content && selectedRating > 0) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

// 리뷰 작성 기능
function initReviewSubmission() {
    const submitBtn = document.getElementById('submit-review');
    const titleInput = document.getElementById('review-title');
    const contentInput = document.getElementById('review-content');
    const photoBtn = document.getElementById('review-photo-btn');
    const imageInput = document.getElementById('review-image-input');

    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            submitReview();
        });
    }

    // 사진 버튼 클릭 이벤트
    if (photoBtn && imageInput) {
        photoBtn.addEventListener('click', function () {
            imageInput.click();
        });
    }

    // 이미지 선택 이벤트
    if (imageInput) {
        imageInput.addEventListener('change', function (e) {
            handleImageSelection(e.target.files);
        });
    }

    // 전체 삭제 버튼
    const removeAllBtn = document.getElementById('remove-all-images');
    if (removeAllBtn) {
        removeAllBtn.addEventListener('click', function () {
            removeAllImages();
        });
    }

    // 입력 필드 이벤트 리스너
    if (titleInput) {
        titleInput.addEventListener('input', validateReviewForm);
    }
    if (contentInput) {
        contentInput.addEventListener('input', validateReviewForm);
    }

    // 초기 상태 설정
    validateReviewForm();
}

// 이미지 선택 처리
function handleImageSelection(files) {
    if (!files || files.length === 0) return;

    // 최대 10개까지 제한
    const maxImages = 10;
    const remainingSlots = maxImages - reviewImages.length;

    if (remainingSlots <= 0) {
        alert(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
        return;
    }

    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
        // 파일 타입 검증
        if (!file.type.startsWith('image/')) {
            alert(`${file.name}은(는) 이미지 파일이 아닙니다.`);
            return;
        }

        // 파일 크기 검증 (최대 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert(`${file.name}의 크기가 너무 큽니다. (최대 10MB)`);
            return;
        }

        // 이미지 미리보기 생성
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageData = {
                file: file,
                preview: e.target.result,
                id: Date.now() + Math.random(), // 고유 ID 생성
            };
            reviewImages.push(imageData);
            updateImagePreview();
        };
        reader.readAsDataURL(file);
    });

    // 파일 입력 초기화 (같은 파일을 다시 선택할 수 있도록)
    const imageInput = document.getElementById('review-image-input');
    if (imageInput) {
        imageInput.value = '';
    }
}

// 이미지 미리보기 업데이트
function updateImagePreview() {
    const previewContainer = document.getElementById('review-images-preview');
    const imagesContainer = document.getElementById('review-images-container');
    const imagesCount = document.getElementById('review-images-count');

    if (!previewContainer || !imagesContainer) return;

    if (reviewImages.length === 0) {
        previewContainer.style.display = 'none';
        return;
    }

    previewContainer.style.display = 'block';
    if (imagesCount) {
        imagesCount.textContent = reviewImages.length;
    }

    imagesContainer.innerHTML = '';

    reviewImages.forEach((imageData, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'review-image-item';
        imageItem.setAttribute('data-image-id', imageData.id);

        imageItem.innerHTML = `
            <div class="review-image-wrapper">
                <img src="${imageData.preview}" alt="리뷰 이미지 ${index + 1}" />
                <button type="button" class="remove-image-btn" data-image-id="${imageData.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;

        // 삭제 버튼 이벤트
        const removeBtn = imageItem.querySelector('.remove-image-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                removeImage(imageData.id);
            });
        }

        imagesContainer.appendChild(imageItem);
    });
}

// 이미지 삭제
function removeImage(imageId) {
    reviewImages = reviewImages.filter((img) => img.id !== imageId);
    updateImagePreview();
}

// 모든 이미지 삭제
function removeAllImages() {
    if (reviewImages.length === 0) return;

    if (confirm('모든 이미지를 삭제하시겠습니까?')) {
        reviewImages = [];
        updateImagePreview();
    }
}

// 리뷰 제출
async function submitReview() {
    const titleInput = document.getElementById('review-title');
    const contentInput = document.getElementById('review-content');

    const title = titleInput?.value.trim();
    const content = contentInput?.value.trim();

    if (!title || !content || selectedRating === 0) {
        alert('제목, 내용, 별점을 모두 입력해주세요.');
        return;
    }

    if (!currentSpotId) {
        alert('관광지 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    // 현재 로그인한 사용자 정보 가져오기
    const user = getCurrentUser();
    if (!user) {
        alert('로그인이 필요합니다. 로그인 후 리뷰를 작성해주세요.');
        return;
    }

    const userId = user.id;
    if (!userId) {
        alert('사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.');
        return;
    }

    // 제출 버튼 비활성화 (중복 제출 방지)
    const submitBtn = document.getElementById('submit-review');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '등록 중...';
    }

    try {
        // FormData 생성 (이미지가 있는 경우)
        let requestBody;
        let headers = {};

        if (reviewImages.length > 0) {
            // 이미지가 있는 경우 FormData 사용
            const formData = new FormData();
            formData.append('touristSpotId', currentSpotId);
            formData.append('title', title);
            formData.append('content', content);
            formData.append('rating', selectedRating);

            // 이미지 파일 추가
            reviewImages.forEach((imageData, index) => {
                formData.append('images', imageData.file);
            });

            requestBody = formData;
            // FormData 사용 시 Content-Type 헤더를 설정하지 않음 (브라우저가 자동으로 설정)
        } else {
            // 이미지가 없는 경우 JSON 사용
            headers['Content-Type'] = 'application/json';
            requestBody = JSON.stringify({
                touristSpotId: currentSpotId,
                title: title,
                content: content,
                rating: selectedRating,
            });
        }

        // 백엔드 API 호출
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: headers,
            body: requestBody,
        });

        const data = await response.json();

        if (data.success) {
            alert('리뷰가 성공적으로 등록되었습니다!');

            // 폼 초기화
            resetReviewForm();

            // 리뷰 목록 새로고침
            await loadReviews();

            // 포토리뷰도 업데이트됨 (loadReviews 내부에서 updatePhotoReviews 호출)
        } else {
            alert('리뷰 등록에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('리뷰 제출 중 오류:', error);
        alert('리뷰 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
        // 제출 버튼 다시 활성화
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '리뷰 등록';
        }
    }
}

// 리뷰 폼 초기화
function resetReviewForm() {
    const titleInput = document.getElementById('review-title');
    const contentInput = document.getElementById('review-content');
    const charCount = document.getElementById('char-count');
    const ratingText = document.querySelector('.rating-text');
    const imageInput = document.getElementById('review-image-input');

    if (titleInput) titleInput.value = '';
    if (contentInput) contentInput.value = '';
    if (imageInput) imageInput.value = ''; // 파일 입력도 초기화
    if (charCount) charCount.textContent = '0';
    if (ratingText) ratingText.textContent = '별점을 선택해주세요';

    selectedRating = 0;
    updateStarDisplay(0);

    // 이미지 초기화
    reviewImages = [];
    updateImagePreview();

    // 제출 버튼 비활성화
    const submitBtn = document.getElementById('submit-review');
    if (submitBtn) {
        submitBtn.disabled = true;
    }
}

// 리뷰 좋아요 토글
async function toggleReviewLike(reviewId) {
    // 로그인 상태 확인
    const user = getCurrentUser();
    if (!user || !user.id) {
        alert('좋아요를 누르려면 로그인이 필요합니다.');
        window.location.href = '/login';
        return;
    }

    const userId = user.id;

    try {
        // 백엔드 API 호출
        const response = await fetch(`/api/reviews/${reviewId}/like`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('좋아요 처리에 실패했습니다.');
        }

        const data = await response.json();

        if (data.success) {
            // 화면의 좋아요 수 업데이트
            const reviewElement = document.querySelector(`[data-review-id="${reviewId}"]`);
            if (reviewElement) {
                const likeBtn = reviewElement.querySelector('.reviewLikeBtn');
                const likeCount = reviewElement.querySelector('.reviewLikeCount');

                if (likeBtn && likeCount) {
                    likeCount.textContent = data.likeCount;

                    if (data.liked) {
                        likeBtn.classList.add('active');
                    } else {
                        likeBtn.classList.remove('active');
                    }
                }
            }

            // 포토리뷰 모달에서도 업데이트
            const modalReviewElement = document.querySelector(
                `#photo-review-modal [data-review-id="${reviewId}"]`,
            );
            if (modalReviewElement) {
                const modalLikeBtn = modalReviewElement.querySelector('.reviewLikeBtn');
                const modalLikeCount = modalReviewElement.querySelector('.reviewLikeCount');

                if (modalLikeBtn && modalLikeCount) {
                    modalLikeCount.textContent = data.likeCount;

                    if (data.liked) {
                        modalLikeBtn.classList.add('active');
                    } else {
                        modalLikeBtn.classList.remove('active');
                    }
                }
            }
        } else {
            throw new Error(data.message || '좋아요 처리에 실패했습니다.');
        }
    } catch (error) {
        console.error('리뷰 좋아요 토글 오류:', error);
        alert(error.message || '좋아요 처리 중 오류가 발생했습니다.');
    }
}

// 리뷰 신고
function reportReview(reviewId) {
    openReportModal(reviewId, 'review');
}

// 댓글 목록 토글 (펼치기/접기)
async function toggleReviewReply(reviewId) {
    // 모든 가능한 댓글 컨테이너 찾기
    let commentsContainer = document.getElementById(`photo-review-comments-${reviewId}`);

    if (!commentsContainer) {
        commentsContainer = document.getElementById(`review-comments-${reviewId}`);
    }

    if (!commentsContainer) {
        // 일반 리뷰 요소에서 찾기
        const reviewElement = document.querySelector(`.userReview[data-review-id="${reviewId}"]`);
        if (reviewElement) {
            commentsContainer = reviewElement.querySelector('.review-comments-container');
        }
    }

    // 현재 상태 확인 (getComputedStyle 사용)
    let isExpanded = false;
    if (commentsContainer) {
        const computedStyle = window.getComputedStyle(commentsContainer);
        const inlineDisplay = commentsContainer.style.display;
        // 인라인 스타일이 있으면 우선, 없으면 computed style 사용
        if (inlineDisplay) {
            isExpanded = inlineDisplay !== 'none';
        } else {
            isExpanded = computedStyle.display !== 'none';
        }
    }

    if (isExpanded) {
        // 접기
        if (commentsContainer) {
            commentsContainer.style.display = 'none';
        }
    } else {
        // 펼치기
        if (!commentsContainer) {
            // 댓글 컨테이너 생성
            commentsContainer = document.createElement('div');
            commentsContainer.className = 'review-comments-container';

            // 포토리뷰 모달인지 확인
            const modalContent = document.getElementById('photo-review-modal-content');
            const modal = document.getElementById('photo-review-modal');
            const isModalOpen =
                modal && modal.style.display !== 'none' && modal.style.display !== '';

            if (isModalOpen && modalContent) {
                // 포토리뷰 모달 내부
                commentsContainer.id = `photo-review-comments-${reviewId}`;
                // 모달 컨텐츠에 추가
                const reviewActions = modalContent.querySelector('.reviewActions');
                if (reviewActions) {
                    // reviewActions 다음에 추가
                    if (reviewActions.nextSibling) {
                        modalContent.insertBefore(commentsContainer, reviewActions.nextSibling);
                    } else {
                        modalContent.appendChild(commentsContainer);
                    }
                } else {
                    modalContent.appendChild(commentsContainer);
                }
            } else {
                // 일반 리뷰
                const reviewElement = document.querySelector(
                    `.userReview[data-review-id="${reviewId}"]`,
                );
                if (reviewElement) {
                    commentsContainer.id = `review-comments-${reviewId}`;
                    reviewElement.appendChild(commentsContainer);
                } else {
                    console.error('리뷰 요소를 찾을 수 없습니다:', reviewId);
                    return;
                }
            }
        }

        // 댓글 목록 로드
        try {
            await loadReviewComments(reviewId, commentsContainer);
            commentsContainer.style.display = 'block';
        } catch (error) {
            console.error('댓글 로드 실패:', error);
        }
    }
}

// 댓글 목록 로드
async function loadReviewComments(reviewId, container) {
    container.innerHTML = '<div class="comments-loading">댓글을 불러오는 중...</div>';

    try {
        const response = await fetch(`/api/reviews/${reviewId}/comments`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || '댓글을 불러오는데 실패했습니다.');
        }

        const comments = data.comments || [];

        if (comments.length === 0) {
            container.innerHTML = `
                <div class="comments-empty">
                    <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
                </div>
                ${createCommentFormHTML(reviewId)}
            `;
        } else {
            container.innerHTML = `
                <div class="comments-list">
                    ${comments.map((comment) => createCommentHTML(comment)).join('')}
                </div>
                ${createCommentFormHTML(reviewId)}
            `;
        }

        // 댓글 작성 폼 이벤트 리스너 추가
        initCommentForm(reviewId);

        // 댓글 수정 폼 이벤트 리스너 추가
        initCommentEditForms();

        // 댓글 수 업데이트
        updateCommentCount(reviewId, comments.length);

        return comments.length;
    } catch (error) {
        console.error('댓글 로드 오류:', error);
        container.innerHTML = `
            <div class="comments-error">
                <p>댓글을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.</p>
            </div>
            ${createCommentFormHTML(reviewId)}
        `;
        initCommentForm(reviewId);
        return 0;
    }
}

// 댓글 수 업데이트 함수
function updateCommentCount(reviewId, count) {
    // 포토리뷰 모달 내의 댓글 수 업데이트
    const photoReviewModal = document.getElementById('photo-review-modal-content');
    if (photoReviewModal && photoReviewModal.getAttribute('data-review-id') == reviewId) {
        const reviewReCount = photoReviewModal.querySelector('.reviewReCount');
        if (reviewReCount) {
            reviewReCount.textContent = count;
        }
    }

    // 일반 리뷰 목록 내의 댓글 수 업데이트
    const reviewElement = document.querySelector(`[data-review-id="${reviewId}"]`);
    if (reviewElement) {
        const reviewReCount = reviewElement.querySelector('.reviewReCount');
        if (reviewReCount) {
            reviewReCount.textContent = count;
        }
    }
}

// 댓글 HTML 생성
function createCommentHTML(comment) {
    // 사용자 입력값은 XSS 방지를 위해 이스케이프
    const userName = escapeHtml(comment.userName || comment.userLoginId || '익명');
    const safeContent = escapeHtml(comment.content || '');
    const createdAt = formatDate(
        comment.createdAt || comment.created_at || new Date().toISOString(),
        'dot',
    );
    const userProfileImage = comment.userProfileImage || '/images/defaultProfile.png';

    // 현재 로그인한 사용자 정보 가져오기
    const user = getCurrentUser();
    const currentUserId = user ? user.id : null;

    const commentUserId = comment.userId || comment.user_id;
    const isMyComment = currentUserId && commentUserId && currentUserId == commentUserId;
    
    // 클릭 가능한 프로필 요소 (본인/타인 모두)
    const profileClickable = !!commentUserId;
    const profileClickHandler = profileClickable ? `onclick="goToUserProfile(${commentUserId})"` : '';
    const profileCursorStyle = profileClickable ? 'style="cursor: pointer;"' : '';

    // 본인 댓글인 경우 신고 버튼 숨김, 삭제/수정 버튼 표시
    const actionButtonsHTML = isMyComment
        ? `<div class="comment-actions">
            <button class="edit-comment-btn" onclick="editComment(${comment.id})">수정</button>
            <button class="delete-comment-btn" onclick="deleteComment(${comment.id})">삭제</button>
        </div>`
        : `<div class="comment-report-btn">
            <button onclick="reportComment(${comment.id})">신고</button>
        </div>`;

    return `
        <div class="comment-item ${isMyComment ? 'my-comment' : ''}" data-comment-id="${
            comment.id
        }">
            <div class="comment-header">
                <img src="${userProfileImage}" alt="${userName}" class="comment-user-image ${profileClickable ? 'clickable-profile' : ''}" ${profileClickHandler} ${profileCursorStyle} />
                <div class="comment-user-info">
                    <p class="comment-user-name ${profileClickable ? 'clickable-profile' : ''}" ${profileClickHandler} ${profileCursorStyle}>
                        <strong>${userName}</strong>
                        ${isMyComment ? ' <span class="my-comment-badge">내 댓글</span>' : ''}
                    </p>
                    <p class="comment-date">${createdAt}</p>
                </div>
                ${actionButtonsHTML}
            </div>
            <div class="comment-content" id="comment-content-${comment.id}">
                <p>${safeContent}</p>
            </div>
            <!-- 댓글 수정 폼 (숨김) -->
            <div class="comment-edit-form" id="comment-edit-form-${
                comment.id
            }" style="display: none;">
                <textarea class="comment-edit-input" id="comment-edit-input-${
                    comment.id
                }" maxlength="500">${safeContent}</textarea>
                <div class="comment-edit-actions">
                    <span class="comment-edit-char-count"><span id="comment-edit-char-count-${
                        comment.id
                    }">${(comment.content || '').length}</span>/500</span>
                    <div>
                        <button class="comment-cancel-btn" onclick="cancelEditComment(${
                            comment.id
                        })">취소</button>
                        <button class="comment-save-btn" onclick="saveComment(${
                            comment.id
                        })">저장</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 댓글 작성 폼 HTML 생성
function createCommentFormHTML(reviewId) {
    return `
        <div class="comment-form-container">
            <div class="comment-form">
                <textarea 
                    id="comment-input-${reviewId}" 
                    class="comment-input" 
                    placeholder="댓글을 입력해주세요... (최대 500자)"
                    maxlength="500"
                    rows="3"
                ></textarea>
                <div class="comment-form-actions">
                    <span class="comment-char-count"><span id="comment-char-count-${reviewId}">0</span>/500</span>
                    <button class="comment-submit-btn" onclick="submitComment(${reviewId})">댓글 작성</button>
                </div>
            </div>
        </div>
    `;
}

// 댓글 작성 폼 초기화
function initCommentForm(reviewId) {
    const textarea = document.getElementById(`comment-input-${reviewId}`);
    const charCount = document.getElementById(`comment-char-count-${reviewId}`);

    if (textarea && charCount) {
        textarea.addEventListener('input', function () {
            const currentLength = this.value.length;
            charCount.textContent = currentLength;

            // 글자수가 450자를 넘으면 경고색으로 변경
            if (currentLength > 450) {
                charCount.style.color = '#ef4444';
            } else {
                charCount.style.color = 'var(--neutral-500)';
            }
        });
    }
}

// 댓글 수정 폼 초기화
function initCommentEditForms() {
    const editInputs = document.querySelectorAll('.comment-edit-input');
    editInputs.forEach((input) => {
        const commentId = input.id.replace('comment-edit-input-', '');
        const charCount = document.getElementById(`comment-edit-char-count-${commentId}`);

        if (charCount) {
            // 기존 이벤트 리스너 제거 (중복 방지)
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);

            // 새 이벤트 리스너 추가
            newInput.addEventListener('input', function () {
                const length = this.value.length;
                charCount.textContent = length;
                if (length > 450) {
                    charCount.style.color = '#ef4444';
                } else {
                    charCount.style.color = 'var(--neutral-500)';
                }
            });
        }
    });
}

// 댓글 작성
async function submitComment(reviewId) {
    const textarea = document.getElementById(`comment-input-${reviewId}`);
    if (!textarea) {
        console.error('댓글 입력 필드를 찾을 수 없습니다:', `comment-input-${reviewId}`);
        return;
    }

    const content = textarea.value ? textarea.value.trim() : '';

    if (!content) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    // 현재 로그인한 사용자 정보 가져오기
    const user = getCurrentUser();
    if (!user) {
        alert('로그인이 필요합니다. 로그인 후 댓글을 작성해주세요.');
        return;
    }

    const userId = user.id;
    if (!userId) {
        alert('사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.');
        return;
    }

    // 제출 버튼 비활성화
    const submitBtn = document.querySelector(`[onclick="submitComment(${reviewId})"]`);
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '작성 중...';
    }

    try {
        const response = await fetch(`/api/reviews/${reviewId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: content,
            }),
        });

        const data = await response.json();

        if (data.success) {
            // 댓글 목록 새로고침 - 포토리뷰 모달과 일반 리뷰 모두 처리
            let commentsContainer = document.getElementById(`photo-review-comments-${reviewId}`);
            const isPhotoReviewModal = !!commentsContainer;

            if (!commentsContainer) {
                // 일반 리뷰의 경우
                const reviewElement = document.querySelector(`[data-review-id="${reviewId}"]`);
                if (reviewElement) {
                    commentsContainer =
                        reviewElement.querySelector('.review-comments-container') ||
                        document.getElementById(`review-comments-${reviewId}`);
                }
            }

            // 댓글창이 열려있는지 확인
            const wasOpen =
                commentsContainer &&
                commentsContainer.style.display !== 'none' &&
                window.getComputedStyle(commentsContainer).display !== 'none';

            if (isPhotoReviewModal && wasOpen) {
                // 포토리뷰 모달이 열려있고 댓글창도 열려있으면 댓글 컨테이너만 직접 새로고침
                const commentCount = await loadReviewComments(reviewId, commentsContainer);
                commentsContainer.style.display = 'block';
                // 댓글 수 업데이트
                updateCommentCount(reviewId, commentCount);

                // 폼 초기화
                const newTextarea = document.getElementById(`comment-input-${reviewId}`);
                const charCount = document.getElementById(`comment-char-count-${reviewId}`);
                if (newTextarea) {
                    newTextarea.value = '';
                }
                if (charCount) {
                    charCount.textContent = '0';
                    charCount.style.color = 'var(--neutral-500)';
                }
            } else {
                // 일반 리뷰이거나 댓글창이 닫혀있으면 기존 로직 사용
                // 리뷰 목록 새로고침 (댓글 수 업데이트) - 이전에 댓글창이 열려있었다면 다시 열기
                await loadReviews();

                // 댓글창이 열려있었으면 다시 열기
                if (wasOpen) {
                    // loadReviews() 후 DOM이 재생성되었으므로 toggleReviewReply를 호출하여 댓글창 다시 열기
                    await toggleReviewReply(reviewId);

                    // 폼 초기화 (댓글 목록 로드 후)
                    const newTextarea = document.getElementById(`comment-input-${reviewId}`);
                    const charCount = document.getElementById(`comment-char-count-${reviewId}`);
                    if (newTextarea) {
                        newTextarea.value = '';
                    }
                    if (charCount) {
                        charCount.textContent = '0';
                        charCount.style.color = 'var(--neutral-500)';
                    }
                }
            }
        } else {
            alert('댓글 작성에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('댓글 작성 오류:', error);
        alert('댓글 작성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
        // 제출 버튼 다시 활성화
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '댓글 작성';
        }
    }
}

// 댓글 신고
function reportComment(commentId) {
    openReportModal(commentId, 'comment');
}

// 댓글 수정 모드로 전환
function editComment(commentId, currentContent) {
    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentItem) return;

    const contentDiv = document.getElementById(`comment-content-${commentId}`);
    const editForm = document.getElementById(`comment-edit-form-${commentId}`);
    const editInput = document.getElementById(`comment-edit-input-${commentId}`);
    const charCount = document.getElementById(`comment-edit-char-count-${commentId}`);

    if (contentDiv && editForm && editInput) {
        // 수정 모드로 전환
        contentDiv.style.display = 'none';
        editForm.style.display = 'block';
        editInput.focus();
        editInput.setSelectionRange(editInput.value.length, editInput.value.length);

        // 글자 수 카운트 이벤트
        editInput.addEventListener('input', function () {
            const length = this.value.length;
            if (charCount) {
                charCount.textContent = length;
                if (length > 450) {
                    charCount.style.color = '#ef4444';
                } else {
                    charCount.style.color = 'var(--neutral-500)';
                }
            }
        });
    }
}

// 댓글 수정 취소
function cancelEditComment(commentId) {
    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentItem) return;

    const contentDiv = document.getElementById(`comment-content-${commentId}`);
    const editForm = document.getElementById(`comment-edit-form-${commentId}`);
    const editInput = document.getElementById(`comment-edit-input-${commentId}`);

    if (contentDiv && editForm && editInput) {
        // 원래 내용으로 복원
        const originalContent = contentDiv.querySelector('p').textContent;
        editInput.value = originalContent;

        // 표시 모드로 전환
        contentDiv.style.display = 'block';
        editForm.style.display = 'none';
    }
}

// 댓글 수정 저장
async function saveComment(commentId) {
    const editInput = document.getElementById(`comment-edit-input-${commentId}`);
    if (!editInput) return;

    const newContent = editInput.value.trim();
    if (!newContent) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    // 현재 로그인한 사용자 정보 가져오기
    const user = getCurrentUser();
    if (!user) {
        alert('로그인이 필요합니다.');
        return;
    }

    const userId = user.id;
    if (!userId) {
        alert('사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.');
        return;
    }

    // 저장 버튼 비활성화
    const saveBtn = document.querySelector(`[onclick="saveComment(${commentId})"]`);
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = '저장 중...';
    }

    try {
        const response = await fetch(`/api/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: newContent,
            }),
        });

        const data = await response.json();

        if (data.success) {
            // 댓글 내용 업데이트
            const contentDiv = document.getElementById(`comment-content-${commentId}`);
            const editForm = document.getElementById(`comment-edit-form-${commentId}`);
            const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);

            if (contentDiv) {
                contentDiv.querySelector('p').textContent = newContent;
                contentDiv.style.display = 'block';
            }
            if (editForm) {
                editForm.style.display = 'none';
            }

            // 댓글 목록 새로고침 (포토리뷰 모달과 일반 리뷰 모두 처리)
            if (commentItem) {
                const reviewElement = commentItem.closest('[data-review-id]');
                const reviewId = reviewElement
                    ? reviewElement.getAttribute('data-review-id')
                    : null;

                if (reviewId) {
                    let commentsContainer = document.getElementById(
                        `photo-review-comments-${reviewId}`,
                    );
                    if (!commentsContainer) {
                        commentsContainer = document.getElementById(`review-comments-${reviewId}`);
                    }
                    if (!commentsContainer && reviewElement) {
                        commentsContainer = reviewElement.querySelector(
                            '.review-comments-container',
                        );
                    }

                    if (commentsContainer) {
                        await loadReviewComments(reviewId, commentsContainer);
                        commentsContainer.style.display = 'block';
                    }
                }
            }
        } else {
            alert('댓글 수정에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('댓글 수정 오류:', error);
        alert('댓글 수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
        // 저장 버튼 다시 활성화
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = '저장';
        }
    }
}

// 댓글 삭제
async function deleteComment(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) {
        return;
    }

    // 현재 로그인한 사용자 정보 가져오기
    const user = getCurrentUser();
    if (!user) {
        alert('로그인이 필요합니다.');
        return;
    }

    const userId = user.id;
    if (!userId) {
        alert('사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.');
        return;
    }

    try {
        const response = await fetch(`/api/comments/${commentId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
            // 댓글 요소 제거
            const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
            if (commentItem) {
                // 리뷰 ID 찾기
                const reviewElement = commentItem.closest('[data-review-id]');
                const reviewId = reviewElement
                    ? reviewElement.getAttribute('data-review-id')
                    : null;

                // 댓글창이 열려있는지 확인
                let commentsContainer = document.getElementById(
                    `photo-review-comments-${reviewId}`,
                );
                const isPhotoReviewModal = !!commentsContainer;

                if (!commentsContainer) {
                    commentsContainer = document.getElementById(`review-comments-${reviewId}`);
                }

                const wasOpen =
                    commentsContainer &&
                    commentsContainer.style.display !== 'none' &&
                    window.getComputedStyle(commentsContainer).display !== 'none';

                commentItem.remove();

                if (isPhotoReviewModal && wasOpen) {
                    // 포토리뷰 모달이 열려있고 댓글창도 열려있으면 댓글 컨테이너만 직접 새로고침
                    const commentCount = await loadReviewComments(reviewId, commentsContainer);
                    commentsContainer.style.display = 'block';
                    // 댓글 수 업데이트
                    updateCommentCount(reviewId, commentCount);
                } else {
                    // 일반 리뷰이거나 댓글창이 닫혀있으면 기존 로직 사용
                    // 리뷰 목록 새로고침 (댓글 수 업데이트)
                    await loadReviews();

                    // 댓글창이 열려있었으면 다시 열기
                    if (wasOpen && reviewId) {
                        await toggleReviewReply(reviewId);
                    }
                }
            }
        } else {
            alert('댓글 삭제에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('댓글 삭제 오류:', error);
        alert('댓글 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
}

// 신고 모달 열기
function openReportModal(targetId, targetType) {
    // 현재 로그인한 사용자 정보 확인
    const user = getCurrentUser();
    if (!user) {
        alert('로그인이 필요합니다. 로그인 후 신고해주세요.');
        return;
    }

    const modal = document.getElementById('report-modal');
    const targetIdInput = document.getElementById('report-target-id');
    const targetTypeInput = document.getElementById('report-target-type');
    const modalTitle = document.getElementById('report-modal-title');
    const form = document.getElementById('report-form');
    const otherReasonGroup = document.getElementById('report-other-reason-group');
    const otherReasonTextarea = document.getElementById('report-other-reason');

    // 타겟 정보 설정
    targetIdInput.value = targetId;
    targetTypeInput.value = targetType;
    modalTitle.textContent = targetType === 'review' ? '리뷰 신고하기' : '댓글 신고하기';

    // 폼 초기화
    form.reset();
    otherReasonGroup.style.display = 'none';
    otherReasonTextarea.required = false;
    document.getElementById('report-reason-char-count').textContent = '0';

    // 모달 표시
    modal.style.display = 'block';

    // 배경 스크롤 방지
    document.body.style.overflow = 'hidden';

    // 라디오 버튼 변경 이벤트
    const reasonRadios = document.querySelectorAll('input[name="report-reason"]');
    reasonRadios.forEach((radio) => {
        radio.addEventListener('change', function () {
            if (this.value === 'other') {
                otherReasonGroup.style.display = 'block';
                otherReasonTextarea.required = true;
            } else {
                otherReasonGroup.style.display = 'none';
                otherReasonTextarea.required = false;
                otherReasonTextarea.value = '';
                document.getElementById('report-reason-char-count').textContent = '0';
            }
        });
    });

    // 글자 수 카운트
    otherReasonTextarea.addEventListener('input', function () {
        const currentLength = this.value.length;
        document.getElementById('report-reason-char-count').textContent = currentLength;

        if (currentLength > 450) {
            document.getElementById('report-reason-char-count').style.color = '#ef4444';
        } else {
            document.getElementById('report-reason-char-count').style.color = 'var(--neutral-500)';
        }
    });
}

// 신고 모달 닫기
// 배경 스크롤 복원 (다른 모달이 열려있지 않은 경우에만)
function restoreBodyScroll() {
    const photoModal = document.getElementById('photo-review-modal');
    const reportModal = document.getElementById('report-modal');
    const photoRequestModal = document.getElementById('photo-request-modal');
    const spotEditModal = document.getElementById('spot-edit-request-modal');

    const isPhotoModalOpen =
        photoModal && photoModal.style.display !== 'none' && photoModal.style.display !== '';
    const isReportModalOpen =
        reportModal && reportModal.style.display !== 'none' && reportModal.style.display !== '';
    const isPhotoRequestModalOpen =
        photoRequestModal &&
        photoRequestModal.style.display !== 'none' &&
        photoRequestModal.style.display !== '';
    const isSpotEditModalOpen =
        spotEditModal &&
        spotEditModal.style.display !== 'none' &&
        spotEditModal.style.display !== '';

    // 모든 모달이 닫혀있을 때만 스크롤 복원
    if (
        !isPhotoModalOpen &&
        !isReportModalOpen &&
        !isPhotoRequestModalOpen &&
        !isSpotEditModalOpen
    ) {
        document.body.style.overflow = '';
    }
}

function closeReportModal() {
    const modal = document.getElementById('report-modal');
    if (modal) {
        modal.style.display = 'none';
        // 배경 스크롤 복원 (다른 모달이 열려있지 않은 경우에만)
        restoreBodyScroll();
    }
}

// 신고 제출
async function submitReport(event) {
    event.preventDefault();

    const targetId = document.getElementById('report-target-id').value;
    const targetType = document.getElementById('report-target-type').value;
    const selectedReason = document.querySelector('input[name="report-reason"]:checked');
    const otherReason = document.getElementById('report-other-reason').value.trim();

    if (!selectedReason) {
        alert('신고 사유를 선택해주세요.');
        return;
    }

    let reason = '';
    const reasonMap = {
        spam: '스팸',
        abuse: '욕설/비방',
        inappropriate: '부적절한 내용',
        other: '기타',
    };

    if (selectedReason.value === 'other') {
        if (!otherReason) {
            alert('상세 사유를 입력해주세요.');
            return;
        }
        reason = `기타: ${otherReason}`;
    } else {
        reason = reasonMap[selectedReason.value];
    }

    // 현재 로그인한 사용자 정보 가져오기
    const user = getCurrentUser();
    if (!user) {
        alert('사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.');
        return;
    }

    const userId = user.id;
    if (!userId) {
        alert('사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.');
        return;
    }

    // 제출 버튼 비활성화
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '신고 중...';
    }

    try {
        const endpoint =
            targetType === 'review'
                ? `/api/reviews/${targetId}/report`
                : `/api/comments/${targetId}/report`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reason: reason,
            }),
        });

        const data = await response.json();

        if (data.success) {
            alert('신고가 접수되었습니다. 검토 후 조치하겠습니다.');
            closeReportModal();
        } else {
            alert('신고 처리에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('신고 처리 오류:', error);
        alert('신고 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
        // 제출 버튼 다시 활성화
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '신고하기';
        }
    }
}

// 신고 모달 이벤트 리스너 초기화
function initReportModal() {
    const modal = document.getElementById('report-modal');
    const closeBtn = document.getElementById('close-report-modal');
    const cancelBtn = document.getElementById('cancel-report-btn');
    const form = document.getElementById('report-form');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeReportModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeReportModal);
    }

    if (form) {
        form.addEventListener('submit', submitReport);
    }

    // 모달 외부 클릭 시 닫기
    if (modal) {
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                closeReportModal();
            }
        });
    }
}

// 전역 스코프에 함수 바인딩
window.toggleReviewReply = toggleReviewReply;
window.submitComment = submitComment;
window.reportComment = reportComment;
window.editComment = editComment;
window.cancelEditComment = cancelEditComment;
window.saveComment = saveComment;
window.deleteComment = deleteComment;
window.editComment = editComment;
window.cancelEditComment = cancelEditComment;
window.saveComment = saveComment;
window.deleteComment = deleteComment;

// 비활성화된 카테고리 경고 배너 표시 (ADMIN 전용)
function showInactiveCategoryBanner() {
    // 이미 배너가 있으면 제거
    const existingBanner = document.getElementById('inactive-category-banner');
    if (existingBanner) {
        existingBanner.remove();
    }

    // 경고 배너 생성
    const banner = document.createElement('div');
    banner.id = 'inactive-category-banner';
    banner.innerHTML = `
        <div style="
            position: fixed;
            top: 80px;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 15px 20px;
            text-align: center;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
            animation: slideDown 0.3s ease;
        ">
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                max-width: 1200px;
                margin: 0 auto;
            ">
                <span style="font-size: 24px;">⚠️</span>
                <div style="text-align: left;">
                    <strong style="font-size: 16px;">비활성화된 카테고리</strong>
                    <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">
                        이 관광지는 현재 비활성화된 카테고리에 속해 있어 일반 사용자에게 표시되지 않습니다. (관리자만 접근 가능)
                    </p>
                </div>
                <button onclick="document.getElementById('inactive-category-banner').remove()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    margin-left: 20px;
                    transition: background 0.2s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    닫기
                </button>
            </div>
        </div>
        <style>
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-100%);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        </style>
    `;

    document.body.insertBefore(banner, document.body.firstChild);

    // 페이지 상단에 여백 추가 (배너 높이만큼)
    const wrapper = document.getElementById('Wrapper');
    if (wrapper) {
        wrapper.style.marginTop = '80px';
    }
}

// 페이지 콘텐츠 업데이트 함수 수정 (기존 함수에 currentSpotTitle 설정 추가)
function updatePageContent(spot, regionName) {
    // 현재 관광지 ID와 제목, 해시태그 설정
    currentSpotId = spot.id;
    currentSpotTitle = spot.title;
    currentSpotHashtags = spot.hashtags || [];

    // 기본 정보 업데이트
    const spotTitle = document.getElementById('spot-title');
    const spotLocation = document.getElementById('spot-location');
    const spotDescription = document.getElementById('spot-description');
    const detailedDescription = document.getElementById('detailed-description');

    if (spotTitle) spotTitle.textContent = spot.title;
    if (spotLocation) spotLocation.textContent = `부산 ${regionName}`;
    if (spotDescription) spotDescription.textContent = spot.description;
    if (detailedDescription) detailedDescription.textContent = spot.description;

    // 조회수 업데이트
    const eyesCount = document.querySelector('.eyesCount');
    if (eyesCount) {
        eyesCount.textContent = spot.viewCount || 0;
    }

    // 이미지 설정
    updateImages(spot);

    // 해시태그 설정
    updateHashtags(spot);

    // 관광지 정보 설정
    updateSpotInfo(spot, regionName);

    // 카카오 지도 초기화 (스크립트 로드 대기 포함)
    initKakaoMap(spot.title, spot.latitude, spot.longitude);

    // Swiper 재초기화
    setTimeout(() => {
        initSwiper();
    }, 100);

    // 리뷰 로드 (loadReviews가 updatePhotoReviews까지 호출하므로
    // loadPhotoReviews를 따로 부르면 같은 API를 중복 호출하게 됨)
    setTimeout(() => {
        loadReviews();
    }, 200);
}

// 사진 등록 신청 모달 관련 함수들
function initPhotoRequestModal() {
    const submitPictureBtn = document.querySelector('.submitPicture');
    const modal = document.getElementById('photo-request-modal');
    const closeBtn = document.getElementById('close-photo-request-modal');
    const form = document.getElementById('photo-request-form');
    const imageInput = document.getElementById('photo-request-image');
    const previewContainer = document.getElementById('photo-preview-container');
    const preview = document.getElementById('photo-preview');
    const descriptionTextarea = document.getElementById('photo-request-description');
    const charCount = document.getElementById('photo-description-char-count');

    // 모달 열기
    if (submitPictureBtn) {
        submitPictureBtn.addEventListener('click', function () {
            if (modal) {
                // 현재 관광지 정보를 모달에 설정
                const spotIdInput = document.getElementById('photo-request-spot-id');
                const spotNameInput = document.getElementById('photo-request-spot-name');

                if (spotIdInput) {
                    spotIdInput.value = currentSpotId || '';
                }
                if (spotNameInput && currentSpotTitle) {
                    spotNameInput.value = currentSpotTitle;
                }

                modal.style.display = 'block';
                // 배경 스크롤 방지
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // 모달 닫기
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            if (modal) {
                modal.style.display = 'none';
                // 배경 스크롤 복원 (다른 모달이 열려있지 않은 경우에만)
                restoreBodyScroll();
                // 폼 초기화
                if (form) {
                    form.reset();
                }
                if (previewContainer) {
                    previewContainer.style.display = 'none';
                }
                if (preview) {
                    preview.src = '';
                }
                if (charCount) {
                    charCount.textContent = '0';
                }
            }
        });
    }

    // 모달 외부 클릭 시 닫기
    if (modal) {
        window.addEventListener('click', function (event) {
            if (event.target === modal) {
                modal.style.display = 'none';
                // 배경 스크롤 복원 (다른 모달이 열려있지 않은 경우에만)
                restoreBodyScroll();
                // 폼 초기화
                if (form) {
                    form.reset();
                }
                if (previewContainer) {
                    previewContainer.style.display = 'none';
                }
                if (preview) {
                    preview.src = '';
                }
                if (charCount) {
                    charCount.textContent = '0';
                }
            }
        });
    }

    // 이미지 미리보기
    if (imageInput) {
        imageInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    if (preview) {
                        preview.src = e.target.result;
                    }
                    if (previewContainer) {
                        previewContainer.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            } else {
                if (previewContainer) {
                    previewContainer.style.display = 'none';
                }
                if (preview) {
                    preview.src = '';
                }
            }
        });
    }

    // 설명 글자 수 카운트
    if (descriptionTextarea && charCount) {
        descriptionTextarea.addEventListener('input', function () {
            const length = this.value.length;
            charCount.textContent = length;
        });
    }

    // 폼 제출
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const spotId = document.getElementById('photo-request-spot-id').value;
            const spotName = document.getElementById('photo-request-spot-name').value;
            const imageFile = document.getElementById('photo-request-image').files[0];
            const description = document.getElementById('photo-request-description').value;

            if (!imageFile) {
                alert('사진을 선택해주세요.');
                return;
            }

            // 현재 로그인한 사용자 정보 가져오기
            const user = getCurrentUser();
            if (!user || !user.id) {
                alert('로그인이 필요합니다.');
                return;
            }

            const userId = user.id;

            // FormData 생성
            const formData = new FormData();
            formData.append('spotId', spotId);
            formData.append('image', imageFile);
            formData.append('description', description);

            // 백엔드 API 호출
            fetch('/api/spot-requests/photo', {
                method: 'POST',
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        alert('사진 등록 신청이 완료되었습니다. 관리자 검토 후 반영됩니다.');
                        modal.style.display = 'none';
                        // 배경 스크롤 복원 (다른 모달이 열려있지 않은 경우에만)
                        restoreBodyScroll();
                        form.reset();
                        if (previewContainer) {
                            previewContainer.style.display = 'none';
                        }
                        if (preview) {
                            preview.src = '';
                        }
                        if (charCount) {
                            charCount.textContent = '0';
                        }
                    } else {
                        alert('신청에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    alert('신청 중 오류가 발생했습니다.');
                });
        });
    }
}

// 관광지 정보 수정요청 모달 관련 함수들
function initSpotEditRequestModal() {
    const detailPictureBtn = document.querySelector('.detailPicture');
    const modal = document.getElementById('spot-edit-request-modal');
    const closeBtn = document.getElementById('close-spot-edit-request-modal');
    const form = document.getElementById('spot-edit-request-form');
    const imageInput = document.getElementById('spot-edit-request-image');
    const previewContainer = document.getElementById('spot-edit-preview-container');
    const preview = document.getElementById('spot-edit-preview');
    const contentTextarea = document.getElementById('spot-edit-request-content');
    const charCount = document.getElementById('spot-edit-content-char-count');

    // 모달 열기
    if (detailPictureBtn) {
        detailPictureBtn.addEventListener('click', function () {
            if (modal) {
                // 현재 관광지 정보를 모달에 설정
                const spotIdInput = document.getElementById('spot-edit-request-spot-id');
                const spotNameInput = document.getElementById('spot-edit-request-spot-name');

                if (spotIdInput && currentSpotId) {
                    spotIdInput.value = currentSpotId;
                }
                if (spotNameInput && currentSpotTitle) {
                    spotNameInput.value = currentSpotTitle;
                }

                modal.style.display = 'block';
                // 배경 스크롤 방지
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // 모달 닫기
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            if (modal) {
                modal.style.display = 'none';
                // 배경 스크롤 복원 (다른 모달이 열려있지 않은 경우에만)
                restoreBodyScroll();
            }
        });
    }

    // 모달 외부 클릭 시 닫기
    if (modal) {
        window.addEventListener('click', function (event) {
            if (event.target === modal) {
                modal.style.display = 'none';
                // 배경 스크롤 복원 (다른 모달이 열려있지 않은 경우에만)
                restoreBodyScroll();
            }
        });
    }

    // 이미지 미리보기
    if (imageInput && preview && previewContainer) {
        imageInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    preview.src = e.target.result;
                    previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                previewContainer.style.display = 'none';
                preview.src = '';
            }
        });
    }

    // 글자 수 카운트
    if (contentTextarea && charCount) {
        contentTextarea.addEventListener('input', function () {
            const length = this.value.length;
            charCount.textContent = length;
        });
    }

    // 폼 제출
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const spotId = document.getElementById('spot-edit-request-spot-id').value;
            const content = document.getElementById('spot-edit-request-content').value;
            const imageFile = imageInput ? imageInput.files[0] : null;

            if (!content || content.trim() === '') {
                alert('수정 요청 내용을 입력해주세요.');
                return;
            }

            // 현재 로그인한 사용자 정보 가져오기
            const user = getCurrentUser();
            if (!user || !user.id) {
                alert('로그인이 필요합니다.');
                return;
            }

            const userId = user.id;

            // FormData 생성
            const formData = new FormData();
            formData.append('spotId', spotId);
            formData.append('content', content);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            // 백엔드 API 호출
            // TODO: 백엔드 API 엔드포인트 구현 필요
            fetch('/api/spot-requests/edit', {
                method: 'POST',
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        alert('관광지 정보 수정요청이 완료되었습니다. 관리자 검토 후 반영됩니다.');
                        modal.style.display = 'none';
                        // 배경 스크롤 복원 (다른 모달이 열려있지 않은 경우에만)
                        restoreBodyScroll();
                        form.reset();
                        if (previewContainer) {
                            previewContainer.style.display = 'none';
                        }
                        if (preview) {
                            preview.src = '';
                        }
                        if (charCount) {
                            charCount.textContent = '0';
                        }
                    } else {
                        alert('신청에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    alert('신청 중 오류가 발생했습니다.');
                });
        });
    }
}

// ========== 포토리뷰 관련 기능 ==========

// 포토리뷰 데이터
let photoReviews = [];
let isGridView = false;
let currentSort = 'latest';

// 포토리뷰 업데이트 (리뷰 데이터에서)
function updatePhotoReviews(spotReviews) {
    // 이미지가 있는 리뷰만 필터링
    photoReviews = spotReviews.filter((review) => {
        return review.images && Array.isArray(review.images) && review.images.length > 0;
    });

    // 포토리뷰 표시
    displayPhotoReviews();
}

// 포토리뷰 로드 (별도 API 호출)
async function loadPhotoReviews() {
    if (!currentSpotId) {
        return;
    }

    try {
        // 로그인한 사용자 ID 가져오기
        const user = getCurrentUser();
        const userId = user?.id;

        // API URL 구성 (로그인 상태면 서버가 세션으로 좋아요 여부도 함께 조회)
        const apiUrl = `/api/reviews?touristSpotId=${currentSpotId}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let spotReviews = [];

        if (data.content && Array.isArray(data.content)) {
            spotReviews = data.content;
        } else if (data.reviews && Array.isArray(data.reviews)) {
            spotReviews = data.reviews;
        } else if (Array.isArray(data)) {
            spotReviews = data;
        }

        // 포토리뷰 업데이트
        updatePhotoReviews(spotReviews);
    } catch (error) {
        console.error('포토리뷰 데이터 로드 중 오류:', error);
    }
}

// 포토리뷰 표시
function displayPhotoReviews() {
    const listContainer = document.getElementById('photo-reviews-list');
    const gridContainer = document.getElementById('photo-reviews-grid');

    if (!listContainer || !gridContainer) return;

    if (photoReviews.length === 0) {
        listContainer.innerHTML =
            '<div class="no-photo-reviews"><p>아직 포토리뷰가 없습니다.</p></div>';
        gridContainer.innerHTML =
            '<div class="no-photo-reviews"><p>아직 포토리뷰가 없습니다.</p></div>';
        return;
    }

    // 정렬
    const sortedReviews = sortPhotoReviews([...photoReviews]);

    if (isGridView) {
        // 그리드 형태
        displayPhotoReviewsGrid(gridContainer, sortedReviews);
        listContainer.style.display = 'none';
        gridContainer.style.display = 'grid';
    } else {
        // 리스트 형태
        displayPhotoReviewsList(listContainer, sortedReviews);
        listContainer.style.display = 'block';
        gridContainer.style.display = 'none';
    }
}

// 포토리뷰 정렬
function sortPhotoReviews(reviews) {
    if (currentSort === 'latest') {
        return reviews.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || 0);
            const dateB = new Date(b.createdAt || b.created_at || 0);
            return dateB - dateA;
        });
    } else if (currentSort === 'popular') {
        return reviews.sort((a, b) => {
            const likesA = a.likes || a.likeCount || 0;
            const likesB = b.likes || b.likeCount || 0;
            return likesB - likesA;
        });
    }
    return reviews;
}

// 포토리뷰 리스트 형태 표시
function displayPhotoReviewsList(container, reviews) {
    container.innerHTML = '';

    // 최대 6개만 표시 (리스트 형태)
    const displayReviews = reviews.slice(0, 6);

    displayReviews.forEach((review) => {
        const reviewElement = createPhotoReviewListItem(review);
        container.appendChild(reviewElement);
    });
}

// 포토리뷰 그리드 형태 표시
function displayPhotoReviewsGrid(container, reviews) {
    container.innerHTML = '';

    reviews.forEach((review) => {
        const reviewElement = createPhotoReviewGridItem(review);
        container.appendChild(reviewElement);
    });
}

// 포토리뷰 리스트 아이템 생성
function createPhotoReviewListItem(review) {
    const item = document.createElement('div');
    item.setAttribute('data-review-id', review.id);

    // 현재 로그인한 사용자 정보 가져오기
    const user = getCurrentUser();
    const currentUserId = user ? user.id : null;

    // 리뷰 작성자 ID 가져오기
    const reviewUserId = review.userId || review.user_id;
    const isMyReview = currentUserId && reviewUserId && currentUserId == reviewUserId;

    // 본인 리뷰인 경우 클래스 추가
    item.className = isMyReview
        ? 'photo-review-list-item my-photo-review'
        : 'photo-review-list-item';

    const firstImage =
        review.images && review.images.length > 0
            ? review.images[0].imageUrl || review.images[0].image_url || ''
            : '/images/logo.png';

    const userName = escapeHtml(review.userName || review.user_name || '익명');
    const title = escapeHtml(review.title || '');
    const rating = review.rating || 0;
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const createdAt = formatDate(
        review.createdAt || review.created_at || new Date().toISOString(),
        'dot',
    );
    const imageCount = review.images ? review.images.length : 0;

    item.innerHTML = `
        <div class="photo-review-list-image">
            <img src="${firstImage}" alt="${title}" onerror="this.src='/images/logo.png'" />
            ${imageCount > 1 ? `<span class="image-count">+${imageCount - 1}</span>` : ''}
        </div>
        <div class="photo-review-list-info">
            <div class="photo-review-list-header">
                <p class="photo-review-user">${userName}${
                    isMyReview ? ' <span class="my-photo-review-badge">내 리뷰</span>' : ''
                }</p>
                <p class="photo-review-date">${createdAt}</p>
            </div>
            <p class="photo-review-title">${title}</p>
            <div class="photo-review-rating">${stars} (${rating}/5)</div>
        </div>
    `;

    item.addEventListener('click', () => {
        openPhotoReviewModal(review);
    });

    return item;
}

// 포토리뷰 그리드 아이템 생성
function createPhotoReviewGridItem(review) {
    const item = document.createElement('div');
    item.setAttribute('data-review-id', review.id);

    // 현재 로그인한 사용자 정보 가져오기
    const user = getCurrentUser();
    const currentUserId = user ? user.id : null;

    // 리뷰 작성자 ID 가져오기
    const reviewUserId = review.userId || review.user_id;
    const isMyReview = currentUserId && reviewUserId && currentUserId == reviewUserId;

    // 본인 리뷰인 경우 클래스 추가
    item.className = isMyReview
        ? 'photo-review-grid-item my-photo-review'
        : 'photo-review-grid-item';

    const firstImage =
        review.images && review.images.length > 0
            ? review.images[0].imageUrl || review.images[0].image_url || ''
            : '/images/logo.png';

    const imageCount = review.images ? review.images.length : 0;

    item.innerHTML = `
        <div class="photo-review-grid-image">
            <img src="${firstImage}" alt="포토리뷰" onerror="this.src='/images/logo.png'" />
            ${imageCount > 1 ? `<span class="image-count">+${imageCount - 1}</span>` : ''}
            ${isMyReview ? '<span class="my-photo-review-indicator">내 리뷰</span>' : ''}
        </div>
    `;

    item.addEventListener('click', () => {
        openPhotoReviewModal(review);
    });

    return item;
}

// 포토리뷰 모달 열기
function openPhotoReviewModal(review) {
    const modal = document.getElementById('photo-review-modal');
    const content = document.getElementById('photo-review-modal-content');

    if (!modal || !content) return;

    // 배경 스크롤 방지
    document.body.style.overflow = 'hidden';

    // 현재 로그인한 사용자 정보 가져오기
    const user = getCurrentUser();
    const currentUserId = user ? user.id : null;

    // 리뷰 작성자 ID 가져오기
    const reviewUserId = review.userId || review.user_id;
    const isMyReview = currentUserId && reviewUserId && currentUserId == reviewUserId;

    const userName = escapeHtml(review.userName || review.user_name || '익명');
    const title = escapeHtml(review.title || '');
    const contentText = escapeHtml(review.content || '');
    const rating = review.rating || 0;
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

    // 수정 날짜 처리
    const createdAtRaw = review.createdAt || review.created_at;
    const updatedAtRaw = review.updatedAt || review.updated_at;
    const createdAt = formatDate(createdAtRaw || new Date().toISOString(), 'dot');
    const updatedAt = formatDate(updatedAtRaw, 'dot');
    const isEdited = updatedAtRaw && createdAt !== updatedAt;

    const images = review.images || [];
    const likes = review.likes || review.likeCount || 0;
    const replies = review.replies || review.comments || review.commentCount || 0;
    const isLiked = review.isLiked || false;
    const likeClass = isLiked ? 'reviewLikeBtn active' : 'reviewLikeBtn';

    // 본인 리뷰인 경우: 수정/삭제 버튼 표시, 신고 버튼 숨김
    const myReviewButtonsHTML = isMyReview
        ? `<div class="myReviewBtns">
            <button class="editReviewBtn" onclick="openEditReviewModal(${review.id})">수정</button>
            <button class="deleteReviewBtn" onclick="deleteReview(${review.id})">삭제</button>
        </div>`
        : '';

    const reportButtonHTML = isMyReview
        ? ''
        : `<div class="reportBtn">
            <button onclick="reportReview(${review.id})">신고</button>
        </div>`;
    
    // 클릭 가능한 프로필 요소 (본인/타인 모두)
    const profileClickable = !!reviewUserId;
    const profileClickHandler = profileClickable ? `onclick="goToUserProfile(${reviewUserId})"` : '';
    const profileCursorStyle = profileClickable ? 'style="cursor: pointer;"' : '';
    const userProfileImage =
        review.userProfileImage ||
        review.profileImage ||
        review.profile_image ||
        '/images/defaultProfile.png';

    let imagesHTML = '';
    if (images.length > 0) {
        imagesHTML = `
            <div class="photo-review-modal-images">
                ${images
                    .map((img, index) => {
                        const imageUrl = img.imageUrl || img.image_url || '';
                        return `
                        <div class="photo-review-modal-image-item">
                            <img src="${imageUrl}" alt="리뷰 이미지 ${
                                index + 1
                            }" onerror="this.src='/images/logo.png'" />
                        </div>
                    `;
                    })
                    .join('')}
            </div>
        `;
    }

    // 날짜 HTML 생성
    const modalDateHTML = isEdited
        ? `<p class="photo-review-modal-date">${createdAt}</p>
           <p class="photo-review-modal-date-edited">(수정: ${updatedAt})</p>`
        : `<p class="photo-review-modal-date">${createdAt}</p>`;

    content.innerHTML = `
        <div class="photo-review-modal-header">
            <div class="photo-review-modal-user-info">
                <div class="photo-review-modal-user-left">
                    <img src="${userProfileImage}" alt="${userName}" class="photo-review-modal-user-image ${profileClickable ? 'clickable-profile' : ''}" ${profileClickHandler} ${profileCursorStyle}
                        onerror="this.src='/images/defaultProfile.png'" />
                    <p class="photo-review-modal-user ${profileClickable ? 'clickable-profile' : ''}" ${profileClickHandler} ${profileCursorStyle}>
                        <strong>${userName}</strong>${
                            isMyReview ? ' <span class="my-review-badge">내 리뷰</span>' : ''
                        }
                    </p>
                </div>
                <div class="photo-review-modal-date-container">
                    ${modalDateHTML}
                </div>
            </div>
        </div>
        <div class="photo-review-modal-title">${title}</div>
        <div class="photo-review-modal-rating">${stars} (${rating}/5)</div>
        <div class="photo-review-modal-body">${contentText}</div>
        ${imagesHTML}
        <div class="reviewActions" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--neutral-200);">
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
                ${myReviewButtonsHTML}
                ${reportButtonHTML}
            </div>
        </div>
        <!-- 댓글 컨테이너 (동적으로 추가됨) -->
        <div class="review-comments-container" id="photo-review-comments-${
            review.id
        }" style="display: none;">
            <!-- 댓글이 동적으로 추가됩니다 -->
        </div>
    `;

    // 모달 컨텐츠에 data-review-id 속성 추가 (댓글 기능을 위해)
    content.setAttribute('data-review-id', review.id);

    modal.style.display = 'block';
}

// 포토리뷰 모달 닫기
function closePhotoReviewModal() {
    const modal = document.getElementById('photo-review-modal');
    if (modal) {
        modal.style.display = 'none';
        // 배경 스크롤 복원 (다른 모달이 열려있지 않은 경우에만)
        restoreBodyScroll();
    }
}

// 포토리뷰 뷰 전환 (리스트/그리드)
function togglePhotoReviewView() {
    isGridView = !isGridView;
    const toggleBtn = document.getElementById('view-all-photos');

    if (toggleBtn) {
        toggleBtn.textContent = isGridView ? '리스트보기' : '전체보기';
    }

    displayPhotoReviews();
}

// 포토리뷰 정렬 변경
function changePhotoReviewSort(sortType) {
    currentSort = sortType;

    // 정렬 버튼 활성화 상태 업데이트
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach((btn) => {
        if (btn.getAttribute('data-sort') === sortType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    displayPhotoReviews();
}

// 포토리뷰 기능 초기화
function initPhotoReviews() {
    // 전체보기 버튼 클릭 이벤트
    const viewToggleBtn = document.getElementById('view-all-photos');
    if (viewToggleBtn) {
        viewToggleBtn.addEventListener('click', togglePhotoReviewView);
    }

    // 정렬 버튼 클릭 이벤트
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach((btn) => {
        btn.addEventListener('click', function () {
            const sortType = this.getAttribute('data-sort');
            changePhotoReviewSort(sortType);
        });
    });

    // 포토리뷰 모달 닫기 이벤트
    const closeModalBtn = document.getElementById('close-photo-review-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closePhotoReviewModal);
    }

    // 모달 외부 클릭 시 닫기
    const modal = document.getElementById('photo-review-modal');
    if (modal) {
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                closePhotoReviewModal();
            }
        });
    }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function () {
    // 뒤로가기 버튼 초기화
    initBackButton();

    // 리뷰 관련 기능 초기화
    initRatingSystem();

    // 신고 모달 초기화
    initReportModal();
    initCharCount();
    initReviewSubmission();

    // 리뷰 정보 클릭 이벤트 초기화
    initReviewInfoClick();

    // 사진 등록 신청 모달 초기화
    initPhotoRequestModal();

    // 관광지 정보 수정요청 모달 초기화
    initSpotEditRequestModal();

    // 포토리뷰 기능 초기화
    initPhotoReviews();

    // 프린트 및 공유 버튼 초기화
    initPrintAndShareButtons();

    // URL 파라미터가 있으면 동적 데이터 로드 (detailed.html용)
    // ID만 사용 (title 기반 검색은 사용하지 않음)
    const urlParams = new URLSearchParams(window.location.search);
    const spotId = urlParams.get('id');

    if (spotId) {
        loadTouristSpotDetail();
    } else {
        setTimeout(() => {
            initSwiper();
        }, 100);
    }
});

/**
 * 프린트 및 공유 버튼 기능 초기화
 */
function initPrintAndShareButtons() {
    // 프린트 버튼 클릭 이벤트
    const printBtn = document.querySelector('.print');
    if (printBtn) {
        printBtn.style.cursor = 'pointer';
        printBtn.addEventListener('click', function () {
            window.print();
        });
    }

    // 공유(URL 복사) 버튼 클릭 이벤트
    const shareBtn = document.querySelector('.share');
    if (shareBtn) {
        shareBtn.style.cursor = 'pointer';
        shareBtn.addEventListener('click', function () {
            const currentUrl = window.location.href;

            // Clipboard API를 사용하여 URL 복사
            navigator.clipboard
                .writeText(currentUrl)
                .then(function () {
                    // 복사 성공 시 알림 표시
                    showCopyNotification();
                })
                .catch(function (err) {
                    // 구형 브라우저 대응 (fallback)
                    const textArea = document.createElement('textarea');
                    textArea.value = currentUrl;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-9999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        showCopyNotification();
                    } catch (e) {
                        alert('URL 복사에 실패했습니다.');
                    }
                    document.body.removeChild(textArea);
                });
        });
    }
}

/**
 * URL 복사 완료 알림 표시
 */
function showCopyNotification() {
    // 기존 알림이 있으면 제거
    const existingNotification = document.querySelector('.copy-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 알림 요소 생성
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.innerHTML = `
        <span class="copy-notification-icon">✓</span>
        <span class="copy-notification-text">클립보드에 저장되었습니다!</span>
    `;

    document.body.appendChild(notification);

    // 애니메이션을 위해 약간의 지연 후 show 클래스 추가
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // 2.5초 후 알림 제거
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2500);
}

// ===== 리뷰 수정 기능 =====

// 수정 중인 리뷰의 선택된 별점
let editSelectedRating = 0;

// 수정 모달에서 관리할 이미지 상태
let editExistingImages = []; // 기존 이미지 (삭제할 ID 관리)
let editDeletedImageIds = []; // 삭제할 이미지 ID 목록
let editNewImages = []; // 새로 추가할 이미지

/**
 * 리뷰 수정 모달 열기
 * @param {number} reviewId - 수정할 리뷰 ID
 */
function openEditReviewModal(reviewId) {
    // 현재 로그인한 사용자 확인
    const user = getCurrentUser();
    if (!user || !user.id) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
        return;
    }

    // 리뷰 데이터 가져오기
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) {
        alert('리뷰를 찾을 수 없습니다.');
        return;
    }

    // 리뷰 작성자 확인
    const reviewUserId = review.userId || review.user_id;
    if (user.id != reviewUserId) {
        alert('본인이 작성한 리뷰만 수정할 수 있습니다.');
        return;
    }

    // 모달 요소 가져오기
    const modal = document.getElementById('edit-review-modal');
    const reviewIdInput = document.getElementById('edit-review-id');
    const titleInput = document.getElementById('edit-review-title');
    const contentInput = document.getElementById('edit-review-content');
    const charCount = document.getElementById('edit-review-char-count');

    if (!modal || !reviewIdInput || !titleInput || !contentInput) {
        console.error('리뷰 수정 모달 요소를 찾을 수 없습니다.');
        return;
    }

    // 폼에 기존 데이터 채우기
    reviewIdInput.value = reviewId;
    titleInput.value = review.title || '';
    contentInput.value = review.content || '';

    // 글자 수 업데이트
    if (charCount) {
        charCount.textContent = (review.content || '').length;
    }

    // 별점 설정
    editSelectedRating = review.rating || 0;
    updateEditStarDisplay(editSelectedRating);

    // 기존 이미지 로드
    editExistingImages = review.images || [];
    editDeletedImageIds = [];
    editNewImages = [];
    displayEditExistingImages();
    updateEditNewImagesPreview();

    // 모달 표시
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // 이벤트 리스너 초기화
    initEditReviewModal();
}

/**
 * 리뷰 수정 모달 닫기
 */
function closeEditReviewModal() {
    const modal = document.getElementById('edit-review-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // 폼 초기화
    resetEditReviewForm();
}

/**
 * 수정 모달 폼 초기화
 */
function resetEditReviewForm() {
    const reviewIdInput = document.getElementById('edit-review-id');
    const titleInput = document.getElementById('edit-review-title');
    const contentInput = document.getElementById('edit-review-content');
    const charCount = document.getElementById('edit-review-char-count');
    const imageInput = document.getElementById('edit-review-image-input');

    if (reviewIdInput) reviewIdInput.value = '';
    if (titleInput) titleInput.value = '';
    if (contentInput) contentInput.value = '';
    if (charCount) charCount.textContent = '0';
    if (imageInput) imageInput.value = '';

    editSelectedRating = 0;
    updateEditStarDisplay(0);

    // 이미지 상태 초기화
    editExistingImages = [];
    editDeletedImageIds = [];
    editNewImages = [];
    displayEditExistingImages();
    updateEditNewImagesPreview();
}

/**
 * 수정 모달 별점 표시 업데이트
 * @param {number} rating - 별점 (1-5)
 */
function updateEditStarDisplay(rating) {
    const stars = document.querySelectorAll('.edit-star');
    const ratingText = document.querySelector('.edit-rating-text');

    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('selected');
            star.style.color = '#fbbf24';
        } else {
            star.classList.remove('selected');
            star.style.color = '#d1d5db';
        }
    });

    if (ratingText) {
        if (rating > 0) {
            const ratingLabels = ['', '별로예요', '그저 그래요', '괜찮아요', '좋아요', '최고예요!'];
            ratingText.textContent = ratingLabels[rating] || `${rating}점`;
        } else {
            ratingText.textContent = '별점을 선택해주세요';
        }
    }
}

/**
 * 리뷰 수정 모달 이벤트 초기화
 */
function initEditReviewModal() {
    // 닫기 버튼
    const closeBtn = document.getElementById('close-edit-review-modal');
    if (closeBtn) {
        closeBtn.onclick = closeEditReviewModal;
    }

    // 취소 버튼
    const cancelBtn = document.getElementById('cancel-edit-review-btn');
    if (cancelBtn) {
        cancelBtn.onclick = closeEditReviewModal;
    }

    // 모달 외부 클릭 시 닫기
    const modal = document.getElementById('edit-review-modal');
    if (modal) {
        modal.onclick = function (e) {
            if (e.target === modal) {
                closeEditReviewModal();
            }
        };
    }

    // 별점 선택
    const stars = document.querySelectorAll('.edit-star');
    stars.forEach((star) => {
        star.onclick = function (e) {
            e.preventDefault();
            const rating = parseInt(this.getAttribute('data-rating'));
            editSelectedRating = rating;
            updateEditStarDisplay(rating);
        };
    });

    // 글자 수 카운트
    const contentInput = document.getElementById('edit-review-content');
    const charCount = document.getElementById('edit-review-char-count');
    if (contentInput && charCount) {
        contentInput.oninput = function () {
            charCount.textContent = this.value.length;
        };
    }

    // 이미지 추가 버튼
    const addImageBtn = document.getElementById('edit-add-image-btn');
    const imageInput = document.getElementById('edit-review-image-input');
    if (addImageBtn && imageInput) {
        addImageBtn.onclick = function (e) {
            e.preventDefault();
            imageInput.click();
        };

        imageInput.onchange = function () {
            handleEditImageSelect(this.files);
            this.value = ''; // 같은 파일 재선택 허용
        };
    }

    // 새 이미지 전체 삭제 버튼
    const removeAllNewBtn = document.getElementById('remove-all-new-images');
    if (removeAllNewBtn) {
        removeAllNewBtn.onclick = function (e) {
            e.preventDefault();
            editNewImages = [];
            updateEditNewImagesPreview();
        };
    }

    // 폼 제출
    const form = document.getElementById('edit-review-form');
    if (form) {
        form.onsubmit = function (e) {
            e.preventDefault();
            submitEditReview();
        };
    }
}

/**
 * 기존 이미지 표시
 */
function displayEditExistingImages() {
    const container = document.getElementById('edit-existing-images');
    if (!container) return;

    // 삭제되지 않은 기존 이미지만 필터링
    const activeImages = editExistingImages.filter((img) => {
        const imgId = img.id || img.imageId;
        return !editDeletedImageIds.includes(imgId);
    });

    if (activeImages.length === 0) {
        container.innerHTML = '<p class="no-images-text">등록된 사진이 없습니다.</p>';
        return;
    }

    container.innerHTML = `
        <div class="edit-existing-images-header">
            <span>기존 사진 (${activeImages.length}장)</span>
        </div>
        <div class="edit-existing-images-list">
            ${activeImages
                .map((img) => {
                    const imgId = img.id || img.imageId;
                    const imgUrl = img.imageUrl || img.image_url || '';
                    return `
                    <div class="edit-image-item" data-image-id="${imgId}">
                        <img src="${imgUrl}" alt="리뷰 이미지" onerror="this.src='/images/logo.png'" />
                        <button type="button" class="remove-existing-image-btn" onclick="removeEditExistingImage(${imgId})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                `;
                })
                .join('')}
        </div>
    `;
}

/**
 * 기존 이미지 삭제 (표시에서만 제거, 실제 삭제는 제출 시)
 */
function removeEditExistingImage(imageId) {
    if (!editDeletedImageIds.includes(imageId)) {
        editDeletedImageIds.push(imageId);
    }
    displayEditExistingImages();
}

/**
 * 새 이미지 선택 처리
 */
function handleEditImageSelect(files) {
    if (!files || files.length === 0) return;

    // 현재 유효한 기존 이미지 수 계산
    const activeExistingCount = editExistingImages.filter((img) => {
        const imgId = img.id || img.imageId;
        return !editDeletedImageIds.includes(imgId);
    }).length;

    // 최대 5장 제한 체크
    const totalAfterAdd = activeExistingCount + editNewImages.length + files.length;
    if (totalAfterAdd > 5) {
        alert(
            `최대 5장까지만 업로드할 수 있습니다.\n현재: ${
                activeExistingCount + editNewImages.length
            }장, 추가 가능: ${5 - activeExistingCount - editNewImages.length}장`,
        );
        return;
    }

    // 파일 처리
    Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드할 수 있습니다.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('파일 크기는 10MB 이하여야 합니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            editNewImages.push({
                id: Date.now() + Math.random(),
                file: file,
                preview: e.target.result,
            });
            updateEditNewImagesPreview();
        };
        reader.readAsDataURL(file);
    });
}

/**
 * 새 이미지 미리보기 업데이트
 */
function updateEditNewImagesPreview() {
    const container = document.getElementById('edit-new-images-preview');
    const imagesContainer = document.getElementById('edit-new-images-container');

    if (!container || !imagesContainer) return;

    if (editNewImages.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    imagesContainer.innerHTML = editNewImages
        .map(
            (img, index) => `
        <div class="edit-image-item" data-new-image-id="${img.id}">
            <img src="${img.preview}" alt="새 이미지 ${index + 1}" />
            <button type="button" class="remove-new-image-btn" onclick="removeEditNewImage('${
                img.id
            }')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `,
        )
        .join('');
}

/**
 * 새 이미지 삭제
 */
function removeEditNewImage(imageId) {
    editNewImages = editNewImages.filter((img) => img.id.toString() !== imageId.toString());
    updateEditNewImagesPreview();
}

/**
 * 리뷰 수정 제출
 */
async function submitEditReview() {
    const user = getCurrentUser();
    if (!user || !user.id) {
        alert('로그인이 필요합니다.');
        return;
    }

    const reviewIdInput = document.getElementById('edit-review-id');
    const titleInput = document.getElementById('edit-review-title');
    const contentInput = document.getElementById('edit-review-content');
    const submitBtn = document.querySelector('#edit-review-form .submit-btn');

    const reviewId = reviewIdInput?.value;
    const title = titleInput?.value?.trim();
    const content = contentInput?.value?.trim();

    // 유효성 검사
    if (!reviewId) {
        alert('리뷰 정보가 올바르지 않습니다.');
        return;
    }

    if (!title) {
        alert('리뷰 제목을 입력해주세요.');
        titleInput?.focus();
        return;
    }

    if (!content) {
        alert('리뷰 내용을 입력해주세요.');
        contentInput?.focus();
        return;
    }

    if (editSelectedRating === 0) {
        alert('별점을 선택해주세요.');
        return;
    }

    // 제출 버튼 비활성화
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '수정 중...';
    }

    try {
        // FormData 생성 (이미지 포함)
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('rating', editSelectedRating);

        // 삭제할 이미지 ID 목록 추가
        if (editDeletedImageIds.length > 0) {
            formData.append('deleteImageIds', JSON.stringify(editDeletedImageIds));
        }

        // 새 이미지 파일 추가
        editNewImages.forEach((img) => {
            if (img.file) {
                formData.append('images', img.file);
            }
        });

        const response = await fetch(`/api/reviews/${reviewId}`, {
            method: 'PUT',
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            alert('리뷰가 수정되었습니다.');
            closeEditReviewModal();

            // 포토리뷰 모달이 열려있으면 함께 닫기
            const photoReviewModal = document.getElementById('photo-review-modal');
            if (
                photoReviewModal &&
                photoReviewModal.style.display !== 'none' &&
                photoReviewModal.style.display !== ''
            ) {
                photoReviewModal.style.display = 'none';
                document.body.style.overflow = '';
            }

            // 리뷰 목록 새로고침
            await loadReviews();
        } else {
            alert('리뷰 수정에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('리뷰 수정 중 오류:', error);
        alert('리뷰 수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
        // 제출 버튼 다시 활성화
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '수정 완료';
        }
    }
}

/**
 * 리뷰 삭제
 * @param {number} reviewId - 삭제할 리뷰 ID
 */
async function deleteReview(reviewId) {
    // 현재 로그인한 사용자 확인
    const user = getCurrentUser();
    if (!user || !user.id) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
        return;
    }

    // 리뷰 데이터 가져오기
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) {
        alert('리뷰를 찾을 수 없습니다.');
        return;
    }

    // 리뷰 작성자 확인
    const reviewUserId = review.userId || review.user_id;
    if (user.id != reviewUserId) {
        alert('본인이 작성한 리뷰만 삭제할 수 있습니다.');
        return;
    }

    // 삭제 확인
    if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?\n삭제된 리뷰는 복구할 수 없습니다.')) {
        return;
    }

    try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (data.success) {
            alert('리뷰가 삭제되었습니다.');

            // 포토리뷰 모달이 열려있으면 닫기
            const photoReviewModal = document.getElementById('photo-review-modal');
            if (photoReviewModal && photoReviewModal.style.display !== 'none') {
                photoReviewModal.style.display = 'none';
                document.body.style.overflow = '';
            }

            // 리뷰 목록 새로고침
            await loadReviews();
        } else {
            alert('리뷰 삭제에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('리뷰 삭제 중 오류:', error);
        alert('리뷰 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
}

// 유저 프로필 페이지로 이동
function goToUserProfile(userId) {
    const targetUserId = Number(userId);
    if (!Number.isFinite(targetUserId) || targetUserId <= 0) return;
    
    // 현재 로그인한 사용자인지 확인
    const currentUser = getCurrentUser();
    const currentUserId = currentUser ? Number(currentUser.id) : null;
    if (currentUserId && currentUserId === targetUserId) {
        // 본인이면 마이페이지로 이동
        window.location.href = '/pages/mypage/mypage';
    } else {
        // 다른 유저면 프로필 페이지로 이동
        window.location.href = `/pages/profile/${targetUserId}`;
    }
}

// 전역 스코프에 goToUserProfile 함수 등록
window.goToUserProfile = goToUserProfile;
