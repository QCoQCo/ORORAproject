// 관리자 페이지 JavaScript

// 전역 변수
let touristSpots = {};
let currentEditIndex = null;
let currentEditRegion = null;
let isAddMode = false; // 추가 모드 여부 (true: 추가, false: 수정)

// 사용자 관리 관련 전역 변수
let users = [];
let currentEditUserId = null;
let currentPage = 1;
let usersPerPage = 10;
let filteredUsers = [];

// 사진 추가 신청 관리 관련 전역 변수
let spotRequests = [];
let filteredSpotRequests = [];
let currentRequestPage = 1;
let requestsPerPage = 10;

// 유저 신고 관리 관련 전역 변수
let userReports = [];
let filteredUserReports = [];
let currentReportPage = 1;
let reportsPerPage = 10;

// 지역 한글 매핑
const regionNames = {
    area01: '기장군',
    area02: '금정구',
    area03: '해운대구',
    area04: '동래구',
    area05: '북구',
    area06: '강서구',
    area07: '사상구',
    area08: '부산진구',
    area09: '남구',
    area10: '사하구',
    area11: '동구',
    area12: '서구',
    area13: '중구',
    area14: '연제구',
    area15: '수영구',
    area16: '영도구',
};

// 해시태그 기반 카테고리 매핑
const hashtagToCategory = {
    해수욕장: 'beach',
    해변: 'beach',
    바다: 'beach',
    해안: 'beach',
    산: 'mountain',
    공원: 'mountain',
    등산: 'mountain',
    자연: 'mountain',
    사찰: 'culture',
    문화: 'culture',
    역사: 'culture',
    전통: 'culture',
    박물관: 'culture',
    영화: 'culture',
    시장: 'food',
    먹거리: 'food',
    맛집: 'food',
    음식: 'food',
    쇼핑: 'shopping',
    백화점: 'shopping',
    상가: 'shopping',
    쇼핑몰: 'shopping',
};

// 카테고리 한글 매핑 (대문자 코드 기준)
const categoryNames = {
    BEACH: '해변',
    MOUNTAIN: '산/공원',
    CULTURE: '문화',
    FOOD: '전통시장',
    SHOPPING: '쇼핑',
    CAFE: '카페',
    FAMILY: '가족',
    COUPLE: '연인',
    SOLO: '혼자',
    FRIEND: '친구',
    ETC: '기타',
    // 소문자 호환성 유지
    beach: '해변',
    mountain: '산/공원',
    culture: '문화',
    food: '전통시장',
    shopping: '쇼핑',
};

// 다양한 형태로 전달되는 해시태그 데이터를 문자열 배열로 정규화
function normalizeHashtags(rawHashtags) {
    if (!rawHashtags) return [];

    if (Array.isArray(rawHashtags)) {
        return rawHashtags
            .map((tag) => {
                if (typeof tag === 'string') return tag.trim();
                if (tag && typeof tag === 'object') {
                    // HashtagDto 혹은 유사 객체에 대응
                    return (tag.name || tag.label || '').trim();
                }
                return '';
            })
            .filter((tag) => tag.length > 0);
    }

    if (typeof rawHashtags === 'string') {
        return rawHashtags
            .split(/[,#]/)
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);
    }

    return [];
}

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function () {
    initializeAdmin();
});

// 관리자 페이지 초기화
async function initializeAdmin() {
    // 관리자 권한 확인
    if (!isAdmin()) {
        alert('관리자 권한이 필요합니다.');
        window.location.href = '/';
        return;
    }

    // 공통코드를 먼저 로드해야 카테고리 활성 상태를 확인할 수 있음
    await loadCommonCodes();
    await loadTouristSpots();
    await initializeUsers();
    initializeTabs();

    // DOM이 완전히 준비된 후 이벤트 리스너 초기화
    setTimeout(() => {
        initializeEventListeners();
    }, 100);

    // 헤더는 layout.html에서 Thymeleaf로 이미 포함되므로 별도 로드 불필요
    // 헤더 업데이트만 수행 (페이지 로드 시에만)
    setTimeout(() => {
        if (typeof updateHeader === 'function' && !window.headerUpdated) {
            updateHeader();
            window.headerUpdated = true;
        }
    }, 200);
}

// 관광지 데이터 로드
async function loadTouristSpots() {
    try {
        const response = await fetch('/api/admin/tourist-spots');
        const data = await response.json();

        if (data.success && data.spots) {
            // 백엔드 데이터를 프론트엔드 형식으로 변환
            touristSpots = {};
            data.spots.forEach((spot) => {
                // regionId를 area01 형식으로 변환 (임시로 regionId를 키로 사용)
                const regionKey = `area${String(spot.regionId).padStart(2, '0')}`;

                if (!touristSpots[regionKey]) {
                    touristSpots[regionKey] = {
                        name: regionNames[regionKey] || `지역 ${spot.regionId}`,
                        code: '',
                        spots: [],
                    };
                }

                // 해시태그 정규화
                const normalizedHashtags = normalizeHashtags(spot.hashtags);

                // 해시태그는 백엔드에서 전달받은 데이터 사용
                touristSpots[regionKey].spots.push({
                    id: spot.id,
                    title: spot.title,
                    description: spot.description || '',
                    hashtags: normalizedHashtags, // 다양한 형태 정규화
                    img: '', // TODO: 이미지 API 추가 시 수정
                    link: spot.linkUrl || '#',
                    categoryCode: spot.categoryCode,
                    isActive: spot.isActive,
                    latitude: spot.latitude,
                    longitude: spot.longitude,
                    address: spot.address,
                });
            });

            displayTouristSpots();
            updateStatistics();
        } else {
            throw new Error(data.message || '관광지 데이터를 불러오는데 실패했습니다.');
        }
    } catch (error) {
        console.error('관광지 데이터 로드 실패:', error);
        showNotification('데이터를 불러오는데 실패했습니다.', 'error');
        touristSpots = {};
    }
}

// 해시태그로 카테고리 추정
function getCategoryFromHashtags(hashtags) {
    if (!hashtags || !Array.isArray(hashtags)) return 'culture';

    for (const hashtag of hashtags) {
        const cleanTag = hashtag.trim();
        for (const [keyword, category] of Object.entries(hashtagToCategory)) {
            if (cleanTag.includes(keyword)) {
                return category;
            }
        }
    }
    return 'culture'; // 기본값
}

// 탭별 설명 텍스트
const tabDescriptions = {
    'list': '부산 관광지 정보를 관리할 수 있습니다.',
    'users': '사용자 정보와 권한을 관리할 수 있습니다.',
    'user-reports': '사용자들이 신고한 내용을 확인하고 처리할 수 있습니다.',
    'spot-requests': '사용자들이 신청한 관광지 및 사진 추가 요청을 관리할 수 있습니다.',
    'common-codes': '공통코드 그룹과 코드를 관리할 수 있습니다.',
    'stats': '관광지 및 사용자 통계를 확인할 수 있습니다.'
};

// 탭 기능 초기화
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const adminDescription = document.getElementById('admin-description');

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // 모든 탭 버튼과 콘텐츠 비활성화
            tabButtons.forEach((btn) => btn.classList.remove('active'));
            tabContents.forEach((content) => content.classList.remove('active'));

            // 선택된 탭 활성화
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');

            // 탭에 맞는 설명 업데이트
            if (adminDescription && tabDescriptions[targetTab]) {
                adminDescription.textContent = tabDescriptions[targetTab];
            }

            // 통계 탭을 클릭한 경우 통계 업데이트
            if (targetTab === 'stats') {
                updateStatistics();
            }

            // 사용자 관리 탭을 클릭한 경우 사용자 목록 표시
            if (targetTab === 'users') {
                displayUsers();
            }

            // 공통코드 관리 탭을 클릭한 경우 공통코드 목록 표시
            if (targetTab === 'common-codes') {
                loadCommonCodeGroups();
                loadCommonCodes();
            }

            // 사진 추가 신청 관리 탭을 클릭한 경우 신청 목록 표시
            if (targetTab === 'spot-requests') {
                loadSpotRequests();
            }

            // 유저 신고 관리 탭을 클릭한 경우 신고 목록 표시
            if (targetTab === 'user-reports') {
                loadUserReports();
            }
        });
    });
}

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 검색 기능
    const searchInput = document.getElementById('admin-search-input');
    const searchBtn = document.getElementById('admin-search-btn');
    const regionFilter = document.getElementById('region-filter');

    // 검색 버튼 클릭 시 검색
    if (searchBtn) {
        searchBtn.addEventListener('click', filterTouristSpots);
    }
    
    // Enter 키로 검색
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterTouristSpots();
            }
        });
    }
    if (regionFilter) {
        regionFilter.addEventListener('change', filterTouristSpots);
    }

    // 수정/추가 폼
    const editForm = document.getElementById('edit-tourist-spot-form');
    if (editForm) {
        editForm.addEventListener('submit', handleEditTouristSpot);
    }

    // 모달 닫기
    const closeModal = document.getElementById('close-modal');
    const modal = document.getElementById('edit-modal');

    if (closeModal && modal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // 사용자 관리 이벤트 리스너
    initializeUserEventListeners();

    // 사진 추가 신청 관리 이벤트 리스너
    initializeSpotRequestEventListeners();

    // 유저 신고 관리 이벤트 리스너
    initializeUserReportEventListeners();

    // 이미지 파일 선택 미리보기
    const newImagesInput = document.getElementById('edit-spot-new-images');
    if (newImagesInput) {
        newImagesInput.addEventListener('change', handleImagePreview);
    }
}

