// 마이페이지 JavaScript

// XSS 방지: 사용자 입력값을 innerHTML에 넣기 전에 반드시 이스케이프
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// 전역 변수: 다른 유저의 프로필인지 여부
let isViewingOtherProfile = false;
let viewingUserId = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async function () {
    // 다른 유저의 프로필 보기인지 확인
    const contentDiv = document.querySelector('[layout\\:fragment="content"]') || 
                       document.querySelector('[data-profile-user-id]');
    const profileUserId = contentDiv?.getAttribute('data-profile-user-id');
    
    if (profileUserId && profileUserId !== 'null' && profileUserId !== '') {
        // 다른 유저의 프로필 보기 모드
        isViewingOtherProfile = true;
        viewingUserId = parseInt(profileUserId);
        
        // 현재 로그인한 사용자와 비교
        const currentUser = getCurrentUser();
        if (currentUser && Number(currentUser.id) === viewingUserId) {
            // 본인의 프로필이면 마이페이지로 리다이렉트
            window.location.href = '/pages/mypage/mypage';
            return;
        }
        
        // 다른 유저 프로필 표시
        await displayOtherUserProfile(viewingUserId);
        
        // 탭 기능 초기화 (제한된 탭만)
        initTabsForOtherProfile();
        
        // 해당 유저의 리뷰 데이터 로드 (작성 리뷰 + 좋아요 누른 리뷰)
        await Promise.all([loadUserReviews(viewingUserId), loadLikedReviews(viewingUserId)]);
    } else {
        // 본인의 마이페이지 모드
        // 서버에서 로그인 상태 확인
        const isLoggedInStatus = await isLoggedInAsync();
        if (!isLoggedInStatus) {
            alert('로그인이 필요합니다.');
            window.location.href = '/pages/login/login';
            return;
        }

        // 사용자 정보 표시
        displayUserInfo();

        // 탭 기능 초기화
        initTabs();

        // 데이터 로드
        loadUserData();
    }
});

// 사용자 정보 표시
async function displayUserInfo() {
    const user = getCurrentUser();
    if (!user) return;

    try {
        // 최신 사용자 정보를 API에서 가져오기
        const response = await fetch(`/api/users/${user.id}`);

        // 응답이 HTML인지 확인 (인증/권한 문제로 로그인 페이지가 반환된 경우)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            throw new Error('인증이 필요합니다. 로그인해주세요.');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.user) {
            const userInfo = data.user;

            // 사용자 정보 업데이트
            document.getElementById('user-name').textContent = userInfo.username;
            document.getElementById('user-email').textContent = userInfo.email;

            // 가입일 표시
            if (userInfo.join_date) {
                const joinDateStr = formatJoinDate(userInfo.join_date);
                document.getElementById('join-date').textContent = `가입일: ${joinDateStr}`;
            } else {
                document.getElementById('join-date').textContent = `가입일: 2024-01-01`;
            }

            // 프로필 이미지 설정
            const profileImageUrl =
                userInfo.profileImage || userInfo.profile_image || '/images/defaultProfile.png';
            document.getElementById('profile-image').src = profileImageUrl;

            // 사용자 정보 업데이트 (localStorage 또는 sessionStorage에 저장)
            // 현재 로그인 상태 유지 여부 확인 (localStorage에 있으면 유지, 없으면 sessionStorage)
            const hasLocalStorage = localStorage.getItem('loggedInUser') !== null;
            if (hasLocalStorage) {
                localStorage.setItem('loggedInUser', JSON.stringify(userInfo));
            } else {
                sessionStorage.setItem('loggedInUser', JSON.stringify(userInfo));
            }
        } else {
            // API 호출 실패 시 sessionStorage의 정보 사용
            document.getElementById('user-name').textContent = user.username;
            document.getElementById('user-email').textContent = user.email;

            if (user.join_date) {
                document.getElementById('join-date').textContent = `가입일: ${user.join_date}`;
            } else {
                document.getElementById('join-date').textContent = `가입일: 2024-01-01`;
            }

            const profileImageUrl =
                user.profileImage || user.profile_image || '/images/defaultProfile.png';
            document.getElementById('profile-image').src = profileImageUrl;
        }
    } catch (error) {
        // JSON 파싱 에러인 경우 (HTML 응답)
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            console.error('사용자 정보 로드 오류: 인증이 필요합니다.');
        } else {
            console.error('사용자 정보 로드 오류:', error);
        }
        // 에러 발생 시 sessionStorage의 정보 사용
        document.getElementById('user-name').textContent = user.username;
        document.getElementById('user-email').textContent = user.email;

        if (user.join_date) {
            document.getElementById('join-date').textContent = `가입일: ${user.join_date}`;
        } else {
            document.getElementById('join-date').textContent = `가입일: 2024-01-01`;
        }

        const profileImageUrl =
            user.profileImage || user.profile_image || '/images/defaultProfile.png';
        document.getElementById('profile-image').src = profileImageUrl;
    }
}

