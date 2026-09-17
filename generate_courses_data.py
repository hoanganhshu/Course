import json
import re
import sys
import unicodedata

sys.stdout.reconfigure(encoding='utf-8')

with open('crawled_drive_tree.json', 'r', encoding='utf-8') as f:
    tree = json.load(f)

def clean_vietnamese_slug(text):
    text = text.lower()
    text = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', text)
    text = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', text)
    text = re.sub(r'[ìíịỉĩ]', 'i', text)
    text = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', text)
    text = re.sub(r'[ùúụủũưừứựửữ]', 'u', text)
    text = re.sub(r'[ỳýỵỷỹ]', 'y', text)
    text = re.sub(r'[đ]', 'd', text)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text).strip('-')
    return text

CATEGORY_CONFIG = {
    "0. Đọc hướng dẫn trước khi học": {
        "name": "Hướng dẫn học tập",
        "slug": "huong-dan-hoc-tap",
        "icon": "BookOpen",
        "order": 0,
        "bg": "/backgrounds/01_thu_vien_hien_dai.jpg",
        "price": 0,
        "orig_price": 100000
    },
    "1. Công nghệ thông tin": {
        "name": "Công nghệ thông tin & Lập trình",
        "slug": "cong-nghe-thong-tin",
        "icon": "Code",
        "order": 1,
        "bg": "/backgrounds/tech_05_modern_developer_desk.jpg",
        "price": 129000,
        "orig_price": 890000
    },
    "2. Dựng Phim và Nhiếp ảnh": {
        "name": "Dựng Phim & Nhiếp ảnh",
        "slug": "dung-phim-nhiep-anh",
        "icon": "Video",
        "order": 2,
        "bg": "/backgrounds/tech_07_video_creator_studio.jpg",
        "price": 99000,
        "orig_price": 650000
    },
    "3. Đầu tư": {
        "name": "Đầu tư tài chính & Chứng khoán",
        "slug": "dau-tu-tai-chinh",
        "icon": "TrendingUp",
        "order": 3,
        "bg": "/backgrounds/tech_09_business_data_strategy.jpg",
        "price": 99000,
        "orig_price": 750000
    },
    "4. Kiếm tiền & MMO": {
        "name": "Kiếm tiền Online & MMO",
        "slug": "kiem-tien-mmo",
        "icon": "DollarSign",
        "order": 4,
        "bg": "/backgrounds/tech_06_global_network_mesh.jpg",
        "price": 89000,
        "orig_price": 590000
    },
    "5. Kinh Doanh Và Khởi Nghiệp": {
        "name": "Kinh doanh & Khởi nghiệp",
        "slug": "kinh-doanh-khoi-nghiep",
        "icon": "Briefcase",
        "order": 5,
        "bg": "/backgrounds/tech_09_business_data_strategy.jpg",
        "price": 99000,
        "orig_price": 690000
    },
    "6. Khóa học Tiktok": {
        "name": "Khóa học TikTok & Video ngắn",
        "slug": "khoa-hoc-tiktok",
        "icon": "Smartphone",
        "order": 6,
        "bg": "/backgrounds/tech_04_digital_creator_desk.jpg",
        "price": 89000,
        "orig_price": 550000
    },
    "7. Kỹ Năng Mềm": {
        "name": "Kỹ năng mềm & Phát triển bản thân",
        "slug": "ky-nang-mem",
        "icon": "Award",
        "order": 7,
        "bg": "/backgrounds/02_ban_hoc_toi_gian.jpg",
        "price": 69000,
        "orig_price": 450000
    },
    "8. Marketing": {
        "name": "Digital Marketing & Truyền thông",
        "slug": "marketing",
        "icon": "Megaphone",
        "order": 8,
        "bg": "/backgrounds/10_ban_lam_viec_so.jpg",
        "price": 99000,
        "orig_price": 690000
    },
    "9. Ngoại ngữ": {
        "name": "Ngoại ngữ (Anh, Hàn, Trung, Nhật)",
        "slug": "ngoai-ngu",
        "icon": "Globe",
        "order": 9,
        "bg": "/backgrounds/01_thu_vien_hien_dai.jpg",
        "price": 99000,
        "orig_price": 790000
    },
    "10. Thiết kế đồ họa": {
        "name": "Thiết kế đồ họa & UI/UX",
        "slug": "thiet-ke-do-hoa",
        "icon": "Palette",
        "order": 10,
        "bg": "/backgrounds/tech_02_uiux_creative_studio.jpg",
        "price": 99000,
        "orig_price": 690000
    },
    "11. Tin học văn phòng": {
        "name": "Tin học văn phòng (Excel, Word, PPT)",
        "slug": "tin-hoc-van-phong",
        "icon": "FileSpreadsheet",
        "order": 11,
        "bg": "/backgrounds/10_ban_lam_viec_so.jpg",
        "price": 69000,
        "orig_price": 450000
    },
    "12. Khóa học khác": {
        "name": "Khóa học mở rộng",
        "slug": "khoa-hoc-khac",
        "icon": "Layers",
        "order": 12,
        "bg": "/backgrounds/tech_08_geometric_dark_shapes.jpg",
        "price": 79000,
        "orig_price": 490000
    },
    "13. Khóa Học Update 2025": {
        "name": "Khóa học Update 2025 - 2026",
        "slug": "khoa-hoc-update-2025",
        "icon": "Sparkles",
        "order": 13,
        "bg": "/backgrounds/tech_01_workspace_code_design.jpg",
        "price": 149000,
        "orig_price": 990000
    },
    "14. Quà tặng_ Ebook - Audio Book": {
        "name": "Quà tặng Ebook & Sách nói",
        "slug": "qua-tang-ebook-audio-book",
        "icon": "BookOpen",
        "order": 14,
        "bg": "/backgrounds/04_trang_sach_nghe_thuat.jpg",
        "price": 0,
        "orig_price": 250000
    },
    "15. Quà tặng_ tài nguyên": {
        "name": "Quà tặng Tài nguyên & Template",
        "slug": "qua-tang-tai-nguyen",
        "icon": "Gift",
        "order": 15,
        "bg": "/backgrounds/tech_08_geometric_dark_shapes.jpg",
        "price": 0,
        "orig_price": 300000
    },
    "16. Khóa học mới": {
        "name": "Khóa học mới phát hành",
        "slug": "khoa-hoc-moi",
        "icon": "Flame",
        "order": 16,
        "bg": "/backgrounds/tech_03_abstract_3d_dark_wave.jpg",
        "price": 119000,
        "orig_price": 790000
    },
    "17. Khóa Học Facebook": {
        "name": "Khóa học Facebook Ads & BM",
        "slug": "khoa-hoc-facebook",
        "icon": "Share2",
        "order": 17,
        "bg": "/backgrounds/tech_04_digital_creator_desk.jpg",
        "price": 99000,
        "orig_price": 690000
    },
    "18. Khóa Học Youtube": {
        "name": "Khóa học YouTube & Kiếm tiền Adsense",
        "slug": "khoa-hoc-youtube",
        "icon": "PlaySquare",
        "order": 18,
        "bg": "/backgrounds/tech_07_video_creator_studio.jpg",
        "price": 99000,
        "orig_price": 690000
    },
    "19. Combo Khóa học": {
        "name": "Combo Khóa Học Toàn Diện",
        "slug": "combo-khoa-hoc",
        "icon": "Package",
        "order": 19,
        "bg": "/backgrounds/tech_03_abstract_3d_dark_wave.jpg",
        "price": 199000,
        "orig_price": 1990000
    }
}

