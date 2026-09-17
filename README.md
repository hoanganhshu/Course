# KHÓA HỌC GIÁ HỜI (KHOAHOCGIAHOI.COM) — ENTERPRISE ARCHITECTURE

> **Sàn thương mại điện tử bán khóa học online & tài nguyên số bàn giao tự động qua Google Drive.**  
> Kiến trúc phân tán (Decoupled Client-Server), bảo mật chuẩn tài chính & chịu tải cao.

---

## 🛠️ BỘ CÔNG NGHỆ VÀ KIẾN TRÚC ÁP DỤNG (TECH STACK)

### 1. FRONTEND (Giao diện & Trải nghiệm người dùng)
* **Next.js 14 (App Router & React 18)**: Khung sườn full-stack hiện đại, kết hợp Server Components tối ưu SEO và Client Components linh hoạt.
* **TypeScript**: Ép kiểu tĩnh toàn diện, hạn chế tối đa lỗi runtime và chuẩn hóa dữ liệu giao tiếp với Backend.
* **Tailwind CSS v3**: Giao diện **Dark Cyberpunk** sang trọng, responsive hoàn hảo mọi thiết bị, tối ưu CSS bundle siêu nhẹ.
* **CSS Mask-Image (`linear-gradient`)**: Hiệu ứng làm mờ dần hai đầu thanh cuộn ngang, giúp trải nghiệm lướt danh mục mượt mà, không bị đứt đoạn.
* **TanStack Query v5 (React Query)**: Quản lý Server State, tự động lưu cache, tự refetch khi chuyển tab, polling kiểm tra thanh toán thời gian thực.
* **Zustand (kèm persist middleware)**: Quản lý Client State (giỏ hàng, auth token), tự đồng bộ vào `localStorage`, nhẹ hơn Redux gấp 10 lần.
* **Axios Interceptors**: Tự động gắn header `Authorization: Bearer <JWT>` vào mọi request, tự bắt lỗi 401 để xử lý đăng xuất an toàn.
* **Lucide React**: Bộ icon vector SVG chuẩn hóa, tải theo cơ chế tree-shaking không tốn dung lượng.
* **React Hot Toast**: Hiển thị thông báo trạng thái thao tác góc màn hình mượt mà, trực quan.

### 2. BACKEND & NGHIỆP VỤ HỆ THỐNG
* **Spring Boot 3.3.0 & Java 17/21**: Nền tảng RESTful API chuẩn doanh nghiệp, xử lý nghiệp vụ giao dịch tiền tệ ổn định và chịu tải cao.
* **Spring Security 6 & Stateless JWT (JJWT 0.12.5)**: Cơ chế xác thực phân quyền Role-based không lưu session server, dễ dàng scale ngang.
* **BCrypt Hashing**: Mã hóa mật khẩu người dùng chuẩn 1 chiều an toàn.
* **Spring Data JPA & Hibernate 6**: Tương tác cơ sở dữ liệu qua ORM, phân trang dữ liệu linh hoạt, tối ưu hóa truy vấn SQL.
* **Flyway Migration**: Quản lý phiên bản cơ sở dữ liệu qua mã nguồn SQL (V1, V2), tự động khởi tạo cấu trúc và nạp dữ liệu mẫu khi chạy app.

### 3. CƠ SỞ DỮ LIỆU & BẢO MẬT KHO HÀNG
* **PostgreSQL 16**: Cơ sở dữ liệu quan hệ mạnh mẽ, đảm bảo tính toàn vẹn dữ liệu tài chính (chuẩn ACID).
* **JSONB + GIN Index (PostgreSQL)**: Cột lưu trữ tài khoản kho hàng linh hoạt (hỗ trợ cả Account 2FA, License Key, Link mời, Drive Link), đánh chỉ mục GIN tìm kiếm siêu tốc.
* **Mã hóa quân đội AES-256-GCM**: Toàn bộ Google Drive link, mật khẩu, 2FA, key bản quyền được mã hóa 2 chiều kèm Vector ngẫu nhiên (IV 12 bytes) trước khi lưu vào DB, chống rò rỉ dữ liệu khi dump database.
* **Pessimistic Locking (`SELECT ... FOR UPDATE`)**: Khóa bi quan dòng tài khoản khi có người mua, đảm bảo 1 tài khoản/link duy nhất chỉ xuất xưởng cho 1 khách hàng dù hàng nghìn người bấm mua cùng lúc.
* **Idempotency Key**: Trường `reference_code` UNIQUE trong lịch sử giao dịch/đơn hàng, ngăn chặn lỗi double-credit khi webhook ngân hàng gửi lại nhiều lần.

