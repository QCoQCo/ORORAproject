const themeList = document.getElementById('themeList');

class ThemeCarousel {
    constructor() {
        this.currentPage = {
            'aurora-carousel': 0,
            'user-carousel': 0,
        };
        this.itemsPerPage = 10;
        this.allData = {
            'aurora-carousel': [],
            'user-carousel': [],
        };
        this.displayedData = {
            'aurora-carousel': [],
            'user-carousel': [],
        };

        this.init();
    }

    async init() {
        try {
            // 데이터 로드
            await this.loadData();

            // 데이터 로드 후 잠시 대기
            await new Promise((resolve) => setTimeout(resolve, 100));

            // 오로라 추천 테마 렌더링
            await this.renderCarousel('aurora-carousel');

            // 유저 추천 테마 렌더링 (기본값으로 kpop)
            await this.renderCarousel('user-carousel', 'kpop');

            // 이벤트 리스너 설정
            this.setupEventListeners();
        } catch (error) {
            console.error('초기화 중 오류:', error);
            // 오류 발생 시에도 기본 UI는 표시
            this.setupEventListeners();
        }
    }

    async loadData() {
        try {
            // TODO: 백엔드 연결 시 수정 필요 - API 엔드포인트로 변경
            // 예: const response = await fetch('/api/tourist-spots');
            const response = await fetch('../../data/busanTouristSpots.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // console.log('로드된 데이터 구조:', {
            //     hasRegions: !!data.regions,
            //     regionsCount: data.regions ? Object.keys(data.regions).length : 0,
            //     firstRegion: data.regions ? Object.keys(data.regions)[0] : null,
            // });

            // 데이터 구조 확인
            if (!data || !data.regions) {
                throw new Error('데이터 구조가 올바르지 않습니다. regions 속성이 없습니다.');
            }

            // 모든 관광지 데이터를 배열로 변환
            const allSpots = [];
            Object.values(data.regions).forEach((region) => {
                if (region && region.spots && Array.isArray(region.spots)) {
                    region.spots.forEach((spot) => {
                        allSpots.push({
                            ...spot,
                            region: region.name,
                        });
                    });
                }
            });

            // console.log('전체 관광지 데이터:', allSpots.length, '개');

            // 오로라 추천 테마 (부산의 대표 관광지들 - 인기 있는 장소들)
            this.allData['aurora-carousel'] = this.getAuroraRecommendedSpots(allSpots);
            // console.log('오로라 추천 테마 데이터:', this.allData['aurora-carousel'].length, '개');

            // 유저 추천 테마 데이터 준비
            this.allData['user-carousel'] = allSpots;
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            // 오류 발생 시 빈 배열로 초기화
            this.allData['aurora-carousel'] = [];
            this.allData['user-carousel'] = [];
        }
    }

    getAuroraRecommendedSpots(allSpots) {
        // 부산의 대표적이고 인기 있는 관광지들을 선별
        const recommendedSpots = allSpots.filter((spot) => {
            // 대표 관광지, 포토스팟, 인기 장소들을 우선 선택
            return spot.hashtags.some(
                (tag) =>
                    tag.includes('부산대표명소') ||
                    tag.includes('포토스팟') ||
                    tag.includes('랜드마크') ||
                    tag.includes('인기') ||
                    tag.includes('핫플레이스') ||
                    tag.includes('절경') ||
                    tag.includes('명소') ||
                    tag.includes('대표') ||
                    // 특정 유명 장소들
                    spot.title.includes('해운대') ||
                    spot.title.includes('광안리') ||
                    spot.title.includes('감천문화마을') ||
                    spot.title.includes('태종대') ||
                    spot.title.includes('부산타워') ||
                    spot.title.includes('자갈치시장') ||
                    spot.title.includes('BIFF') ||
                    spot.title.includes('센텀시티') ||
                    spot.title.includes('범어사') ||
                    spot.title.includes('해동용궁사') ||
                    spot.title.includes('오륙도') ||
                    spot.title.includes('UN기념공원') ||
                    spot.title.includes('국제시장') ||
                    spot.title.includes('부평깡통시장') ||
                    spot.title.includes('서면') ||
                    spot.title.includes('송도') ||
                    spot.title.includes('용두산공원')
            );
        });

        // 최대 20개까지만 추천하고, 랜덤하게 섞어서 다양한 장소를 보여줌
        return this.shuffleArray(recommendedSpots).slice(0, 20);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    getBackupDataForTheme(theme, allSpots) {
        // 각 테마별로 기본 필터링된 데이터가 부족할 때 사용할 백업 데이터
        const backupKeywords = {
            kpop: [
                '데이트',
                '포토스팟',
                '카페',
                '핫플레이스',
                '젊은이',
                '트렌디',
                '로맨틱',
                '야경',
                '해운대',
                '광안리',
            ],
            culture: [
                '문화',
                '역사',
                '전통',
                '예술',
                '교육',
                '박물관',
                '사찰',
                '불교문화',
                '천년고찰',
            ],
            nature: [
                '자연',
                '산',
                '공원',
                '바다',
                '해안',
                '절경',
                '해수욕장',
                '등산',
                '산책',
                '일출',
                '일몰',
            ],
            food: [
                '시장',
                '먹거리',
                '카페',
                '디저트',
                '음식점',
                '해산물',
                '회',
                '구이',
                '찜',
                '빙수',
                '팥빙수',
            ],
            shopping: [
                '쇼핑',
                '백화점',
                '상가',
                '소품샵',
                '패션',
                '브랜드',
                '쇼핑몰',
                '기네스북',
                '센텀시티',
            ],
        };

        const keywords = backupKeywords[theme] || ['관광', '명소', '인기'];

        // 백업 키워드로 필터링
        let backupData = allSpots.filter((spot) =>
            spot.hashtags.some((tag) => keywords.some((keyword) => tag.includes(keyword)))
        );

        // 여전히 부족하면 모든 데이터에서 랜덤하게 선택
        if (backupData.length < 10) {
            backupData = this.shuffleArray(allSpots).slice(0, 15);
        }

        console.log(theme + ' 테마 백업 데이터:', backupData.length, '개');
        return backupData;
    }

    filterByTheme(spots, theme) {
        let filteredSpots = [];

        switch (theme) {
            case 'kpop':
                // K-POP 여행: 영화, 문화, 젊은이들이 좋아할 만한 장소들
                filteredSpots = spots.filter((spot) =>
                    spot.hashtags.some(
                        (tag) =>
                            tag.includes('영화') ||
                            tag.includes('문화') ||
                            tag.includes('BIFF') ||
                            tag.includes('핫플레이스') ||
                            tag.includes('젊은이') ||
                            tag.includes('트렌디') ||
                            tag.includes('데이트') ||
                            tag.includes('인스타그램') ||
                            tag.includes('포토스팟') ||
                            tag.includes('카페거리') ||
                            tag.includes('로맨틱') ||
                            tag.includes('야경') ||
                            tag.includes('광안대교') ||
                            tag.includes('해운대') ||
                            tag.includes('광안리') ||
                            spot.title.includes('BIFF') ||
                            spot.title.includes('해운대') ||
                            spot.title.includes('광안리') ||
                            spot.title.includes('감천문화마을') ||
                            spot.title.includes('전포카페거리')
                    )
                );
                break;
            case 'culture':
                // 문화 여행: 역사, 전통, 예술, 교육 관련 장소들
                filteredSpots = spots.filter((spot) =>
                    spot.hashtags.some(
                        (tag) =>
                            tag.includes('문화') ||
                            tag.includes('역사') ||
                            tag.includes('사찰') ||
                            tag.includes('전통') ||
                            tag.includes('예술') ||
                            tag.includes('교육') ||
                            tag.includes('박물관') ||
                            tag.includes('문화재') ||
                            tag.includes('전시') ||
                            tag.includes('공연') ||
                            tag.includes('불교문화') ||
                            tag.includes('천년고찰') ||
                            tag.includes('조선시대') ||
                            spot.title.includes('범어사') ||
                            spot.title.includes('해동용궁사') ||
                            spot.title.includes('동래읍성') ||
                            spot.title.includes('UN기념공원') ||
                            spot.title.includes('국립해양박물관') ||
                            spot.title.includes('감천문화마을') ||
                            spot.title.includes('흰여울문화마을')
                    )
                );
                break;
            case 'nature':
                // 자연 여행: 산, 바다, 공원, 생태 관련 장소들
                filteredSpots = spots.filter((spot) =>
                    spot.hashtags.some(
                        (tag) =>
                            tag.includes('자연') ||
                            tag.includes('산') ||
                            tag.includes('공원') ||
                            tag.includes('해안') ||
                            tag.includes('생태') ||
                            tag.includes('바다') ||
                            tag.includes('해수욕장') ||
                            tag.includes('등산') ||
                            tag.includes('산책') ||
                            tag.includes('절경') ||
                            tag.includes('일출') ||
                            tag.includes('일몰') ||
                            tag.includes('해안절벽') ||
                            tag.includes('바다뷰') ||
                            tag.includes('모래사장') ||
                            spot.title.includes('해운대') ||
                            spot.title.includes('광안리') ||
                            spot.title.includes('송정해수욕장') ||
                            spot.title.includes('송도해수욕장') ||
                            spot.title.includes('다대포해수욕장') ||
                            spot.title.includes('태종대') ||
                            spot.title.includes('오륙도') ||
                            spot.title.includes('이기대공원') ||
                            spot.title.includes('금정산') ||
                            spot.title.includes('몰운대') ||
                            spot.title.includes('아홉산숲')
                    )
                );
                break;
            case 'food':
                // 음식 여행: 시장, 맛집, 해산물, 카페 관련 장소들
                filteredSpots = spots.filter((spot) =>
                    spot.hashtags.some(
                        (tag) =>
                            tag.includes('시장') ||
                            tag.includes('먹거리') ||
                            tag.includes('맛집') ||
                            tag.includes('해산물') ||
                            tag.includes('카페') ||
                            tag.includes('디저트') ||
                            tag.includes('음식점') ||
                            tag.includes('로컬푸드') ||
                            tag.includes('전통시장') ||
                            tag.includes('야시장') ||
                            tag.includes('회') ||
                            tag.includes('구이') ||
                            tag.includes('찜') ||
                            tag.includes('빙수') ||
                            tag.includes('팥빙수') ||
                            spot.title.includes('자갈치시장') ||
                            spot.title.includes('국제시장') ||
                            spot.title.includes('부평깡통시장') ||
                            spot.title.includes('구포시장') ||
                            spot.title.includes('연산동') ||
                            spot.title.includes('카페') ||
                            spot.title.includes('빙수') ||
                            spot.title.includes('디저트')
                    )
                );
                break;
            case 'shopping':
                // 쇼핑 여행: 백화점, 상가, 소품샵 관련 장소들
                filteredSpots = spots.filter((spot) =>
                    spot.hashtags.some(
                        (tag) =>
                            tag.includes('쇼핑') ||
                            tag.includes('백화점') ||
                            tag.includes('상가') ||
                            tag.includes('지하상가') ||
                            tag.includes('소품샵') ||
                            tag.includes('편집샵') ||
                            tag.includes('패션') ||
                            tag.includes('액세서리') ||
                            tag.includes('브랜드') ||
                            tag.includes('기네스북') ||
                            tag.includes('쇼핑몰') ||
                            spot.title.includes('센텀시티') ||
                            spot.title.includes('신세계') ||
                            spot.title.includes('서면') ||
                            spot.title.includes('지하상가') ||
                            spot.title.includes('소품샵') ||
                            spot.title.includes('편집샵') ||
                            spot.title.includes('패치킹') ||
                            spot.title.includes('파도블') ||
                            spot.title.includes('이티비티샵')
                    )
                );
                break;
            default:
                return spots;
        }

        // 테마별 우선순위에 따라 정렬
        return this.sortByThemePriority(filteredSpots, theme);
    }

    sortByThemePriority(spots, theme) {
        const priorityKeywords = {
            kpop: ['BIFF', '핫플레이스', '포토스팟', '데이트', '젊은이', '트렌디'],
            culture: ['박물관', '문화재', '사찰', '역사', '전통', '예술'],
            nature: ['절경', '일출', '일몰', '해수욕장', '산', '공원'],
            food: ['시장', '해산물', '맛집', '카페', '디저트', '전통시장'],
            shopping: ['백화점', '센텀시티', '쇼핑몰', '소품샵', '편집샵', '브랜드'],
        };

        const keywords = priorityKeywords[theme] || [];

        return spots.sort((a, b) => {
            const scoreA = this.calculatePriorityScore(a, keywords);
            const scoreB = this.calculatePriorityScore(b, keywords);
            return scoreB - scoreA; // 높은 점수부터 정렬
        });
    }

    calculatePriorityScore(spot, keywords) {
        let score = 0;
        spot.hashtags.forEach((tag) => {
            keywords.forEach((keyword, index) => {
                if (tag.includes(keyword)) {
                    score += (keywords.length - index) * 10; // 앞에 있을수록 높은 점수
                }
            });
        });
        return score;
    }

    async renderCarousel(carouselId, theme = null) {
        try {
            // 리스트 템플릿 로드
            await this.loadListTemplate();

            let data = this.allData[carouselId] || [];

            // 유저 추천 테마인 경우 테마별 필터링
            if (carouselId === 'user-carousel' && theme) {
                data = this.filterByTheme(this.allData[carouselId] || [], theme);
                // console.log(`${theme} 테마 필터링 결과:`, data.length, '개');

                // 필터링된 데이터가 부족한 경우 백업 데이터 추가
                if (data.length < 5) {
                    // console.log(`${theme} 테마 데이터 부족, 백업 데이터 사용`);
                    data = this.getBackupDataForTheme(theme, this.allData[carouselId] || []);
                }
            }

            // 데이터가 없는 경우 처리
            if (!data || data.length === 0) {
                console.warn(`${carouselId}에 표시할 데이터가 없습니다.`);
                const grid = document.getElementById(carouselId);
                if (grid) {
                    grid.innerHTML = '<div class="no-data">데이터를 불러오는 중입니다...</div>';
                }
                return;
            }

            // 현재 페이지까지의 데이터 계산
            const startIndex = 0;
            const endIndex = (this.currentPage[carouselId] + 1) * this.itemsPerPage;
            this.displayedData[carouselId] = data.slice(startIndex, endIndex);

            // 그리드 렌더링
            const grid = document.getElementById(carouselId);
            if (grid) {
                grid.innerHTML = '';

                this.displayedData[carouselId].forEach((item) => {
                    const itemElement = this.createListItem(item);
                    if (itemElement) {
                        grid.appendChild(itemElement);
                    }
                });
            }

            // 더보기 버튼 상태 업데이트
            this.updateMoreButton(carouselId, data.length);
        } catch (error) {
            console.error('테마 그리드 렌더링 중 오류:', error);
            const grid = document.getElementById(carouselId);
            if (grid) {
                grid.innerHTML =
                    '<div class="no-data">데이터를 불러오는 중 오류가 발생했습니다.</div>';
            }
        }
    }

    async loadListTemplate() {
        try {
            const response = await fetch('/components/list-item.html');
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
        const remainingItems = totalItems - currentDisplayed;

        // 더보기 버튼 (더 이상 표시할 항목이 없으면 비활성화)
        if (moreBtn) {
            moreBtn.disabled = !canShowMore;
            const btnText = moreBtn.querySelector('span');
            if (btnText) {
                if (canShowMore) {
                    btnText.textContent = `더보기 (${remainingItems}개 더)`;
                } else {
                    btnText.textContent = '모든 항목을 표시했습니다';
                }
            }
        }
    }

    setupEventListeners() {
        // 더보기 버튼 이벤트
        document.querySelectorAll('.more-btn').forEach((btn) => {
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

                // 그리드 모드가 이미 활성화되어 있다면 유지
                const grid = document.getElementById('user-carousel');
                if (grid && grid.classList.contains('grid-mode')) {
                    // 그리드 모드 유지
                } else {
                    // 초기 상태로 리셋
                    grid.classList.remove('grid-mode');
                }

                this.renderCarousel('user-carousel', e.target.value);
            });
        }
    }

    loadMore(carouselId) {
        this.currentPage[carouselId]++;

        const theme =
            carouselId === 'user-carousel' ? document.getElementById('theme').value : null;

        // 그리드 모드로 전환
        const grid = document.getElementById(carouselId);
        if (grid) {
            grid.classList.add('grid-mode');
        }

        // 그리드 애니메이션 효과를 위한 처리
        if (grid) {
            grid.style.opacity = '0.7';
            grid.style.transform = 'scale(0.98)';
        }

        // 약간의 지연 후 렌더링하여 부드러운 전환 효과
        setTimeout(() => {
            this.renderCarousel(carouselId, theme);

            // 애니메이션 복원
            if (grid) {
                grid.style.opacity = '1';
                grid.style.transform = 'scale(1)';
            }
        }, 150);
    }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    new ThemeCarousel();
});