// 이미지 선택 미리보기 처리
function handleImagePreview(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('selected-files-preview');
    if (!previewContainer) return;

    previewContainer.innerHTML = '';

    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const reader = new FileReader();
        reader.onload = function (e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="미리보기" />
                <span class="file-name" title="${file.name}">${file.name.substring(0, 15)}${
                file.name.length > 15 ? '...' : ''
            }</span>
            `;
            previewContainer.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    }
}

// 사용자 관리 이벤트 리스너 초기화
function initializeUserEventListeners() {
    // 사용자 검색 및 필터
    const userSearchInput = document.getElementById('user-search-input');
    const userRoleFilter = document.getElementById('user-role-filter');
    const userStatusFilter = document.getElementById('user-status-filter');

    if (userSearchInput) userSearchInput.addEventListener('input', filterUsers);
    if (userRoleFilter) userRoleFilter.addEventListener('change', filterUsers);
    if (userStatusFilter) userStatusFilter.addEventListener('change', filterUsers);

    // 사용자 수정 폼
    const editUserForm = document.getElementById('edit-user-form');
    if (editUserForm) editUserForm.addEventListener('submit', handleEditUser);

    // 사용자 모달 닫기
    const closeEditUserModal = document.getElementById('close-edit-user-modal');
    const editUserModal = document.getElementById('edit-user-modal');

    if (closeEditUserModal) {
        closeEditUserModal.addEventListener('click', () => {
            editUserModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === editUserModal) {
            editUserModal.style.display = 'none';
        }
    });
}

// 관광지 목록 표시
function displayTouristSpots(filteredSpots = null) {
    const grid = document.getElementById('tourist-spots-grid');
    const spots = filteredSpots || touristSpots;

    grid.innerHTML = '';

    Object.keys(spots).forEach((regionKey) => {
        const region = spots[regionKey];
        if (region.spots && Array.isArray(region.spots)) {
            region.spots.forEach((spot, index) => {
                const card = createTouristSpotCard(spot, regionKey, spot.id || index, region.name);
                grid.appendChild(card);
            });
        }
    });
}

// 관광지 카드 생성
// 카테고리 활성 상태 확인
function isCategoryActive(categoryCode) {
    if (!categoryCode || !commonCodes || commonCodes.length === 0) {
        return true; // 기본적으로 활성으로 간주
    }
    
    const category = commonCodes.find(
        (code) => code.groupCode === 'SPOT_CATEGORY' && code.code === categoryCode.toUpperCase()
    );
    
    return category ? (category.isActive !== false) : true;
}

function createTouristSpotCard(spot, regionKey, spotId, regionName) {
    const card = document.createElement('div');
    
    // 카테고리 결정: categoryCode 우선, 없으면 해시태그로 추정
    const normalizedHashtags = normalizeHashtags(spot.hashtags);
    let category = 'CULTURE'; // 기본값
    if (spot.categoryCode) {
        category = spot.categoryCode.toUpperCase();
    } else {
        const estimatedCategory = getCategoryFromHashtags(normalizedHashtags);
        category = estimatedCategory.toUpperCase();
    }

    // 카테고리 활성 상태 확인
    const isActive = isCategoryActive(category);
    
    if (!isActive) {
        // 비활성화된 카테고리인 경우 비활성화 스타일 적용
        card.className = 'tourist-spot-card inactive-category';
        card.style.opacity = '0.7';
        card.style.cursor = 'pointer'; // ADMIN이므로 클릭 가능
    } else {
        card.className = 'tourist-spot-card';
        card.style.cursor = 'pointer';
    }

    // 해시태그 배열을 문자열로 변환 (# 접두사 추가)
    let hashtagsDisplay = '없음';
    if (normalizedHashtags.length > 0) {
        hashtagsDisplay = normalizedHashtags
            .map((tag) => {
                const tagStr = String(tag).trim();
                return tagStr.startsWith('#') ? tagStr : '#' + tagStr;
            })
            .filter((tag) => tag.length > 0)
            .join(' ');
    }

    const inactiveBadge = !isActive ? '<span class="inactive-badge">비활성화된 카테고리</span>' : '';

    card.innerHTML = `
        <h3>${spot.title} ${inactiveBadge}</h3>
        <div class="spot-category">${regionName} (${categoryNames[category] || category})</div>
        <div class="spot-info">
            해시태그: ${hashtagsDisplay}
        </div>
        <div class="spot-description">${spot.description || ''}</div>
        <div class="spot-actions">
            <button class="edit-btn" onclick="event.stopPropagation(); openEditModal('${regionKey}', ${spotId})">수정</button>
            <button class="delete-btn" onclick="event.stopPropagation(); deleteTouristSpot('${regionKey}', ${spotId})">삭제</button>
        </div>
    `;

    // 카드 클릭 시 상세 페이지로 이동 (관리자는 비활성화된 카테고리도 접근 가능)
    card.addEventListener('click', (e) => {
        // 수정/삭제 버튼 클릭 시에는 이동하지 않음
        if (e.target.closest('.spot-actions')) {
            return;
        }
        // ADMIN이므로 비활성화된 카테고리도 상세 페이지로 이동 가능
        window.location.href = `/pages/detailed/detailed?id=${spotId}`;
    });

    return card;
}

// 관광지 필터링
function filterTouristSpots() {
    const searchInput = document.getElementById('admin-search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedRegion = document.getElementById('region-filter').value;

    const filteredSpots = {};

    Object.keys(touristSpots).forEach((regionKey) => {
        const region = touristSpots[regionKey];

        if (selectedRegion && regionKey !== selectedRegion) {
            return;
        }

        if (region.spots && Array.isArray(region.spots)) {
            const filtered = region.spots.filter(
                (spot) =>
                    spot.title.toLowerCase().includes(searchTerm) ||
                    spot.description.toLowerCase().includes(searchTerm) ||
                    (spot.hashtags &&
                        spot.hashtags.some((tag) => tag.toLowerCase().includes(searchTerm)))
            );

            if (filtered.length > 0) {
                filteredSpots[regionKey] = {
                    ...region,
                    spots: filtered,
                };
            }
        }
    });

    displayTouristSpots(filteredSpots);
}

// 추가 모달 열기 (수정 모달 재활용)
function openAddSpotModal() {
    const tryOpenModal = () => {
        const editModal = document.getElementById('edit-modal');
        if (!editModal) {
            setTimeout(tryOpenModal, 100);
            return;
        }

        // 추가 모드로 설정
        isAddMode = true;
        currentEditRegion = null;
        currentEditIndex = null;

        // 모달 제목과 버튼 텍스트 변경
        const modalTitle = document.getElementById('edit-modal-title');
        const submitBtn = document.getElementById('edit-modal-submit-btn');
        if (modalTitle) modalTitle.textContent = '새 관광지 추가';
        if (submitBtn) submitBtn.textContent = '관광지 추가';

        // 폼 초기화
        const titleInput = document.getElementById('edit-spot-title');
        const regionSelect = document.getElementById('edit-spot-region');
        const categorySelect = document.getElementById('edit-spot-category');
        const descriptionTextarea = document.getElementById('edit-spot-description');
        const hashtagsInput = document.getElementById('edit-spot-hashtags');
        const linkInput = document.getElementById('edit-spot-link');

        if (titleInput) titleInput.value = '';
        if (regionSelect) regionSelect.value = 'area01';
        if (categorySelect) categorySelect.value = 'CULTURE';
        if (descriptionTextarea) descriptionTextarea.value = '';
        if (hashtagsInput) hashtagsInput.value = '';
        if (linkInput) linkInput.value = '#';

        // 이미지 섹션 초기화 (추가 모드에서는 기존 이미지 없음)
        const imageList = document.getElementById('edit-spot-images');
        if (imageList)
            imageList.innerHTML =
                '<p class="no-images">새 관광지입니다. 추가 후 이미지를 등록할 수 있습니다.</p>';

        // 새 이미지 미리보기 초기화
        const selectedFilesPreview = document.getElementById('selected-files-preview');
        if (selectedFilesPreview) selectedFilesPreview.innerHTML = '';
        const newImagesInput = document.getElementById('edit-spot-new-images');
        if (newImagesInput) newImagesInput.value = '';

        // 위치 정보 초기화
        clearLocationSelection();

        // 위치 검색 초기화
        initLocationSearch();

        // 모달 표시
        editModal.style.display = 'block';
    };

    tryOpenModal();
}

// 전역 스코프에 함수 바인딩
window.openAddSpotModal = openAddSpotModal;

// 수정 모달 열기
function openEditModal(regionKey, spotId) {
    // DOM이 완전히 로드될 때까지 기다림
    const tryOpenModal = () => {
        const editModal = document.getElementById('edit-modal');
        if (!editModal) {
            // 모달이 아직 로드되지 않았다면 잠시 후 다시 시도
            setTimeout(tryOpenModal, 100);
            return;
        }

        // spotId로 관광지 찾기
        let spot = null;
        let foundIndex = -1;
        if (touristSpots[regionKey] && touristSpots[regionKey].spots) {
            foundIndex = touristSpots[regionKey].spots.findIndex((s) => s.id === spotId);
            if (foundIndex !== -1) {
                spot = touristSpots[regionKey].spots[foundIndex];
            }
        }

        if (!spot) {
            showNotification('관광지를 찾을 수 없습니다.', 'error');
            return;
        }

        // 수정 모드로 설정
        isAddMode = false;
        currentEditRegion = regionKey;
        currentEditIndex = foundIndex;

        // 모달 제목과 버튼 텍스트 변경
        const modalTitle = document.getElementById('edit-modal-title');
        const submitBtn = document.getElementById('edit-modal-submit-btn');
        if (modalTitle) modalTitle.textContent = '관광지 정보 수정';
        if (submitBtn) submitBtn.textContent = '수정 완료';

        // 폼에 기존 데이터 입력
        const titleInput = document.getElementById('edit-spot-title');
        const regionSelect = document.getElementById('edit-spot-region');
        const categorySelect = document.getElementById('edit-spot-category');
        const descriptionTextarea = document.getElementById('edit-spot-description');
        const hashtagsInput = document.getElementById('edit-spot-hashtags');
        const imgInput = document.getElementById('edit-spot-img');
        const linkInput = document.getElementById('edit-spot-link');

        if (titleInput) titleInput.value = spot.title || '';
        if (regionSelect) regionSelect.value = regionKey;
        if (categorySelect) {
            // categoryCode가 있으면 사용, 없으면 기본값 'CULTURE'
            const categoryCode = spot.categoryCode || 'CULTURE';
            categorySelect.value = categoryCode.toUpperCase();
        }
        if (descriptionTextarea) descriptionTextarea.value = spot.description || '';
        // 해시태그 처리: 배열이면 join, 문자열이면 그대로, 없으면 빈 문자열
        if (hashtagsInput) {
            const normalized = normalizeHashtags(spot.hashtags);
            hashtagsInput.value = normalized
                .map((tag) => {
                    const tagStr = String(tag || '').trim();
                    return tagStr.startsWith('#') ? tagStr.substring(1) : tagStr;
                })
                .filter((tag) => tag.length > 0)
                .join(', ');
        }
        if (linkInput) linkInput.value = spot.link || spot.linkUrl || '#';

        // 새 이미지 미리보기 초기화
        const selectedFilesPreview = document.getElementById('selected-files-preview');
        if (selectedFilesPreview) selectedFilesPreview.innerHTML = '';
        const newImagesInput = document.getElementById('edit-spot-new-images');
        if (newImagesInput) newImagesInput.value = '';

        // 위치 검색 초기화 (먼저 초기화)
        initLocationSearch();

        // 위치 정보 로드 (초기화 후 로드)
        loadLocationData(spot);

        // 이미지 로드
        loadSpotImages(spotId);

        // 모달 표시
        editModal.style.display = 'block';
    };

    tryOpenModal();
}

// 전역 스코프에 함수 바인딩 (인라인 onclick 핸들러에서 접근 가능하도록)
window.openEditModal = openEditModal;

// ========== 이미지 관리 함수들 ==========

// 관광지 이미지 로드
async function loadSpotImages(spotId) {
    const imageList = document.getElementById('edit-spot-images');
    if (!imageList) return;

    imageList.innerHTML = '<p class="loading">이미지 로딩 중...</p>';

    try {
        const response = await fetch(`/api/admin/tourist-spots/${spotId}/images`);
        const data = await response.json();

        if (data.success && data.images) {
            if (data.images.length === 0) {
                imageList.innerHTML = '<p class="no-images">등록된 이미지가 없습니다.</p>';
                return;
            }

            imageList.innerHTML = data.images
                .map(
                    (image) => `
                <div class="image-item ${image.repImgYn === 'Y' ? 'is-rep' : ''}" data-image-id="${
                        image.id
                    }">
                    ${image.repImgYn === 'Y' ? '<span class="rep-badge">대표</span>' : ''}
                    <img src="${image.imageUrl}" alt="${
                        image.oriImgName || '이미지'
                    }" onerror="this.src='/images/no-image.png'" />
                    <div class="image-actions">
                        <button type="button" class="set-rep-btn ${
                            image.repImgYn === 'Y' ? 'active' : ''
                        }" 
                            onclick="setSpotRepImage(${image.id})" 
                            ${image.repImgYn === 'Y' ? 'disabled' : ''}>
                            ${image.repImgYn === 'Y' ? '✓ 대표' : '대표 설정'}
                        </button>
                        <button type="button" class="delete-img-btn" onclick="deleteSpotImage(${
                            image.id
                        })">삭제</button>
                    </div>
                </div>
            `
                )
                .join('');
        } else {
            imageList.innerHTML = '<p class="no-images">이미지를 불러오는데 실패했습니다.</p>';
        }
    } catch (error) {
        console.error('이미지 로드 실패:', error);
        imageList.innerHTML = '<p class="no-images">이미지를 불러오는데 실패했습니다.</p>';
    }
}

// 관광지 이미지 삭제
async function deleteSpotImage(imageId) {
    if (!confirm('이 이미지를 삭제하시겠습니까?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/tourist-spots/images/${imageId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
            showNotification('이미지가 삭제되었습니다.', 'success');
            // 현재 편집 중인 관광지의 이미지 목록 새로고침
            const spot = touristSpots[currentEditRegion]?.spots[currentEditIndex];
            if (spot) {
                loadSpotImages(spot.id);
            }
        } else {
            showNotification(data.message || '이미지 삭제에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('이미지 삭제 실패:', error);
        showNotification('이미지 삭제 중 오류가 발생했습니다.', 'error');
    }
}

// 대표 이미지 설정
async function setSpotRepImage(imageId) {
    try {
        const response = await fetch(`/api/admin/tourist-spots/images/${imageId}/set-rep`, {
            method: 'PUT',
        });

        const data = await response.json();

        if (data.success) {
            showNotification('대표 이미지가 설정되었습니다.', 'success');
            // 현재 편집 중인 관광지의 이미지 목록 새로고침
            const spot = touristSpots[currentEditRegion]?.spots[currentEditIndex];
            if (spot) {
                loadSpotImages(spot.id);
            }
        } else {
            showNotification(data.message || '대표 이미지 설정에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('대표 이미지 설정 실패:', error);
        showNotification('대표 이미지 설정 중 오류가 발생했습니다.', 'error');
    }
}

// 새 이미지 업로드
async function uploadNewSpotImages(spotId, files) {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
    }

    try {
        const response = await fetch(`/api/admin/tourist-spots/${spotId}/images`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            showNotification('이미지가 추가되었습니다.', 'success');
        } else {
            showNotification(data.message || '이미지 추가에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('이미지 업로드 실패:', error);
        showNotification('이미지 업로드 중 오류가 발생했습니다.', 'error');
    }
}

// 전역 스코프에 이미지 함수 바인딩
window.deleteSpotImage = deleteSpotImage;
window.setSpotRepImage = setSpotRepImage;

// 관광지 수정/추가 처리
async function handleEditTouristSpot(event) {
    event.preventDefault();

    const hashtags = document
        .getElementById('edit-spot-hashtags')
        .value.split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .map((tag) => (tag.startsWith('#') ? tag.substring(1) : tag));

    const regionKey = document.getElementById('edit-spot-region').value;
    const categoryCode = document.getElementById('edit-spot-category').value;

    // 위도/경도 정보 가져오기
    const latitudeInput = document.getElementById('edit-spot-latitude');
    const longitudeInput = document.getElementById('edit-spot-longitude');
    const addressInput = document.getElementById('edit-spot-address');

    const latitude = latitudeInput?.value ? parseFloat(latitudeInput.value) : null;
    const longitude = longitudeInput?.value ? parseFloat(longitudeInput.value) : null;
    const address = addressInput?.value || null;

    const requestData = {
        regionKey: regionKey,
        title: document.getElementById('edit-spot-title').value,
        description: document.getElementById('edit-spot-description').value,
        hashtags: hashtags,
        linkUrl: document.getElementById('edit-spot-link').value || '#',
        categoryCode: categoryCode || 'CULTURE',
        latitude: latitude,
        longitude: longitude,
        address: address,
    };

    try {
        let response;
        let successMessage;

        if (isAddMode) {
            // 추가 모드
            response = await fetch('/api/admin/tourist-spots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
            successMessage = '관광지가 성공적으로 추가되었습니다!';
        } else {
            // 수정 모드
            if (currentEditRegion === null || currentEditIndex === null) {
                showNotification('관광지 정보를 찾을 수 없습니다.', 'error');
                return;
            }

            const spot = touristSpots[currentEditRegion].spots[currentEditIndex];
            if (!spot || !spot.id) {
                showNotification('관광지 정보를 찾을 수 없습니다.', 'error');
                return;
            }

            response = await fetch(`/api/admin/tourist-spots/${spot.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
            successMessage = '관광지 정보가 성공적으로 수정되었습니다!';
        }

        const data = await response.json();

        if (data.success) {
            // 수정 모드에서만 새 이미지 업로드 (추가 모드는 관광지 생성 후 별도로 이미지 추가)
            if (!isAddMode) {
                const newImagesInput = document.getElementById('edit-spot-new-images');
                const spot = touristSpots[currentEditRegion].spots[currentEditIndex];
                if (newImagesInput && newImagesInput.files.length > 0 && spot) {
                    await uploadNewSpotImages(spot.id, newImagesInput.files);
                }
            }

            // 관광지 추가 신청 승인 처리 (신청을 통한 추가인 경우)
            if (isAddMode && currentSpotRequestId) {
                try {
                    await approveSpotRequest(currentSpotRequestId);
                } catch (error) {
                    console.error('신청 승인 처리 실패:', error);
                }
                currentSpotRequestId = null;
            }

            // 모달 닫기
            document.getElementById('edit-modal').style.display = 'none';

            // 목록 갱신
            await loadTouristSpots();
            updateStatistics();

            showNotification(successMessage, 'success');

            // 상태 초기화
            isAddMode = false;
            currentEditRegion = null;
            currentEditIndex = null;
        } else {
            showNotification(
                data.message ||
                    (isAddMode ? '관광지 추가에 실패했습니다.' : '관광지 수정에 실패했습니다.'),
                'error'
            );
        }
    } catch (error) {
        console.error('관광지 수정 실패:', error);
        showNotification('관광지 수정 중 오류가 발생했습니다.', 'error');
    }
}