# Image rotation pool for diversity
IMAGE_POOL = [
    "/backgrounds/tech_01_workspace_code_design.jpg",
    "/backgrounds/tech_02_uiux_creative_studio.jpg",
    "/backgrounds/tech_03_abstract_3d_dark_wave.jpg",
    "/backgrounds/tech_04_digital_creator_desk.jpg",
    "/backgrounds/tech_05_modern_developer_desk.jpg",
    "/backgrounds/tech_06_global_network_mesh.jpg",
    "/backgrounds/tech_07_video_creator_studio.jpg",
    "/backgrounds/tech_08_geometric_dark_shapes.jpg",
    "/backgrounds/tech_09_business_data_strategy.jpg",
    "/backgrounds/tech_10_clean_dark_gradient.jpg",
    "/backgrounds/hex_01_deep_circuit_board.jpg",
    "/backgrounds/hex_03_cyber_matrix_grid.jpg",
    "/backgrounds/10_ban_lam_viec_so.jpg"
]

processed_categories = []
processed_courses = []
seen_slugs = set()

cat_id_counter = 1
course_id_counter = 1

for cat_entry in tree:
    raw_cat_name = cat_entry['name']
    config = CATEGORY_CONFIG.get(raw_cat_name, {
        "name": re.sub(r'^\d+\.\s*', '', raw_cat_name),
        "slug": clean_vietnamese_slug(raw_cat_name),
        "icon": "Folder",
        "order": cat_id_counter,
        "bg": "/backgrounds/tech_05_modern_developer_desk.jpg",
        "price": 99000,
        "orig_price": 690000
    })

    cat_record = {
        "id": cat_id_counter,
        "name": config["name"],
        "slug": config["slug"],
        "icon": config["icon"],
        "display_order": config["order"],
        "is_active": True,
        "drive_id": cat_entry["id"]
    }
    processed_categories.append(cat_record)

    children = cat_entry.get('children', [])
    for sub_idx, sub in enumerate(children):
        raw_title = sub['name']
        # Clean title prefix like "0. ", "1. ", "23. "
        title_clean = re.sub(r'^\d+[\.\-_]\s*', '', raw_title).strip()
        if not title_clean.lower().startswith('khóa học') and not title_clean.lower().startswith('bộ') and not title_clean.lower().startswith('tài liệu') and not title_clean.lower().startswith('combo'):
            course_title = f"Khóa Học {title_clean}"
        else:
            course_title = title_clean

        slug_base = clean_vietnamese_slug(course_title)
        if not slug_base:
            slug_base = f"khoa-hoc-{course_id_counter}"
        slug = slug_base
        s_count = 1
        while slug in seen_slugs:
            slug = f"{slug_base}-{s_count}"
            s_count += 1
        seen_slugs.add(slug)

        # Image selection based on category and index
        img_idx = (cat_id_counter * 7 + sub_idx) % len(IMAGE_POOL)
        thumbnail = config["bg"] if sub_idx == 0 else IMAGE_POOL[img_idx]

        is_combo = "combo" in cat_record["slug"] or "combo" in course_title.lower()
        price = config["price"]
        orig_price = config["orig_price"]

        # Flash sale logic: ~25% of courses have active flash sale
        is_flash_sale = (course_id_counter % 4 == 0) and price > 0
        flash_price = max(49000, price - 30000) if is_flash_sale else None

        registered_count = 120 + (course_id_counter * 37) % 850

        description = f"Khóa học chuyên sâu {course_title} cung cấp đầy đủ video bài giảng chất lượng cao, slide hướng dẫn, tài liệu thực hành và project mẫu được lưu trữ trực tiếp trên Google Drive, truy cập trọn đời."

        drive_link = f"https://drive.google.com/drive/folders/{sub['id']}"

        course_record = {
            "id": course_id_counter,
            "title": course_title,
            "slug": slug,
            "price": price,
            "original_price": orig_price,
            "thumbnail": thumbnail,
            "description": description,
            "drive_link": drive_link,
            "drive_folder_id": sub['id'],
            "category_id": cat_id_counter,
            "category_name": cat_record["name"],
            "category_slug": cat_record["slug"],
            "is_flash_sale": is_flash_sale,
            "flash_sale_price": flash_price,
            "is_combo": is_combo,
            "registered_count": registered_count
        }
        processed_courses.append(course_record)
        course_id_counter += 1

    cat_id_counter += 1

