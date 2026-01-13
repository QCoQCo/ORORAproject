// 리스트 컴포넌트 로더
class ListLoader {
    constructor(options = {}) {
        this.containerSelector = options.containerSelector || '.list-wrap';
        // templateContainerSelector는 더 이상 사용되지 않음 (Thymeleaf fragment로 제공)
        this.dataUrl = options.dataUrl || null;
        this.data = options.data || null;
        this.fallbackImage = options.fallbackImage || '/images/logo.png';
        this.onItemClick = options.onItemClick || null;
        this.onLikeClick = options.onLikeClick || null;
    }

    // 리스트 템플릿 로드 (이제 Thymeleaf fragment로 제공되므로 로드 불필요)
    async loadTemplate() {
        // 템플릿이 이미 DOM에 있으므로 확인만 수행
        const template = document.getElementById('list-item');
        if (!template) {
            console.warn('리스트 템플릿을 찾을 수 없습니다. Thymeleaf fragment가 포함되어 있는지 확인하세요.');
            return false;
        }
        return true;
    }

    // 데이터 로드
    async loadData() {
        if (this.data) {
            return this.data;
        }

        if (!this.dataUrl) {
            throw new Error('데이터 URL이 제공되지 않았습니다.');
        }

        try {
            const response = await fetch(this.dataUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            throw error;
        }
    }

    // 상세 페이지로 이동하는 함수
    navigateToDetail(itemData) {
        const currentPath = window.location.pathname;
        let detailPagePath;

        // 현재 경로에 따라 상세 페이지 경로 결정
        if (currentPath.includes('/pages/')) {
            detailPagePath = '../detailed/detailed';
        } else {
            detailPagePath = './pages/detailed/detailed';
        }

        // 관광지 ID가 있으면 ID를 사용하고, 없으면 제목을 사용
        if (itemData.id) {
            window.location.href = `${detailPagePath}?id=${itemData.id}`;
        } else {
            // ID가 없는 경우 제목으로 대체
            const encodedTitle = encodeURIComponent(itemData.title);
            window.location.href = `${detailPagePath}?title=${encodedTitle}`;
        }
    }

    // 리스트 아이템 생성
    createListItem(itemData) {
        const template = document.getElementById('list-item');
        if (!template) {
            console.error('리스트 템플릿을 찾을 수 없습니다.');
            return null;
        }
        const itemFragment = document.importNode(template.content, true);

        // 카테고리 비활성화 상태 확인
        const isCategoryInactive = itemData.categoryActive === false;

        // 이미지 설정
        const imgElement = itemFragment.querySelector('.item-photo img');
        if (imgElement) {
            // 이미지 URL이 없거나 빈 문자열인 경우 기본 이미지 사용
            const imageUrl = itemData.img || itemData.imageUrl || '';
            if (imageUrl && imageUrl.trim() !== '') {
                imgElement.src = imageUrl;
            } else {
                // 이미지가 없으면 즉시 기본 이미지 설정
                imgElement.src = this.fallbackImage;
            }
            imgElement.alt = itemData.title || '';
            imgElement.onerror = () => {
                imgElement.src = this.fallbackImage;
                imgElement.onerror = null;
            };
        }

        // 텍스트 데이터 설정
        const titleElement = itemFragment.querySelector('.item-title');
        if (titleElement) titleElement.textContent = itemData.title || '';

        const descriptionElement = itemFragment.querySelector('.item-description');
        if (descriptionElement) descriptionElement.textContent = itemData.description || '';

        const hashtagElement = itemFragment.querySelector('.hash-tag');
        if (hashtagElement && itemData.hashtags) {
            hashtagElement.textContent = Array.isArray(itemData.hashtags)
                ? itemData.hashtags.join(' ')
                : itemData.hashtags;
        }

        // 링크 설정 - 기본 링크 제거하고 클릭 이벤트로 처리
        const linkElement = itemFragment.querySelector('.item-link');
        if (linkElement) {
            linkElement.href = 'javascript:void(0)'; // 기본 링크 동작 방지
            linkElement.addEventListener('click', (e) => {
                e.preventDefault();
                if (!e.target.closest('.likeBtn')) {
                    // 카테고리가 비활성화된 경우 클릭 차단
                    if (isCategoryInactive) {
                        this.showInactiveNotification();
                        return;
                    }
                    this.navigateToDetail(itemData);
                }
            });
        }

        // 좋아요 버튼 클릭 이벤트
        const likeBtn = itemFragment.querySelector('.likeBtn');
        if (likeBtn) {
            likeBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 비활성화된 카테고리의 관광지는 좋아요도 차단
                if (isCategoryInactive) {
                    this.showInactiveNotification();
                    return;
                }
                
                const itemEl = likeBtn.closest('.item');
                const spotId = itemEl.dataset.spotId;
                const userId = getCurrentUser()?.id;

                if (!userId) {
                    alert('로그인이 필요합니다');
                    return;
                }
                
                const res = await fetch(
                    `/api/tourist-spots/${spotId}/like?userId=${userId}`,
                    { method: 'POST' }
                );

                const data = await res.json();
                const liked = data.liked;

                likeBtn.classList.toggle('liked', liked);
            });
        }