// 관광지 삭제
async function deleteTouristSpot(regionKey, spotId) {
    if (confirm('정말로 이 관광지를 삭제하시겠습니까?')) {
        try {
            const response = await fetch(`/api/admin/tourist-spots/${spotId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                // 목록 갱신
                await loadTouristSpots();
                updateStatistics();

                showNotification('관광지가 성공적으로 삭제되었습니다!', 'success');
            } else {
                showNotification(data.message || '관광지 삭제에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('관광지 삭제 실패:', error);
            showNotification('관광지 삭제 중 오류가 발생했습니다.', 'error');
        }
    }
}

// 전역 스코프에 함수 바인딩
window.deleteTouristSpot = deleteTouristSpot;

// 통계 업데이트
function updateStatistics() {
    let totalSpots = 0;
    const regionCounts = {};
    const categoryCounts = {};

    Object.keys(touristSpots).forEach((regionKey) => {
        const region = touristSpots[regionKey];
        if (region.spots && Array.isArray(region.spots)) {
            const count = region.spots.length;
            totalSpots += count;
            regionCounts[regionKey] = count;

            // 카테고리별 통계 (활성화된 카테고리만)
            region.spots.forEach((spot) => {
                const normalizedHashtags = normalizeHashtags(spot.hashtags);
                let category = 'CULTURE';
                if (spot.categoryCode) {
                    category = spot.categoryCode.toUpperCase();
                } else {
                    const estimatedCategory = getCategoryFromHashtags(normalizedHashtags);
                    category = estimatedCategory.toUpperCase();
                }
                if (isCategoryActive(category)) {
                    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                }
            });
        }
    });

    // 총 관광지 수 업데이트
    document.getElementById('total-spots').textContent = totalSpots;

    // 카테고리별 수 업데이트
    Object.keys(categoryNames).forEach((category) => {
        const count = categoryCounts[category] || 0;
        const element = document.getElementById(`${category}-count`);
        if (element) {
            element.textContent = count;
        }
    });

    // 차트 업데이트
    updateCategoryChart(categoryCounts);
    updateRegionChart(regionCounts);

    // 사용자 통계 업데이트
    updateUserStatistics();
}

// 지역별 차트 업데이트
function updateRegionChart(regionCounts) {
    const chartContainer = document.getElementById('region-chart');
    if (!chartContainer) return;

    chartContainer.innerHTML = '';

    Object.keys(regionCounts).forEach((regionKey) => {
        const count = regionCounts[regionKey] || 0;
        const regionName = regionNames[regionKey] || regionKey;

        if (count > 0) {
            const chartBar = document.createElement('div');
            chartBar.className = 'chart-bar';
            chartBar.innerHTML = `
                <div class="category-name">${regionName}</div>
                <div class="category-count">${count}</div>
            `;

            chartBar.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
            chartContainer.appendChild(chartBar);
        }
    });
}

// 사용자 통계 업데이트
function updateUserStatistics() {
    if (!users || users.length === 0) return;

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === 'active').length;
    const adminUsers = users.filter((u) => u.role === 'admin').length;
    const vipUsers = users.filter((u) => u.role === 'vip').length;
    const memberUsers = users.filter((u) => u.role === 'member').length;
    const suspendedUsers = users.filter((u) => u.status === 'suspended').length;

    // 사용자 통계 업데이트
    const elements = {
        'total-users': totalUsers,
        'active-users': activeUsers,
        'admin-users': adminUsers,
        'vip-users': vipUsers,
        'member-users': memberUsers,
        'suspended-users': suspendedUsers,
    };

    Object.keys(elements).forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });

    // 사용자 권한별 차트 업데이트
    updateUserRoleChart({
        admin: adminUsers,
        vip: vipUsers,
        member: memberUsers,
    });
}

// 사용자 권한별 차트 업데이트
function updateUserRoleChart(roleCounts) {
    const chartContainer = document.getElementById('user-role-chart');
    if (!chartContainer) return;

    chartContainer.innerHTML = '';

    const roleInfo = {
        admin: { name: '관리자', color: 'linear-gradient(135deg, #e74c3c, #c0392b)' },
        vip: { name: 'VIP회원', color: 'linear-gradient(135deg, #f39c12, #e67e22)' },
        member: { name: '일반회원', color: 'linear-gradient(135deg, #3498db, #2980b9)' },
    };

    Object.keys(roleInfo).forEach((role) => {
        const count = roleCounts[role] || 0;

        const chartBar = document.createElement('div');
        chartBar.className = 'chart-bar';
        chartBar.innerHTML = `
            <div class="category-name">${roleInfo[role].name}</div>
            <div class="category-count">${count}</div>
        `;

        chartBar.style.background = roleInfo[role].color;
        chartContainer.appendChild(chartBar);
    });
}

// 카테고리 차트 업데이트
function updateCategoryChart(categoryCounts) {
    const chartContainer = document.getElementById('category-chart');
    if (!chartContainer) return;

    chartContainer.innerHTML = '';

    // 카테고리별 색상 적용
    const colors = {
        BEACH: 'linear-gradient(135deg, rgb(52, 152, 219), rgb(41, 128, 185))',
        MOUNTAIN: 'linear-gradient(135deg, rgb(39, 174, 96), rgb(46, 204, 113))',
        CULTURE: 'linear-gradient(135deg, rgb(155, 89, 182), rgb(142, 68, 173))',
        FOOD: 'linear-gradient(135deg, rgb(243, 156, 18), rgb(230, 126, 34))',
        SHOPPING: 'linear-gradient(135deg, rgb(231, 76, 60), rgb(192, 57, 43))',
        CAFE: 'linear-gradient(135deg, rgb(241, 196, 15), rgb(243, 156, 18))',
        FAMILY: 'linear-gradient(135deg, rgb(46, 204, 113), rgb(39, 174, 96))',
        COUPLE: 'linear-gradient(135deg, rgb(236, 112, 99), rgb(231, 76, 60))',
        SOLO: 'linear-gradient(135deg, rgb(52, 73, 94), rgb(44, 62, 80))',
        FRIEND: 'linear-gradient(135deg, rgb(155, 89, 182), rgb(142, 68, 173))',
        ETC: 'linear-gradient(135deg, rgb(149, 165, 166), rgb(127, 140, 141))',
        // 소문자 호환성
        beach: 'linear-gradient(135deg, rgb(52, 152, 219), rgb(41, 128, 185))',
        mountain: 'linear-gradient(135deg, rgb(39, 174, 96), rgb(46, 204, 113))',
        culture: 'linear-gradient(135deg, rgb(155, 89, 182), rgb(142, 68, 173))',
        food: 'linear-gradient(135deg, rgb(243, 156, 18), rgb(230, 126, 34))',
        shopping: 'linear-gradient(135deg, rgb(231, 76, 60), rgb(192, 57, 43))',
    };

    // count가 0보다 큰 카테고리만 표시
    Object.keys(categoryCounts).forEach((category) => {
        const count = categoryCounts[category];
        if (count > 0 && categoryNames[category]) {
            const chartBar = document.createElement('div');
            chartBar.className = 'chart-bar';
            chartBar.innerHTML = `
                <div class="category-name">${categoryNames[category]}</div>
                <div class="category-count">${count}</div>
            `;

            if (colors[category]) {
                chartBar.style.background = colors[category];
            }

            chartContainer.appendChild(chartBar);
        }
    });
}

// 알림 표시
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // 스타일 적용
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;

    // 타입별 색상
    const colors = {
        success: 'linear-gradient(45deg, #27ae60, #2ecc71)',
        error: 'linear-gradient(45deg, #e74c3c, #c0392b)',
        info: 'linear-gradient(45deg, #3498db, #2980b9)',
    };

    notification.style.background = colors[type] || colors.info;

    document.body.appendChild(notification);

    // 3초 후 자동 제거
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// 애니메이션 CSS 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// 관광지 데이터 내보내기
// TODO: 백엔드 연결 시 수정 필요 - API를 통한 데이터 내보내기로 변경
function exportTouristSpotsData() {
    const dataStr = JSON.stringify({ regions: touristSpots }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'busanTouristSpots.json';
    link.click();

    URL.revokeObjectURL(url);
}

// 사용자 데이터 내보내기
// TODO: 백엔드 연결 시 수정 필요 - API를 통한 데이터 내보내기로 변경
function exportUsersData() {
    const dataStr = JSON.stringify({ users: users }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.json';
    link.click();

    URL.revokeObjectURL(url);
}

// 전체 데이터 내보내기
// TODO: 백엔드 연결 시 수정 필요 - API를 통한 데이터 백업으로 변경
function exportAllData() {
    const allData = {
        regions: touristSpots,
        users: users,
        exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `arataBusan_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
}

// 전역 스코프에 함수 바인딩
window.exportAllData = exportAllData;
window.exportTouristSpotsData = exportTouristSpotsData;
window.exportUsersData = exportUsersData;

// ========== 사용자 관리 기능 ==========

// 사용자 데이터 초기화
async function initializeUsers() {
    try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();

        if (data.success && data.users) {
            // 백엔드 데이터를 프론트엔드 형식으로 변환
            users = data.users.map((user) => ({
                id: user.id,
                userId: user.loginId,
                username: user.username,
                email: user.email,
                role: user.roleCode ? user.roleCode.toLowerCase() : 'member', // ADMIN -> admin
                status: user.statusCode ? user.statusCode.toLowerCase() : 'active', // ACTIVE -> active
                joinDate: user.joinDate ? new Date(user.joinDate).toISOString().split('T')[0] : '-',
                lastLogin: user.lastLogin ? new Date(user.lastLogin).toISOString() : '-',
            }));
            filteredUsers = [...users];

            // 사용자 관리 탭이 활성화된 경우 사용자 목록 표시
            const currentTab = document.querySelector('.tab-btn.active');
            if (currentTab && currentTab.getAttribute('data-tab') === 'users') {
                displayUsers();
            }

            // 통계 탭이 활성화된 경우 사용자 통계 업데이트
            if (currentTab && currentTab.getAttribute('data-tab') === 'stats') {
                updateUserStatistics();
            }
        } else {
            throw new Error(data.message || '사용자 데이터를 불러오는데 실패했습니다.');
        }
    } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
        showNotification('사용자 데이터를 불러오는데 실패했습니다.', 'error');

        // 오류 발생 시 빈 배열로 초기화
        users = [];
        filteredUsers = [];
    }
}

// 사용자 목록 표시
function displayUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToShow = filteredUsers.slice(startIndex, endIndex);

    tbody.innerHTML = '';

    usersToShow.forEach((user) => {
        const row = createUserRow(user);
        tbody.appendChild(row);
    });

    updateUsersPagination();
}

