const themeList = document.getElementById('themeList');

class ThemeCarousel {
    constructor() {
        this.currentPage = {
            'aurora-carousel': 0,
            'user-carousel': 0
        };
        this.itemsPerPage = 10;
        this.allData = {
            'aurora-carousel': [],
            'user-carousel': []
        };
        this.displayedData = {
            'aurora-carousel': [],
            'user-carousel': []
        };
        
        this.init();
    }

    async init() {
        try {
            // 데이터 로드
            await this.loadData();
            
            // 오로라 추천 테마 렌더링
            await this.renderCarousel('aurora-carousel');
            
            // 유저 추천 테마 렌더링 (기본값으로 kpop)
            await this.renderCarousel('user-carousel', 'kpop');
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
        } catch (error) {
            console.error('초기화 중 오류:', error);
        }
    }

    async loadData() {
        try {
            const response = await fetch('../../data/busanTouristSpots.json');
            const data = await response.json();
            
            // 모든 관광지 데이터를 배열로 변환
            const allSpots = [];
            Object.values(data.regions).forEach(region => {
                region.spots.forEach(spot => {
                    allSpots.push({
                        ...spot,
                        region: region.name
                    });
                });
            });
            
            // 오로라 추천 테마 (K-POP 관련 데이터)
            this.allData['aurora-carousel'] = this.filterByTheme(allSpots, 'kpop');
            
            // 유저 추천 테마 데이터 준비
            this.allData['user-carousel'] = allSpots;
            
        } catch (error) {
            console.error('데이터 로드 실패:', error);
        }
    }

    filterByTheme(spots, theme) {
        switch(theme) {
            case 'kpop':
                return spots.filter(spot => 
                    spot.hashtags.some(tag => 
                        tag.includes('영화') || tag.includes('문화') || tag.includes('BIFF')
                    )
                );
            case 'culture':
                return spots.filter(spot => 
                    spot.hashtags.some(tag => 
                        tag.includes('문화') || tag.includes('역사') || tag.includes('사찰') || tag.includes('전통')
                    )
                );
            case 'nature':
                return spots.filter(spot => 
                    spot.hashtags.some(tag => 
                        tag.includes('자연') || tag.includes('산') || tag.includes('공원') || tag.includes('해안') || tag.includes('생태')
                    )
                );
            case 'food':
                return spots.filter(spot => 
                    spot.hashtags.some(tag => 
                        tag.includes('시장') || tag.includes('먹거리') || tag.includes('맛집') || tag.includes('해산물')
                    )
                );
            case 'shopping':
                return spots.filter(spot => 
                    spot.hashtags.some(tag => 
                        tag.includes('쇼핑') || tag.includes('백화점') || tag.includes('상가')
                    )
                );
            default:
                return spots;
        }
    }

    async renderCarousel(carouselId, theme = null) {
        try {
            // 리스트 템플릿 로드
            await this.loadListTemplate();
            
            let data = this.allData[carouselId];
            
            // 유저 추천 테마인 경우 테마별 필터링
            if (carouselId === 'user-carousel' && theme) {
                data = this.filterByTheme(this.allData[carouselId], theme);
            }
            
            // 현재 페이지까지의 데이터 계산
            const startIndex = 0;
            const endIndex = (this.currentPage[carouselId] + 1) * this.itemsPerPage;
            this.displayedData[carouselId] = data.slice(startIndex, endIndex);
            
            // 그리드 렌더링
            const grid = document.getElementById(carouselId);
            grid.innerHTML = '';
            
            this.displayedData[carouselId].forEach(item => {
                const itemElement = this.createListItem(item);
                if (itemElement) {
                    grid.appendChild(itemElement);
                }
            });
            
            // 더보기 버튼 상태 업데이트
            this.updateMoreButton(carouselId, data.length);
            
        } catch (error) {
            console.error('테마 그리드 렌더링 중 오류:', error);
        }
    }

    async loadListTemplate() {
        try {
            const response = await fetch('../../components/list-item.html');
            const templateHTML = await response.text();
            
            const templateContainer = document.getElementById('list-template-container');
            if (templateContainer && !templateContainer.innerHTML.trim()) {
                templateContainer.innerHTML = templateHTML;
            }
        } catch (error) {
            console.error('템플릿 로드 실패:', error);
        }
    }

    createListItem(itemData) {
        const template = document.getElementById('list-item');
        if (!template) {
            console.error('리스트 템플릿을 찾을 수 없습니다.');
            return null;
        }

        const itemFragment = document.importNode(template.content, true);

        // 이미지 설정
        const imgElement = itemFragment.querySelector('.item-photo img');
        if (imgElement) {
            imgElement.src = itemData.img || '';
            imgElement.alt = itemData.title || '';
            imgElement.onerror = () => {
                imgElement.src = '../../images/common.jpg';
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

        // 링크 설정 - 상세 페이지로 이동
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

        // 아이템 클릭 이벤트
        const itemElement = itemFragment.querySelector('.item');
        if (itemElement) {
            itemElement.style.cursor = 'pointer';
            itemElement.addEventListener('click', (e) => {
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
            });
        }

        return itemFragment;
    }

    // 상세 페이지로 이동하는 함수
    navigateToDetail(itemData) {
        const encodedTitle = encodeURIComponent(itemData.title);
        window.location.href = `../detailed/detailed.html?title=${encodedTitle}`;
    }

    updateMoreButton(carouselId, totalItems) {
        const moreBtn = document.querySelector(`[data-carousel="${carouselId}"].more-btn`);
        
        const currentDisplayed = this.displayedData[carouselId].length;
        const canShowMore = currentDisplayed < totalItems;
        
        // 더보기 버튼 (더 이상 표시할 항목이 없으면 비활성화)
        if (moreBtn) {
            moreBtn.disabled = !canShowMore;
            const btnText = moreBtn.querySelector('span');
            if (btnText) {
                btnText.textContent = canShowMore ? '더보기' : '모든 항목을 표시했습니다';
            }
        }
    }

    setupEventListeners() {
        // 더보기 버튼 이벤트
        document.querySelectorAll('.more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const carouselId = e.target.closest('.more-btn').dataset.carousel;
                this.loadMore(carouselId);
            });
        });

        // 테마 선택 이벤트
        const themeSelect = document.getElementById('theme');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.currentPage['user-carousel'] = 0;
                this.renderCarousel('user-carousel', e.target.value);
            });
        }
    }

    loadMore(carouselId) {
        this.currentPage[carouselId]++;
        
        const theme = carouselId === 'user-carousel' ? 
            document.getElementById('theme').value : null;
            
        this.renderCarousel(carouselId, theme);
    }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    new ThemeCarousel();
});