        // 아이템 클릭 이벤트 (추가적인 클릭 처리)
        const itemElement = itemFragment.querySelector('.item');
        if (itemElement) {
            itemElement.dataset.spotId = itemData.id;
            
            // 카테고리 비활성화된 경우 시각적 스타일 적용
            if (isCategoryInactive) {
                itemElement.classList.add('inactive-category');
                itemElement.style.opacity = '0.6';
                itemElement.style.cursor = 'not-allowed';
                itemElement.style.position = 'relative';
                
                // 비활성화 배지 추가
                const inactiveBadge = document.createElement('div');
                inactiveBadge.className = 'inactive-badge';
                inactiveBadge.innerHTML = `
                    <span style="
                        position: absolute;
                        top: 10px;
                        left: 10px;
                        background: rgba(220, 53, 69, 0.9);
                        color: white;
                        padding: 4px 10px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: bold;
                        z-index: 10;
                        pointer-events: none;
                    ">비활성화</span>
                `;
                itemElement.insertBefore(inactiveBadge, itemElement.firstChild);
            } else {
                itemElement.style.cursor = 'pointer'; // 커서 모양 변경
            }
            
            itemElement.addEventListener('click', (e) => {
                if (!e.target.closest('.likeBtn')) {
                    // 카테고리가 비활성화된 경우 클릭 차단
                    if (isCategoryInactive) {
                        this.showInactiveNotification();
                        return;
                    }
                    if (this.onItemClick) {
                        this.onItemClick(itemData, e);
                    } else {
                        this.navigateToDetail(itemData);
                    }
                }
            });
        }

        return itemFragment;
    }

    // 비활성화 알림 표시
    showInactiveNotification() {
        // 이미 알림이 있으면 제거
        const existingNotification = document.querySelector('.inactive-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'inactive-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 20px 30px;
                border-radius: 12px;
                z-index: 10000;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                animation: fadeIn 0.3s ease;
            ">
                <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">접근 불가</p>
                <p style="margin: 0; font-size: 14px; color: #ccc;">비활성화된 카테고리의 관광지입니다.</p>
            </div>
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            </style>
        `;
        document.body.appendChild(notification);

        // 2초 후 자동 제거
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    // 리스트 렌더링
    async render() {
        try {
            // 템플릿 확인 (이미 DOM에 있음)
            const templateLoaded = await this.loadTemplate();
            if (!templateLoaded) {
                throw new Error('템플릿을 찾을 수 없습니다');
            }

            // 데이터 로드
            const data = await this.loadData();

            // 컨테이너 찾기
            const listContainer = document.querySelector(this.containerSelector);
            if (!listContainer) {
                throw new Error(`컨테이너를 찾을 수 없습니다: ${this.containerSelector}`);
            }

            // 기존 내용 제거
            listContainer.innerHTML = '';

            // 아이템 생성 및 추가
            data.forEach((itemData) => {
                const itemElement = this.createListItem(itemData);
                if (itemElement) {
                    listContainer.appendChild(itemElement);
                }
            });

            // 좋아요 상태 동기화
            await this.applyLikedState();
        } catch (error) {
            console.error('리스트 렌더링 중 오류:', error);
        }
    }

    // 좋아요 상태 동기화 함수
    async applyLikedState() {
        const userId = getCurrentUser()?.id;
        if (!userId) return;
        
        try {
            const res = await fetch(`/api/users/${userId}/liked-spots`);
            if (!res.ok) return;

            const data = await res.json();
            const likedSpotIds = new Set(
                data.likes.map(l => String(l.spotId))
            );
            document.querySelectorAll('.item').forEach(item => {
                const spotId = item.dataset.spotId;
                if (likedSpotIds.has(spotId)) {
                    item.querySelector('.likeBtn')
                        ?.classList.add('liked');
                }
            });
        } catch (e) {
            console.error('좋아요 상태 반영 실패:', e);
        }
        
    }

}

// 간편 사용을 위한 전역 함수
window.loadListComponent = async function (options) {
    const loader = new ListLoader(options);
    await loader.render();
    return loader;
};

// DOM 로드 완료 후 자동 실행 (data-list-config 속성이 있는 경우)
document.addEventListener('DOMContentLoaded', () => {
    const autoLoadElement = document.querySelector('[data-list-config]');
    if (autoLoadElement) {
        try {
            const config = JSON.parse(autoLoadElement.getAttribute('data-list-config'));
            window.loadListComponent(config);
        } catch (error) {
            console.error('자동 로드 설정 파싱 오류:', error);
        }
    }
});