print(f"Processed {len(processed_categories)} categories.")
print(f"Processed {len(processed_courses)} courses from Google Drive.")

# 1. Output SQL Migration script: V4__seed_real_drive_courses.sql
sql_lines = [
    "-- ============================================================",
    "-- KhoaHocGiaHoi - V4: Seed Real Courses Crawled From Google Drive",
    f"-- Total Categories: {len(processed_categories)} | Total Courses: {len(processed_courses)}",
    "-- ============================================================\n",
    "-- Tắt ràng buộc ngoại khóa tạm thời để xóa dữ liệu mẫu cũ nếu có",
    "TRUNCATE TABLE user_purchased_courses, order_items, courses, categories CASCADE;\n",
    "-- 1. INSERT CATEGORIES"
]

for c in processed_categories:
    name_escaped = c['name'].replace("'", "''")
    slug_escaped = c['slug'].replace("'", "''")
    icon_escaped = c['icon'].replace("'", "''")
    sql_lines.append(
        f"INSERT INTO categories (id, name, slug, icon, display_order, is_active) "
        f"VALUES ({c['id']}, '{name_escaped}', '{slug_escaped}', '{icon_escaped}', {c['display_order']}, TRUE);"
    )

sql_lines.append("\n-- 2. INSERT COURSES")

