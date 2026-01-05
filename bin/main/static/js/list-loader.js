// 리스트 컴포넌트 로더
class ListLoader {
    constructor(options = {}) {
        this.containerSelector = options.containerSelector || '.list-wrap';
        // templateContainerSelector는 더 이상 사용되지 않음 (Thymeleaf fragment로 제공)
        this.dataUrl = options.dataUrl || null;
        this.data = options.data || null;
        this.fallbackImage = options.fallbackImage || 'logo.png';
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
            detailPagePath = '../detailed/detailed.html';
        } else {
            detailPagePath = './pages/detailed/detailed.html';
        }

        // 관광지 제목을 URL 파라미터로 전달
        const encodedTitle = encodeURIComponent(itemData.title);
        window.location.href = `${detailPagePath}?title=${encodedTitle}`;
    }

    // 리스트 아이템 생성
    createListItem(itemData) {
        const template = document.getElementById('list-item');
        if (!template) {
            console.error('리스트 템플릿을 찾을 수 없습니다.');
            return null;
        }

        const itemFragment = document.importNode(template.content, true);

        // 이미지 설정
        const imgElement = itemFragment.querySelector('.item-photo img');
        imgElement.src = itemData.img || '';
        imgElement.alt = itemData.title || '';
        imgElement.onerror = () => {
            imgElement.src = this.fallbackImage;
            imgElement.onerror = null;
        };

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
                    this.navigateToDetail(itemData);
                }
            });
        }

        // 좋아요 버튼 이벤트
        const likeBtn = itemFragment.querySelector('.likeBtn');
        if (likeBtn) {
            likeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                likeBtn.classList.toggle('liked');

                if (this.onLikeClick) {
                    this.onLikeClick(itemData, likeBtn.classList.contains('liked'));
                }
            });
        }

        // 아이템 클릭 이벤트 (추가적인 클릭 처리)
        const itemElement = itemFragment.querySelector('.item');
        if (itemElement) {
            itemElement.style.cursor = 'pointer'; // 커서 모양 변경
            itemElement.addEventListener('click', (e) => {
                if (!e.target.closest('.likeBtn')) {
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

            // console.log(`${data.length}개의 리스트 아이템이 렌더링되었습니다.`);
        } catch (error) {
            console.error('리스트 렌더링 중 오류:', error);
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