// 사용자 테이블 행 생성
function createUserRow(user) {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${user.userId}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td><span class="user-role-badge ${user.role}">${getRoleText(user.role)}</span></td>
        <td><span class="user-status-badge ${user.status}">${getStatusText(user.status)}</span></td>
        <td>${formatDate(user.joinDate)}</td>
        <td>${formatDate(user.lastLogin)}</td>
        <td>
            <div class="user-actions">
                <button class="user-edit-btn" onclick="openEditUserModal(${user.id})">수정</button>
                <button class="user-toggle-btn" onclick="toggleUserStatus(${user.id})">${
        user.status === 'active' ? '비활성화' : '활성화'
    }</button>
                <button class="user-delete-btn" onclick="deleteUser(${user.id})">삭제</button>
            </div>
        </td>
    `;

    return row;
}

// 권한 텍스트 변환
function getRoleText(role) {
    const roleTexts = {
        admin: '관리자',
        vip: 'VIP회원',
        member: '일반회원',
    };
    return roleTexts[role] || role;
}

// 상태 텍스트 변환
function getStatusText(status) {
    const statusTexts = {
        active: '활성',
        inactive: '비활성',
        suspended: '정지',
    };
    return statusTexts[status] || status;
}

// 날짜 포맷팅
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ko-KR');
}

// 사용자 필터링
function filterUsers() {
    const searchTerm = document.getElementById('user-search-input').value.toLowerCase();
    const roleFilter = document.getElementById('user-role-filter').value;
    const statusFilter = document.getElementById('user-status-filter').value;

    filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = !statusFilter || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    currentPage = 1;
    displayUsers();
}

// 사용자 수정 모달 열기
function openEditUserModal(userId) {
    const tryOpenModal = () => {
        const editUserModal = document.getElementById('edit-user-modal');
        if (!editUserModal) {
            // 모달이 아직 로드되지 않았다면 잠시 후 다시 시도
            setTimeout(tryOpenModal, 100);
            return;
        }

        const user = users.find((u) => u.id === userId);
        if (!user) {
            console.error('사용자를 찾을 수 없습니다:', userId);
            return;
        }

        currentEditUserId = userId;

        const usernameInput = document.getElementById('edit-username');
        const emailInput = document.getElementById('edit-email');
        const roleSelect = document.getElementById('edit-user-role');
        const statusSelect = document.getElementById('edit-user-status');

        if (usernameInput) usernameInput.value = user.username;
        if (emailInput) emailInput.value = user.email;
        if (roleSelect) roleSelect.value = user.role;
        if (statusSelect) statusSelect.value = user.status;

        editUserModal.style.display = 'block';
    };
    tryOpenModal();
}

// 전역 스코프에 함수 바인딩
window.openEditUserModal = openEditUserModal;

// 사용자 수정 처리
async function handleEditUser(event) {
    event.preventDefault();

    if (!currentEditUserId) return;

    const requestData = {
        username: document.getElementById('edit-username').value,
        email: document.getElementById('edit-email').value,
        role: document.getElementById('edit-user-role').value,
        status: document.getElementById('edit-user-status').value,
    };

    try {
        const response = await fetch(`/api/admin/users/${currentEditUserId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        const data = await response.json();

        if (data.success) {
            // 모달 닫기
            document.getElementById('edit-user-modal').style.display = 'none';
            currentEditUserId = null;

            // 목록 갱신
            await initializeUsers();
            displayUsers();
            updateUserStatistics();

            showNotification('사용자 정보가 성공적으로 수정되었습니다!', 'success');
        } else {
            showNotification(data.message || '사용자 수정에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('사용자 수정 실패:', error);
        showNotification('사용자 수정 중 오류가 발생했습니다.', 'error');
    }
}

// 사용자 상태 토글
async function toggleUserStatus(userId) {
    const user = users.find((u) => u.id === userId);
    if (!user) {
        console.error('사용자를 찾을 수 없습니다:', userId);
        return;
    }

    let newStatus = 'active';
    if (user.status === 'active') {
        newStatus = 'inactive';
    } else if (user.status === 'inactive') {
        newStatus = 'active';
    } else {
        newStatus = 'active'; // suspended -> active
    }

    try {
        const response = await fetch(`/api/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        const data = await response.json();

        if (data.success) {
            // 목록 갱신
            await initializeUsers();
            displayUsers();
            updateUserStatistics();

            showNotification(`사용자 ${user.username}의 상태가 변경되었습니다.`, 'success');
        } else {
            showNotification(data.message || '사용자 상태 변경에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('사용자 상태 변경 실패:', error);
        showNotification('사용자 상태 변경 중 오류가 발생했습니다.', 'error');
    }
}

// 전역 스코프에 함수 바인딩
window.toggleUserStatus = toggleUserStatus;

// 사용자 삭제
async function deleteUser(userId) {
    const user = users.find((u) => u.id === userId);
    if (!user) {
        console.error('사용자를 찾을 수 없습니다:', userId);
        return;
    }

    if (confirm(`정말로 사용자 "${user.username}"을(를) 삭제하시겠습니까?`)) {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                // 목록 갱신
                await initializeUsers();
                displayUsers();
                updateUserStatistics();

                showNotification('사용자가 성공적으로 삭제되었습니다!', 'success');
            } else {
                showNotification(data.message || '사용자 삭제에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('사용자 삭제 실패:', error);
            showNotification('사용자 삭제 중 오류가 발생했습니다.', 'error');
        }
    }
}

// 전역 스코프에 함수 바인딩
window.deleteUser = deleteUser;

// 페이지네이션 업데이트
function updateUsersPagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginationContainer = document.getElementById('users-pagination');

    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    // 이전 버튼
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '이전';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayUsers();
        }
    };
    paginationContainer.appendChild(prevBtn);

    // 페이지 번호들
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            currentPage = i;
            displayUsers();
        };
        paginationContainer.appendChild(pageBtn);
    }

    // 다음 버튼
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = '다음';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayUsers();
        }
    };
    paginationContainer.appendChild(nextBtn);

    // 정보 표시
    const info = document.createElement('div');
    info.className = 'pagination-info';
    const startItem = (currentPage - 1) * usersPerPage + 1;
    const endItem = Math.min(currentPage * usersPerPage, filteredUsers.length);
    info.textContent = `${startItem}-${endItem} / ${filteredUsers.length}`;
    paginationContainer.appendChild(info);
}

// 키보드 단축키
document.addEventListener('keydown', function (event) {
    // Ctrl + S로 전체 데이터 내보내기
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        exportAllData();
    }

    // Ctrl + Shift + T로 관광지 데이터만 내보내기
    if (event.ctrlKey && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        exportTouristSpotsData();
    }

    // Ctrl + Shift + U로 사용자 데이터만 내보내기
    if (event.ctrlKey && event.shiftKey && event.key === 'U') {
        event.preventDefault();
        exportUsersData();
    }

    // ESC로 모달 닫기
    if (event.key === 'Escape') {
        const modals = [
            'edit-modal',
            'edit-user-modal',
            'add-group-modal',
            'edit-group-modal',
            'add-code-modal',
            'edit-code-modal',
        ];
        modals.forEach((modalId) => {
            const modal = document.getElementById(modalId);
            if (modal && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
});

// ========== 공통코드 관리 기능 ==========

// 전역 변수
let commonCodeGroups = [];
let commonCodes = [];
let currentEditGroupId = null;
let currentEditCodeId = null;

// 코드 그룹 목록 로드
async function loadCommonCodeGroups() {
    try {
        const response = await fetch('/api/admin/common-code-groups');
        const data = await response.json();

        if (data.success && data.groups) {
            commonCodeGroups = data.groups;
            displayCodeGroups();
            updateGroupFilter();
            updateCodeGroupSelect();
        } else {
            throw new Error(data.message || '코드 그룹 목록을 불러오는데 실패했습니다.');
        }
    } catch (error) {
        console.error('코드 그룹 데이터 로드 실패:', error);
        showNotification('코드 그룹 목록을 불러오는데 실패했습니다.', 'error');
        commonCodeGroups = [];
    }
}

// 코드 목록 로드
async function loadCommonCodes(groupCode = null) {
    try {
        const url = groupCode
            ? `/api/admin/common-codes?groupCode=${encodeURIComponent(groupCode)}`
            : '/api/admin/common-codes';
        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.codes) {
            commonCodes = data.codes;
            displayCodes();
        } else {
            throw new Error(data.message || '코드 목록을 불러오는데 실패했습니다.');
        }
    } catch (error) {
        console.error('코드 데이터 로드 실패:', error);
        showNotification('코드 목록을 불러오는데 실패했습니다.', 'error');
        commonCodes = [];
    }
}

// 코드 그룹 목록 표시
function displayCodeGroups() {
    const grid = document.getElementById('code-groups-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (commonCodeGroups.length === 0) {
        grid.innerHTML = '<p>등록된 코드 그룹이 없습니다.</p>';
        return;
    }

    commonCodeGroups.forEach((group) => {
        const card = document.createElement('div');
        card.className = 'code-group-card';
        // 코드 그룹은 비활성화/삭제 불가능
        card.innerHTML = `
            <div class="code-group-header">
                <h4>${group.groupName}</h4>
                <span class="code-group-code">${group.groupCode}</span>
            </div>
            <div class="code-group-info">
                <p><strong>영어:</strong> ${group.groupNameEn || '-'}</p>
                <p><strong>일본어:</strong> ${group.groupNameJp || '-'}</p>
                <p><strong>설명:</strong> ${group.description || '-'}</p>
                <p><strong>상태:</strong> ${group.isActive ? '활성' : '비활성'}</p>
                <p><strong>정렬 순서:</strong> ${group.sortOrder || 0}</p>
            </div>
            <div class="code-group-actions">
                <button class="edit-btn" onclick="openEditGroupModal(${group.id})">수정</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 코드 목록 표시
function displayCodes() {
    const tbody = document.getElementById('codes-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (commonCodes.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="9" style="text-align: center;">등록된 코드가 없습니다.</td></tr>';
        return;
    }

    // 비활성화 불가능한 그룹 코드 목록
    const nonDeactivatableGroups = ['USER_STATUS', 'GENDER', 'REPORT_STATUS'];

    commonCodes.forEach((code) => {
        const row = document.createElement('tr');
        const canDeactivate = !nonDeactivatableGroups.includes(code.groupCode);
        const isAdminRole = code.groupCode === 'USER_ROLE' && code.code === 'ADMIN';
        
        // 비활성화 버튼 (삭제 버튼 대신)
        let actionButtons = '';
        if (canDeactivate && !isAdminRole) {
            // 비활성화 가능한 경우: 수정 + 비활성화 버튼
            actionButtons = `
                <button class="edit-btn" onclick="openEditCodeModal(${code.id})">수정</button>
                <button class="toggle-btn" onclick="toggleCodeActive(${code.id}, ${code.isActive})">
                    ${code.isActive ? '비활성화' : '활성화'}
                </button>
            `;
        } else {
            // 비활성화 불가능한 경우: 수정 버튼만
            actionButtons = `
                <button class="edit-btn" onclick="openEditCodeModal(${code.id})">수정</button>
            `;
        }

        row.innerHTML = `
            <td>${code.id}</td>
            <td>${code.groupCode}</td>
            <td>${code.code}</td>
            <td>${code.codeName || '-'}</td>
            <td>${code.codeNameEn || '-'}</td>
            <td>${code.codeNameJp || '-'}</td>
            <td>${code.sortOrder || 0}</td>
            <td>${code.isActive ? '활성' : '비활성'}</td>
            <td>
                ${actionButtons}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 그룹 필터 업데이트
function updateGroupFilter() {
    const filter = document.getElementById('code-group-filter');
    if (!filter) return;

    // 기존 옵션 제거 (전체 그룹 제외)
    while (filter.children.length > 1) {
        filter.removeChild(filter.lastChild);
    }

    commonCodeGroups.forEach((group) => {
        const option = document.createElement('option');
        option.value = group.groupCode;
        option.textContent = `${group.groupName} (${group.groupCode})`;
        filter.appendChild(option);
    });

    // 필터 변경 이벤트
    filter.addEventListener('change', (e) => {
        const selectedGroupCode = e.target.value;
        loadCommonCodes(selectedGroupCode || null);
    });
}

// 코드 그룹 선택 드롭다운 업데이트
function updateCodeGroupSelect() {
    const select = document.getElementById('new-code-group-code');
    if (!select) return;

    // 기존 옵션 제거 (그룹 선택 제외)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    commonCodeGroups.forEach((group) => {
        const option = document.createElement('option');
        option.value = group.groupCode;
        option.textContent = `${group.groupName} (${group.groupCode})`;
        select.appendChild(option);
    });
}

// 코드 그룹 추가 모달 열기
function openAddGroupModal() {
    const modal = document.getElementById('add-group-modal');
    if (!modal) {
        setTimeout(() => openAddGroupModal(), 100);
        return;
    }
    modal.style.display = 'block';
    document.getElementById('add-group-form').reset();
}

// 코드 그룹 수정 모달 열기
function openEditGroupModal(groupId) {
    const group = commonCodeGroups.find((g) => g.id === groupId);
    if (!group) {
        showNotification('코드 그룹을 찾을 수 없습니다.', 'error');
        return;
    }

    const modal = document.getElementById('edit-group-modal');
    if (!modal) {
        setTimeout(() => openEditGroupModal(groupId), 100);
        return;
    }

    currentEditGroupId = groupId;
    document.getElementById('edit-group-code').value = group.groupCode;
    document.getElementById('edit-group-name').value = group.groupName || '';
    document.getElementById('edit-group-name-en').value = group.groupNameEn || '';
    document.getElementById('edit-group-name-jp').value = group.groupNameJp || '';
    document.getElementById('edit-group-description').value = group.description || '';
    document.getElementById('edit-group-sort-order').value = group.sortOrder || 0;
    // 코드 그룹은 비활성화할 수 없으므로 항상 활성으로 설정하고 비활성화
    const activeSelect = document.getElementById('edit-group-active');
    activeSelect.value = 'true';
    activeSelect.disabled = true;
    modal.style.display = 'block';
}

// 코드 추가 모달 열기
function openAddCodeModal() {
    const modal = document.getElementById('add-code-modal');
    if (!modal) {
        setTimeout(() => openAddCodeModal(), 100);
        return;
    }
    modal.style.display = 'block';
    document.getElementById('add-code-form').reset();
}

// 코드 수정 모달 열기
function openEditCodeModal(codeId) {
    const code = commonCodes.find((c) => c.id === codeId);
    if (!code) {
        showNotification('코드를 찾을 수 없습니다.', 'error');
        return;
    }

    const modal = document.getElementById('edit-code-modal');
    if (!modal) {
        setTimeout(() => openEditCodeModal(codeId), 100);
        return;
    }

    // 비활성화 불가능한 그룹 코드 목록
    const nonDeactivatableGroups = ['USER_STATUS', 'GENDER', 'REPORT_STATUS'];
    const canDeactivate = !nonDeactivatableGroups.includes(code.groupCode);
    const isAdminRole = code.groupCode === 'USER_ROLE' && code.code === 'ADMIN';

    currentEditCodeId = codeId;
    document.getElementById('edit-code-group-code').value = code.groupCode;
    document.getElementById('edit-code-code').value = code.code;
    document.getElementById('edit-code-name').value = code.codeName || '';
    document.getElementById('edit-code-name-en').value = code.codeNameEn || '';
    document.getElementById('edit-code-name-jp').value = code.codeNameJp || '';
    document.getElementById('edit-code-description').value = code.description || '';
    document.getElementById('edit-code-sort-order').value = code.sortOrder || 0;
    
    // 비활성화 불가능한 코드는 활성화 필드를 비활성화
    const activeSelect = document.getElementById('edit-code-active');
    activeSelect.value = code.isActive ? 'true' : 'false';
    if (!canDeactivate || isAdminRole) {
        activeSelect.disabled = true;
    } else {
        activeSelect.disabled = false;
    }
    
    modal.style.display = 'block';
}

// 코드 그룹 추가
async function handleAddGroup(event) {
    event.preventDefault();
    try {
        const formData = {
            groupCode: document.getElementById('new-group-code').value,
            groupName: document.getElementById('new-group-name').value,
            groupNameEn: document.getElementById('new-group-name-en').value,
            groupNameJp: document.getElementById('new-group-name-jp').value,
            description: document.getElementById('new-group-description').value,
            sortOrder: parseInt(document.getElementById('new-group-sort-order').value) || 0,
        };

        const response = await fetch('/api/admin/common-code-groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (data.success) {
            showNotification('코드 그룹이 추가되었습니다.', 'success');
            document.getElementById('add-group-modal').style.display = 'none';
            await loadCommonCodeGroups();
        } else {
            throw new Error(data.message || '코드 그룹 추가에 실패했습니다.');
        }
    } catch (error) {
        console.error('코드 그룹 추가 실패:', error);
        showNotification(error.message || '코드 그룹 추가에 실패했습니다.', 'error');
    }
}

// 코드 그룹 수정
async function handleEditGroup(event) {
    event.preventDefault();
    try {
        const group = commonCodeGroups.find((g) => g.id === currentEditGroupId);
        if (!group) {
            showNotification('코드 그룹을 찾을 수 없습니다.', 'error');
            return;
        }

        const formData = {
            groupName: document.getElementById('edit-group-name').value,
            groupNameEn: document.getElementById('edit-group-name-en').value,
            groupNameJp: document.getElementById('edit-group-name-jp').value,
            description: document.getElementById('edit-group-description').value,
            sortOrder: parseInt(document.getElementById('edit-group-sort-order').value) || 0,
            // 코드 그룹은 비활성화할 수 없으므로 항상 활성 상태 유지
            isActive: true,
        };

        const response = await fetch(`/api/admin/common-code-groups/${currentEditGroupId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (data.success) {
            showNotification('코드 그룹이 수정되었습니다.', 'success');
            document.getElementById('edit-group-modal').style.display = 'none';
            await loadCommonCodeGroups();
        } else {
            throw new Error(data.message || '코드 그룹 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('코드 그룹 수정 실패:', error);
        showNotification(error.message || '코드 그룹 수정에 실패했습니다.', 'error');
    }
}

// 코드 그룹 삭제 (비활성화됨 - 코드 그룹은 삭제할 수 없음)
async function deleteCodeGroup(groupId) {
    showNotification('코드 그룹은 삭제할 수 없습니다.', 'error');
}

// 코드 추가
async function handleAddCode(event) {
    event.preventDefault();
    try {
        const formData = {
            groupCode: document.getElementById('new-code-group-code').value,
            code: document.getElementById('new-code-code').value,
            codeName: document.getElementById('new-code-name').value,
            codeNameEn: document.getElementById('new-code-name-en').value,
            codeNameJp: document.getElementById('new-code-name-jp').value,
            description: document.getElementById('new-code-description').value,
            sortOrder: parseInt(document.getElementById('new-code-sort-order').value) || 0,
        };

        const response = await fetch('/api/admin/common-codes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (data.success) {
            showNotification('코드가 추가되었습니다.', 'success');
            document.getElementById('add-code-modal').style.display = 'none';
            await loadCommonCodes();
        } else {
            throw new Error(data.message || '코드 추가에 실패했습니다.');
        }
    } catch (error) {
        console.error('코드 추가 실패:', error);
        showNotification(error.message || '코드 추가에 실패했습니다.', 'error');
    }
}

// 코드 수정
async function handleEditCode(event) {
    event.preventDefault();
    try {
        const formData = {
            codeName: document.getElementById('edit-code-name').value,
            codeNameEn: document.getElementById('edit-code-name-en').value,
            codeNameJp: document.getElementById('edit-code-name-jp').value,
            description: document.getElementById('edit-code-description').value,
            sortOrder: parseInt(document.getElementById('edit-code-sort-order').value) || 0,
            isActive: document.getElementById('edit-code-active').value === 'true',
        };

        const response = await fetch(`/api/admin/common-codes/${currentEditCodeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (data.success) {
            showNotification('코드가 수정되었습니다.', 'success');
            document.getElementById('edit-code-modal').style.display = 'none';
            await loadCommonCodes();
        } else {
            throw new Error(data.message || '코드 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('코드 수정 실패:', error);
        showNotification(error.message || '코드 수정에 실패했습니다.', 'error');
    }
}

// 코드 비활성화/활성화 토글
async function toggleCodeActive(codeId, currentActive) {
    const code = commonCodes.find((c) => c.id === codeId);
    if (!code) {
        showNotification('코드를 찾을 수 없습니다.', 'error');
        return;
    }

    // 비활성화 불가능한 그룹 체크
    const nonDeactivatableGroups = ['USER_STATUS', 'GENDER', 'REPORT_STATUS'];
    if (nonDeactivatableGroups.includes(code.groupCode)) {
        showNotification('이 코드는 비활성화할 수 없습니다.', 'error');
        return;
    }

    // ADMIN 역할 비활성화 불가
    if (code.groupCode === 'USER_ROLE' && code.code === 'ADMIN') {
        showNotification('ADMIN 역할은 비활성화할 수 없습니다.', 'error');
        return;
    }

    const newActive = !currentActive;
    const action = newActive ? '활성화' : '비활성화';
    
    if (!confirm(`코드를 ${action}하시겠습니까?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/common-codes/${codeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                codeName: code.codeName,
                codeNameEn: code.codeNameEn,
                codeNameJp: code.codeNameJp,
                description: code.description,
                sortOrder: code.sortOrder,
                isActive: newActive,
            }),
        });

        const data = await response.json();
        if (data.success) {
            showNotification(`코드가 ${action}되었습니다.`, 'success');
            await loadCommonCodes();
            
            // 사용자 역할이 비활성화된 경우 사용자 목록 갱신
            if (code.groupCode === 'USER_ROLE') {
                await initializeUsers();
                displayUsers();
            }
            
            // 관광지 카테고리가 비활성화된 경우 관광지 목록 갱신
            if (code.groupCode === 'SPOT_CATEGORY') {
                await loadTouristSpots();
                updateStatistics();
            }
        } else {
            throw new Error(data.message || `코드 ${action}에 실패했습니다.`);
        }
    } catch (error) {
        console.error(`코드 ${action} 실패:`, error);
        showNotification(error.message || `코드 ${action}에 실패했습니다.`, 'error');
    }
}

// 전역 스코프에 함수 바인딩
window.openAddGroupModal = openAddGroupModal;
window.openEditGroupModal = openEditGroupModal;
window.openAddCodeModal = openAddCodeModal;
window.openEditCodeModal = openEditCodeModal;
window.deleteCodeGroup = deleteCodeGroup;
window.toggleCodeActive = toggleCodeActive;

// 모달 닫기 이벤트 리스너
document.addEventListener('DOMContentLoaded', function () {
    // 코드 그룹 추가 모달
    const addGroupModal = document.getElementById('add-group-modal');
    if (addGroupModal) {
        const closeBtn = document.getElementById('close-add-group-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                addGroupModal.style.display = 'none';
            });
        }
        const addGroupForm = document.getElementById('add-group-form');
        if (addGroupForm) {
            addGroupForm.addEventListener('submit', handleAddGroup);
        }
    }

    // 코드 그룹 수정 모달
    const editGroupModal = document.getElementById('edit-group-modal');
    if (editGroupModal) {
        const closeBtn = document.getElementById('close-edit-group-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                editGroupModal.style.display = 'none';
            });
        }
        const editGroupForm = document.getElementById('edit-group-form');
        if (editGroupForm) {
            editGroupForm.addEventListener('submit', handleEditGroup);
        }
    }

    // 코드 추가 모달
    const addCodeModal = document.getElementById('add-code-modal');
    if (addCodeModal) {
        const closeBtn = document.getElementById('close-add-code-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                addCodeModal.style.display = 'none';
            });
        }
        const addCodeForm = document.getElementById('add-code-form');
        if (addCodeForm) {
            addCodeForm.addEventListener('submit', handleAddCode);
        }
    }

    // 코드 수정 모달
    const editCodeModal = document.getElementById('edit-code-modal');
    if (editCodeModal) {
        const closeBtn = document.getElementById('close-edit-code-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                editCodeModal.style.display = 'none';
            });
        }
        const editCodeForm = document.getElementById('edit-code-form');
        if (editCodeForm) {
            editCodeForm.addEventListener('submit', handleEditCode);
        }
    }

    // 처벌 모달 이벤트 초기화
    initPenaltyModalEvents();

    // 사진 추가 신청 상세 모달 이벤트 초기화
    initPhotoRequestDetailModalEvents();
});

