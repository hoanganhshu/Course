-- ============================================================
-- KhoaHocGiaHoi - Flyway Migration V3: Wallet & Google Drive Auto Sharing
-- ============================================================

-- 1. Thêm cột số dư ví và Gmail nhận Google Drive vào bảng users
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance NUMERIC(14, 0) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS drive_email VARCHAR(255) NULL;

-- 2. Thêm cột ID thư mục Google Drive vào bảng courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS drive_folder_id VARCHAR(100) NULL;

-- 3. Thêm các cột theo dõi trạng thái phân quyền Google Drive vào user_purchased_courses
ALTER TABLE user_purchased_courses ADD COLUMN IF NOT EXISTS drive_shared BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE user_purchased_courses ADD COLUMN IF NOT EXISTS drive_permission_id VARCHAR(100) NULL;
ALTER TABLE user_purchased_courses ADD COLUMN IF NOT EXISTS drive_shared_at TIMESTAMPTZ NULL;
ALTER TABLE user_purchased_courses ADD COLUMN IF NOT EXISTS drive_share_error VARCHAR(1000) NULL;

-- 4. Tạo bảng lịch sử giao dịch ví (Wallet Transactions)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id                BIGSERIAL PRIMARY KEY,
    transaction_code  VARCHAR(50)    NOT NULL UNIQUE,
    user_id           BIGINT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount            NUMERIC(14, 0) NOT NULL,
    type              VARCHAR(20)    NOT NULL, -- DEPOSIT, PURCHASE, REFUND
    balance_before    NUMERIC(14, 0) NULL,
    balance_after     NUMERIC(14, 0) NULL,
    reference_code    VARCHAR(100)   NULL,
    description       VARCHAR(500)   NULL,
    status            VARCHAR(20)    NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED
    created_at        TIMESTAMPTZ    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_code ON wallet_transactions(transaction_code);
