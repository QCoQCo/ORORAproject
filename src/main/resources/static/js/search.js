// 통합 검색 기능
class SearchSystem {
    constructor() {
        this.currentKeyword = '';
        this.currentTab = 'all';
        this.searchResults = {
            spots: [],
            reviews: [],
            hashtags: [],
            comments: []
        };
        this.init();
    }

    init() {
        // URL 파라미터에서 검색어 가져오기
        const urlParams = new URLSearchParams(window.location.search);
        const keyword = urlParams.get('q');
        
        if (keyword) {
            this.currentKeyword = decodeURIComponent(keyword);
            document.getElementById('search-keyword').value = this.currentKeyword;
            this.performSearch(this.currentKeyword);
        }

        // 검색 버튼 이벤트
        document.getElementById('search-btn').addEventListener('click', () => {
            this.handleSearch();
        });

        // 엔터 키 이벤트
        document.getElementById('search-keyword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // 탭 전환 이벤트
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
    }

    handleSearch() {
        const keyword = document.getElementById('search-keyword').value.trim();
        if (keyword) {
            // URL 업데이트
            window.history.pushState({}, '', `/pages/search-place/search?q=${encodeURIComponent(keyword)}`);
            this.performSearch(keyword);
        } else {
            alert('검색어를 입력해주세요.');
        }
    }

    async performSearch(keyword) {
        this.currentKeyword = keyword;
        
        // 로딩 표시
        this.showLoading();
        
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`);
            if (!response.ok) {
                throw new Error('검색 요청 실패');
            }
            
            const data = await response.json();
            this.searchResults = {
                spots: data.spots || [],
                reviews: data.reviews || [],
                hashtags: data.hashtags || [],
                comments: data.comments || []
            };
            
            this.displayResults();
            this.updateKeywordDisplay(keyword, data.totalCount || 0);
        } catch (error) {
            console.error('검색 오류:', error);
            this.showError();
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        document.getElementById('loading-results').style.display = 'block';
        document.getElementById('no-results').style.display = 'none';
        document.querySelectorAll('.result-category').forEach(el => {
            el.style.display = 'none';
        });
    }

    hideLoading() {
        document.getElementById('loading-results').style.display = 'none';
    }

    showError() {
        document.getElementById('no-results').style.display = 'block';
        document.getElementById('no-results').querySelector('p').textContent = '검색 중 오류가 발생했습니다.';
    }

    displayResults() {
        const totalCount = this.searchResults.spots.length + 
                         this.searchResults.reviews.length + 
                         this.searchResults.hashtags.length + 
                         this.searchResults.comments.length;

        if (totalCount === 0) {
            document.getElementById('no-results').style.display = 'block';
            document.querySelectorAll('.result-category').forEach(el => {
                el.style.display = 'none';
            });
            return;
        }

        document.getElementById('no-results').style.display = 'none';

        // 각 카테고리별 결과 표시
        this.displaySpots();
        this.displayReviews();
        this.displayHashtags();
        this.displayComments();

        // 현재 탭에 맞게 표시
        this.switchTab(this.currentTab);
    }

    displaySpots() {
        const container = document.getElementById('spots-grid');
        const countEl = document.getElementById('spots-count');
        const results = this.searchResults.spots;
        
        countEl.textContent = results.length;
        
        if (results.length === 0) {
            container.innerHTML = '<p class="empty-message">관광지 검색 결과가 없습니다.</p>';
            return;
        }

        container.innerHTML = results.map(spot => `
            <div class="result-item spot-item" onclick="window.location.href='/pages/detailed/detailed?id=${spot.touristSpotId || spot.id}'">
                <div class="item-content">
                    <h4 class="item-title">${this.highlightKeyword(spot.title, this.currentKeyword)}</h4>
                    ${spot.description ? `<p class="item-description">${this.highlightKeyword(spot.description.substring(0, 100), this.currentKeyword)}${spot.description.length > 100 ? '...' : ''}</p>` : ''}
                    ${spot.linkUrl ? `<a href="${spot.linkUrl}" class="item-link" target="_blank">자세히 보기</a>` : ''}
                </div>
            </div>
        `).join('');
    }

    displayReviews() {
        const container = document.getElementById('reviews-list');
        const countEl = document.getElementById('reviews-count');
        const results = this.searchResults.reviews;
        
        countEl.textContent = results.length;
        
        if (results.length === 0) {
            container.innerHTML = '<p class="empty-message">리뷰 검색 결과가 없습니다.</p>';
            return;
        }

        container.innerHTML = results.map(review => `
            <div class="result-item review-item" onclick="window.location.href='/pages/detailed/detailed?id=${review.touristSpotId}#review-${review.id}'">
                <div class="item-header">
                    <h4 class="item-title">${this.highlightKeyword(review.title, this.currentKeyword)}</h4>
                    ${review.rating ? `<span class="rating-badge">⭐ ${review.rating}</span>` : ''}
                </div>
                <p class="item-content">${this.highlightKeyword(review.content.substring(0, 150), this.currentKeyword)}${review.content.length > 150 ? '...' : ''}</p>
                <div class="item-meta">
                    <span class="meta-item">관광지: ${review.touristSpotTitle || '알 수 없음'}</span>
                    ${review.userName ? `<span class="meta-item">작성자: ${review.userName}</span>` : ''}
                    <span class="meta-item">${this.formatDate(review.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }

    displayHashtags() {
        const container = document.getElementById('hashtags-grid');
        const countEl = document.getElementById('hashtags-count');
        const results = this.searchResults.hashtags;
        
        countEl.textContent = results.length;
        
        if (results.length === 0) {
            container.innerHTML = '<p class="empty-message">태그 검색 결과가 없습니다.</p>';
            return;
        }

        container.innerHTML = results.map(hashtag => `
            <div class="tag-item" onclick="window.location.href='/pages/search-place/tag?search=${encodeURIComponent(hashtag.hashtagName || hashtag.title)}'">
                #${this.highlightKeyword(hashtag.hashtagName || hashtag.title, this.currentKeyword)}
            </div>
        `).join('');
    }

    displayComments() {
        const container = document.getElementById('comments-list');
        const countEl = document.getElementById('comments-count');
        const results = this.searchResults.comments;
        
        countEl.textContent = results.length;
        
        if (results.length === 0) {
            container.innerHTML = '<p class="empty-message">댓글 검색 결과가 없습니다.</p>';
            return;
        }

        container.innerHTML = results.map(comment => `
            <div class="result-item comment-item" onclick="window.location.href='/pages/detailed/detailed?id=${comment.touristSpotId}#review-${comment.reviewId}'">
                <div class="item-header">
                    <h4 class="item-title">${comment.reviewTitle || '댓글'}</h4>
                </div>
                <p class="item-content">${this.highlightKeyword(comment.content.substring(0, 150), this.currentKeyword)}${comment.content.length > 150 ? '...' : ''}</p>
                <div class="item-meta">
                    <span class="meta-item">관광지: ${comment.touristSpotTitle || '알 수 없음'}</span>
                    ${comment.userName ? `<span class="meta-item">작성자: ${comment.userName}</span>` : ''}
                    <span class="meta-item">${this.formatDate(comment.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // 탭 버튼 활성화
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tab) {
                btn.classList.add('active');
            }
        });

        // 결과 카테고리 표시/숨김
        if (tab === 'all') {
            // 전체 탭: 결과가 있는 카테고리만 표시
            document.querySelectorAll('.result-category').forEach(el => {
                const category = el.id.replace('-results', '');
                const count = this.getCategoryCount(category);
                el.style.display = count > 0 ? 'block' : 'none';
            });
        } else {
            // 특정 탭: 해당 카테고리만 표시
            document.querySelectorAll('.result-category').forEach(el => {
                el.style.display = 'none';
            });
            const targetEl = document.getElementById(`${tab}-results`);
            if (targetEl) {
                const count = this.getCategoryCount(tab);
                targetEl.style.display = count > 0 ? 'block' : 'none';
            }
        }
    }

    getCategoryCount(category) {
        switch(category) {
            case 'spots': return this.searchResults.spots.length;
            case 'reviews': return this.searchResults.reviews.length;
            case 'hashtags': return this.searchResults.hashtags.length;
            case 'comments': return this.searchResults.comments.length;
            default: return 0;
        }
    }

    highlightKeyword(text, keyword) {
        if (!text || !keyword) return text;
        const regex = new RegExp(`(${keyword})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR');
    }

    updateKeywordDisplay(keyword, totalCount) {
        const displayEl = document.getElementById('keyword-display');
        const keywordEl = document.getElementById('keyword-value');
        const countEl = document.getElementById('result-count');
        
        keywordEl.textContent = keyword;
        countEl.textContent = `(${totalCount}개 결과)`;
        displayEl.style.display = 'block';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new SearchSystem();
});