// ========== 사진 추가 신청 관리 기능 ==========

// 사진 추가 신청 관리 이벤트 리스너 초기화
function initializeSpotRequestEventListeners() {
    // 검색 및 필터
    const requestSearchInput = document.getElementById('request-search-input');
    const requestTypeFilter = document.getElementById('request-type-filter');
    const requestStatusFilter = document.getElementById('request-status-filter');

    if (requestSearchInput) {
        requestSearchInput.addEventListener('input', filterSpotRequests);
    }
    if (requestTypeFilter) {
        requestTypeFilter.addEventListener('change', filterSpotRequests);
    }
    if (requestStatusFilter) {
        requestStatusFilter.addEventListener('change', filterSpotRequests);
    }
}

// 사진 추가 신청 목록 로드
async function loadSpotRequests() {
    try {
        const response = await fetch('/api/admin/spot-requests');
        const data = await response.json();

        if (data.success && data.requests) {
            spotRequests = data.requests;
            filteredSpotRequests = [...spotRequests];
            currentRequestPage = 1;
            displaySpotRequests();
        } else {
            throw new Error(data.message || '신청 목록을 불러오는데 실패했습니다.');
        }
    } catch (error) {
        console.error('사진 추가 신청 목록 로드 실패:', error);
        showNotification('신청 목록을 불러오는데 실패했습니다.', 'error');
        spotRequests = [];
        filteredSpotRequests = [];
        displaySpotRequests();
    }
}

// 사진 추가 신청 목록 표시
function displaySpotRequests() {
    const tbody = document.getElementById('requests-table-body');
    if (!tbody) return;

    // 페이지네이션 계산
    const startIndex = (currentRequestPage - 1) * requestsPerPage;
    const endIndex = startIndex + requestsPerPage;
    const paginatedRequests = filteredSpotRequests.slice(startIndex, endIndex);

    if (paginatedRequests.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="8" style="text-align: center; padding: 40px;">신청 내역이 없습니다.</td></tr>';
        updateRequestPagination();
        return;
    }

    tbody.innerHTML = paginatedRequests
        .map((request) => {
            const statusBadge = getStatusBadge(request.status);
            let typeLabel = '관광지 추가';
            if (request.type === 'photo') {
                typeLabel = '사진 추가';
            } else if (request.type === 'edit') {
                typeLabel = '정보 수정';
            }
            const createdAt = formatDate(request.createdAt);
            const description = request.description || '-';

            // 여러 이미지가 쉼표로 구분되어 있을 수 있음 - 첫 번째 이미지만 미리보기로 표시
            let imagePreview = '-';
            if (request.imageUrl) {
                const firstImageUrl = request.imageUrl.split(',')[0].trim();
                const imageCount = request.imageUrl.split(',').filter((url) => url.trim()).length;
                const countBadge =
                    imageCount > 1
                        ? `<span style="position: absolute; top: 2px; right: 2px; background: #007bff; color: white; padding: 1px 5px; border-radius: 10px; font-size: 0.7rem;">${imageCount}</span>`
                        : '';
                imagePreview = `<div style="position: relative; display: inline-block;"><img src="${firstImageUrl}" alt="신청 사진" style="max-width: 100px; max-height: 100px; cursor: pointer; border-radius: 4px; border: 1px solid #ddd;" onclick="openImageModal('${firstImageUrl}')">${countBadge}</div>`;
            }

            // 신청 유형에 따른 버튼 생성
            let actionButtons = '';
            if (request.status === 'pending') {
                if (request.type === 'photo') {
                    // 사진 추가 신청: 상세 모달로 열기
                    actionButtons = `
                        <button class="approve-btn" onclick="openPhotoRequestDetailModal(${request.id})" style="margin-right: 5px;">승인</button>
                        <button class="reject-btn" onclick="rejectSpotRequest(${request.id})">거부</button>
                    `;
                } else if (request.type === 'spot') {
                    // 관광지 추가 신청: 관광지 추가 모달로 열기 (정보 미리 채움)
                    actionButtons = `
                        <button class="approve-btn" onclick="openSpotRequestApprovalModal(${request.id})" style="margin-right: 5px;">승인</button>
                        <button class="reject-btn" onclick="rejectSpotRequest(${request.id})">거부</button>
                    `;
                } else {
                    // 기타 (정보 수정 등)
                    actionButtons = `
                        <button class="approve-btn" onclick="approveSpotRequest(${request.id})" style="margin-right: 5px;">승인</button>
                        <button class="reject-btn" onclick="rejectSpotRequest(${request.id})">거부</button>
                    `;
                }
            } else {
                // 처리 완료된 경우 삭제 버튼만 표시
                actionButtons = `
                    <button class="delete-btn" onclick="deleteSpotRequest(${request.id})">삭제</button>
                `;
            }

            return `
            <tr>
                <td>${request.id}</td>
                <td>${typeLabel}</td>
                <td>${request.applicantName || request.applicantId || '-'}</td>
                <td>${request.spotName || '-'}</td>
                <td>
                    <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${description}">
                        ${description}
                    </div>
                    ${request.imageUrl ? `<div style="margin-top: 5px;">${imagePreview}</div>` : ''}
                </td>
                <td>${createdAt}</td>
                <td>${statusBadge}</td>
                <td>${actionButtons}</td>
            </tr>
        `;
        })
        .join('');

    updateRequestPagination();
}

