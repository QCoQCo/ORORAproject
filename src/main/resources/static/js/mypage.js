// 마이페이지 JavaScript

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function () {
    // 로그인 상태 확인
    if (!isLoggedIn()) {
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
});

// 사용자 정보 표시
async function displayUserInfo() {
    const user = getCurrentUser();
    if (!user) return;

    try {
        // 최신 사용자 정보를 API에서 가져오기
        const response = await fetch(`/api/users/${user.id}`);
        const data = await response.json();

        if (data.success && data.user) {
            const userInfo = data.user;

            // 사용자 정보 업데이트
            document.getElementById('user-name').textContent = userInfo.username;
            document.getElementById('user-email').textContent = userInfo.email;

            // 가입일 표시
            if (userInfo.join_date) {
                const joinDate = new Date(userInfo.join_date);
                document.getElementById(
                    'join-date'
                ).textContent = `가입일: ${joinDate.toLocaleDateString('ko-KR')}`;
            } else {
                document.getElementById('join-date').textContent = `가입일: 2024-01-01`;
            }

            // 프로필 이미지 설정
            const profileImageUrl =
                userInfo.profileImage || userInfo.profile_image || '/images/defaultProfile.png';
            document.getElementById('profile-image').src = profileImageUrl;

            // sessionStorage 업데이트 (최신 정보로)
            sessionStorage.setItem('loggedInUser', JSON.stringify(userInfo));
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
        console.error('사용자 정보 로드 오류:', error);
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

        // 댓글 데이터 로드
        await loadUserComments(user.id);

        // 좋아요한 관광지 데이터 로드
        await loadUserLikes(user.id);
    } catch (error) {
        console.error('데이터 로드 오류:', error);
        showError('데이터를 불러오는 중 오류가 발생했습니다.');
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
        // 실제 API 호출 대신 샘플 데이터 사용
        const reviews = await getSampleUserReviews(userId);

        if (reviews.length === 0) {
            reviewsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h3>작성한 리뷰가 없습니다</h3>
                    <p>관광지를 방문하고 첫 리뷰를 작성해보세요!</p>
                </div>
            `;
        } else {
            reviewsList.innerHTML = reviews.map((review) => createReviewHTML(review)).join('');
        }

        reviewsCount.textContent = `${reviews.length}개`;
    } catch (error) {
        reviewsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <h3>리뷰를 불러올 수 없습니다</h3>
                <p>잠시 후 다시 시도해주세요.</p>
            </div>
        `;
    }
}

// 사용자 댓글 로드
async function loadUserComments(userId) {
    const commentsList = document.getElementById('comments-list');
    const commentsCount = document.getElementById('comments-count');

    // 로딩 상태 표시
    commentsList.innerHTML =
        '<div class="loading-state"><div class="loading-spinner"></div><p>댓글을 불러오는 중...</p></div>';

    try {
        // 실제 API 호출 대신 샘플 데이터 사용
        const comments = await getSampleUserComments(userId);

        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <h3>작성한 댓글이 없습니다</h3>
                    <p>다른 사용자의 리뷰에 댓글을 남겨보세요!</p>
                </div>
            `;
        } else {
            commentsList.innerHTML = comments.map((comment) => createCommentHTML(comment)).join('');
        }

        commentsCount.textContent = `${comments.length}개`;
    } catch (error) {
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
        // 실제 API 호출 대신 샘플 데이터 사용
        const likes = await getSampleUserLikes(userId);

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
                          `<img src="${img.image_url}" alt="${
                              img.alt_text || '리뷰 이미지'
                          }" class="review-image" onclick="openImageModal('${img.image_url}')">`
                  )
                  .join('')}</div>`
            : '';

    return `
        <div class="review-item">
            <div class="item-header">
                <h3 class="item-title">${review.title}</h3>
                <span class="item-date">${formatDate(review.created_at)}</span>
            </div>
            <div class="item-content">${review.content}</div>
            <div class="item-meta">
                <div class="rating">
                    <span class="stars">${stars}</span>
                    <span>${review.rating}/5</span>
                </div>
                <a href="/pages/detailed/detailed?id=${
                    review.tourist_spot_id
                }" class="tourist-spot">
                    ${review.tourist_spot_name}
                </a>
            </div>
            ${imagesHTML}
        </div>
    `;
}

// 댓글 HTML 생성
function createCommentHTML(comment) {
    return `
        <div class="comment-item">
            <div class="item-header">
                <h3 class="item-title">${comment.review_title}</h3>
                <span class="item-date">${formatDate(comment.created_at)}</span>
            </div>
            <div class="item-content">${comment.content}</div>
            <div class="item-meta">
                <a href="/pages/detailed/detailed?id=${
                    comment.tourist_spot_id
                }" class="tourist-spot">
                    ${comment.tourist_spot_name}
                </a>
            </div>
        </div>
    `;
}

// 좋아요 HTML 생성
function createLikeHTML(like) {
    return `
        <div class="like-item">
            <div class="item-header">
                <h3 class="item-title">${like.tourist_spot_name}</h3>
                <span class="item-date">${formatDate(like.created_at)}</span>
            </div>
            <div class="item-content">${like.description || '좋아요한 관광지입니다.'}</div>
            <div class="item-meta">
                <a href="/pages/detailed/detailed?id=${like.tourist_spot_id}" class="tourist-spot">
                    자세히 보기
                </a>
            </div>
        </div>
    `;
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// 이미지 모달 열기
function openImageModal(imageUrl) {
    // 간단한 이미지 모달 구현
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        cursor: pointer;
    `;

    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;

    modal.appendChild(img);
    document.body.appendChild(modal);

    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// 에러 표시
