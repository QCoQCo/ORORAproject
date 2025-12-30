// 로딩 애니메이션 로더
class LoadingLoader {
    constructor() {
        this.init();
    }

    init() {
        this.loadLoadingAnimation();
    }

    loadLoadingAnimation() {
        try {
            // loading-animation.html의 내용을 직접 삽입
            const html = `
<!-- Language Loading Animation -->
<div id="languageLoading" class="language-loading">
    <div class="wave-overlay"></div>
    <div class="logoWrapper">
        <img src="/images/logo.png" alt="Arata Busan Logo" class="loading-logo" />
        <div class="logoText">あらた釜山</div>
    </div>
</div>
            `.trim();

            // body 태그의 시작 부분에 삽입
            document.body.insertAdjacentHTML('afterbegin', html);

            console.log('로딩 애니메이션 컴포넌트 로드 완료');
        } catch (error) {
            console.error('로딩 애니메이션 로드 실패:', error);
        }
    }
}

// 로딩 애니메이션 로더 초기화
document.addEventListener('DOMContentLoaded', () => {
    new LoadingLoader();
});
