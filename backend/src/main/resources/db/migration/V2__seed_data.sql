-- ============================================================
-- KhoaHocGiaHoi - PostgreSQL 16 Seed Data V2
-- ============================================================

-- MEMBERSHIP PLANS
INSERT INTO membership_plans (name, price, duration_days, daily_quota, allow_combo, benefits, display_order) VALUES
('Start',    49000,   30,  1, FALSE, '["1 khóa/ngày","Khóa đã nhận không mất","Hỗ trợ Zalo"]'::jsonb,                          1),
('Flex',     79000,   30,  2, FALSE, '["2 khóa/ngày","Khóa đã nhận không mất","Hỗ trợ Zalo ưu tiên"]'::jsonb,                  2),
('Plus',    149000,   60,  3, TRUE,  '["3 khóa/ngày","Bao gồm khóa Combo","Khóa đã nhận không mất"]'::jsonb,                   3),
('Pro',     199000,   90,  5, TRUE,  '["5 khóa/ngày","Bao gồm khóa Combo","Hỗ trợ 24/7","Khóa đã nhận không mất"]'::jsonb,    4),
('VIP',     299000,  360, 10, TRUE,  '["10 khóa/ngày","Toàn bộ kho khóa học","Combo không giới hạn","Ưu tiên cao nhất"]'::jsonb,5);

-- CATEGORIES CẤP 1
INSERT INTO categories (name, slug, parent_id, icon, display_order) VALUES
('Combo Khóa Học',              'combo-khoa-hoc',              NULL, 'layers',        0),
('Công nghệ thông tin',         'cong-nghe-thong-tin',         NULL, 'code',          1),
('Ngoại ngữ',                   'ngoai-ngu',                   NULL, 'globe',         2),
('Thiết kế đồ họa',             'thiet-ke-do-hoa',             NULL, 'palette',       3),
('Marketing',                   'marketing',                   NULL, 'megaphone',     4),
('Đầu tư',                      'dau-tu',                      NULL, 'trending-up',   5),
('Tin học văn phòng',           'tin-hoc-van-phong',           NULL, 'monitor',       6),
('Dựng phim & Nhiếp ảnh',       'dung-phim-va-nhiep-anh',      NULL, 'film',          7),
('Kinh doanh & Khởi nghiệp',    'kinh-doanh-va-khoi-nghiep',   NULL, 'briefcase',     8),
('Kỹ năng & Phát triển bản thân','ky-nang',                    NULL, 'star',          9),
('Kiếm tiền và MMO',            'kiem-tien-va-mmo',            NULL, 'dollar-sign',   10),
('Khoá học Tiktok',             'khoa-hoc-tiktok',             NULL, 'music',         11),
('Khóa học Youtube',            'khoa-hoc-youtube',            NULL, 'youtube',       12);

-- CATEGORIES CẤP 2 (CNTT)
INSERT INTO categories (name, slug, parent_id, icon, display_order)
SELECT c.name, c.slug, p.id, c.icon, c.display_order FROM (
    VALUES
    ('Trí tuệ nhân tạo',                           'tri-tue-nhan-tao',                   NULL, 1),
    ('Vibe Coding',                                'vibe-coding',                         NULL, 2),
    ('AI Automation',                              'ai-automation',                       NULL, 3),
    ('Lập trình Web',                              'lap-trinh-web',                       NULL, 4),
    ('Data Science',                               'data-science',                        NULL, 5),
    ('Deep Learning',                              'deep-learning',                       NULL, 6),
    ('Machine Learning',                           'machine-learning',                    NULL, 7),
    ('System Design & MicroService',               'system-design-and-microservice',      NULL, 8),
    ('Frontend',                                   'frontend',                            NULL, 9),
    ('Backend',                                    'backend',                             NULL, 10),
    ('Lập trình Mobile',                           'lap-trinh-mobile',                    NULL, 11),
    ('Ngôn ngữ lập trình',                         'ngon-ngu-lap-trinh',                  NULL, 12),
    ('Lập trình Game',                             'lap-trinh-game',                      NULL, 13),
    ('Data Analyst',                               'data-analyst',                        NULL, 14),
    ('DevOps',                                     'devops',                              NULL, 15),
    ('ChatGPT',                                    'chatgpt',                             NULL, 16),
    ('Cơ sở dữ liệu',                              'co-so-du-lieu',                       NULL, 17),
    ('Lập trình hướng đối tượng (OOP)',            'lap-trinh-huong-doi-tuong-oop',       NULL, 18),
    ('Blockchain',                                 'blockchain',                          NULL, 19),
    ('Tester',                                     'tester',                              NULL, 20),
    ('Business Analyst',                           'business-analyst',                    NULL, 21),
    ('Data Engineer',                              'data-engineer',                       NULL, 22),
    ('Power BI',                                   'power-bi',                            NULL, 23),
    ('Linux',                                      'linux',                               NULL, 24)
) AS c(name, slug, icon, display_order)
CROSS JOIN categories p WHERE p.slug = 'cong-nghe-thong-tin';