function showError(message) {
    console.error(message);
    // 필요시 사용자에게 에러 메시지 표시
}

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

async function getSampleUserComments(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    content: '저도 일출 보러 가봤는데 정말 환상적이었어요!',
                    review_title: '일출이 정말 아름다워요!',
                    tourist_spot_id: 1,
                    tourist_spot_name: '해동 용궁사',
                    created_at: '2024-12-15T11:00:00Z',
                },
                {
                    id: 2,
                    content: '서핑 배우고 싶었는데 좋은 정보 감사합니다!',
                    review_title: '서핑하기 좋은 곳',
                    tourist_spot_id: 3,
                    tourist_spot_name: '송정해수욕장',
                    created_at: '2024-12-10T15:30:00Z',
                },
            ]);
        }, 800);
    });
}

async function getSampleUserLikes(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    tourist_spot_id: 1,
                    tourist_spot_name: '해동 용궁사',
                    description: '바다 위에 세워진 아름다운 사찰',
                    created_at: '2024-12-15T09:00:00Z',
                },
                {
                    id: 2,
                    tourist_spot_id: 9,
                    tourist_spot_name: '해운대 해수욕장',
                    description: '부산의 대표 해수욕장',
                    created_at: '2024-12-12T16:00:00Z',
                },
                {
                    id: 3,
                    tourist_spot_id: 152,
                    tourist_spot_name: '광안리 해수욕장',
                    description: '광안대교 야경이 아름다운 해수욕장',
                    created_at: '2024-12-08T20:00:00Z',
                },
            ]);
        }, 600);
    });
}

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
                (req) => req.userId === userId || req.userId === String(userId)
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
    const description = request.description || '-';
    const imagePreview =
        request.imageUrl && request.type === 'photo'
            ? `<img src="${request.imageUrl}" alt="신청 사진" style="max-width: 100px; max-height: 100px; margin-top: 10px; border-radius: 4px;" />`
            : '';

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
                    <p><strong>관광지:</strong> ${request.spotName || '-'}</p>
                    <p><strong>신청일:</strong> ${createdAt}</p>
                    ${
                        request.status === 'rejected' && request.rejectReason
                            ? `<p><strong>거부 사유:</strong> ${request.rejectReason}</p>`
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
        const response = await fetch(`/api/spot-requests/${requestId}?userId=${user.id}`, {
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

// 관광지 추가 신청 폼 초기화
async function initSpotAddForm() {
    const form = document.getElementById('spot-add-form');
    const regionSelect = document.getElementById('spot-region');
    const descriptionTextarea = document.getElementById('spot-description');
    const charCount = document.getElementById('spot-description-char-count');
    const imageInput = document.getElementById('spot-image');
    const imagePreview = document.getElementById('spot-image-preview');
    const imagePreviewContainer = document.getElementById('spot-image-preview-container');

    // 이미지 미리보기 기능
    if (imageInput && imagePreview && imagePreviewContainer) {
        imageInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreviewContainer.style.display = 'none';
                imagePreview.src = '';
            }
        });
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

            // FormData 생성 (이미지 파일 포함)
            const formData = new FormData();
            formData.append('userId', user.id);
            formData.append('spotTitle', spotTitle);
            formData.append('regionId', regionId);
            formData.append('linkUrl', document.getElementById('spot-link').value);
            formData.append('hashtags', document.getElementById('spot-hashtags').value);
            formData.append('description', document.getElementById('spot-description').value);

            // 이미지 파일이 있으면 추가
            if (imageInput && imageInput.files[0]) {
                formData.append('image', imageInput.files[0]);
            }

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
                    if (imagePreviewContainer) {
                        imagePreviewContainer.style.display = 'none';
                        imagePreview.src = '';
                    }
                } else {
                    alert('신청에 실패했습니다: ' + (data.message || '알 수 없는 오류'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('신청 중 오류가 발생했습니다.');
            }
        });
    }
}
