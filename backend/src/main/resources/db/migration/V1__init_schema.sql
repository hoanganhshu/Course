-- ============================================================
-- KhoaHocGiaHoi - PostgreSQL 16 Schema (ACID + JSONB + GIN)
-- Flyway: V1__init_schema.sql
-- ============================================================

-- Bật extension mở rộng nếu cần
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==================== MEMBERSHIP PLANS ====================
CREATE TABLE membership_plans (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(50)    NOT NULL,
    price          NUMERIC(12, 0) NOT NULL,
    duration_days  INT            NULL, -- NULL = Lifetime
    daily_quota    INT            NOT NULL, -- -1 = Unlimited
    allow_combo    BOOLEAN        NOT NULL DEFAULT FALSE,
    benefits       JSONB          NULL DEFAULT '[]'::jsonb,
    display_order  INT            NOT NULL DEFAULT 0,
    is_active      BOOLEAN        NOT NULL DEFAULT TRUE
);

-- ==================== USERS ====================
CREATE TABLE users (
    id                     BIGSERIAL PRIMARY KEY,
    name                   VARCHAR(150)   NOT NULL,
    email                  VARCHAR(255)   NOT NULL UNIQUE,
    password               VARCHAR(255)   NOT NULL,
    phone                  VARCHAR(20)    NULL,
    role                   VARCHAR(30)    NOT NULL DEFAULT 'ROLE_USER',
    membership_plan_id     BIGINT         NULL REFERENCES membership_plans(id) ON DELETE SET NULL,
    membership_expires_at  TIMESTAMPTZ    NULL,
    daily_claimed_count    INT            NOT NULL DEFAULT 0,
    last_claim_date        TIMESTAMPTZ    NULL,
    is_active              BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at             TIMESTAMPTZ    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMPTZ    NULL
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ==================== CATEGORIES ====================
CREATE TABLE categories (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(150)   NOT NULL,
    slug           VARCHAR(200)   NOT NULL UNIQUE,
    parent_id      BIGINT         NULL REFERENCES categories(id) ON DELETE SET NULL,
    icon           VARCHAR(255)   NULL,
    display_order  INT            NOT NULL DEFAULT 0,
    is_active      BOOLEAN        NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_categories_slug   ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ==================== COURSES ====================
CREATE TABLE courses (
    id                         BIGSERIAL PRIMARY KEY,
    title                      VARCHAR(500)   NOT NULL,
    slug                       VARCHAR(600)   NOT NULL UNIQUE,
    price                      NUMERIC(12, 0) NOT NULL,
    original_price             NUMERIC(12, 0) NOT NULL,
    thumbnail                  VARCHAR(1000)  NULL,
    description                TEXT           NULL,
    content                    TEXT           NULL,
    drive_link                 VARCHAR(1000)  NULL, -- 🔒 AES-256-GCM Encrypted
    is_flash_sale              BOOLEAN        NOT NULL DEFAULT FALSE,
    flash_sale_price           NUMERIC(12, 0) NULL,
    flash_sale_start_at        TIMESTAMPTZ    NULL,
    flash_sale_end_at          TIMESTAMPTZ    NULL,
    is_combo                   BOOLEAN        NOT NULL DEFAULT FALSE,
    combo_course_ids           JSONB          NULL DEFAULT '[]'::jsonb,
    metadata                   JSONB          NULL DEFAULT '{}'::jsonb,
    registered_count           BIGINT         NOT NULL DEFAULT 0,
    require_combo_membership   BOOLEAN        NOT NULL DEFAULT FALSE,
    is_published               BOOLEAN        NOT NULL DEFAULT TRUE,
    meta_title                 VARCHAR(255)   NULL,
    meta_description           VARCHAR(500)   NULL,
    category_id                BIGINT         NULL REFERENCES categories(id) ON DELETE SET NULL,
    created_at                 TIMESTAMPTZ    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                 TIMESTAMPTZ    NULL
);
CREATE INDEX idx_courses_slug       ON courses(slug);
CREATE INDEX idx_courses_category   ON courses(category_id);
CREATE INDEX idx_courses_flash_sale ON courses(is_flash_sale);
CREATE INDEX idx_courses_registered ON courses(registered_count DESC);
CREATE INDEX idx_courses_metadata_gin ON courses USING GIN (metadata);

-- ==================== INVENTORY ITEMS (KHO HÀNG TÀI KHOẢN & LINK SỐ) ====================
-- Lưu trữ linh hoạt: Account 2FA, License Key, Link Google Drive độc quyền
CREATE TABLE inventory_items (
    id             BIGSERIAL PRIMARY KEY,
    course_id      BIGINT         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    item_type      VARCHAR(50)    NOT NULL DEFAULT 'GOOGLE_DRIVE', -- GOOGLE_DRIVE, ACCOUNT_2FA, LICENSE_KEY, INVITE_LINK
    -- Cột JSONB lưu trữ dữ liệu chi tiết, đã mã hóa AES-256-GCM
    item_data      JSONB          NOT NULL, 
    is_delivered   BOOLEAN        NOT NULL DEFAULT FALSE,
    delivered_at   TIMESTAMPTZ    NULL,
    order_id       BIGINT         NULL,
    created_at     TIMESTAMPTZ    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- GIN Index cho cột JSONB để truy vấn siêu tốc theo thuộc tính bên trong
CREATE INDEX idx_inventory_data_gin ON inventory_items USING GIN (item_data);
CREATE INDEX idx_inventory_course_available ON inventory_items (course_id, is_delivered) WHERE is_delivered = FALSE;

-- ==================== ORDERS (GIAO DỊCH TÀI CHÍNH & IDEMPOTENCY KEY) ====================
CREATE TABLE orders (
    id               BIGSERIAL PRIMARY KEY,
    order_code       VARCHAR(50)    NOT NULL UNIQUE, -- KHGH10283
    -- Idempotency Key: Ngăn ngừa double-credit từ ngân hàng gửi lại webhook
    reference_code   VARCHAR(100)   NULL UNIQUE, 
    user_id          BIGINT         NULL REFERENCES users(id) ON DELETE SET NULL,
    customer_name    VARCHAR(150)   NOT NULL,
    customer_email   VARCHAR(255)   NOT NULL,
    customer_phone   VARCHAR(20)    NULL,
    total_amount     NUMERIC(12, 0) NOT NULL,
    discount_amount  NUMERIC(12, 0) NOT NULL DEFAULT 0,
    coupon_code      VARCHAR(50)    NULL,
    status           VARCHAR(30)    NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, CANCELLED, REFUNDED
    payment_method   VARCHAR(50)    NOT NULL DEFAULT 'VIET_QR',
    paid_at          TIMESTAMPTZ    NULL,
    webhook_raw_data TEXT           NULL,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_order_code     ON orders(order_code);
CREATE INDEX idx_orders_reference_code ON orders(reference_code);
CREATE INDEX idx_orders_status         ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);

-- ==================== ORDER ITEMS ====================
CREATE TABLE order_items (
    id               BIGSERIAL PRIMARY KEY,
    order_id         BIGINT         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    course_id        BIGINT         NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    price            NUMERIC(12, 0) NOT NULL,
    course_title     VARCHAR(500)   NOT NULL,
    course_thumbnail VARCHAR(1000)  NULL
);
CREATE INDEX idx_order_items_order  ON order_items(order_id);
CREATE INDEX idx_order_items_course ON order_items(course_id);

-- ==================== USER PURCHASED COURSES ====================
CREATE TABLE user_purchased_courses (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id    BIGINT       NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    claim_type   VARCHAR(30)  NOT NULL DEFAULT 'PURCHASE', -- PURCHASE, MEMBERSHIP_CLAIM, ADMIN_GRANT
    order_id     BIGINT       NULL REFERENCES orders(id) ON DELETE SET NULL,
    purchased_at TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_course UNIQUE (user_id, course_id)
);
CREATE INDEX idx_upc_user_id   ON user_purchased_courses(user_id);
CREATE INDEX idx_upc_course_id ON user_purchased_courses(course_id);

-- ==================== FEEDBACKS ====================
CREATE TABLE feedbacks (
    id             BIGSERIAL PRIMARY KEY,
    image_url      VARCHAR(1000)  NOT NULL,
    customer_name  VARCHAR(150)   NULL,
    comment        TEXT           NULL,
    rating         INT            NULL,
    display_order  INT            NOT NULL DEFAULT 0,
    is_active      BOOLEAN        NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_feedbacks_display_order ON feedbacks(display_order);

-- ==================== COUPONS ====================
CREATE TABLE coupons (
    id               BIGSERIAL PRIMARY KEY,
    code             VARCHAR(50)    NOT NULL UNIQUE,
    discount_percent INT            NOT NULL,
    max_discount     NUMERIC(12, 0) NULL,
    expires_at       TIMESTAMPTZ    NULL,
    usage_limit      INT            NULL,
    used_count       INT            NOT NULL DEFAULT 0,
    is_active        BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_coupons_code ON coupons(code);