// 다른 유저의 프로필 표시
async function displayOtherUserProfile(userId) {
    try {
        const response = await fetch(`/api/public/users/${userId}`);
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            throw new Error('사용자 정보를 불러올 수 없습니다.');
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.user) {
            const userInfo = data.user;
            const username = userInfo.username || '사용자';
            
            // 사용자 정보 업데이트
            document.getElementById('user-name').textContent = `${username}님의 프로필`;
            document.getElementById('user-email').textContent = userInfo.email || '';
            
            // 가입일 표시
            if (userInfo.join_date) {
                const joinDateStr = formatJoinDate(userInfo.join_date);
                document.getElementById('join-date').textContent = `가입일: ${joinDateStr}`;
            } else {
                document.getElementById('join-date').textContent = '';
            }
            
            // 프로필 이미지 설정
            const profileImageUrl = userInfo.profileImage || userInfo.profile_image || '/images/defaultProfile.png';
            document.getElementById('profile-image').src = profileImageUrl;
            
            // 프로필 수정 버튼 숨기기
            const editBtn = document.getElementById('edit-profile-btn');
            if (editBtn) {
                editBtn.style.display = 'none';
            }

            // 섹션 제목 문구 변경 (다른 유저 프로필)
            const writtenTitleEl = document.getElementById('written-reviews-title');
            if (writtenTitleEl) {
                writtenTitleEl.textContent = `${username}님이 작성한 리뷰`;
            }
            const likedTitleEl = document.getElementById('liked-reviews-title');
            if (likedTitleEl) {
                likedTitleEl.textContent = `${username}님이 좋아요 누른 리뷰`;
            }
            
            // 다른 유저 프로필에서는 특정 탭들 숨기기
            hideTabsForOtherProfile();
        } else {
            throw new Error('사용자 정보를 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('다른 유저 프로필 로드 오류:', error);
        document.getElementById('user-name').textContent = '사용자를 찾을 수 없습니다';
        document.getElementById('user-email').textContent = '';
        document.getElementById('join-date').textContent = '';
        
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.style.display = 'none';
        }
    }
}

// 다른 유저 프로필에서 특정 탭 숨기기
function hideTabsForOtherProfile() {
    // 숨길 탭 목록 (댓글, 좋아요, 신청관리, 관광지 추가신청)
    const tabsToHide = ['comments', 'likes', 'requests', 'spot-add'];
    
    tabsToHide.forEach(tabName => {
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        const tabPanel = document.getElementById(`${tabName}-tab`);
        
        if (tabBtn) tabBtn.style.display = 'none';
        if (tabPanel) tabPanel.style.display = 'none';
    });
    
    // 리뷰 탭 텍스트 변경
    const reviewsTabBtn = document.querySelector('.tab-btn[data-tab="reviews"]');
    if (reviewsTabBtn) {
        reviewsTabBtn.textContent = '리뷰';
    }
}

// 다른 유저 프로필용 탭 초기화
function initTabsForOtherProfile() {
    // 리뷰 탭만 활성화
    const reviewsTab = document.querySelector('.tab-btn[data-tab="reviews"]');
    if (reviewsTab) {
        reviewsTab.classList.add('active');
    }
    
    const reviewsPanel = document.getElementById('reviews-tab');
    if (reviewsPanel) {
        reviewsPanel.classList.add('active');
    }
}

// 탭 기능 초기화
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // 모든 탭 버튼에서 active 클래스 제거
            tabBtns.forEach((b) => b.classList.remove('active'));
            // 모든 탭 패널에서 active 클래스 제거
            tabPanels.forEach((p) => p.classList.remove('active'));

            // 클릭된 버튼에 active 클래스 추가
            btn.classList.add('active');
            // 해당 탭 패널에 active 클래스 추가
            document.getElementById(`${targetTab}-tab`).classList.add('active');

            // 탭별 데이터 로드
            const user = getCurrentUser();
            if (user) {
                if (targetTab === 'requests') {
                    loadUserRequests(user.id);
                } else if (targetTab === 'spot-add') {
                    initSpotAddForm();
                }
            }
        });
    });
}