### 4. BẤT ĐỒNG BỘ, TÌM KIẾM & TỐI ƯU HIỆU NĂNG
* **RabbitMQ 3.13 (Message Broker AMQP)**: Xử lý gửi email thông báo, kích hoạt đơn hàng bất đồng bộ, phản hồi kết quả webhook cho ngân hàng trong `< 200ms`.
* **Redis 7**: Bộ nhớ đệm RAM lưu session, Token Blacklist và áp dụng Rate Limiting chống bot spam request / brute-force.
* **Meilisearch v1.8**: Công cụ tìm kiếm sản phẩm tốc độ cao, hỗ trợ tự sửa lỗi khi người dùng gõ sai chính tả (Typo-tolerance).

### 5. THANH TOÁN TỰ ĐỘNG & NGÂN HÀNG VIỆT NAM
* **VietQR NAPAS 24/7**: Tự sinh mã QR ngân hàng động chứa sẵn số tiền và cú pháp nạp duy nhất theo mã đơn (`KHGH<MãĐơn>`).
* **Webhook Tích Hợp Ngân Hàng (SePay / PayOS)**: Lắng nghe biến động số dư tài khoản ngân hàng, tự động nhận diện cú pháp và kích hoạt khóa học trong **3 - 5 giây**.

### 6. DEVOPS & TRIỂN KHAI
* **Docker & Docker Compose**: Đóng gói toàn bộ 5 dịch vụ (PostgreSQL 16, Redis 7, RabbitMQ 3.13, Meilisearch v1.8, Backend) khởi chạy chỉ với 1 câu lệnh (`docker compose up -d`).
* **Git & .gitignore Chuẩn**: Tự động loại trừ các thư mục nặng và nhạy cảm (`node_modules`, `.next`, `target`, `.env.local`), giữ kho code luôn sạch sẽ và bảo mật.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY DỰ ÁN (QUICK START)

### Cách 1: Khởi chạy toàn bộ hạ tầng bằng Docker Compose (Khuyên dùng)

Chỉ cần 1 câu lệnh duy nhất tại thư mục gốc:

```bash
docker compose up -d
```

Lệnh này sẽ tự động khởi động:
1. **PostgreSQL 16**: Port `5432` (User: `postgres`, Pass: `SecretPassword123!`)
2. **Redis 7**: Port `6379` (Pass: `RedisPassword123!`)
3. **RabbitMQ 3.13**: Port `5672` (AMQP) & Port `15672` (Web UI: `khgh_rabbit` / `RabbitPassword123!`)
4. **Meilisearch 1.8**: Port `7700`
5. **Backend Spring Boot 3**: Port `8080` (API: `http://localhost:8080/api/v1`)

---

### Cách 2: Khởi chạy Backend & Frontend thủ công (Development)

#### Bước 1: Khởi động các dịch vụ phụ trợ (DB, Redis, RabbitMQ)
```bash
docker compose up -d postgres redis rabbitmq meilisearch
```

#### Bước 2: Chạy Backend Spring Boot
```bash
cd backend
# Windows:
.\mvnw.cmd spring-boot:run
# Linux/Mac:
./mvnw spring-boot:run
```
> Flyway tự động kết nối PostgreSQL 16 và chạy file migration `V1__init_schema.sql` cùng `V2__seed_data.sql`.

#### Bước 3: Chạy Frontend Next.js 14
```bash
cd frontend
npm install
npm run dev
```
Mở trình duyệt: **http://localhost:3000**

---

## 🔐 KIỂM TRA BẢO MẬT & TEST TÀI KHOẢN

### Tài khoản Quản trị viên mặc định:
- **Email**: `admin@khoahocgiahoi.com`
- **Mật khẩu**: `Admin@123`

### Xác minh Mã hóa Quân đội AES-256-GCM:
- Link Google Drive lưu trong cột `courses.drive_link` và `inventory_items.item_data` hoàn toàn là chuỗi Base64 mã hóa kèm IV ngẫu nhiên 12 bytes.
- API công khai (`/courses`, `/courses/{slug}`) **tuyệt đối không bao giờ** lộ link.
- Chỉ khi khách hàng đã thanh toán thành công và gọi vào `GET /my-courses/{id}/drive-link` kèm JWT hợp lệ, Backend mới giải mã `AES-256-GCM` và trả về link Google Drive cho học viên.
