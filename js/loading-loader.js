// 로딩 애니메이션 로더
class LoadingLoader {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadLoadingAnimation();
    }

    async loadLoadingAnimation() {
        try {
            const response = await fetch('/components/loading-animation.html');
            const html = await response.text();

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