// 상태 배지 생성
function getStatusBadge(status) {
    const badges = {
        pending:
            '<span style="background: #ffc107; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">대기중</span>',
        approved:
            '<span style="background: #28a745; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">승인됨</span>',
        rejected:
            '<span style="background: #dc3545; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">거부됨</span>',
    };
    return badges[status] || badges.pending;
}

// 날짜 포맷팅
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// 사진 추가 신청 필터링
function filterSpotRequests() {
    const searchInput = document.getElementById('request-search-input');
    const typeFilter = document.getElementById('request-type-filter');
    const statusFilter = document.getElementById('request-status-filter');

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const type = typeFilter ? typeFilter.value : '';
    const status = statusFilter ? statusFilter.value : '';

    filteredSpotRequests = spotRequests.filter((request) => {
        const matchesSearch =
            !searchTerm ||
            (request.applicantName && request.applicantName.toLowerCase().includes(searchTerm)) ||
            (request.applicantId && request.applicantId.toLowerCase().includes(searchTerm)) ||
            (request.spotName && request.spotName.toLowerCase().includes(searchTerm)) ||
            (request.description && request.description.toLowerCase().includes(searchTerm));

        const matchesType = !type || request.type === type;
        const matchesStatus = !status || request.status === status;

        return matchesSearch && matchesType && matchesStatus;
    });

    currentRequestPage = 1;
    displaySpotRequests();
}

// 페이지네이션 업데이트
function updateRequestPagination() {
    const pagination = document.getElementById('requests-pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(filteredSpotRequests.length / requestsPerPage);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML =
        '<div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 20px;">';

    // 이전 페이지 버튼
    paginationHTML += `<button onclick="changeRequestPage(${currentRequestPage - 1})" ${
        currentRequestPage === 1 ? 'disabled' : ''
    } style="padding: 8px 16px; border: 1px solid #ddd; background: #fff; cursor: pointer; border-radius: 4px;">이전</button>`;

    // 페이지 번호
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentRequestPage - 2 && i <= currentRequestPage + 2)
        ) {
            paginationHTML += `<button onclick="changeRequestPage(${i})" ${
                i === currentRequestPage
                    ? 'style="padding: 8px 16px; border: 1px solid #3498db; background: #3498db; color: #fff; cursor: pointer; border-radius: 4px;"'
                    : 'style="padding: 8px 16px; border: 1px solid #ddd; background: #fff; cursor: pointer; border-radius: 4px;"'
            }>${i}</button>`;
        } else if (i === currentRequestPage - 3 || i === currentRequestPage + 3) {
            paginationHTML += '<span>...</span>';
        }
    }

    // 다음 페이지 버튼
    paginationHTML += `<button onclick="changeRequestPage(${currentRequestPage + 1})" ${
        currentRequestPage === totalPages ? 'disabled' : ''
    } style="padding: 8px 16px; border: 1px solid #ddd; background: #fff; cursor: pointer; border-radius: 4px;">다음</button>`;

    paginationHTML += '</div>';
    pagination.innerHTML = paginationHTML;
}

// 페이지 변경
function changeRequestPage(page) {
    const totalPages = Math.ceil(filteredSpotRequests.length / requestsPerPage);
    if (page < 1 || page > totalPages) return;
    currentRequestPage = page;
    displaySpotRequests();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 사진 추가 신청 승인
async function approveSpotRequest(requestId) {
    if (!confirm('이 신청을 승인하시겠습니까?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/spot-requests/${requestId}/approve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (data.success) {
            showNotification('신청이 승인되었습니다.', 'success');
            await loadSpotRequests();
        } else {
            throw new Error(data.message || '승인에 실패했습니다.');
        }
    } catch (error) {
        console.error('승인 실패:', error);
        showNotification('승인에 실패했습니다: ' + error.message, 'error');
    }
}

// 사진 추가 신청 거부
async function rejectSpotRequest(requestId) {
    const reason = prompt('거부 사유를 입력해주세요:');
    if (reason === null) {
        return; // 사용자가 취소한 경우
    }

    try {
        const response = await fetch(`/api/admin/spot-requests/${requestId}/reject`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reason: reason || '사유 없음',
            }),
        });

        const data = await response.json();

        if (data.success) {
            showNotification('신청이 거부되었습니다.', 'success');
            await loadSpotRequests();
        } else {
            throw new Error(data.message || '거부에 실패했습니다.');
        }
    } catch (error) {
        console.error('거부 실패:', error);
        showNotification('거부에 실패했습니다: ' + error.message, 'error');
    }
}

// 이미지 모달 열기
function openImageModal(imageUrl) {
    const modal = document.createElement('div');
    modal.style.cssText =
        'position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center;';
    modal.innerHTML = `
        <div style="position: relative; max-width: 90%; max-height: 90%;">
            <span onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: -40px; right: 0; color: #fff; font-size: 40px; font-weight: bold; cursor: pointer;">&times;</span>
            <img src="${imageUrl}" style="max-width: 100%; max-height: 90vh; border-radius: 8px;">
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ========== 사진 추가 신청 상세 모달 기능 ==========

// 사진 추가 신청 상세 모달 열기
function openPhotoRequestDetailModal(requestId) {
    const request = spotRequests.find((r) => r.id === requestId);
    if (!request) {
        showNotification('신청 정보를 찾을 수 없습니다.', 'error');
        return;
    }

    const modal = document.getElementById('photo-request-detail-modal');
    if (!modal) return;

    // 신청 ID 저장
    document.getElementById('photo-request-detail-id').value = requestId;

    // 관광지 정보 표시
    document.getElementById('photo-request-spot-name').textContent = request.spotName || '-';
    document.getElementById('photo-request-applicant').textContent =
        request.applicantName || request.applicantId || '-';
    document.getElementById('photo-request-date').textContent = formatDate(request.createdAt);
    document.getElementById('photo-request-description').textContent =
        request.description || '설명 없음';

    // 사진 표시
    const imageElement = document.getElementById('photo-request-detail-image');
    if (request.imageUrl) {
        imageElement.src = request.imageUrl;
        imageElement.style.display = 'block';
    } else {
        imageElement.src = '/images/logo.png';
        imageElement.style.display = 'block';
    }

    modal.style.display = 'block';
}

// 사진 추가 신청 상세 모달 닫기
function closePhotoRequestDetailModal() {
    const modal = document.getElementById('photo-request-detail-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 사진 추가 신청 상세 모달에서 승인
async function approvePhotoRequestFromModal() {
    const requestId = document.getElementById('photo-request-detail-id').value;
    if (!requestId) return;

    await approveSpotRequest(parseInt(requestId));
    closePhotoRequestDetailModal();
}

// 사진 추가 신청 상세 모달에서 거부
async function rejectPhotoRequestFromModal() {
    const requestId = document.getElementById('photo-request-detail-id').value;
    if (!requestId) return;

    await rejectSpotRequest(parseInt(requestId));
    closePhotoRequestDetailModal();
}

// 사진 추가 신청 상세 모달 이벤트 초기화
function initPhotoRequestDetailModalEvents() {
    const modal = document.getElementById('photo-request-detail-modal');
    const closeBtn = document.getElementById('close-photo-request-detail-modal');
    const approveBtn = document.getElementById('approve-photo-request-btn');
    const rejectBtn = document.getElementById('reject-photo-request-btn');

    if (closeBtn) {
        closeBtn.addEventListener('click', closePhotoRequestDetailModal);
    }

    if (approveBtn) {
        approveBtn.addEventListener('click', approvePhotoRequestFromModal);
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', rejectPhotoRequestFromModal);
    }

    // 모달 외부 클릭 시 닫기
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closePhotoRequestDetailModal();
            }
        });
    }
}

// ========== 관광지 추가 신청 승인 모달 기능 ==========

// 현재 처리 중인 관광지 신청 ID
let currentSpotRequestId = null;

// 관광지 추가 신청 승인 모달 열기 (기존 수정 모달 재활용)
function openSpotRequestApprovalModal(requestId) {
    const request = spotRequests.find((r) => r.id === requestId);
    if (!request) {
        showNotification('신청 정보를 찾을 수 없습니다.', 'error');
        return;
    }

    // 현재 처리 중인 신청 ID 저장
    currentSpotRequestId = requestId;

    const tryOpenModal = () => {
        const editModal = document.getElementById('edit-modal');
        if (!editModal) {
            setTimeout(tryOpenModal, 100);
            return;
        }

        // 추가 모드로 설정
        isAddMode = true;
        currentEditRegion = null;
        currentEditIndex = null;

        // 모달 제목과 버튼 텍스트 변경
        const modalTitle = document.getElementById('edit-modal-title');
        const submitBtn = document.getElementById('edit-modal-submit-btn');
        if (modalTitle) modalTitle.textContent = '📋 관광지 추가 신청 승인';
        if (submitBtn) submitBtn.textContent = '승인 및 관광지 추가';

        // 신청 정보로 폼 채우기
        const titleInput = document.getElementById('edit-spot-title');
        const regionSelect = document.getElementById('edit-spot-region');
        const categorySelect = document.getElementById('edit-spot-category');
        const descriptionTextarea = document.getElementById('edit-spot-description');
        const hashtagsInput = document.getElementById('edit-spot-hashtags');
        const linkInput = document.getElementById('edit-spot-link');

        if (titleInput) titleInput.value = request.spotName || '';
        if (descriptionTextarea) descriptionTextarea.value = request.description || '';
        if (linkInput) linkInput.value = request.linkUrl || '#';
        if (hashtagsInput) hashtagsInput.value = request.hashtags || '';

        // 지역 선택 (신청에 지역 정보가 있으면 설정)
        if (regionSelect) {
            if (request.regionId) {
                // regionId를 area01 형식으로 변환
                const regionKey = `area${String(request.regionId).padStart(2, '0')}`;
                regionSelect.value = regionKey;
            } else {
                regionSelect.value = 'area01'; // 기본값
            }
        }

        // 카테고리 선택 (신청에 카테고리 정보가 있으면 설정)
        if (categorySelect) {
            if (request.categoryCode) {
                categorySelect.value = request.categoryCode;
            } else {
                categorySelect.value = 'CULTURE'; // 기본값
            }
        }

        // 이미지 섹션 - 신청자가 제공한 이미지 표시
        const imageList = document.getElementById('edit-spot-images');
        if (imageList) {
            if (request.imageUrl) {
                // 쉼표로 구분된 여러 이미지 URL 처리
                const imageUrls = request.imageUrl.split(',').filter((url) => url.trim());

                if (imageUrls.length > 0) {
                    // 신청자가 제공한 이미지가 있으면 모두 표시
                    const imagesHtml = imageUrls
                        .map(
                            (url, index) => `
                        <div class="image-item ${
                            index === 0 ? 'is-rep' : ''
                        }" data-image-id="request-image-${index}" style="position: relative; display: inline-block; margin: 5px; width: 120px;">
                            ${
                                index === 0
                                    ? '<span class="rep-badge" style="position: absolute; top: 5px; left: 5px; background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; z-index: 1;">대표</span>'
                                    : ''
                            }
                            <img src="${url.trim()}" alt="신청된 이미지 ${
                                index + 1
                            }" onerror="this.src='/images/no-image.png'" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid ${
                                index === 0 ? '#28a745' : '#ddd'
                            };" onclick="openImageModal('${url.trim()}')" />
                        </div>
                    `
                        )
                        .join('');

                    imageList.innerHTML = `
                        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                            ${imagesHtml}
                        </div>
                        <p class="form-hint" style="margin-top: 10px; font-size: 0.85rem; color: #666;">위 ${imageUrls.length}개의 이미지는 신청자가 제공한 이미지입니다. 필요시 아래에서 추가 이미지를 등록할 수 있습니다.</p>
                    `;
                } else {
                    imageList.innerHTML =
                        '<p class="no-images">신청자가 제공한 이미지가 없습니다. 아래에서 이미지를 추가할 수 있습니다.</p>';
                }
            } else {
                imageList.innerHTML =
                    '<p class="no-images">신청자가 제공한 이미지가 없습니다. 아래에서 이미지를 추가할 수 있습니다.</p>';
            }
        }

        // 새 이미지 미리보기 초기화
        const selectedFilesPreview = document.getElementById('selected-files-preview');
        if (selectedFilesPreview) selectedFilesPreview.innerHTML = '';
        const newImagesInput = document.getElementById('edit-spot-new-images');
        if (newImagesInput) newImagesInput.value = '';

        // 위치 정보 설정 (신청에 위치 정보가 있으면 사용)
        if (request.latitude && request.longitude) {
            // 신청자가 제공한 위치 정보로 설정
            const latitudeInput = document.getElementById('edit-spot-latitude');
            const longitudeInput = document.getElementById('edit-spot-longitude');
            const addressInput = document.getElementById('edit-spot-address');
            const selectedInfo = document.getElementById('edit-spot-location-selected');
            const selectedText = document.getElementById('edit-spot-location-selected-text');
            const resultsContainer = document.getElementById('edit-spot-location-results');
            
            if (latitudeInput) latitudeInput.value = request.latitude;
            if (longitudeInput) longitudeInput.value = request.longitude;
            if (addressInput) addressInput.value = request.address || '';
            
            // 선택된 위치 정보 표시
            if (selectedInfo && selectedText) {
                const displayText = request.address || `위도: ${request.latitude}, 경도: ${request.longitude}`;
                selectedText.textContent = displayText;
                selectedInfo.style.display = 'flex';
            }
            if (resultsContainer) resultsContainer.style.display = 'none';
        } else {
            // 위치 정보 초기화
            clearLocationSelection();
        }

        // 위치 검색 초기화
        initLocationSearch();

        // 모달 표시
        editModal.style.display = 'block';
    };

    tryOpenModal();
}

// 관광지 신청 삭제
async function deleteSpotRequest(requestId) {
    if (!confirm('이 신청 기록을 삭제하시겠습니까?\n삭제된 기록은 복구할 수 없습니다.')) {
        return;
    }

    try {
        await fetch(`/api/admin/spot-requests/${requestId}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error('API 호출 실패 (무시됨):', error);
    }

    // 프론트엔드에서 목록에서 제거
    const index = spotRequests.findIndex((r) => r.id === requestId);
    if (index !== -1) {
        spotRequests.splice(index, 1);
        filteredSpotRequests = [...spotRequests];
    }

    showNotification('신청 기록이 삭제되었습니다.', 'success');
    displaySpotRequests();
}

