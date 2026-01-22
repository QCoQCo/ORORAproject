/**
 * 날짜 포맷팅 유틸리티
 * 다양한 형식의 날짜 포맷을 지원합니다.
 */

/**
 * 날짜를 포맷팅합니다.
 * @param {string|Date} dateString - 포맷팅할 날짜
 * @param {string} format - 포맷 타입 ('default', 'dot', 'korean', 'full')
 * @returns {string} 포맷팅된 날짜 문자열
 */
function formatDate(dateString, format = 'default') {
    if (!dateString) return '';

    const dateStr = dateString.toString();

    // 날짜 문자열에서 직접 년/월/일 추출 (시간대 변환 없이)
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        const day = parseInt(match[3]);

        switch (format) {
            case 'dot':
                return `${year}. ${month}. ${day}`;
            case 'korean':
                return `${year}년 ${month}월 ${day}일`;
            case 'full':
                // 시간 정보도 추출
                const timeMatch = dateStr.match(/(\d{2}):(\d{2}):(\d{2})/);
                if (timeMatch) {
                    const hour = parseInt(timeMatch[1]);
                    const minute = parseInt(timeMatch[2]);
                    return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
                }
                return `${year}년 ${month}월 ${day}일`;
            case 'locale':
                try {
                    const date = new Date(dateString);
                    if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString('ko-KR');
                    }
                } catch (e) {
                    console.error('날짜 파싱 오류:', e);
                }
                return '';
            case 'locale-full':
                try {
                    const date = new Date(dateString);
                    if (!isNaN(date.getTime())) {
                        return date.toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                        });
                    }
                } catch (e) {
                    console.error('날짜 파싱 오류:', e);
                }
                return '';
            default:
                return `${year}. ${month}. ${day}`;
        }
    }

    // 다른 형식의 날짜인 경우
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            // 한국 시간대(UTC+9)로 변환하여 표시
            const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
            const year = koreaTime.getUTCFullYear();
            const month = koreaTime.getUTCMonth() + 1;
            const day = koreaTime.getUTCDate();

            switch (format) {
                case 'dot':
                    return `${year}. ${month}. ${day}`;
                case 'korean':
                    return `${year}년 ${month}월 ${day}일`;
                case 'locale':
                    return date.toLocaleDateString('ko-KR');
                case 'locale-full':
                    return date.toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                default:
                    return `${year}. ${month}. ${day}`;
            }
        }
    } catch (e) {
        console.error('날짜 파싱 오류:', e);
    }

    return '';
}

/**
 * 가입일 포맷팅 (한국 시간 기준)
 * @param {string|Date} dateString - 포맷팅할 날짜
 * @returns {string} 포맷팅된 날짜 문자열
 */
function formatJoinDate(dateString) {
    if (!dateString) return '정보 없음';

    const dateStr = dateString.toString();
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        const day = parseInt(match[3]);
        return `${year}년 ${month}월 ${day}일`;
    }

    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
            const year = koreaTime.getUTCFullYear();
            const month = koreaTime.getUTCMonth() + 1;
            const day = koreaTime.getUTCDate();
            return `${year}년 ${month}월 ${day}일`;
        }
    } catch (e) {
        console.error('날짜 파싱 오류:', e);
    }

    return '정보 없음';
}
