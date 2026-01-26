/**
 * 날짜 포맷팅 유틸리티
 * 다양한 형식의 날짜 포맷을 지원합니다.
 */

const KST_TIME_ZONE = 'Asia/Seoul';

/**
 * 문자열 날짜를 "KST 기준"으로 Date 객체로 파싱합니다.
 * - 타임존 정보가 없는 문자열(LocalDateTime 등)은 +09:00(KST)로 간주합니다.
 * - 파싱 실패 시 null 반환
 */
function parseAsKstDate(dateInput) {
    if (!dateInput) return null;
    if (dateInput instanceof Date) {
        return isNaN(dateInput.getTime()) ? null : dateInput;
    }

    const raw = dateInput.toString().trim();
    if (!raw) return null;

    // 이미 타임존이 명시된 ISO(예: Z, +09:00, -0500 등)면 그대로 파싱
    const hasTimeZone =
        /[zZ]$/.test(raw) || /[+-]\d{2}:\d{2}$/.test(raw) || /[+-]\d{4}$/.test(raw);
    if (hasTimeZone) {
        const d = new Date(raw);
        return isNaN(d.getTime()) ? null : d;
    }

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const d = new Date(`${raw}T00:00:00+09:00`);
        return isNaN(d.getTime()) ? null : d;
    }

    // YYYY-MM-DD HH:mm(:ss(.SSS)?)?  or  YYYY-MM-DDTHH:mm(:ss(.SSS)?)?
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(raw)) {
        const isoLike = raw.replace(' ', 'T');
        const d = new Date(`${isoLike}+09:00`);
        return isNaN(d.getTime()) ? null : d;
    }

    // 그 외: 브라우저 기본 파서에 맡김 (fallback)
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
}

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
                    const date = parseAsKstDate(dateString);
                    if (date) {
                        return date.toLocaleDateString('ko-KR', { timeZone: KST_TIME_ZONE });
                    }
                } catch (e) {
                    console.error('날짜 파싱 오류:', e);
                }
                return '';
            case 'locale-full':
                try {
                    const date = parseAsKstDate(dateString);
                    if (date) {
                        return date.toLocaleString('ko-KR', {
                            timeZone: KST_TIME_ZONE,
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
        const date = parseAsKstDate(dateString);
        if (!date) return '';

        switch (format) {
            case 'dot':
                return date.toLocaleDateString('ko-KR', { timeZone: KST_TIME_ZONE }).replace(/\.$/, '');
            case 'korean': {
                const m = date.toLocaleDateString('ko-KR', { timeZone: KST_TIME_ZONE });
                // 2026. 1. 26. -> 2026년 1월 26일
                const parts = m.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\./);
                if (parts) return `${parts[1]}년 ${parseInt(parts[2])}월 ${parseInt(parts[3])}일`;
                return m;
            }
            case 'locale':
                return date.toLocaleDateString('ko-KR', { timeZone: KST_TIME_ZONE });
            case 'locale-full':
                return date.toLocaleString('ko-KR', {
                    timeZone: KST_TIME_ZONE,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            default:
                return date.toLocaleDateString('ko-KR', { timeZone: KST_TIME_ZONE }).replace(/\.$/, '');
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
        const date = parseAsKstDate(dateString);
        if (date) {
            const locale = date.toLocaleDateString('ko-KR', { timeZone: KST_TIME_ZONE });
            const parts = locale.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\./);
            if (parts) return `${parts[1]}년 ${parseInt(parts[2])}월 ${parseInt(parts[3])}일`;
            return locale;
        }
    } catch (e) {
        console.error('날짜 파싱 오류:', e);
    }

    return '정보 없음';
}