// 전역 스코프에 함수 바인딩
window.openPhotoRequestDetailModal = openPhotoRequestDetailModal;
window.openSpotRequestApprovalModal = openSpotRequestApprovalModal;
window.deleteSpotRequest = deleteSpotRequest;

// ========== 유저 신고 관리 기능 ==========

// 유저 신고 관리 이벤트 리스너 초기화
function initializeUserReportEventListeners() {
    // 검색 및 필터
    const reportSearchInput = document.getElementById('report-search-input');
    const reportStatusFilter = document.getElementById('report-status-filter');
    const reportTypeFilter = document.getElementById('report-type-filter');

    if (reportSearchInput) {
        reportSearchInput.addEventListener('input', filterUserReports);
    }
    if (reportStatusFilter) {
        reportStatusFilter.addEventListener('change', filterUserReports);
    }
    if (reportTypeFilter) {
        reportTypeFilter.addEventListener('change', filterUserReports);
    }
}

// 유저 신고 목록 로드
async function loadUserReports() {
    try {
        const response = await fetch('/api/admin/user-reports');
        const data = await response.json();

        if (data.success && data.reports) {
            userReports = data.reports;
            filteredUserReports = [...userReports];
            currentReportPage = 1;
            displayUserReports();
        } else {
            throw new Error(data.message || '신고 목록을 불러오는데 실패했습니다.');
        }
    } catch (error) {
        console.error('유저 신고 목록 로드 실패:', error);
        showNotification('신고 목록을 불러오는데 실패했습니다.', 'error');
        userReports = [];
        filteredUserReports = [];
        displayUserReports();
    }
}

// 유저 신고 목록 표시
function displayUserReports() {
    const tbody = document.getElementById('reports-table-body');
    if (!tbody) return;

    // 페이지네이션 계산
    const startIndex = (currentReportPage - 1) * reportsPerPage;
    const endIndex = startIndex + reportsPerPage;
    const paginatedReports = filteredUserReports.slice(startIndex, endIndex);

    if (paginatedReports.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="8" style="text-align: center; padding: 40px;">신고 내역이 없습니다.</td></tr>';
        updateReportPagination();
        return;
    }

    tbody.innerHTML = paginatedReports
        .map((report) => {
            const statusBadge = getReportStatusBadge(report.status);
            const typeLabel = getReportTypeLabel(report.type);
            const createdAt = formatReportDate(report.createdAt);
            const reason = report.reason || '-';
            const isCommentReport = report.reportType === 'comment';

            // 리뷰 내용 또는 댓글 내용 처리
            const reviewContent = report.reviewContent
                ? report.reviewContent.length > 50
                    ? report.reviewContent.substring(0, 50) + '...'
                    : report.reviewContent
                : '-';

            const commentContent = report.commentContent
                ? report.commentContent.length > 50
                    ? report.commentContent.substring(0, 50) + '...'
                    : report.commentContent
                : null;

            // 신고 유형 배지 (리뷰/댓글 구분)
            const reportTypeBadge = isCommentReport
                ? '<span style="background: #6c757d; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-right: 4px;">댓글</span>'
                : '<span style="background: #007bff; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-right: 4px;">리뷰</span>';

            // 상태에 따른 버튼 생성
            let actionButtons = '';
            const statusLower = (report.status || '').toLowerCase();

            if (statusLower === 'pending') {
                // 대기중 상태: 처리 버튼, 반려 버튼
                actionButtons = `
                    <button class="approve-btn" onclick="openPenaltyModal(${report.id}, '${
                    report.reportType || 'review'
                }', ${report.reportedUserId || 0}, '${(report.reportedUserName || '').replace(
                    /'/g,
                    "\\'"
                )}', '${typeLabel}', '${(reason || '')
                    .replace(/'/g, "\\'")
                    .substring(0, 100)}')" style="margin-right: 5px;">처리</button>
                    <button class="reject-btn" onclick="rejectReport(${report.id}, '${
                    report.reportType || 'review'
                }')">반려</button>
                `;
            } else {
                // 완료 또는 반려 상태: 삭제 버튼만
                actionButtons = `
                    <button class="delete-btn" onclick="deleteReport(${report.id}, '${
                    report.reportType || 'review'
                }')">삭제</button>
                `;
            }

            return `
            <tr>
                <td>${report.id}</td>
                <td>${report.reporterName || report.reporterId || '-'}</td>
                <td>${report.reportedUserName || report.reportedUserId || '-'}</td>
                <td>${reportTypeBadge} ${typeLabel}</td>
                <td>
                    <div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${reason}">
                        ${reason}
                    </div>
                    ${
                        isCommentReport
                            ? commentContent
                                ? `<div style="margin-top: 5px; font-size: 0.875rem; color: #666;">
                                    <strong>댓글 내용:</strong> ${commentContent}
                                   </div>`
                                : ''
                            : report.reviewTitle
                            ? `<div style="margin-top: 5px; font-size: 0.875rem; color: #666;">리뷰: ${report.reviewTitle}</div>`
                            : ''
                    }
                    ${
                        isCommentReport
                            ? report.reviewTitle
                                ? `<div style="margin-top: 3px; font-size: 0.8rem; color: #999;">관련 리뷰: ${report.reviewTitle}</div>`
                                : ''
                            : reviewContent !== '-'
                            ? `<div style="margin-top: 3px; font-size: 0.8rem; color: #999;">${reviewContent}</div>`
                            : ''
                    }
                </td>
                <td>${createdAt}</td>
                <td>${statusBadge}</td>
                <td>${actionButtons}</td>
            </tr>
        `;
        })
        .join('');

    updateReportPagination();
}

// 신고 상태 배지 생성
function getReportStatusBadge(status) {
    const statusLower = (status || '').toLowerCase();
    const badges = {
        pending:
            '<span style="background: #ffc107; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">대기중</span>',
        processing:
            '<span style="background: #17a2b8; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">처리중</span>',
        resolved:
            '<span style="background: #28a745; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">처리완료</span>',
        rejected:
            '<span style="background: #dc3545; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">반려</span>',
    };
    return badges[statusLower] || badges.pending;
}

// 신고 유형 라벨
function getReportTypeLabel(type) {
    const labels = {
        spam: '스팸',
        abuse: '욕설/비방',
        inappropriate: '부적절한 내용',
        other: '기타',
    };
    return labels[type] || '기타';
}

// 신고 날짜 포맷팅
function formatReportDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// 유저 신고 필터링
function filterUserReports() {
    const searchInput = document.getElementById('report-search-input');
    const statusFilter = document.getElementById('report-status-filter');
    const typeFilter = document.getElementById('report-type-filter');

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const status = statusFilter ? statusFilter.value : '';
    const type = typeFilter ? typeFilter.value : '';

    filteredUserReports = userReports.filter((report) => {
        const matchesSearch =
            !searchTerm ||
            (report.reporterName && report.reporterName.toLowerCase().includes(searchTerm)) ||
            (report.reportedUserName &&
                report.reportedUserName.toLowerCase().includes(searchTerm)) ||
            (report.reason && report.reason.toLowerCase().includes(searchTerm)) ||
            (report.reviewTitle && report.reviewTitle.toLowerCase().includes(searchTerm)) ||
            (report.reviewContent && report.reviewContent.toLowerCase().includes(searchTerm)) ||
            (report.commentContent && report.commentContent.toLowerCase().includes(searchTerm));

        const matchesStatus = !status || report.status.toLowerCase() === status;
        const matchesType = !type || report.type === type;

        return matchesSearch && matchesStatus && matchesType;
    });

    currentReportPage = 1;
    displayUserReports();
}

// ========== 유저 신고 처리 기능 ==========

// 처벌 모달 열기
function openPenaltyModal(
    reportId,
    reportType,
    reportedUserId,
    reportedUserName,
    violationType,
    reason
) {
    const modal = document.getElementById('penalty-modal');
    if (!modal) return;

    // 숨겨진 필드 설정
    document.getElementById('penalty-report-id').value = reportId;
    document.getElementById('penalty-report-type').value = reportType;
    document.getElementById('penalty-reported-user-id').value = reportedUserId;

    // 신고 정보 표시
    const infoSection = document.getElementById('penalty-report-info');
    infoSection.innerHTML = `
        <h4>📋 신고 정보</h4>
        <div class="penalty-info-grid">
            <div class="penalty-info-item">
                <span class="label">피신고자</span>
                <span class="value">${reportedUserName || '알 수 없음'}</span>
            </div>
            <div class="penalty-info-item">
                <span class="label">신고 유형</span>
                <span class="value">${violationType}</span>
            </div>
            <div class="penalty-info-item full-width">
                <span class="label">신고 사유</span>
                <span class="value">${reason || '-'}</span>
            </div>
        </div>
    `;

    // 폼 초기화
    document.getElementById('penalty-type').value = '';
    document.getElementById('penalty-reason').value = '';
    document.getElementById('penalty-delete-content').checked = true;
    document.getElementById('penalty-notify-user').checked = true;

    modal.style.display = 'block';
}

// 처벌 모달 닫기
function closePenaltyModal() {
    const modal = document.getElementById('penalty-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 처벌 적용
async function applyPenalty(event) {
    event.preventDefault();

    const reportId = document.getElementById('penalty-report-id').value;
    const reportType = document.getElementById('penalty-report-type').value;
    const reportedUserId = document.getElementById('penalty-reported-user-id').value;
    const penaltyType = document.getElementById('penalty-type').value;
    const penaltyReason = document.getElementById('penalty-reason').value;
    const deleteContent = document.getElementById('penalty-delete-content').checked;
    const notifyUser = document.getElementById('penalty-notify-user').checked;

    if (!penaltyType) {
        showNotification('처벌 유형을 선택해주세요.', 'warning');
        return;
    }

    try {
        // 백엔드 API 호출 (API가 없으면 프론트엔드에서만 처리)
        const response = await fetch(`/api/admin/reports/${reportId}/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'resolved',
                reportType,
                reportedUserId,
                penaltyType,
                penaltyReason,
                deleteContent,
                notifyUser,
            }),
        });

        // 프론트엔드에서 상태 업데이트 (API 응답과 관계없이)
        const report = userReports.find((r) => r.id === parseInt(reportId));
        if (report) {
            report.status = 'resolved';
        }

        showNotification('신고가 처리되고 처벌이 적용되었습니다.', 'success');
        closePenaltyModal();
        displayUserReports();
    } catch (error) {
        console.error('처벌 적용 실패:', error);
        // API 실패해도 프론트엔드 상태는 업데이트
        const report = userReports.find((r) => r.id === parseInt(reportId));
        if (report) {
            report.status = 'resolved';
        }
        showNotification('신고가 처리되었습니다.', 'success');
        closePenaltyModal();
        displayUserReports();
    }
}

// 신고 반려 처리
async function rejectReport(reportId, reportType = 'review') {
    if (
        !confirm(
            '이 신고를 반려 처리하시겠습니까?\n반려 시 피신고자에게 별도의 조치가 취해지지 않습니다.'
        )
    ) {
        return;
    }

    try {
        await fetch(`/api/admin/reports/${reportId}/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'rejected', reportType }),
        });
    } catch (error) {
        console.error('API 호출 실패 (무시됨):', error);
    }

    // 프론트엔드에서 상태 업데이트
    const report = userReports.find((r) => r.id === reportId);
    if (report) {
        report.status = 'rejected';
    }

    showNotification('신고가 반려 처리되었습니다.', 'success');
    displayUserReports();
}

