#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JSON 데이터를 SQL INSERT 문으로 변환하는 스크립트
"""

import json
import re
from pathlib import Path

# 지역 코드 매핑 (area_code -> region_id)
REGION_MAPPING = {
    "26710": 1,  # 기장군
    "26410": 2,  # 금정구
    "26440": 3,  # 해운대구
    "26290": 4,  # 동래구
    "26320": 5,  # 북구
    "26350": 6,  # 강서구
    "26530": 7,  # 사상구
    "26200": 8,  # 부산진구
    "26260": 9,  # 남구
    "26380": 10, # 사하구
    "26230": 11, # 동구
    "26140": 12, # 서구
    "26110": 13, # 중구
    "26470": 14, # 연제구
    "26500": 15, # 수영구
    "26170": 16, # 영도구
}

# 카테고리 추론 함수
def infer_category(hashtags):
    """해시태그 기반으로 카테고리 추론 (우선순위 순)"""
    hashtags_lower = [tag.lower().replace('#', '') for tag in hashtags]
    
    # 우선순위에 따라 체크 (더 구체적인 것부터)
    if any(tag in ['사찰', '천년고찰', '불교문화', '문화재', '박물관', '전시', '예술', '역사', '전통문화'] for tag in hashtags_lower):
        return 'CULTURE'
    if any(tag in ['카페', '커피', '디저트', '빙수'] for tag in hashtags_lower):
        return 'CAFE'
    if any(tag in ['해수욕장', '해변', '서핑'] for tag in hashtags_lower):
        return 'BEACH'
    if any(tag in ['산', '등산', '하이킹', '금정산'] for tag in hashtags_lower):
        return 'MOUNTAIN'
    if any(tag in ['전통시장', '먹거리', '해산물', '맛집', '음식점'] for tag in hashtags_lower):
        return 'FOOD'
    if any(tag in ['쇼핑', '쇼핑몰', '백화점', '소품샵', '편집샵'] for tag in hashtags_lower):
        return 'SHOPPING'
    if any(tag in ['문화', '역사', '전통', '예술'] for tag in hashtags_lower):
        return 'CULTURE'
    
    return 'ETC'

# SQL 이스케이프 함수
def escape_sql_string(s):
    """SQL 문자열 이스케이프"""
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''").replace("\\", "\\\\") + "'"

# 이미지 경로 변환
def convert_image_path(img_path):
    """../../images/파일명.jpg -> /images/파일명.jpg"""
    if not img_path:
        return None
    if img_path.startswith('../../images/'):
        return '/images/' + img_path.replace('../../images/', '')
    if img_path.startswith('../images/'):
        return '/images/' + img_path.replace('../images/', '')
    if not img_path.startswith('/'):
        return '/images/' + img_path
    return img_path

# 파일명 추출
def extract_filename(img_path):
    """이미지 경로에서 파일명 추출"""
    if not img_path:
        return None
    return img_path.split('/')[-1]

def main():
    # JSON 파일 읽기
    base_path = Path(__file__).parent / 'the_whole_data'
    spots_file = base_path / 'busanTouristSpots.json'
    reviews_file = base_path / 'userReview.json'
    
    with open(spots_file, 'r', encoding='utf-8') as f:
        spots_data = json.load(f)
    
    with open(reviews_file, 'r', encoding='utf-8') as f:
        reviews_data = json.load(f)
    
    # 출력 파일들
    output_dir = Path(__file__).parent
    spots_sql = output_dir / 'phase3_tourist_spots.sql'
    images_sql = output_dir / 'phase3_tourist_spot_images.sql'
    hashtags_sql = output_dir / 'phase3_hashtags.sql'
    spot_hashtags_sql = output_dir / 'phase3_tourist_spot_hashtags.sql'
    reviews_sql = output_dir / 'phase3_reviews.sql'
    
    # 데이터 수집
    all_spots = []
    all_hashtags = set()
    spot_hashtag_mapping = {}  # {spot_id: [hashtag_names]}
    spot_title_to_id = {}  # {title: spot_id} - 리뷰 매핑용
    
    spot_id = 7
    image_id = 1
    hashtag_id = 1
    spot_hashtag_id = 1
    
    # SQL 파일 초기화
    with open(spots_sql, 'w', encoding='utf-8') as f:
        f.write("-- Phase 3-2: tourist_spots INSERT\n")
        f.write("-- 기존 데이터(id: 1-6) 뒤에 추가\n")
        f.write("USE arata_busan;\n\n")
    
    with open(images_sql, 'w', encoding='utf-8') as f:
        f.write("-- Phase 3-3: tourist_spot_images INSERT\n")
        f.write("USE arata_busan;\n\n")
    
    with open(hashtags_sql, 'w', encoding='utf-8') as f:
        f.write("-- Phase 3-4: hashtags INSERT\n")
        f.write("-- 중복 제거를 위해 INSERT IGNORE 사용\n")
        f.write("USE arata_busan;\n\n")
    
    with open(spot_hashtags_sql, 'w', encoding='utf-8') as f:
        f.write("-- Phase 3-5: tourist_spot_hashtags INSERT\n")
        f.write("USE arata_busan;\n\n")
    
    with open(reviews_sql, 'w', encoding='utf-8') as f:
        f.write("-- Phase 3-6: reviews INSERT\n")
        f.write("USE arata_busan;\n\n")
    
    # 1. 관광지 데이터 수집 및 처리
    for area_key, area_data in spots_data['regions'].items():
        if area_key == 'festivals':
            continue  # 축제는 나중에 처리
        
        area_code = area_data['code']
        region_id = REGION_MAPPING.get(area_code)
        
        if not region_id:
            print(f"Warning: Unknown area_code {area_code} for {area_data['name']}")
            continue
        
        for spot in area_data['spots']:
            title = spot['title']
            description = spot.get('description', '')
            link = spot.get('link', '#')
            hashtags = spot.get('hashtags', [])
            img = spot.get('img', '')
            
            # 카테고리 추론
            category = infer_category(hashtags)
            
            # 관광지 데이터 저장
            all_spots.append({
                'id': spot_id,
                'region_id': region_id,
                'title': title,
                'description': description,
                'link': link,
                'category': category,
                'img': img,
                'hashtags': hashtags
            })
            
            # 제목 -> ID 매핑 (리뷰용)
            spot_title_to_id[title] = spot_id
            
            # 해시태그 수집 (# 제거)
            clean_hashtags = [tag.replace('#', '') for tag in hashtags]
            spot_hashtag_mapping[spot_id] = clean_hashtags
            all_hashtags.update(clean_hashtags)
            
            spot_id += 1
    
    # 2. tourist_spots INSERT 작성
    with open(spots_sql, 'a', encoding='utf-8') as f:
        f.write("INSERT INTO tourist_spots (region_id, title, description, link_url, category_code, is_active, view_count) VALUES\n")
        values = []
        for spot in all_spots:
            desc = escape_sql_string(spot['description'])
            link_val = escape_sql_string(spot['link']) if spot['link'] != '#' else 'NULL'
            values.append(f"({spot['region_id']}, {escape_sql_string(spot['title'])}, {desc}, {link_val}, '{spot['category']}', TRUE, 0)")
        f.write(',\n'.join(values) + ';\n\n')
    
    # 3. tourist_spot_images INSERT 작성
    with open(images_sql, 'a', encoding='utf-8') as f:
        f.write("INSERT INTO tourist_spot_images (img_name, ori_img_name, tourist_spot_id, image_url, rep_img_yn) VALUES\n")
        values = []
        for spot in all_spots:
            if spot['img']:
                img_path = convert_image_path(spot['img'])
                filename = extract_filename(img_path)
                values.append(f"({escape_sql_string(filename)}, {escape_sql_string(filename)}, {spot['id']}, {escape_sql_string(img_path)}, 'Y')")
        f.write(',\n'.join(values) + ';\n\n')
    
    # 4. hashtags INSERT 작성 (중복 제거)
    hashtag_id_map = {}  # {hashtag_name: hashtag_id}
    with open(hashtags_sql, 'a', encoding='utf-8') as f:
        f.write("INSERT IGNORE INTO hashtags (name) VALUES\n")
        sorted_hashtags = sorted(all_hashtags)
        values = []
        for idx, tag in enumerate(sorted_hashtags, 1):
            hashtag_id_map[tag] = idx
            values.append(f"({escape_sql_string(tag)})")
        f.write(',\n'.join(values) + ';\n\n')
        f.write("-- 참고: INSERT IGNORE를 사용했으므로 실제 ID는 DB에서 자동 할당됩니다.\n")
        f.write("-- 아래 tourist_spot_hashtags INSERT 전에 hashtag_id를 조회하여 사용해야 합니다.\n")
    
    # 5. tourist_spot_hashtags INSERT 작성
    # 실제로는 hashtag_id를 조회해야 하므로, 여기서는 해시태그 이름으로 매핑
    with open(spot_hashtags_sql, 'a', encoding='utf-8') as f:
        f.write("-- 주의: hashtag_id는 실제 DB에서 조회하여 사용해야 합니다.\n")
        f.write("-- 아래 쿼리로 해시태그 ID 매핑을 확인하세요:\n")
        f.write("-- SELECT id, name FROM hashtags ORDER BY id;\n\n")
        f.write("INSERT INTO tourist_spot_hashtags (tourist_spot_id, hashtag_id) VALUES\n")
        values = []
        for spot_id, hashtags in spot_hashtag_mapping.items():
            for tag in hashtags:
                # 실제로는 SELECT로 ID를 찾아야 하지만, 여기서는 주석으로 표시
                values.append(f"({spot_id}, (SELECT id FROM hashtags WHERE name = {escape_sql_string(tag)} LIMIT 1))")
        f.write(',\n'.join(values) + ';\n\n')
    
    # 6. reviews INSERT 작성
    # 관광지 제목으로 매핑
    with open(reviews_sql, 'a', encoding='utf-8') as f:
        f.write("-- 리뷰 INSERT (일광해수욕장 리뷰는 제외)\n")
        f.write("INSERT INTO reviews (user_id, tourist_spot_id, title, content, rating, is_approved, created_at, updated_at) VALUES\n")
        values = []
        for review in reviews_data['userReview']:
            spot_title = review['spotTitle']
            if spot_title == '일광해수욕장':
                continue  # 제외
            
            tourist_spot_id = spot_title_to_id.get(spot_title)
            if not tourist_spot_id:
                print(f"Warning: Spot '{spot_title}' not found for review {review['id']}")
                continue
            
            user_id = review['userId']
            title = escape_sql_string(review['title'])
            content = escape_sql_string(review['content'])
            rating = review['rating']
            created_at = review['createdAt'] + ' 00:00:00'
            updated_at = review['updatedAt'] + ' 00:00:00'
            
            values.append(f"({user_id}, {tourist_spot_id}, {title}, {content}, {rating}, TRUE, '{created_at}', '{updated_at}')")
        
        if values:
            f.write(',\n'.join(values) + ';\n\n')
        else:
            f.write("-- 리뷰 데이터 없음\n")
    
    print(f"✅ SQL 파일 생성 완료:")
    print(f"  - {spots_sql}")
    print(f"  - {images_sql}")
    print(f"  - {hashtags_sql}")
    print(f"  - {spot_hashtags_sql}")
    print(f"  - {reviews_sql}")
    print(f"\n총 관광지 수: {len(all_spots)}")
    print(f"총 해시태그 수: {len(all_hashtags)}")
    print(f"리뷰 수: {len([r for r in reviews_data['userReview'] if r['spotTitle'] != '일광해수욕장'])}")

if __name__ == '__main__':
    main()