// 사용자 데이터 로드
async function loadUserData() {
    const user = getCurrentUser();
    if (!user) return;

    try {
        // 리뷰 데이터 로드
        await loadUserReviews(user.id);

        // 좋아요 누른 리뷰 데이터 로드
        await loadLikedReviews(user.id);

        // 댓글 데이터 로드
        await loadUserComments(user.id);

        // 좋아요한 관광지 데이터 로드
        await loadUserLikes(user.id);
    } catch (error) {
        console.error('데이터 로드 오류:', error);
        showNotification('데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

// 사용자 리뷰 로드
async function loadUserReviews(userId) {
    const reviewsList = document.getElementById('reviews-list');
    const reviewsCount = document.getElementById('reviews-count');

    // 로딩 상태 표시
    reviewsList.innerHTML =
        '<div class="loading-state"><div class="loading-spinner"></div><p>리뷰를 불러오는 중...</p></div>';

    try {
        // 실제 API 호출
        const response = await fetch(`/api/users/${userId}/reviews`);

        // 응답이 HTML인지 확인 (인증/권한 문제로 로그인 페이지가 반환된 경우)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            throw new Error('인증이 필요합니다. 로그인해주세요.');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || '리뷰를 불러오는데 실패했습니다.');
        }

        const reviews = data.reviews || [];

        if (reviews.length === 0) {
            reviewsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h3>작성한 리뷰가 없습니다</h3>
                    <p>관광지를 방문하고 첫 리뷰를 작성해보세요!</p>
                </div>
            `;
        } else {
            // API 응답 데이터를 프론트엔드 형식으로 변환
            const formattedReviews = reviews.map((review) => ({
                id: review.id,
                title: review.title,
                content: review.content,
                rating: review.rating,
                tourist_spot_id: review.touristSpotId || review.tourist_spot_id,
                tourist_spot_name:
                    review.touristSpotName || review.tourist_spot_name || '알 수 없는 관광지',
                created_at: review.createdAt || review.created_at,
                images: [], // 리뷰 이미지는 별도 API로 조회 필요
            }));

            reviewsList.innerHTML = formattedReviews
                .map((review) => createReviewHTML(review))
                .join('');
        }

        reviewsCount.textContent = `${reviews.length}개`;
    } catch (error) {
        // JSON 파싱 에러인 경우 (HTML 응답)
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            console.error('리뷰 로드 오류: 인증이 필요합니다.');
        } else {
            console.error('리뷰 로드 오류:', error);
        }
        reviewsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <h3>리뷰를 불러올 수 없습니다</h3>
                <p>잠시 후 다시 시도해주세요.</p>
            </div>
        `;
    }
}

// 좋아요 누른 리뷰 로드
async function loadLikedReviews(userId) {
    const likedReviewsList = document.getElementById('liked-reviews-list');
    const likedReviewsCount = document.getElementById('liked-reviews-count');

    if (!likedReviewsList) return;

    // 로딩 상태 표시
    likedReviewsList.innerHTML =
        '<div class="loading-state"><div class="loading-spinner"></div><p>좋아요 누른 리뷰를 불러오는 중...</p></div>';

    try {
        // API 호출
        const response = await fetch(`/api/users/${userId}/liked-reviews`);

        // 응답이 HTML인지 확인 (인증/권한 문제로 로그인 페이지가 반환된 경우)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            throw new Error('인증이 필요합니다. 로그인해주세요.');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || '좋아요 누른 리뷰를 불러오는데 실패했습니다.');
        }

        const reviews = data.reviews || [];

        if (reviews.length === 0) {
            likedReviewsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❤️</div>
                    <h3>좋아요 누른 리뷰가 없습니다</h3>
                    <p>마음에 드는 리뷰에 좋아요를 눌러보세요!</p>
                </div>
            `;
        } else {
            // API 응답 데이터를 프론트엔드 형식으로 변환
            const formattedReviews = reviews.map((review) => ({
                id: review.id,
                title: review.title,
                content: review.content,
                rating: review.rating,
                tourist_spot_id: review.touristSpotId || review.tourist_spot_id,
                tourist_spot_name:
                    review.touristSpotName || review.tourist_spot_name || '알 수 없는 관광지',
                created_at: review.createdAt || review.created_at,
                author_name: review.authorName || review.author_name || '익명',
                images: [],
            }));

            likedReviewsList.innerHTML = formattedReviews
                .map((review) => createLikedReviewHTML(review))
                .join('');
        }

        if (likedReviewsCount) {
            likedReviewsCount.textContent = `${reviews.length}개`;
        }
    } catch (error) {
        // JSON 파싱 에러인 경우 (HTML 응답)
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            console.error('좋아요 누른 리뷰 로드 오류: 인증이 필요합니다.');
        } else {
            console.error('좋아요 누른 리뷰 로드 오류:', error);
        }
        likedReviewsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <h3>좋아요 누른 리뷰를 불러올 수 없습니다</h3>
                <p>잠시 후 다시 시도해주세요.</p>
            </div>
        `;
    }
}

// 좋아요 누른 리뷰 HTML 생성
function createLikedReviewHTML(review) {
    const rating = review.rating || 0;
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const date = formatDate(review.created_at, 'korean');
    const authorName = escapeHtml(review.author_name || '익명');

    return `
        <div class="review-item liked-review-item" onclick="window.location.href='/pages/detailed/detailed?id=${review.tourist_spot_id}'">
            <div class="review-header">
                <span class="review-author">👤 ${authorName}</span>
                <span class="review-spot">${escapeHtml(review.tourist_spot_name)}</span>
            </div>
            <h3 class="review-title">${escapeHtml(review.title || '제목 없음')}</h3>
            <div class="review-rating">${stars}</div>
            <p class="review-content">${escapeHtml(review.content || '')}</p>
            <div class="review-footer">
                <span class="review-date">${date}</span>
            </div>
        </div>
    `;
}

// 사용자 댓글 로드
async function loadUserComments(userId) {
    const commentsList = document.getElementById('comments-list');
    const commentsCount = document.getElementById('comments-count');

    // 로딩 상태 표시
    commentsList.innerHTML =
        '<div class="loading-state"><div class="loading-spinner"></div><p>댓글을 불러오는 중...</p></div>';

    try {
        // 실제 API 호출
        const response = await fetch(`/api/users/${userId}/comments`);

        // 응답이 HTML인지 확인 (인증/권한 문제로 로그인 페이지가 반환된 경우)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            throw new Error('인증이 필요합니다. 로그인해주세요.');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || '댓글을 불러오는데 실패했습니다.');
        }

        const comments = data.comments || [];

        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <h3>작성한 댓글이 없습니다</h3>
                    <p>다른 사용자의 리뷰에 댓글을 남겨보세요!</p>
                </div>
            `;
        } else {
            // API 응답 데이터를 프론트엔드 형식으로 변환
            const formattedComments = comments.map((comment) => ({
                id: comment.id,
                content: comment.content,
                review_id: comment.reviewId || comment.review_id,
                review_title: comment.reviewTitle || comment.review_title || '제목 없음',
                tourist_spot_id: comment.touristSpotId || comment.tourist_spot_id,
                tourist_spot_name:
                    comment.touristSpotName || comment.tourist_spot_name || '알 수 없는 관광지',
                review_author_name:
                    comment.reviewAuthorName || comment.review_author_name || '익명',
                created_at: comment.createdAt || comment.created_at,
            }));

            commentsList.innerHTML = formattedComments
                .map((comment) => createCommentHTML(comment))
                .join('');
        }

        commentsCount.textContent = `${comments.length}개`;
    } catch (error) {
        // JSON 파싱 에러인 경우 (HTML 응답)
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            console.error('댓글 로드 오류: 인증이 필요합니다.');
        } else {
            console.error('댓글 로드 오류:', error);
        }
        commentsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <h3>댓글을 불러올 수 없습니다</h3>
                <p>잠시 후 다시 시도해주세요.</p>
            </div>
        `;
    }
}

// 사용자 좋아요 로드
async function loadUserLikes(userId) {
    const likesList = document.getElementById('likes-list');
    const likesCount = document.getElementById('likes-count');

    // 로딩 상태 표시
    likesList.innerHTML =
        '<div class="loading-state"><div class="loading-spinner"></div><p>좋아요한 관광지를 불러오는 중...</p></div>';

    try {
        // 실제 API 호출
        const response = await fetch(`/api/users/${userId}/liked-spots`);

        // 응답이 HTML인지 확인 (인증/권한 문제로 로그인 페이지가 반환된 경우)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            throw new Error('인증이 필요합니다. 로그인해주세요.');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) throw new Error();

        const likes = data.likes;

        if (likes.length === 0) {
            likesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❤️</div>
                    <h3>좋아요한 관광지가 없습니다</h3>
                    <p>마음에 드는 관광지에 좋아요를 눌러보세요!</p>
                </div>
            `;
        } else {
            likesList.innerHTML = likes.map((like) => createLikeHTML(like)).join('');
        }

        likesCount.textContent = `${likes.length}개`;
    } catch (error) {
        // JSON 파싱 에러인 경우 (HTML 응답)
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            console.error('좋아요한 관광지 로드 오류: 인증이 필요합니다.');
        } else {
            console.error('좋아요한 관광지 로드 오류:', error);
        }
        likesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <h3>좋아요한 관광지를 불러올 수 없습니다</h3>
                <p>잠시 후 다시 시도해주세요.</p>
            </div>
        `;
    }
}

// 리뷰 HTML 생성
function createReviewHTML(review) {
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const imagesHTML =
        review.images && review.images.length > 0
            ? `<div class="review-images">${review.images
                  .map(
                      (img) =>
                          `<img src="${img.image_url}" alt="${escapeHtml(
                              img.alt_text || '리뷰 이미지',
                          )}" class="review-image" onclick="openImageModal('${img.image_url}')">`,
                  )
                  .join('')}</div>`
            : '';

    return `
        <div class="review-item">
            <div class="item-header">
                <h3 class="item-title">${escapeHtml(review.title)}</h3>
                <span class="item-date">${formatDate(review.created_at, 'korean')}</span>
            </div>
            <div class="item-content">${escapeHtml(review.content)}</div>
            <div class="item-meta">
                <div class="rating">
                    <span class="stars">${stars}</span>
                    <span>${review.rating}/5</span>
                </div>
                <a href="/pages/detailed/detailed?id=${
                    review.tourist_spot_id
                }" class="tourist-spot">
                    ${escapeHtml(review.tourist_spot_name)}
                </a>
            </div>
            ${imagesHTML}
        </div>
    `;
}

// 댓글 HTML 생성
function createCommentHTML(comment) {
    const reviewAuthor = comment.review_author_name
        ? `<span class="review-author">리뷰 작성자: ${escapeHtml(comment.review_author_name)}</span>`
        : '';
    return `
        <div class="comment-item" onclick="window.location.href='/pages/detailed/detailed?id=${comment.tourist_spot_id}'">
            <div class="item-header">
                <h3 class="item-title">📝 ${escapeHtml(comment.review_title)}</h3>
                <span class="item-date">${formatDate(comment.created_at)}</span>
            </div>
            <div class="item-content">"${escapeHtml(comment.content)}"</div>
            <div class="item-meta">
                <a href="/pages/detailed/detailed?id=${comment.tourist_spot_id}" class="tourist-spot">
                    📍 ${escapeHtml(comment.tourist_spot_name)}
                </a>
                ${reviewAuthor}
            </div>
        </div>
    `;
}

// 좋아요 HTML 생성
function createLikeHTML(like) {
    return `
        <div class="like-item">
            <div class="item-header">
                <h3 class="item-title">${escapeHtml(like.title)}</h3>
                <span class="item-date">${formatDate(like.likedAt, 'korean')}</span>
            </div>
            <div class="item-content">${escapeHtml(like.description || '좋아요한 관광지입니다.')}</div>
            <div class="item-meta">
                <a href="/pages/detailed/detailed?id=${like.spotId}" class="tourist-spot">
                    자세히 보기
                </a>
            </div>
        </div>
    `;
}

// formatDate 함수는 utils/date.js에서 가져옴 (korean 포맷 사용)

// formatJoinDate 함수는 utils/date.js에서 가져옴

// openImageModal 함수는 utils/modal.js에서 가져옴
// showError 함수는 utils/notification.js에서 가져옴

// 샘플 데이터 함수들 (실제 API 연동 시 교체 필요)
async function getSampleUserReviews(userId) {
    // 실제로는 API 호출
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    title: '일출이 정말 아름다워요!',
                    content:
                        '바다 위에 세워진 사찰이라 정말 신비로웠어요. 특히 일출 시간에 가면 환상적인 경치를 볼 수 있습니다.',
                    rating: 5,
                    tourist_spot_id: 1,
                    tourist_spot_name: '해동 용궁사',
                    created_at: '2024-12-15T10:30:00Z',
                    images: [
                        { image_url: '../../images/reviews/sample1.jpg', alt_text: '일출 풍경' },
                        { image_url: '../../images/reviews/sample2.jpg', alt_text: '사찰 전경' },
                    ],
                },
                {
                    id: 2,
                    title: '서핑하기 좋은 곳',
                    content:
                        '파도가 적당해서 서핑 초보자도 즐길 수 있어요. 해변도 깨끗하고 주변에 맛집도 많아서 하루 종일 놀기 좋습니다.',
                    rating: 4,
                    tourist_spot_id: 3,
                    tourist_spot_name: '송정해수욕장',
                    created_at: '2024-12-10T14:20:00Z',
                    images: [],
                },
            ]);
        }, 1000);
    });
}

// 샘플 데이터 함수 (실제 API로 대체됨)
// async function getSampleUserComments(userId) { ... }

// async function getSampleUserLikes(userId) {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve([
//                 {
//                     id: 1,
//                     tourist_spot_id: 1,
//                     tourist_spot_name: '해동 용궁사',
//                     description: '바다 위에 세워진 아름다운 사찰',
//                     created_at: '2024-12-15T09:00:00Z',
//                 },
//                 {
//                     id: 2,
//                     tourist_spot_id: 9,
//                     tourist_spot_name: '해운대 해수욕장',
//                     description: '부산의 대표 해수욕장',
//                     created_at: '2024-12-12T16:00:00Z',
//                 },
//                 {
//                     id: 3,
//                     tourist_spot_id: 152,
//                     tourist_spot_name: '광안리 해수욕장',
//                     description: '광안대교 야경이 아름다운 해수욕장',
//                     created_at: '2024-12-08T20:00:00Z',
//                 },
//             ]);
//         }, 600);
//     });
// }

// 사용자 신청 목록 로드
async function loadUserRequests(userId) {
    const requestsList = document.getElementById('requests-list');
    const requestsCount = document.getElementById('requests-count');

    // 로딩 상태 표시
    requestsList.innerHTML =
        '<div class="loading-state"><div class="loading-spinner"></div><p>신청 목록을 불러오는 중...</p></div>';

    try {
        const response = await fetch(`/api/admin/spot-requests`);
        const data = await response.json();

        if (data.success && data.requests) {
            // 현재 사용자의 신청만 필터링
            const userRequests = data.requests.filter(
                (req) => req.userId === userId || req.userId === String(userId),
            );

            if (userRequests.length === 0) {
                requestsList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <h3>신청 내역이 없습니다</h3>
                        <p>사진 등록 신청이나 관광지 추가 신청을 해보세요!</p>
                    </div>
                `;
            } else {
                requestsList.innerHTML = userRequests
                    .map((request) => createRequestHTML(request))
                    .join('');
            }

            requestsCount.textContent = `${userRequests.length}개`;
        } else {
            throw new Error(data.message || '신청 목록을 불러올 수 없습니다.');
        }
    } catch (error) {
        console.error('신청 목록 로드 오류:', error);
        requestsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <h3>신청 목록을 불러올 수 없습니다</h3>
                <p>잠시 후 다시 시도해주세요.</p>
            </div>
        `;
    }
}

// 신청 HTML 생성
function createRequestHTML(request) {
    const typeLabel = request.type === 'photo' ? '사진 추가' : '관광지 추가';
    const statusBadge = getRequestStatusBadge(request.status);
    const createdAt = formatRequestDate(request.createdAt);
    const description = escapeHtml(request.description || '-');

    // 이미지 미리보기 생성 (모든 신청 유형에서 이미지가 있으면 표시)
    let imagePreview = '';
    if (request.imageUrl) {
        // 쉼표로 구분된 여러 이미지 URL 처리
        const imageUrls = request.imageUrl.split(',').filter((url) => url.trim());

        if (imageUrls.length > 0) {
            const firstImageUrl = imageUrls[0];
            const imageCount = imageUrls.length;

            // 여러 이미지가 있으면 개수 배지 표시
            const countBadge =
                imageCount > 1
                    ? `<span style="position: absolute; top: 5px; right: 5px; background: #007bff; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.7rem; font-weight: 600;">${imageCount}</span>`
                    : '';

            // 여러 이미지가 있으면 모두 표시, 하나면 단일 이미지만 표시
            if (imageCount > 1) {
                const imagesHtml = imageUrls
                    .map(
                        (url, index) => `
                    <div style="position: relative; display: inline-block; margin: 5px;">
                        <img src="${url.trim()}" alt="신청 이미지 ${index + 1}" 
                             style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 2px solid ${index === 0 ? '#28a745' : '#ddd'};" 
                             onclick="openImageModal('${url.trim()}')" />
                        ${index === 0 ? '<span style="position: absolute; top: 2px; left: 2px; background: #28a745; color: white; padding: 1px 4px; border-radius: 3px; font-size: 0.65rem;">대표</span>' : ''}
                    </div>
                `,
                    )
                    .join('');

                imagePreview = `
                    <div style="margin-top: 10px;">
                        <p style="margin-bottom: 5px; font-size: 0.85rem; color: #666;"><strong>신청 이미지 (${imageCount}개):</strong></p>
                        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                            ${imagesHtml}
                        </div>
                    </div>
                `;
            } else {
                // 단일 이미지
                imagePreview = `
                    <div style="margin-top: 10px; position: relative; display: inline-block;">
                        <img src="${firstImageUrl.trim()}" alt="신청 이미지" 
                             style="max-width: 150px; max-height: 150px; border-radius: 4px; cursor: pointer; border: 2px solid #ddd;" 
                             onclick="openImageModal('${firstImageUrl.trim()}')" />
                    </div>
                `;
            }
        }
    }

    // 대기중인 신청만 취소 버튼 표시
    const cancelButton =
        request.status === 'pending'
            ? `<button class="cancel-request-btn" onclick="cancelRequest(${request.id})">신청 취소</button>`
            : '';

    return `
        <div class="request-item">
            <div class="request-header">
                <div class="request-type">${typeLabel}</div>
                ${statusBadge}
            </div>
            <div class="request-content">
                <div class="request-info">
                    <p><strong>관광지:</strong> ${escapeHtml(request.spotName || '-')}</p>
                    <p><strong>신청일:</strong> ${createdAt}</p>
                    ${
                        request.status === 'rejected' && request.rejectReason
                            ? `<p><strong>거부 사유:</strong> ${escapeHtml(request.rejectReason)}</p>`
                            : ''
                    }
                </div>
                <div class="request-description">
                    <p><strong>설명:</strong> ${description}</p>
                    ${imagePreview}
                </div>
                ${cancelButton ? `<div class="request-actions">${cancelButton}</div>` : ''}
            </div>
        </div>
    `;
}

// 신청 상태 배지 생성
function getRequestStatusBadge(status) {
    const badges = {
        pending: '<span class="status-badge status-pending">대기중</span>',
        approved: '<span class="status-badge status-approved">승인됨</span>',
        rejected: '<span class="status-badge status-rejected">거부됨</span>',
    };
    return badges[status] || badges.pending;
}

// 날짜 포맷팅
function formatRequestDate(dateString) {
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

// 신청 취소
async function cancelRequest(requestId) {
    const user = getCurrentUser();
    if (!user) {
        alert('로그인이 필요합니다.');
        return;
    }

    if (!confirm('정말 이 신청을 취소하시겠습니까?')) {
        return;
    }

    try {
        const response = await fetch(`/api/spot-requests/${requestId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
            alert('신청이 취소되었습니다.');
            // 신청 목록 다시 로드
            await loadUserRequests(user.id);
        } else {
            alert('신청 취소에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('신청 취소 중 오류가 발생했습니다.');
    }
}

// 카카오맵 API 스크립트 로드 상태
let kakaoMapLoaded = false;
let kakaoMapLoading = false;
let selectedFiles = [];
let spotAddFormInitialized = false;

// 카카오맵 API 키 가져오기
function getKakaoMapApiKey() {
    const wrapper =
        document.querySelector('[layout\\:fragment="content"]') ||
        document.querySelector('[data-kakao-api-key]');
    if (wrapper) {
        return wrapper.dataset.kakaoApiKey;
    }
    return null;
}

// 카카오맵 스크립트 로드
function loadKakaoMapScript() {
    return new Promise((resolve, reject) => {
        if (kakaoMapLoaded && window.kakao && window.kakao.maps) {
            resolve();
            return;
        }

        if (kakaoMapLoading) {
            const checkInterval = setInterval(() => {
                if (kakaoMapLoaded && window.kakao && window.kakao.maps) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            return;
        }

        const apiKey = getKakaoMapApiKey();
        if (!apiKey) {
            reject(new Error('카카오맵 API 키를 찾을 수 없습니다.'));
            return;
        }

        kakaoMapLoading = true;

        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
        script.onload = () => {
            window.kakao.maps.load(() => {
                kakaoMapLoaded = true;
                kakaoMapLoading = false;
                resolve();
            });
        };
        script.onerror = () => {
            kakaoMapLoading = false;
            reject(new Error('카카오맵 스크립트 로드 실패'));
        };
        document.head.appendChild(script);
    });
}

// 위치 검색
async function searchSpotLocation() {
    const searchInput = document.getElementById('spot-location-search');
    const resultsContainer = document.getElementById('spot-location-results');

    if (!searchInput || !resultsContainer) return;

    const query = searchInput.value.trim();
    if (!query) {
        alert('검색어를 입력해주세요.');
        return;
    }

    try {
        await loadKakaoMapScript();

        const places = new kakao.maps.services.Places();
        places.keywordSearch(query, (data, status) => {
            if (status === kakao.maps.services.Status.OK) {
                displayLocationResults(data);
            } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
                // 키워드 검색 결과 없으면 주소 검색 시도
                const geocoder = new kakao.maps.services.Geocoder();
                geocoder.addressSearch(query, (addressData, addressStatus) => {
                    if (addressStatus === kakao.maps.services.Status.OK) {
                        const formattedResults = addressData.map((item) => ({
                            place_name: item.address_name,
                            address_name: item.address_name,
                            road_address_name: item.road_address?.address_name || '',
                            y: item.y,
                            x: item.x,
                        }));
                        displayLocationResults(formattedResults);
                    } else {
                        resultsContainer.innerHTML =
                            '<div class="location-no-results">검색 결과가 없습니다.</div>';
                        resultsContainer.style.display = 'block';
                    }
                });
            } else {
                resultsContainer.innerHTML =
                    '<div class="location-no-results">검색 중 오류가 발생했습니다.</div>';
                resultsContainer.style.display = 'block';
            }
        });
    } catch (error) {
        console.error('위치 검색 오류:', error);
        alert('위치 검색 중 오류가 발생했습니다.');
    }
}

// 검색 결과 표시
function displayLocationResults(results) {
    const resultsContainer = document.getElementById('spot-location-results');
    if (!resultsContainer) return;

    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<div class="location-no-results">검색 결과가 없습니다.</div>';
        resultsContainer.style.display = 'block';
        return;
    }

    resultsContainer.innerHTML = results
        .map(
            (place, index) => `
        <div class="location-result-item" data-index="${index}"
             data-lat="${place.y}" data-lng="${place.x}"
             data-name="${escapeHtml(place.place_name)}"
             data-address="${escapeHtml(place.road_address_name || place.address_name)}">
            <div class="place-name">${escapeHtml(place.place_name)}</div>
            <div class="place-address">${escapeHtml(place.road_address_name || place.address_name)}</div>
        </div>
    `,
        )
        .join('');

    // 결과 클릭 이벤트 추가
    resultsContainer.querySelectorAll('.location-result-item').forEach((item) => {
        item.addEventListener('click', () => {
            selectLocation(
                parseFloat(item.dataset.lat),
                parseFloat(item.dataset.lng),
                item.dataset.name,
                item.dataset.address,
            );
        });
    });

    resultsContainer.style.display = 'block';
}

// 위치 선택
function selectLocation(lat, lng, name, address) {
    document.getElementById('spot-latitude').value = lat;
    document.getElementById('spot-longitude').value = lng;
    document.getElementById('spot-address').value = address;

    const selectedInfo = document.getElementById('spot-location-selected');
    const selectedText = document.getElementById('spot-location-selected-text');
    const resultsContainer = document.getElementById('spot-location-results');

    if (selectedText) {
        selectedText.textContent = `${name} (${address})`;
    }
    if (selectedInfo) {
        selectedInfo.style.display = 'flex';
    }
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
}

// 위치 선택 취소
function clearLocationSelection() {
    document.getElementById('spot-latitude').value = '';
    document.getElementById('spot-longitude').value = '';
    document.getElementById('spot-address').value = '';

    const selectedInfo = document.getElementById('spot-location-selected');
    const selectedText = document.getElementById('spot-location-selected-text');

    if (selectedText) {
        selectedText.textContent = '';
    }
    if (selectedInfo) {
        selectedInfo.style.display = 'none';
    }
}

// 이미지 미리보기 업데이트
function updateImagePreview() {
    const previewContainer = document.getElementById('spot-selected-files-preview');
    if (!previewContainer) return;

    if (selectedFiles.length === 0) {
        previewContainer.innerHTML = '';
        return;
    }

    previewContainer.innerHTML = selectedFiles
        .map(
            (file, index) => `
        <div class="selected-file-item" data-index="${index}">
            <img src="${URL.createObjectURL(file)}" alt="${escapeHtml(file.name)}">
            <button type="button" class="remove-file" data-index="${index}">&times;</button>
        </div>
    `,
        )
        .join('');

    // 삭제 버튼 이벤트 추가
    previewContainer.querySelectorAll('.remove-file').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            selectedFiles.splice(index, 1);
            updateImagePreview();
        });
    });
}