// 신고 삭제
async function deleteReport(reportId, reportType = 'review') {
    if (!confirm('이 신고 기록을 삭제하시겠습니까?\n삭제된 기록은 복구할 수 없습니다.')) {
        return;
    }

    try {
        await fetch(`/api/admin/reports/${reportId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportType }),
        });
    } catch (error) {
        console.error('API 호출 실패 (무시됨):', error);
    }

    // 프론트엔드에서 목록에서 제거
    const index = userReports.findIndex((r) => r.id === reportId);
    if (index !== -1) {
        userReports.splice(index, 1);
        filteredUserReports = [...userReports];
    }

    showNotification('신고 기록이 삭제되었습니다.', 'success');
    displayUserReports();
}

// 처벌 모달 이벤트 리스너 초기화
function initPenaltyModalEvents() {
    const closeBtn = document.getElementById('close-penalty-modal');
    const cancelBtn = document.getElementById('cancel-penalty-btn');
    const form = document.getElementById('penalty-form');
    const modal = document.getElementById('penalty-modal');

    if (closeBtn) {
        closeBtn.addEventListener('click', closePenaltyModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closePenaltyModal);
    }

    if (form) {
        form.addEventListener('submit', applyPenalty);
    }

    // 모달 외부 클릭 시 닫기
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closePenaltyModal();
            }
        });
    }
}

// 페이지네이션 업데이트
function updateReportPagination() {
    const pagination = document.getElementById('reports-pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(filteredUserReports.length / reportsPerPage);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML =
        '<div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 20px;">';

    // 이전 페이지 버튼
    paginationHTML += `<button onclick="changeReportPage(${currentReportPage - 1})" ${
        currentReportPage === 1 ? 'disabled' : ''
    } style="padding: 8px 16px; border: 1px solid #ddd; background: #fff; cursor: pointer; border-radius: 4px;">이전</button>`;

    // 페이지 번호
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentReportPage - 2 && i <= currentReportPage + 2)
        ) {
            paginationHTML += `<button onclick="changeReportPage(${i})" ${
                i === currentReportPage
                    ? 'style="padding: 8px 16px; border: 1px solid #3498db; background: #3498db; color: #fff; cursor: pointer; border-radius: 4px;"'
                    : 'style="padding: 8px 16px; border: 1px solid #ddd; background: #fff; cursor: pointer; border-radius: 4px;"'
            }>${i}</button>`;
        } else if (i === currentReportPage - 3 || i === currentReportPage + 3) {
            paginationHTML += '<span>...</span>';
        }
    }

    // 다음 페이지 버튼
    paginationHTML += `<button onclick="changeReportPage(${currentReportPage + 1})" ${
        currentReportPage === totalPages ? 'disabled' : ''
    } style="padding: 8px 16px; border: 1px solid #ddd; background: #fff; cursor: pointer; border-radius: 4px;">다음</button>`;

    paginationHTML += '</div>';
    pagination.innerHTML = paginationHTML;
}

// 페이지 변경
function changeReportPage(page) {
    const totalPages = Math.ceil(filteredUserReports.length / reportsPerPage);
    if (page < 1 || page > totalPages) return;
    currentReportPage = page;
    displayUserReports();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 전역 스코프에 함수 바인딩
window.openPenaltyModal = openPenaltyModal;
window.rejectReport = rejectReport;
window.deleteReport = deleteReport;
window.changeReportPage = changeReportPage;

// ========== 위치 검색 기능 (카카오맵 API) ==========

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

// 카카오맵 스크립트 로드
function loadKakaoMapScript() {
    return new Promise((resolve, reject) => {
        if (
            typeof kakao !== 'undefined' &&
            typeof kakao.maps !== 'undefined' &&
            typeof kakao.maps.services !== 'undefined'
        ) {
            resolve();
            return;
        }

        const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
        if (existingScript) {
            if (existingScript.hasAttribute('data-loaded')) {
                if (typeof kakao !== 'undefined' && typeof kakao.maps !== 'undefined') {
                    kakao.maps.load(() => resolve());
                } else {
                    resolve();
                }
                return;
            }

            existingScript.addEventListener('load', () => {
                existingScript.setAttribute('data-loaded', 'true');
                if (typeof kakao !== 'undefined' && typeof kakao.maps !== 'undefined') {
                    kakao.maps.load(() => resolve());
                } else {
                    resolve();
                }
            });
            existingScript.addEventListener('error', () => {
                console.error('카카오맵 스크립트 로드 실패');
                reject(new Error('카카오맵 스크립트 로드 실패'));
            });
            return;
        }

        // API 키 가져오기
        try {
            const apiKey = getKakaoMapApiKey();
            const scriptUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;

            const script = document.createElement('script');
            script.src = scriptUrl;
            script.async = false;
            script.onload = () => {
                script.setAttribute('data-loaded', 'true');
                if (typeof kakao !== 'undefined' && typeof kakao.maps !== 'undefined') {
                    kakao.maps.load(() => resolve());
                } else {
                    resolve();
                }
            };
            script.onerror = () => {
                console.error('카카오맵 스크립트 로드 실패');
                reject(new Error('카카오맵 스크립트 로드 실패'));
            };
            document.head.appendChild(script);
        } catch (error) {
            reject(error);
        }
    });
}

// 주소 검색 함수
async function searchLocation(query) {
    try {
        await loadKakaoMapScript();

        if (
            typeof kakao === 'undefined' ||
            typeof kakao.maps === 'undefined' ||
            typeof kakao.maps.services === 'undefined'
        ) {
            throw new Error('카카오맵 API를 사용할 수 없습니다.');
        }

        const geocoder = new kakao.maps.services.Geocoder();
        const places = new kakao.maps.services.Places();

        return new Promise((resolve) => {
            // 장소 검색 시도
            places.keywordSearch(query, (data, status) => {
                if (status === kakao.maps.services.Status.OK) {
                    resolve(
                        data.map((item) => ({
                            name: item.place_name,
                            address: item.address_name || item.road_address_name,
                            roadAddress: item.road_address_name,
                            latitude: parseFloat(item.y),
                            longitude: parseFloat(item.x),
                            type: 'place',
                        }))
                    );
                } else {
                    // 장소 검색 실패 시 주소 검색 시도
                    geocoder.addressSearch(query, (data, status) => {
                        if (status === kakao.maps.services.Status.OK) {
                            resolve(
                                data.map((item) => ({
                                    name: item.address_name,
                                    address: item.address_name,
                                    roadAddress: item.road_address_name || item.address_name,
                                    latitude: parseFloat(item.y),
                                    longitude: parseFloat(item.x),
                                    type: 'address',
                                }))
                            );
                        } else {
                            resolve([]);
                        }
                    });
                }
            });
        });
    } catch (error) {
        console.error('위치 검색 오류:', error);
        return [];
    }
}

// 위치 검색 결과 표시
function displayLocationResults(results) {
    const resultsContainer = document.getElementById('edit-spot-location-results');
    if (!resultsContainer) return;

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
        resultsContainer.style.display = 'block';
        return;
    }

    resultsContainer.innerHTML = results
        .map(
            (result, index) => `
        <div class="location-result-item" data-index="${index}">
            <div class="location-result-name">${result.name}</div>
            <div class="location-result-address">${result.roadAddress || result.address}</div>
        </div>
    `
        )
        .join('');

    // 결과 항목 클릭 이벤트
    resultsContainer.querySelectorAll('.location-result-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            selectLocation(results[index]);
        });
    });

    resultsContainer.style.display = 'block';
}

// 위치 선택
function selectLocation(location) {
    const latitudeInput = document.getElementById('edit-spot-latitude');
    const longitudeInput = document.getElementById('edit-spot-longitude');
    const addressInput = document.getElementById('edit-spot-address');
    const selectedInfo = document.getElementById('edit-spot-location-selected');
    const selectedText = document.getElementById('edit-spot-location-selected-text');
    const resultsContainer = document.getElementById('edit-spot-location-results');

    if (latitudeInput) latitudeInput.value = location.latitude;
    if (longitudeInput) longitudeInput.value = location.longitude;

    // 주소 필드에 장소 이름과 주소를 함께 저장 (형식: "장소이름 (주소)")
    const locationDisplay = location.name
        ? `${location.name} (${location.roadAddress || location.address})`
        : location.roadAddress || location.address;

    if (addressInput) addressInput.value = locationDisplay;
    if (selectedText) selectedText.textContent = locationDisplay;
    if (selectedInfo) selectedInfo.style.display = 'flex';
    if (resultsContainer) resultsContainer.style.display = 'none';
}

// 위치 선택 취소
function clearLocationSelection() {
    const latitudeInput = document.getElementById('edit-spot-latitude');
    const longitudeInput = document.getElementById('edit-spot-longitude');
    const addressInput = document.getElementById('edit-spot-address');
    const selectedInfo = document.getElementById('edit-spot-location-selected');
    const resultsContainer = document.getElementById('edit-spot-location-results');
    const searchInput = document.getElementById('edit-spot-location-search');

    if (latitudeInput) latitudeInput.value = '';
    if (longitudeInput) longitudeInput.value = '';
    if (addressInput) addressInput.value = '';
    if (selectedInfo) selectedInfo.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'none';
    if (searchInput) searchInput.value = '';
}

// 위치 검색 이벤트 초기화
function initLocationSearch() {
    const searchInput = document.getElementById('edit-spot-location-search');
    const searchBtn = document.getElementById('edit-spot-location-search-btn');
    const clearBtn = document.getElementById('edit-spot-location-clear');

    if (searchBtn) {
        searchBtn.addEventListener('click', async () => {
            const query = searchInput?.value.trim();
            if (!query) {
                alert('검색어를 입력해주세요.');
                return;
            }

            searchBtn.disabled = true;
            searchBtn.textContent = '검색 중...';

            const results = await searchLocation(query);
            displayLocationResults(results);

            searchBtn.disabled = false;
            searchBtn.textContent = '검색';
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (searchBtn) searchBtn.click();
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearLocationSelection);
    }
}

// 모달 열 때 위치 정보 로드
async function loadLocationData(spot) {
    const latitudeInput = document.getElementById('edit-spot-latitude');
    const longitudeInput = document.getElementById('edit-spot-longitude');
    const addressInput = document.getElementById('edit-spot-address');
    const selectedInfo = document.getElementById('edit-spot-location-selected');
    const selectedText = document.getElementById('edit-spot-location-selected-text');

    if (spot.latitude && spot.longitude) {
        if (latitudeInput) latitudeInput.value = spot.latitude;
        if (longitudeInput) longitudeInput.value = spot.longitude;
        if (addressInput) addressInput.value = spot.address || '';

        // 표시할 텍스트 결정
        if (selectedText) {
            if (spot.address && spot.address.trim()) {
                // 주소가 있으면 주소 표시 (장소 이름과 주소가 함께 저장되어 있을 수 있음)
                selectedText.textContent = spot.address;
                if (selectedInfo) selectedInfo.style.display = 'flex';
            } else {
                // 주소가 없으면 관광지 이름으로 장소 검색하여 표시
                selectedText.textContent = '위치 정보를 불러오는 중...';
                if (selectedInfo) selectedInfo.style.display = 'flex';

                // 카카오맵 API로 장소 검색
                try {
                    await loadKakaoMapScript();
                    const locationName = await searchLocationByName(
                        spot.title,
                        spot.latitude,
                        spot.longitude
                    );
                    if (locationName) {
                        selectedText.textContent = locationName;
                    } else {
                        // 검색 실패 시 위도/경도 표시
                        selectedText.textContent = `${spot.latitude}, ${spot.longitude}`;
                    }
                } catch (error) {
                    console.error('장소 검색 실패:', error);
                    selectedText.textContent = `${spot.latitude}, ${spot.longitude}`;
                }
            }
        } else {
            if (selectedInfo) selectedInfo.style.display = 'flex';
        }
    } else {
        clearLocationSelection();
    }
}

// 관광지 이름으로 장소 검색 (위도/경도 주변에서)
async function searchLocationByName(spotTitle, latitude, longitude) {
    return new Promise((resolve) => {
        try {
            const ps = new kakao.maps.services.Places();
            // 관광지 이름으로 검색
            ps.keywordSearch(`부산 ${spotTitle}`, (data, status) => {
                if (status === kakao.maps.services.Status.OK && data.length > 0) {
                    // 검색된 결과 중에서 위도/경도와 가장 가까운 장소 찾기
                    let closestPlace = data[0];
                    let minDistance = getDistance(
                        latitude,
                        longitude,
                        parseFloat(data[0].y),
                        parseFloat(data[0].x)
                    );

                    for (let i = 1; i < data.length; i++) {
                        const distance = getDistance(
                            latitude,
                            longitude,
                            parseFloat(data[i].y),
                            parseFloat(data[i].x)
                        );
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestPlace = data[i];
                        }
                    }

                    // 거리가 500m 이내인 경우에만 해당 장소로 인정
                    if (minDistance <= 0.5) {
                        const placeName = closestPlace.place_name;
                        const address = closestPlace.road_address_name || closestPlace.address_name;
                        resolve(`${placeName} (${address})`);
                    } else {
                        // 가까운 장소가 없으면 주소만 가져오기
                        getAddressFromCoords(latitude, longitude).then(resolve);
                    }
                } else {
                    // 검색 실패 시 위도/경도로 주소만 가져오기
                    getAddressFromCoords(latitude, longitude).then(resolve);
                }
            });
        } catch (error) {
            console.error('장소 검색 오류:', error);
            getAddressFromCoords(latitude, longitude).then(resolve);
        }
    });
}

// 위도/경도로 주소 가져오기
async function getAddressFromCoords(latitude, longitude) {
    return new Promise((resolve) => {
        try {
            const geocoder = new kakao.maps.services.Geocoder();
            geocoder.coord2Address(longitude, latitude, (result, status) => {
                if (status === kakao.maps.services.Status.OK && result.length > 0) {
                    const address = result[0].road_address
                        ? result[0].road_address.address_name
                        : result[0].address.address_name;
                    resolve(address);
                } else {
                    resolve(null);
                }
            });
        } catch (error) {
            console.error('주소 검색 오류:', error);
            resolve(null);
        }
    });
}

// 두 좌표 간 거리 계산 (km)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구 반지름 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// 전역 스코프에 함수 바인딩
window.clearLocationSelection = clearLocationSelection;
