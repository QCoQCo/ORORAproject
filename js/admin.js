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
        window.location.href = '/index.html';
        return;
    }

    await loadTouristSpots();
    await initializeUsers();
    initializeTabs();
    initializeEventListeners();
    loadHeaderComponent();
}

// 헤더 컴포넌트 로드
function loadHeaderComponent() {
    // header-loader.js의 loadHeader 함수 사용
    if (typeof loadHeader === 'function') {
        loadHeader();
    } else {
        // fallback: 직접 헤더 로드
        fetch('../../components/header.html')
            .then((response) => response.text())
            .then((data) => {
                document.getElementById('header-container').innerHTML = data;

                // 헤더 로드 후 네비게이션 기능 초기화
                if (typeof initMobileMenu === 'function') {
                    initMobileMenu();
                }

                // 헤더 로드 후 사용자 상태에 따라 헤더 업데이트
                if (typeof updateHeader === 'function') {
                    updateHeader();
                }
            })
            .catch((error) => {
                console.error('헤더 로드 실패:', error);
            });
    }
}

// 관광지 데이터 로드
async function loadTouristSpots() {
    try {
        // TODO: 백엔드 연결 시 수정 필요 - API 엔드포인트로 변경
        // 예: const response = await fetch('/api/admin/tourist-spots');
        const response = await fetch('../../data/busanTouristSpots.json');
        const data = await response.json();
        touristSpots = data.regions || {};
        displayTouristSpots();
        updateStatistics();
    } catch (error) {
        console.error('관광지 데이터 로드 실패:', error);
        showNotification('데이터를 불러오는데 실패했습니다.', 'error');
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
        });
    });
}

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 검색 기능
    const searchInput = document.getElementById('search-input');
    const regionFilter = document.getElementById('region-filter');

    searchInput.addEventListener('input', filterTouristSpots);
    regionFilter.addEventListener('change', filterTouristSpots);

    // 관광지 추가 폼
    const addForm = document.getElementById('add-tourist-spot-form');
    addForm.addEventListener('submit', handleAddTouristSpot);

    // 수정 폼
    const editForm = document.getElementById('edit-tourist-spot-form');
    editForm.addEventListener('submit', handleEditTouristSpot);

    // 모달 닫기
    const closeModal = document.getElementById('close-modal');
    const modal = document.getElementById('edit-modal');

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 사용자 관리 이벤트 리스너
    initializeUserEventListeners();
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
                const card = createTouristSpotCard(spot, regionKey, index, region.name);
                grid.appendChild(card);
            });
        }
    });
}

// 관광지 카드 생성
function createTouristSpotCard(spot, regionKey, index, regionName) {
    const card = document.createElement('div');
    card.className = 'tourist-spot-card';

    const category = getCategoryFromHashtags(spot.hashtags);
    const hashtags = spot.hashtags ? spot.hashtags.join(' ') : '';

    card.innerHTML = `
        <h3>${spot.title}</h3>
        <div class="spot-category">${regionName} (${categoryNames[category]})</div>
        <div class="spot-info">
            해시태그: ${hashtags}
        </div>
        <div class="spot-description">${spot.description}</div>
        <div class="spot-actions">
            <button class="edit-btn" onclick="openEditModal('${regionKey}', ${index})">수정</button>
            <button class="delete-btn" onclick="deleteTouristSpot('${regionKey}', ${index})">삭제</button>
        </div>
    `;

    return card;
}