-- SAMPLE COURSES
INSERT INTO courses (title, slug, price, original_price, thumbnail, description, registered_count, is_flash_sale, flash_sale_price, flash_sale_start_at, flash_sale_end_at, category_id, is_published)
SELECT
    c.title, c.slug, c.price, c.original_price, c.thumbnail, c.description, c.registered_count,
    c.is_flash_sale, c.flash_sale_price, c.flash_sale_start_at, c.flash_sale_end_at,
    cat.id, TRUE
FROM (
    VALUES
    (
        'Khóa Học Advanced Backend Mới Nhất Cùng Roninhub',
        'khoa-hoc-advanced-backend-moi-nhat-cung-roninhub',
        45499::numeric,
        8500000::numeric,
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
        'Khóa học backend nâng cao với các công nghệ mới nhất 2024-2025',
        1250, FALSE, NULL::numeric, NULL::timestamptz, NULL::timestamptz,
        'backend'
    ),
    (
        'Khóa Học AI For Marketing MindX 2025 – Lộ Trình Bứt Phá Nghề Marketing',
        'khoa-hoc-ai-for-marketing-mindx-2025',
        91999::numeric, 6000000::numeric,
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop',
        'Học AI ứng dụng cho Marketing: viết content, tạo ảnh, phân tích data bằng AI',
        850, TRUE, 79999::numeric,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '8 HOUR',
        'ai-automation'
    ),
    (
        'Combo 17 Khóa Học Lập Trình Toàn Diện Từ Cơ Bản Đến Chuyên Sâu Cùng 28tech',
        'combo-17-khoa-hoc-lap-trinh-28tech',
        149999::numeric, 99999999::numeric,
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
        'Trọn bộ lộ trình lập trình từ C++ đến Web, Mobile, AI từ kênh 28tech nổi tiếng',
        2300, FALSE, NULL::numeric, NULL::timestamptz, NULL::timestamptz,
        'combo-khoa-hoc'
    )
) AS c(title, slug, price, original_price, thumbnail, description, registered_count, is_flash_sale, flash_sale_price, flash_sale_start_at, flash_sale_end_at, cat_slug)
JOIN categories cat ON cat.slug = c.cat_slug;

-- SAMPLE FEEDBACKS
INSERT INTO feedbacks (image_url, customer_name, comment, rating, display_order) VALUES
('https://res.cloudinary.com/el10uhjn/image/upload/v1784646640/feedback-khach-hang/feedback-khach-hang-49.webp', 'Minh Tuấn', 'Mua xong 30s là có link, quá nhanh!', 5, 1),
('https://res.cloudinary.com/el10uhjn/image/upload/v1784646640/feedback-khach-hang/feedback-khach-hang-51.webp', 'Hương Ly',  'Giá siêu rẻ mà chất lượng thật sự xịn',      5, 2);

-- SAMPLE COUPONS
INSERT INTO coupons (code, discount_percent, max_discount, expires_at, usage_limit) VALUES
('WELCOME10',  10, 50000,  CURRENT_TIMESTAMP + INTERVAL '30 DAY', 100),
('SALE20',     20, 100000, CURRENT_TIMESTAMP + INTERVAL '7 DAY',  50);

-- DEFAULT ADMIN USER (Password: Admin@123)
INSERT INTO users (name, email, password, phone, role) VALUES
('Admin KHGH', 'admin@khoahocgiahoi.com',
 '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LpwoX1SV0jSZ2lJsy',
 '0583953426', 'ROLE_ADMIN');
