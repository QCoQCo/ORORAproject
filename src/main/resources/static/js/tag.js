class TagSearchSystem {
    constructor() {
        this.allSpots = [];
        this.allTags = new Map(); // tag -> count
        this.selectedTags = new Set();
        this.filteredSpots = [];
        this.currentResults = [];
        this.resultsPerPage = 12;
        this.currentPage = 0;
        this.isAllTagsExpanded = false; // 전체 태그 펼침 상태

        this.init();
    }

    async init() {
        try {
            // 데이터 로드
            await this.loadData();

            // 태그 추출 및 정리
            this.extractTags();

            // 초기 렌더링
            this.renderPopularTags();
            this.renderAllTags();
            this.updateTagCount();

            // 이벤트 리스너 설정
            this.setupEventListeners();

            // 초기 검색 결과 표시 (모든 관광지)
            this.performSearch();
        } catch (error) {
            console.error('태그 검색 시스템 초기화 오류:', error);
        }
    }

    async loadData() {
        try {
            // 백엔드 API 엔드포인트 사용 (태그 검색 전용)
            const response = await fetch('/api/tag-spots');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            this.allSpots = [];

            // API 응답 형식에 맞춰 데이터 처리
            if (data && data.regions) {
                // regions가 객체인 경우 (기대하는 형식)
                if (typeof data.regions === 'object' && !Array.isArray(data.regions)) {
                    Object.values(data.regions).forEach((region) => {
                        if (region && region.spots && Array.isArray(region.spots)) {
                            region.spots.forEach((spot) => {
                                this.allSpots.push({
                                    ...spot,
                                    region: region.name,
                                    regionCode: region.code || region.areaCode,
                                });
                            });
                        }
                    });

                    // 축제/행사 데이터 처리
                    if (data.regions.festivals && Array.isArray(data.regions.festivals.events)) {
                        data.regions.festivals.events.forEach((event) => {
                            this.allSpots.push({
                                ...event,
                                region: '축제/행사',
                                regionCode: 'festival',
                            });
                        });
                    }
                }
                // regions가 배열인 경우 (대체 형식)
                else if (Array.isArray(data.regions)) {
                    data.regions.forEach((region) => {
                        if (region && region.spots && Array.isArray(region.spots)) {
                            region.spots.forEach((spot) => {
                                this.allSpots.push({
                                    ...spot,
                                    region: region.name,
                                    regionCode: region.code || region.areaCode,
                                });
                            });
                        }
                    });
                }
            } else {
                console.error('데이터 구조 오류: regions 속성이 없습니다.', data);
            }
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            // 에러 발생 시 빈 배열로 초기화하여 페이지가 정상적으로 로드되도록 함
            this.allSpots = [];
        }
    }

    extractTags() {
        this.allTags.clear();

        this.allSpots.forEach((spot) => {
            if (spot.hashtags && Array.isArray(spot.hashtags)) {
                spot.hashtags.forEach((tag) => {
                    // 데이터베이스에서 # 기호 없이 저장되므로 그대로 사용
                    const cleanTag = tag.trim();
                    if (cleanTag) {
                        const count = this.allTags.get(cleanTag) || 0;
                        this.allTags.set(cleanTag, count + 1);
                    }
                });
            }
        });
    }

    renderPopularTags() {
        const popularTagsContainer = document.getElementById('popular-tags');
        if (!popularTagsContainer) return;

        // 인기 태그 (사용 빈도 기준 상위 15개)
        const sortedTags = Array.from(this.allTags.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);

        popularTagsContainer.innerHTML = '';
        sortedTags.forEach(([tag, count]) => {
            const tagElement = this.createTagElement(tag, count, 'popular');
            popularTagsContainer.appendChild(tagElement);
        });
    }

    renderAllTags() {
        const allTagsContainer = document.getElementById('all-tags');
        if (!allTagsContainer) return;

        // 모든 태그 알파벳 순 정렬
        const sortedTags = Array.from(this.allTags.entries()).sort((a, b) =>
            a[0].localeCompare(b[0])
        );

        allTagsContainer.innerHTML = '';
        sortedTags.forEach(([tag, count]) => {
            const tagElement = this.createTagElement(tag, count, 'all');
            allTagsContainer.appendChild(tagElement);
        });

        // 초기 상태 설정 (접힌 상태)
        this.setAllTagsCollapsedState();

        // 태그가 많을 때 페이드 효과 적용
        this.updateFadeEffect();
    }

    createTagElement(tag, count, type) {
        const tagElement = document.createElement('span');
        tagElement.className = `tag-item ${type}-tag`;
        tagElement.textContent = `#${tag} (${count})`;
        tagElement.dataset.tag = tag;

        // 선택된 태그인지 확인
        if (this.selectedTags.has(tag)) {
            tagElement.classList.add('selected');
        }

        tagElement.addEventListener('click', () => {
            this.toggleTag(tag);
        });

        return tagElement;
    }

    toggleTag(tag) {
        if (this.selectedTags.has(tag)) {
            this.selectedTags.delete(tag);
        } else {
            this.selectedTags.add(tag);
        }

        this.updateSelectedTagsDisplay();
        this.updateTagStyles();
        this.performSearch();
    }

    updateSelectedTagsDisplay() {
        const selectedTagsSection = document.getElementById('selected-tags-section');
        const selectedTagsContainer = document.getElementById('selected-tags');

        if (this.selectedTags.size === 0) {
            selectedTagsSection.style.display = 'none';
            return;
        }

        selectedTagsSection.style.display = 'block';
        selectedTagsContainer.innerHTML = '';

        this.selectedTags.forEach((tag) => {
            const tagElement = document.createElement('span');
            tagElement.className = 'selected-tag-item';
            tagElement.innerHTML = `
                #${tag}
                <button type="button" class="remove-tag-btn" data-tag="${tag}">×</button>
            `;
            selectedTagsContainer.appendChild(tagElement);
        });
    }

    updateTagStyles() {
        // 모든 태그 요소의 선택 상태 업데이트
        document.querySelectorAll('.tag-item').forEach((element) => {
            const tag = element.dataset.tag;
            if (this.selectedTags.has(tag)) {
                element.classList.add('selected');
            } else {
                element.classList.remove('selected');
            }
        });
    }

    updateTagCount() {
        const tagCountElement = document.getElementById('tag-count');
        if (tagCountElement) {
            tagCountElement.textContent = `(${this.allTags.size}개)`;
        }
    }

    performSearch(searchQuery = '') {
        this.currentPage = 0;

        // 검색 조건에 맞는 관광지 필터링
        this.filteredSpots = this.allSpots.filter((spot) => {
            // 선택된 태그로 필터링 (AND 연산: 모든 선택된 태그를 포함해야 함)
            if (this.selectedTags.size > 0) {
                const spotTags = spot.hashtags.map((tag) => tag.trim());
                const hasAllSelectedTags = Array.from(this.selectedTags).every((selectedTag) =>
                    spotTags.includes(selectedTag)
                );
                if (!hasAllSelectedTags) return false;
            }

            // 검색어로 필터링
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const titleMatch = spot.title.toLowerCase().includes(query);
                const descMatch = spot.description.toLowerCase().includes(query);
                const tagMatch = spot.hashtags.some((tag) => tag.toLowerCase().includes(query));
                const regionMatch = spot.region.toLowerCase().includes(query);

                return titleMatch || descMatch || tagMatch || regionMatch;
            }

            return true;
        });

        // 카테고리 필터 적용
        const categoryFilter = document.getElementById('category-filter').value;
        if (categoryFilter !== 'all') {
            this.filteredSpots = this.filteredSpots.filter((spot) =>
                this.matchesCategory(spot, categoryFilter)
            );
        }

        // 정렬
        this.sortResults();

        // 결과 표시
        this.displayResults();
    }

    matchesCategory(spot, category) {
        const tags = spot.hashtags.map((tag) => tag.toLowerCase());

        switch (category) {
            case 'attraction':
                return tags.some(
                    (tag) =>
                        tag.includes('명소') ||
                        tag.includes('관광') ||
                        tag.includes('전망') ||
                        tag.includes('포토스팟') ||
                        tag.includes('랜드마크')
                );
            case 'nature':
                return tags.some(
                    (tag) =>
                        tag.includes('자연') ||
                        tag.includes('공원') ||
                        tag.includes('산') ||
                        tag.includes('해수욕장') ||
                        tag.includes('바다') ||
                        tag.includes('생태')
                );
            case 'culture':
                return tags.some(
                    (tag) =>
                        tag.includes('문화') ||
                        tag.includes('역사') ||
                        tag.includes('사찰') ||
                        tag.includes('전통') ||
                        tag.includes('예술') ||
                        tag.includes('박물관')
                );
            case 'food':
                return tags.some(
                    (tag) =>
                        tag.includes('먹거리') ||
                        tag.includes('시장') ||
                        tag.includes('맛집') ||
                        tag.includes('카페') ||
                        tag.includes('해산물') ||
                        tag.includes('로컬푸드')
                );
            case 'activity':
                return tags.some(
                    (tag) =>
                        tag.includes('서핑') ||
                        tag.includes('요트') ||
                        tag.includes('케이블카') ||
                        tag.includes('등산') ||
                        tag.includes('자전거') ||
                        tag.includes('운동')
                );
            case 'shopping':
                return tags.some(
                    (tag) =>
                        tag.includes('쇼핑') ||
                        tag.includes('백화점') ||
                        tag.includes('상가') ||
                        tag.includes('브랜드') ||
                        tag.includes('패션')
                );
            case 'relaxation':
                return tags.some(
                    (tag) =>
                        tag.includes('힐링') ||
                        tag.includes('휴식') ||
                        tag.includes('온천') ||
                        tag.includes('조용') ||
                        tag.includes('명상')
                );
            default:
                return true;
        }
    }

    sortResults() {
        const sortSelect = document.getElementById('sort-select');
        const sortBy = sortSelect.value;

        switch (sortBy) {
            case 'name':
                this.filteredSpots.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'region':
                this.filteredSpots.sort((a, b) => a.region.localeCompare(b.region));
                break;
            case 'relevance':
            default:
                // 선택된 태그와의 일치도로 정렬
                if (this.selectedTags.size > 0) {
                    this.filteredSpots.sort((a, b) => {
                        const aMatches = this.countTagMatches(a);
                        const bMatches = this.countTagMatches(b);
                        return bMatches - aMatches;
                    });
                }
                break;
        }
    }

    countTagMatches(spot) {
        const spotTags = spot.hashtags.map((tag) => tag.trim());
        return Array.from(this.selectedTags).filter((selectedTag) => spotTags.includes(selectedTag))
            .length;
    }

    async displayResults() {
        const resultsGrid = document.getElementById('results-grid');
        const resultsCount = document.getElementById('results-count');
        const loadMoreSection = document.getElementById('load-more-section');

        // 결과 개수 업데이트
        resultsCount.textContent = `(${this.filteredSpots.length}개)`;

        // 현재 페이지까지의 결과 계산
        const endIndex = (this.currentPage + 1) * this.resultsPerPage;
        this.currentResults = this.filteredSpots.slice(0, endIndex);

        // 리스트 템플릿 로드
        await this.loadListTemplate();

        // 결과 표시
        resultsGrid.innerHTML = '';
        this.currentResults.forEach((spot) => {
            const itemElement = this.createResultItem(spot);
            if (itemElement) {
                resultsGrid.appendChild(itemElement);
            }
        });

        // 더보기 버튼 표시/숨김
        const hasMore = this.currentResults.length < this.filteredSpots.length;
        loadMoreSection.style.display = hasMore ? 'block' : 'none';
    }

    async loadListTemplate() {
        // 템플릿은 이제 Thymeleaf fragment로 제공되므로 로드 불필요
        // 템플릿이 이미 DOM에 있는지 확인만 수행
        const template = document.getElementById('list-item');
        if (!template) {
            console.warn(
                '리스트 템플릿을 찾을 수 없습니다. Thymeleaf fragment가 포함되어 있는지 확인하세요.'
            );
        }
    }

    createResultItem(spot) {
        const template = document.getElementById('list-item');
        if (!template) {
            console.error('리스트 템플릿을 찾을 수 없습니다.');
            return null;
        }

        const itemFragment = document.importNode(template.content, true);

        // 이미지 설정
        const imgElement = itemFragment.querySelector('.item-photo img');
        if (imgElement) {
            // 백엔드 API 응답 형식에 맞춰 imageUrl 사용
            imgElement.src = spot.imageUrl || spot.img || '';
            imgElement.alt = spot.title || '';
            imgElement.onerror = () => {
                // Thymeleaf 정적 리소스 경로 사용
                imgElement.src = '/images/common.jpg';
                imgElement.onerror = null;
            };
        }

        // 텍스트 데이터 설정
        const titleElement = itemFragment.querySelector('.item-title');
        if (titleElement) {
            titleElement.textContent = spot.title || '';
        }

        const descriptionElement = itemFragment.querySelector('.item-description');
        if (descriptionElement) {
            descriptionElement.textContent = spot.description || '';
        }

        const hashtagElement = itemFragment.querySelector('.hash-tag');
        if (hashtagElement && spot.hashtags) {
            // 선택된 태그는 강조 표시
            const hashtagText = spot.hashtags
                .map((tag) => {
                    const cleanTag = tag.trim();
                    if (this.selectedTags.has(cleanTag)) {
                        return `<strong>#${tag}</strong>`;
                    }
                    return `#${tag}`;
                })
                .join(' ');
            hashtagElement.innerHTML = hashtagText;
        }

        // 지역 정보 추가
        const regionElement = itemFragment.querySelector('.item-info');
        if (regionElement) {
            const regionInfo = document.createElement('p');
            regionInfo.className = 'item-region';
            regionInfo.textContent = `📍 ${spot.region}`;
            regionElement.appendChild(regionInfo);
        }

        // 링크 설정 - 상세 페이지로 이동
        const linkElement = itemFragment.querySelector('.item-link');
        if (linkElement) {
            linkElement.href = 'javascript:void(0)'; // 기본 링크 동작 방지
            linkElement.addEventListener('click', (e) => {
                e.preventDefault();
                if (!e.target.closest('.likeBtn')) {
                    this.navigateToDetail(spot);
                }
            });
        }

        // 아이템 클릭 이벤트
        const itemElement = itemFragment.querySelector('.item');
        if (itemElement) {
            itemElement.style.cursor = 'pointer';
            itemElement.addEventListener('click', (e) => {
                if (!e.target.closest('.likeBtn')) {
                    this.navigateToDetail(spot);
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
    navigateToDetail(spot) {
        // 관광지 ID만 사용 (title 기반 검색은 사용하지 않음)
        const spotId = spot.id;

        // ID가 유효한 경우에만 이동
        if (spotId != null && spotId !== undefined && spotId !== '' && spotId !== 0) {
            window.location.href = `/pages/detailed/detailed?id=${spotId}`;
        } else {
            console.error('관광지 ID가 없습니다. spot 객체:', spot);
            alert('관광지 정보를 불러올 수 없습니다. ID가 필요합니다.');
        }
    }

    loadMore() {
        this.currentPage++;
        this.displayResults();
    }

    clearAllTags() {
        this.selectedTags.clear();
        this.updateSelectedTagsDisplay();
        this.updateTagStyles();
        this.performSearch();
    }

    // 전체 태그 접기/펼치기 관련 메서드들
    setAllTagsCollapsedState() {
        const allTagsContainer = document.getElementById('all-tags');
        const toggleBtn = document.getElementById('toggle-all-tags');

        if (!this.isAllTagsExpanded) {
            allTagsContainer.classList.add('collapsed');
            allTagsContainer.classList.remove('expanded');
            toggleBtn.classList.add('collapsed');
        } else {
            allTagsContainer.classList.remove('collapsed');
            allTagsContainer.classList.add('expanded');
            toggleBtn.classList.remove('collapsed');
        }
    }

    toggleAllTags() {
        this.isAllTagsExpanded = !this.isAllTagsExpanded;
        this.setAllTagsCollapsedState();
        this.updateFadeEffect();
    }

    updateFadeEffect() {
        const allTagsContainer = document.getElementById('all-tags');

        // 접힌 상태에서만 페이드 효과 적용
        if (!this.isAllTagsExpanded && allTagsContainer.scrollHeight > 200) {
            allTagsContainer.classList.add('show-fade');
        } else {
            allTagsContainer.classList.remove('show-fade');
        }
    }

    setupEventListeners() {
        // 검색 버튼
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-keyword');

        const performSearchHandler = () => {
            const searchQuery = searchInput.value.trim();
            this.performSearch(searchQuery);
        };

        searchBtn.addEventListener('click', performSearchHandler);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearchHandler();
            }
        });

        // 카테고리 필터
        const categoryFilter = document.getElementById('category-filter');
        categoryFilter.addEventListener('change', () => {
            this.performSearch(searchInput.value.trim());
        });

        // 정렬 옵션
        const sortSelect = document.getElementById('sort-select');
        sortSelect.addEventListener('change', () => {
            this.performSearch(searchInput.value.trim());
        });

        // 모든 태그 지우기 버튼
        const clearTagsBtn = document.getElementById('clear-tags-btn');
        clearTagsBtn.addEventListener('click', () => {
            this.clearAllTags();
        });

        // 선택된 태그 제거 버튼 이벤트 위임 (한 번만 등록)
        const selectedTagsContainer = document.getElementById('selected-tags');
        if (selectedTagsContainer) {
            selectedTagsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-tag-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const tag = e.target.dataset.tag;
                    if (tag) {
                        this.toggleTag(tag);
                    }
                }
            });
        }

        // 더보기 버튼
        const loadMoreBtn = document.getElementById('load-more-btn');
        loadMoreBtn.addEventListener('click', () => {
            this.loadMore();
        });

        // 전체 태그 토글 버튼
        const toggleAllTagsBtn = document.getElementById('toggle-all-tags');
        toggleAllTagsBtn.addEventListener('click', () => {
            this.toggleAllTags();
        });

        // 실시간 검색 (옵션)
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(searchInput.value.trim());
            }, 500);
        });
    }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    new TagSearchSystem();

    const scrollTopBtn = document.querySelector('#scrollTop');

    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        });
    }
});
