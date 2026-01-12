# Phase 3 데이터 변환 완료 요약

## 생성된 SQL 파일

1. **phase3_tourist_spots.sql** - 관광지 데이터 (80개)
2. **phase3_tourist_spot_images.sql** - 관광지 이미지 데이터 (80개)
3. **phase3_hashtags.sql** - 해시태그 데이터 (337개, 중복 제거)
4. **phase3_tourist_spot_hashtags.sql** - 관광지-해시태그 연결 데이터
5. **phase3_reviews.sql** - 리뷰 데이터 (6개, 일광해수욕장 제외)

## 실행 순서

```sql
-- 1. 해시태그 먼저 INSERT (중복 제거)
SOURCE phase3_hashtags.sql;

-- 2. 관광지 INSERT
SOURCE phase3_tourist_spots.sql;

-- 3. 관광지 이미지 INSERT
SOURCE phase3_tourist_spot_images.sql;

-- 4. 관광지-해시태그 연결 INSERT
SOURCE phase3_tourist_spot_hashtags.sql;

-- 5. 리뷰 INSERT
SOURCE phase3_reviews.sql;
```

## 주요 처리 사항

### ✅ 완료된 작업
- 지역 코드 매핑 (area_code → region_id)
- 이미지 경로 변환 (`../../images/` → `/images/`)
- 해시태그 # 제거
- 첫 번째 이미지를 대표 이미지로 설정 (rep_img_yn = 'Y')
- 카테고리 자동 추론 (해시태그 기반)
- 리뷰-관광지 매핑 (일광해수욕장 제외)

### ⚠️ 확인 필요 사항
1. **카테고리 분류**: 일부 관광지의 카테고리가 자동 추론되어 부정확할 수 있습니다.
   - 예: "부산국제영화제"가 FOOD로 분류됨 (CULTURE가 더 적합)
   - 수동으로 수정이 필요할 수 있습니다.

2. **해시태그 ID 매핑**: `phase3_tourist_spot_hashtags.sql`은 서브쿼리를 사용하므로
   - `phase3_hashtags.sql`을 먼저 실행해야 합니다.
   - 또는 실제 DB에서 해시태그 ID를 조회하여 직접 매핑할 수 있습니다.

3. **관광지 ID**: 기존 데이터(id: 1-6) 뒤에 추가되므로, 새로 추가된 관광지는 id 7부터 시작합니다.

## 통계

- 총 관광지 수: **80개**
- 총 해시태그 수: **337개** (중복 제거 후)
- 리뷰 수: **6개** (일광해수욕장 리뷰 1개 제외)

## 다음 단계

1. SQL 파일들을 순서대로 실행
2. 데이터 검증 (카테고리, 이미지 경로 등)
3. 필요시 수동 수정