// 관광지 추가 신청 폼 초기화
async function initSpotAddForm() {
    // 이미 초기화된 경우 중복 실행 방지
    if (spotAddFormInitialized) {
        return;
    }

    const form = document.getElementById('spot-add-form');
    const regionSelect = document.getElementById('spot-region');
    const descriptionTextarea = document.getElementById('spot-description');
    const charCount = document.getElementById('spot-description-char-count');
    const imageInput = document.getElementById('spot-images');
    const searchBtn = document.getElementById('spot-location-search-btn');
    const clearBtn = document.getElementById('spot-location-clear');
    const searchInput = document.getElementById('spot-location-search');

    // 이미지 선택 이벤트
    if (imageInput) {
        imageInput.addEventListener('change', function (e) {
            const files = Array.from(e.target.files);

            // 최대 10장 제한
            if (selectedFiles.length + files.length > 10) {
                alert('이미지는 최대 10장까지 추가할 수 있습니다.');
                return;
            }

            // 파일 추가
            files.forEach((file) => {
                if (file.type.startsWith('image/')) {
                    selectedFiles.push(file);
                }
            });

            updateImagePreview();

            // input 초기화 (같은 파일 다시 선택 가능하도록)
            imageInput.value = '';
        });
    }

    // 위치 검색 버튼 이벤트
    if (searchBtn) {
        searchBtn.addEventListener('click', searchSpotLocation);
    }

    // 위치 검색 Enter 키 이벤트
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchSpotLocation();
            }
        });
    }

    // 위치 선택 취소 버튼 이벤트
    if (clearBtn) {
        clearBtn.addEventListener('click', clearLocationSelection);
    }

    // 지역 목록 로드
    try {
        const response = await fetch('/api/regions');
        if (response.ok) {
            const regions = await response.json();
            regionSelect.innerHTML = '<option value="">지역을 선택해주세요</option>';
            regions.forEach((region) => {
                const option = document.createElement('option');
                option.value = region.id;
                option.textContent = region.name;
                regionSelect.appendChild(option);
            });
        } else {
            // API가 없을 경우 직접 지역 목록 생성 (임시)
            const regions = [
                { id: 1, name: '중구' },
                { id: 2, name: '서구' },
                { id: 3, name: '동구' },
                { id: 4, name: '영도구' },
                { id: 5, name: '부산진구' },
                { id: 6, name: '동래구' },
                { id: 7, name: '남구' },
                { id: 8, name: '북구' },
                { id: 9, name: '해운대구' },
                { id: 10, name: '사하구' },
                { id: 11, name: '금정구' },
                { id: 12, name: '강서구' },
                { id: 13, name: '연제구' },
                { id: 14, name: '수영구' },
                { id: 15, name: '사상구' },
                { id: 16, name: '기장군' },
            ];
            regionSelect.innerHTML = '<option value="">지역을 선택해주세요</option>';
            regions.forEach((region) => {
                const option = document.createElement('option');
                option.value = region.id;
                option.textContent = region.name;
                regionSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('지역 목록 로드 오류:', error);
    }

    // 설명 글자 수 카운트
    if (descriptionTextarea && charCount) {
        descriptionTextarea.addEventListener('input', function () {
            const length = this.value.length;
            charCount.textContent = length;
        });
    }

    // 폼 제출 처리
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const user = getCurrentUser();
            if (!user) {
                alert('로그인이 필요합니다.');
                return;
            }

            const spotTitle = document.getElementById('spot-title').value;
            const regionId = document.getElementById('spot-region').value;

            if (!spotTitle || !regionId) {
                alert('관광지명과 지역은 필수 입력 항목입니다.');
                return;
            }

            // FormData 생성 (이미지 파일 포함) — 신청자는 서버가 세션에서 식별
            const formData = new FormData();
            formData.append('spotTitle', spotTitle);
            formData.append('regionId', regionId);
            formData.append('linkUrl', document.getElementById('spot-link').value);
            formData.append('hashtags', document.getElementById('spot-hashtags').value);
            formData.append('description', document.getElementById('spot-description').value);

            // 위치 정보 추가
            const latitude = document.getElementById('spot-latitude').value;
            const longitude = document.getElementById('spot-longitude').value;
            const address = document.getElementById('spot-address').value;

            if (latitude) formData.append('latitude', latitude);
            if (longitude) formData.append('longitude', longitude);
            if (address) formData.append('address', address);

            // 이미지 파일들 추가
            selectedFiles.forEach((file, index) => {
                formData.append('images', file);
            });

            try {
                const response = await fetch('/api/spot-requests/spot', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (data.success) {
                    alert('관광지 추가 신청이 완료되었습니다. 관리자 검토 후 반영됩니다.');
                    form.reset();
                    if (charCount) {
                        charCount.textContent = '0';
                    }
                    // 이미지 미리보기 초기화
                    selectedFiles = [];
                    updateImagePreview();
                    // 위치 선택 초기화
                    clearLocationSelection();
                } else {
                    alert('신청에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('신청 중 오류가 발생했습니다.');
            }
        });
    }

    // 초기화 완료 플래그 설정
    spotAddFormInitialized = true;
}
