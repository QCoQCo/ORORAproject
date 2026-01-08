// 관리자 페이지 JavaScript

// 전역 변수
let touristSpots = {};
let currentEditIndex = null;
let currentEditRegion = null;

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

// 카테고리 한글 매핑
const categoryNames = {
    beach: '해변',
    mountain: '산/공원',
    culture: '문화',
    food: '전통시장',
    shopping: '쇼핑',
};

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

                // 해시태그는 백엔드에서 전달받은 데이터 사용
                touristSpots[regionKey].spots.push({
                    id: spot.id,
                    title: spot.title,
                    description: spot.description || '',
                    hashtags: spot.hashtags || [], // 백엔드에서 해시태그 배열 전달
                    img: '', // TODO: 이미지 API 추가 시 수정
                    link: spot.linkUrl || '#',
                    categoryCode: spot.categoryCode,
                    isActive: spot.isActive,
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

// 탭 기능 초기화
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // 모든 탭 버튼과 콘텐츠 비활성화
            tabButtons.forEach((btn) => btn.classList.remove('active'));
            tabContents.forEach((content) => content.classList.remove('active'));

            // 선택된 탭 활성화
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');

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
        });
    });
}

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 검색 기능
    const searchInput = document.getElementById('admin-search-input');
    const regionFilter = document.getElementById('region-filter');

    if (searchInput) {
        searchInput.addEventListener('input', filterTouristSpots);
    }
    if (regionFilter) {
        regionFilter.addEventListener('change', filterTouristSpots);
    }

    // 관광지 추가 폼
    const addForm = document.getElementById('add-tourist-spot-form');
    if (addForm) {
        addForm.addEventListener('submit', handleAddTouristSpot);
    }

    // 수정 폼
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

    // 사용자 추가 폼
    const addUserForm = document.getElementById('add-user-form');
    if (addUserForm) addUserForm.addEventListener('submit', handleAddUser);

    // 사용자 수정 폼
    const editUserForm = document.getElementById('edit-user-form');
    if (editUserForm) editUserForm.addEventListener('submit', handleEditUser);

    // 사용자 모달 닫기
    const closeAddUserModal = document.getElementById('close-add-user-modal');
    const closeEditUserModal = document.getElementById('close-edit-user-modal');
    const addUserModal = document.getElementById('add-user-modal');
    const editUserModal = document.getElementById('edit-user-modal');

    if (closeAddUserModal) {
        closeAddUserModal.addEventListener('click', () => {
            addUserModal.style.display = 'none';
        });
    }

    if (closeEditUserModal) {
        closeEditUserModal.addEventListener('click', () => {
            editUserModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === addUserModal) {
            addUserModal.style.display = 'none';
        }
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
function createTouristSpotCard(spot, regionKey, spotId, regionName) {
    const card = document.createElement('div');
    card.className = 'tourist-spot-card';

    const category = spot.categoryCode
        ? spot.categoryCode.toLowerCase()
        : getCategoryFromHashtags(spot.hashtags);

    // 해시태그 배열을 문자열로 변환 (# 접두사 추가)
    let hashtagsDisplay = '없음';
    if (spot.hashtags && Array.isArray(spot.hashtags) && spot.hashtags.length > 0) {
        hashtagsDisplay = spot.hashtags
            .map((tag) => {
                // 이미 #이 있으면 그대로, 없으면 추가
                return tag.startsWith('#') ? tag : '#' + tag;
            })
            .join(' ');
    }

    card.innerHTML = `
        <h3>${spot.title}</h3>
        <div class="spot-category">${regionName} (${categoryNames[category] || category})</div>
        <div class="spot-info">
            해시태그: ${hashtagsDisplay}
        </div>
        <div class="spot-description">${spot.description || ''}</div>
        <div class="spot-actions">
            <button class="edit-btn" onclick="openEditModal('${regionKey}', ${spotId})">수정</button>
            <button class="delete-btn" onclick="deleteTouristSpot('${regionKey}', ${spotId})">삭제</button>
        </div>
    `;

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

// 관광지 추가
async function handleAddTouristSpot(event) {
    event.preventDefault();

    const regionKey = document.getElementById('spot-region').value;
    const hashtags = document
        .getElementById('spot-hashtags')
        .value.split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .map((tag) => (tag.startsWith('#') ? tag.substring(1) : tag));

    const requestData = {
        regionKey: regionKey,
        title: document.getElementById('spot-title').value,
        description: document.getElementById('spot-description').value,
        hashtags: hashtags,
        linkUrl: document.getElementById('spot-link').value || '#',
        categoryCode: 'CULTURE', // 기본값, 필요시 수정
    };

    try {
        const response = await fetch('/api/admin/tourist-spots', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        const data = await response.json();

        if (data.success) {
            // 폼 초기화
            event.target.reset();

            // 목록 갱신
            await loadTouristSpots();
            updateStatistics();

            showNotification('관광지가 성공적으로 추가되었습니다!', 'success');
        } else {
            showNotification(data.message || '관광지 추가에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('관광지 추가 실패:', error);
        showNotification('관광지 추가 중 오류가 발생했습니다.', 'error');
    }
}

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

        currentEditRegion = regionKey;
        currentEditIndex = foundIndex;

        // 폼에 기존 데이터 입력
        const titleInput = document.getElementById('edit-spot-title');
        const regionSelect = document.getElementById('edit-spot-region');
        const descriptionTextarea = document.getElementById('edit-spot-description');
        const hashtagsInput = document.getElementById('edit-spot-hashtags');
        const imgInput = document.getElementById('edit-spot-img');
        const linkInput = document.getElementById('edit-spot-link');

        if (titleInput) titleInput.value = spot.title;
        if (regionSelect) regionSelect.value = regionKey;
        if (descriptionTextarea) descriptionTextarea.value = spot.description || '';
        if (hashtagsInput) hashtagsInput.value = spot.hashtags ? spot.hashtags.join(', ') : '';
        if (imgInput) imgInput.value = spot.img || '';
        if (linkInput) linkInput.value = spot.link || '';

        // 모달 표시
        editModal.style.display = 'block';
    };

    tryOpenModal();
}

// 전역 스코프에 함수 바인딩 (인라인 onclick 핸들러에서 접근 가능하도록)
window.openEditModal = openEditModal;

// 관광지 수정
async function handleEditTouristSpot(event) {
    event.preventDefault();

    if (currentEditRegion === null || currentEditIndex === null) {
        return;
    }

    // spotId 가져오기
    const spot = touristSpots[currentEditRegion].spots[currentEditIndex];
    if (!spot || !spot.id) {
        showNotification('관광지 정보를 찾을 수 없습니다.', 'error');
        return;
    }

    const spotId = spot.id;
    const hashtags = document
        .getElementById('edit-spot-hashtags')
        .value.split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .map((tag) => (tag.startsWith('#') ? tag.substring(1) : tag));

    const newRegion = document.getElementById('edit-spot-region').value;

    const requestData = {
        regionKey: newRegion,
        title: document.getElementById('edit-spot-title').value,
        description: document.getElementById('edit-spot-description').value,
        hashtags: hashtags,
        linkUrl: document.getElementById('edit-spot-link').value || '#',
        categoryCode: spot.categoryCode || 'CULTURE',
    };

    try {
        const response = await fetch(`/api/admin/tourist-spots/${spotId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        const data = await response.json();

        if (data.success) {
            // 모달 닫기
            document.getElementById('edit-modal').style.display = 'none';

            // 목록 갱신
            await loadTouristSpots();
            updateStatistics();

            showNotification('관광지 정보가 성공적으로 수정되었습니다!', 'success');

            // 편집 상태 초기화
            currentEditRegion = null;
            currentEditIndex = null;
        } else {
            showNotification(data.message || '관광지 수정에 실패했습니다.', 'error');
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

            // 카테고리별 통계
            region.spots.forEach((spot) => {
                const category = getCategoryFromHashtags(spot.hashtags);
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
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

    Object.keys(categoryNames).forEach((category) => {
        const count = categoryCounts[category] || 0;

        const chartBar = document.createElement('div');
        chartBar.className = 'chart-bar';
        chartBar.innerHTML = `
            <div class="category-name">${categoryNames[category]}</div>
            <div class="category-count">${count}</div>
        `;

        // 카테고리별 색상 적용
        const colors = {
            beach: 'linear-gradient(135deg, #3498db, #2980b9)',
            mountain: 'linear-gradient(135deg, #27ae60, #2ecc71)',
            culture: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
            food: 'linear-gradient(135deg, #f39c12, #e67e22)',
            shopping: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        };

        if (colors[category]) {
            chartBar.style.background = colors[category];
        }

        chartContainer.appendChild(chartBar);
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

// 사용자 추가 모달 열기
function openAddUserModal() {
    const tryOpenModal = () => {
        const addUserModal = document.getElementById('add-user-modal');
        if (!addUserModal) {
            // 모달이 아직 로드되지 않았다면 잠시 후 다시 시도
            setTimeout(tryOpenModal, 100);
            return;
        }
        addUserModal.style.display = 'block';
    };
    tryOpenModal();
}

// 전역 스코프에 함수 바인딩
window.openAddUserModal = openAddUserModal;

// 사용자 추가 처리
async function handleAddUser(event) {
    event.preventDefault();

    const requestData = {
        loginId: document.getElementById('new-username').value, // 임시로 username을 loginId로 사용
        username: document.getElementById('new-username').value,
        email: document.getElementById('new-email').value,
        role: document.getElementById('new-user-role').value,
        password: document.getElementById('new-password').value,
    };

    try {
        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        const data = await response.json();

        if (data.success) {
            // 폼 초기화 및 모달 닫기
            event.target.reset();
            document.getElementById('add-user-modal').style.display = 'none';

            // 목록 갱신
            await initializeUsers();
            displayUsers();
            updateUserStatistics();

            showNotification('새 사용자가 성공적으로 추가되었습니다!', 'success');
        } else {
            showNotification(data.message || '사용자 추가에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('사용자 추가 실패:', error);
        showNotification('사용자 추가 중 오류가 발생했습니다.', 'error');
    }
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
            'add-user-modal',
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
                <button class="delete-btn" onclick="deleteCodeGroup(${group.id})">삭제</button>
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

    commonCodes.forEach((code) => {
        const row = document.createElement('tr');
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
                <button class="edit-btn" onclick="openEditCodeModal(${code.id})">수정</button>
                <button class="delete-btn" onclick="deleteCode(${code.id})">삭제</button>
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
    document.getElementById('edit-group-active').value = group.isActive ? 'true' : 'false';
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

    currentEditCodeId = codeId;
    document.getElementById('edit-code-group-code').value = code.groupCode;
    document.getElementById('edit-code-code').value = code.code;
    document.getElementById('edit-code-name').value = code.codeName || '';
    document.getElementById('edit-code-name-en').value = code.codeNameEn || '';
    document.getElementById('edit-code-name-jp').value = code.codeNameJp || '';
    document.getElementById('edit-code-description').value = code.description || '';
    document.getElementById('edit-code-sort-order').value = code.sortOrder || 0;
    document.getElementById('edit-code-active').value = code.isActive ? 'true' : 'false';
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
        const formData = {
            groupName: document.getElementById('edit-group-name').value,
            groupNameEn: document.getElementById('edit-group-name-en').value,
            groupNameJp: document.getElementById('edit-group-name-jp').value,
            description: document.getElementById('edit-group-description').value,
            sortOrder: parseInt(document.getElementById('edit-group-sort-order').value) || 0,
            isActive: document.getElementById('edit-group-active').value === 'true',
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

// 코드 그룹 삭제
async function deleteCodeGroup(groupId) {
    if (
        !confirm('코드 그룹을 삭제하면 해당 그룹의 모든 코드도 삭제됩니다. 정말 삭제하시겠습니까?')
    ) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/common-code-groups/${groupId}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        if (data.success) {
            showNotification('코드 그룹이 삭제되었습니다.', 'success');
            await loadCommonCodeGroups();
            await loadCommonCodes();
        } else {
            throw new Error(data.message || '코드 그룹 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('코드 그룹 삭제 실패:', error);
        showNotification(error.message || '코드 그룹 삭제에 실패했습니다.', 'error');
    }
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

// 코드 삭제
async function deleteCode(codeId) {
    if (!confirm('코드를 삭제하시겠습니까?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/common-codes/${codeId}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        if (data.success) {
            showNotification('코드가 삭제되었습니다.', 'success');
            await loadCommonCodes();
        } else {
            throw new Error(data.message || '코드 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('코드 삭제 실패:', error);
        showNotification(error.message || '코드 삭제에 실패했습니다.', 'error');
    }
}

// 전역 스코프에 함수 바인딩
window.openAddGroupModal = openAddGroupModal;
window.openEditGroupModal = openEditGroupModal;
window.openAddCodeModal = openAddCodeModal;
window.openEditCodeModal = openEditCodeModal;
window.deleteCodeGroup = deleteCodeGroup;
window.deleteCode = deleteCode;

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
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">신청 내역이 없습니다.</td></tr>';
        updateRequestPagination();
        return;
    }

    tbody.innerHTML = paginatedRequests.map((request) => {
        const statusBadge = getStatusBadge(request.status);
        let typeLabel = '관광지 추가';
        if (request.type === 'photo') {
            typeLabel = '사진 추가';
        } else if (request.type === 'edit') {
            typeLabel = '정보 수정';
        }
        const createdAt = formatDate(request.createdAt);
        const description = request.description || '-';
        const imagePreview = request.imageUrl 
            ? `<img src="${request.imageUrl}" alt="신청 사진" style="max-width: 100px; max-height: 100px; cursor: pointer; border-radius: 4px; border: 1px solid #ddd;" onclick="openImageModal('${request.imageUrl}')">`
            : '-';

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
                <td>
                    ${request.status === 'pending' ? `
                        <button class="approve-btn" onclick="approveSpotRequest(${request.id})" style="margin-right: 5px;">승인</button>
                        <button class="reject-btn" onclick="rejectSpotRequest(${request.id})">거부</button>
                    ` : `
                        <span style="color: #999;">처리 완료</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');

    updateRequestPagination();
}

// 상태 배지 생성
function getStatusBadge(status) {
    const badges = {
        pending: '<span style="background: #ffc107; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">대기중</span>',
        approved: '<span style="background: #28a745; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">승인됨</span>',
        rejected: '<span style="background: #dc3545; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">거부됨</span>'
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
        minute: '2-digit'
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
        const matchesSearch = !searchTerm || 
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

    let paginationHTML = '<div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 20px;">';
    
    // 이전 페이지 버튼
    paginationHTML += `<button onclick="changeRequestPage(${currentRequestPage - 1})" ${currentRequestPage === 1 ? 'disabled' : ''} style="padding: 8px 16px; border: 1px solid #ddd; background: #fff; cursor: pointer; border-radius: 4px;">이전</button>`;
    
    // 페이지 번호
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentRequestPage - 2 && i <= currentRequestPage + 2)) {
            paginationHTML += `<button onclick="changeRequestPage(${i})" ${i === currentRequestPage ? 'style="padding: 8px 16px; border: 1px solid #3498db; background: #3498db; color: #fff; cursor: pointer; border-radius: 4px;"' : 'style="padding: 8px 16px; border: 1px solid #ddd; background: #fff; cursor: pointer; border-radius: 4px;"'}>${i}</button>`;
        } else if (i === currentRequestPage - 3 || i === currentRequestPage + 3) {
            paginationHTML += '<span>...</span>';
        }
    }
    
    // 다음 페이지 버튼
    paginationHTML += `<button onclick="changeRequestPage(${currentRequestPage + 1})" ${currentRequestPage === totalPages ? 'disabled' : ''} style="padding: 8px 16px; border: 1px solid #ddd; background: #fff; cursor: pointer; border-radius: 4px;">다음</button>`;
    
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
                'Content-Type': 'application/json'
            }
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
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reason: reason || '사유 없음'
            })
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
    modal.style.cssText = 'position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center;';
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

//관리자로 로그인 후 관리자 페이지 접근시 헤더에서 로그인 버튼이 표시되는 버그