for cr in processed_courses:
    title_esc = cr['title'].replace("'", "''")
    slug_esc = cr['slug'].replace("'", "''")
    desc_esc = cr['description'].replace("'", "''")
    thumb_esc = cr['thumbnail'].replace("'", "''")
    drive_link_esc = cr['drive_link'].replace("'", "''")
    drive_id_esc = cr['drive_folder_id'].replace("'", "''")

    flash_sale_sql = "TRUE" if cr['is_flash_sale'] else "FALSE"
    flash_price_sql = str(cr['flash_sale_price']) if cr['flash_sale_price'] else "NULL"
    flash_start_sql = "CURRENT_TIMESTAMP" if cr['is_flash_sale'] else "NULL"
    flash_end_sql = "(CURRENT_TIMESTAMP + INTERVAL '14 days')" if cr['is_flash_sale'] else "NULL"
    combo_sql = "TRUE" if cr['is_combo'] else "FALSE"

    sql_lines.append(
        f"INSERT INTO courses (id, title, slug, price, original_price, thumbnail, description, content, drive_link, drive_folder_id, "
        f"is_flash_sale, flash_sale_price, flash_sale_start_at, flash_sale_end_at, is_combo, registered_count, category_id, is_published, created_at, updated_at) "
        f"VALUES ({cr['id']}, '{title_esc}', '{slug_esc}', {cr['price']}, {cr['original_price']}, '{thumb_esc}', '{desc_esc}', "
        f"'{desc_esc}', '{drive_link_esc}', '{drive_id_esc}', {flash_sale_sql}, {flash_price_sql}, {flash_start_sql}, {flash_end_sql}, "
        f"{combo_sql}, {cr['registered_count']}, {cr['category_id']}, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);"
    )

sql_lines.append("\n-- Đồng bộ sequence ID sau khi import cứng")
sql_lines.append(f"SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));")
sql_lines.append(f"SELECT setval('courses_id_seq', (SELECT MAX(id) FROM courses));")

sql_file_path = "backend/src/main/resources/db/migration/V4__seed_real_drive_courses.sql"
with open(sql_file_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_lines))

print(f"Generated SQL migration: {sql_file_path}")

# 2. Output TypeScript catalog for frontend: frontend/src/data/coursesCatalog.ts
ts_code = f"""// AUTO-GENERATED FROM GOOGLE DRIVE CRAWL
// Total Categories: {len(processed_categories)} | Total Courses: {len(processed_courses)}

export interface CatalogCategory {{
  id: number;
  name: string;
  slug: string;
  icon: string;
  displayOrder: number;
}}

export interface CatalogCourse {{
  id: number;
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  thumbnail: string;
  description: string;
  driveLink: string;
  driveFolderId: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  isFlashSale: boolean;
  flashSalePrice?: number;
  isCombo: boolean;
  registeredCount: number;
}}

export const REAL_CATEGORIES: CatalogCategory[] = {json.dumps(processed_categories, ensure_ascii=False, indent=2)};

export const REAL_COURSES: CatalogCourse[] = {json.dumps(processed_courses, ensure_ascii=False, indent=2)};
"""

import os
ts_file_path = "frontend/src/data/coursesCatalog.ts"
os.makedirs(os.path.dirname(ts_file_path), exist_ok=True)
with open(ts_file_path, 'w', encoding='utf-8') as f:
    f.write(ts_code)

print(f"Generated TypeScript catalog: {ts_file_path}")