// 관광지 필터링
function filterTouristSpots() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
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
function handleAddTouristSpot(event) {
    event.preventDefault();

    const regionKey = document.getElementById('spot-region').value;
    const hashtags = document
        .getElementById('spot-hashtags')
        .value.split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .map((tag) => (tag.startsWith('#') ? tag.substring(1) : tag));

    const newSpot = {
        title: document.getElementById('spot-title').value,
        description: document.getElementById('spot-description').value,
        hashtags: hashtags,
        img: document.getElementById('spot-img').value || '../../images/common.jpg',
        link: document.getElementById('spot-link').value || '#',
    };

    if (!touristSpots[regionKey]) {
        touristSpots[regionKey] = {
            name: regionNames[regionKey] || regionKey,
            code: '',
            spots: [],
        };
    }

    if (!touristSpots[regionKey].spots) {
        touristSpots[regionKey].spots = [];
    }

    touristSpots[regionKey].spots.push(newSpot);

    // 폼 초기화
    event.target.reset();

    // 목록 갱신
    displayTouristSpots();
    updateStatistics();

    showNotification('관광지가 성공적으로 추가되었습니다!', 'success');
}

// 수정 모달 열기
function openEditModal(regionKey, index) {
    const spot = touristSpots[regionKey].spots[index];
    currentEditRegion = regionKey;
    currentEditIndex = index;

    // 폼에 기존 데이터 입력
    document.getElementById('edit-spot-title').value = spot.title;
    document.getElementById('edit-spot-region').value = regionKey;
    document.getElementById('edit-spot-description').value = spot.description;
    document.getElementById('edit-spot-hashtags').value = spot.hashtags
        ? spot.hashtags.join(', ')
        : '';
    document.getElementById('edit-spot-img').value = spot.img || '';
    document.getElementById('edit-spot-link').value = spot.link || '';

    // 모달 표시
    document.getElementById('edit-modal').style.display = 'block';
}

// 관광지 수정
function handleEditTouristSpot(event) {
    event.preventDefault();

    if (currentEditRegion === null || currentEditIndex === null) {
        return;
    }

    const hashtags = document
        .getElementById('edit-spot-hashtags')
        .value.split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .map((tag) => (tag.startsWith('#') ? tag.substring(1) : tag));

    const updatedSpot = {
        title: document.getElementById('edit-spot-title').value,
        description: document.getElementById('edit-spot-description').value,
        hashtags: hashtags,
        img: document.getElementById('edit-spot-img').value || '../../images/common.jpg',
        link: document.getElementById('edit-spot-link').value || '#',
    };

    const newRegion = document.getElementById('edit-spot-region').value;

    // 지역이 변경된 경우
    if (newRegion !== currentEditRegion) {
        // 기존 지역에서 제거
        touristSpots[currentEditRegion].spots.splice(currentEditIndex, 1);

        // 새 지역에 추가
        if (!touristSpots[newRegion]) {
            touristSpots[newRegion] = {
                name: regionNames[newRegion] || newRegion,
                code: '',
                spots: [],
            };
        }
        if (!touristSpots[newRegion].spots) {
            touristSpots[newRegion].spots = [];
        }
        touristSpots[newRegion].spots.push(updatedSpot);
    } else {
        // 같은 지역 내에서 수정
        touristSpots[currentEditRegion].spots[currentEditIndex] = updatedSpot;
    }

    // 모달 닫기
    document.getElementById('edit-modal').style.display = 'none';

    // 목록 갱신
    displayTouristSpots();
    updateStatistics();

    showNotification('관광지 정보가 성공적으로 수정되었습니다!', 'success');

    // 편집 상태 초기화
    currentEditRegion = null;
    currentEditIndex = null;
}

// 관광지 삭제
function deleteTouristSpot(regionKey, index) {
    if (confirm('정말로 이 관광지를 삭제하시겠습니까?')) {
        touristSpots[regionKey].spots.splice(index, 1);

        // 지역에 관광지가 없으면 spots 배열만 비워둠 (지역 정보는 유지)
        if (touristSpots[regionKey].spots.length === 0) {
            touristSpots[regionKey].spots = [];
        }

        displayTouristSpots();
        updateStatistics();

        showNotification('관광지가 성공적으로 삭제되었습니다!', 'success');
    }
}

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

// ========== 사용자 관리 기능 ==========

// 사용자 데이터 초기화 (JSON 파일에서 로드)
async function initializeUsers() {
    try {
        // TODO: 백엔드 연결 시 수정 필요 - API 엔드포인트로 변경
        // 예: const response = await fetch('/api/admin/users');
        const response = await fetch('../../data/users.json');
        const data = await response.json();
        users = data.users;
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
    document.getElementById('add-user-modal').style.display = 'block';
}

// 사용자 추가 처리
function handleAddUser(event) {
    event.preventDefault();

    const newUser = {
        id: Math.max(...users.map((u) => u.id)) + 1,
        username: document.getElementById('new-username').value,
        email: document.getElementById('new-email').value,
        role: document.getElementById('new-user-role').value,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: '-',
    };

    // 중복 확인
    if (users.some((u) => u.username === newUser.username || u.email === newUser.email)) {
        showNotification('이미 존재하는 사용자명 또는 이메일입니다.', 'error');
        return;
    }

    users.push(newUser);
    filteredUsers = [...users];

    // 폼 초기화 및 모달 닫기
    event.target.reset();
    document.getElementById('add-user-modal').style.display = 'none';

    displayUsers();
    updateUserStatistics();
    showNotification('새 사용자가 성공적으로 추가되었습니다!', 'success');
}

// 사용자 수정 모달 열기
function openEditUserModal(userId) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    currentEditUserId = userId;

    document.getElementById('edit-username').value = user.username;
    document.getElementById('edit-email').value = user.email;
    document.getElementById('edit-user-role').value = user.role;
    document.getElementById('edit-user-status').value = user.status;

    document.getElementById('edit-user-modal').style.display = 'block';
}

// 사용자 수정 처리
function handleEditUser(event) {
    event.preventDefault();

    if (!currentEditUserId) return;

    const userIndex = users.findIndex((u) => u.id === currentEditUserId);
    if (userIndex === -1) return;

    const updatedUsername = document.getElementById('edit-username').value;
    const updatedEmail = document.getElementById('edit-email').value;

    // 중복 확인 (자신 제외)
    const duplicateUser = users.find(
        (u) =>
            u.id !== currentEditUserId &&
            (u.username === updatedUsername || u.email === updatedEmail)
    );

    if (duplicateUser) {
        showNotification('이미 존재하는 사용자명 또는 이메일입니다.', 'error');
        return;
    }

    users[userIndex] = {
        ...users[userIndex],
        username: updatedUsername,
        email: updatedEmail,
        role: document.getElementById('edit-user-role').value,
        status: document.getElementById('edit-user-status').value,
    };

    filteredUsers = [...users];

    // 모달 닫기
    document.getElementById('edit-user-modal').style.display = 'none';
    currentEditUserId = null;

    displayUsers();
    updateUserStatistics();
    showNotification('사용자 정보가 성공적으로 수정되었습니다!', 'success');
}

// 사용자 상태 토글
function toggleUserStatus(userId) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (user.status === 'active') {
        user.status = 'inactive';
    } else if (user.status === 'inactive') {
        user.status = 'active';
    } else {
        user.status = 'active'; // suspended -> active
    }

    filteredUsers = [...users];
    displayUsers();
    updateUserStatistics();
    showNotification(`사용자 ${user.username}의 상태가 변경되었습니다.`, 'success');
}

// 사용자 삭제
function deleteUser(userId) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (confirm(`정말로 사용자 "${user.username}"을(를) 삭제하시겠습니까?`)) {
        users = users.filter((u) => u.id !== userId);
        filteredUsers = [...users];
        displayUsers();
        updateUserStatistics();
        showNotification('사용자가 성공적으로 삭제되었습니다!', 'success');
    }
}

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
        const modals = ['edit-modal', 'add-user-modal', 'edit-user-modal'];
        modals.forEach((modalId) => {
            const modal = document.getElementById(modalId);
            if (modal && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
});
//관리자로 로그인 후 관리자 페이지 접근시 헤더에서 로그인 버튼이 표시되는 버그
