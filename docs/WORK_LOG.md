# NHẬT KÝ PHÁT TRIỂN DỰ ÁN (WORK LOG)

## Tuần 1: Khởi tạo & Nền tảng (Foundation)

### 1. Thiết lập Môi trường & Cấu trúc
- [x] **Cài đặt công cụ:** Node.js (LTS), MongoDB Community Server, MongoDB Compass, VS Code.
- [x] **Khởi tạo dự án:** `npm init`, cài đặt `express`, `mongoose`, `ejs`, `dotenv`, `bcrypt`, `express-session`.
- [x] **Cấu trúc MVC:** Tổ chức folder `models`, `views`, `controllers`, `routes`.

### 2. Kết nối Database
- [x] **Cấu hình:** File `.env` và `config/database.js`.
- [x] **Model:** Tạo Schema `User` (username, email, password, role).

### 3. Giao diện (Frontend)
- [x] **Views:** Tạo `home.ejs`, `register.ejs`, `login.ejs` với Bootstrap 5.

---

## Tuần 2: Xây dựng Logic & Tương tác Database (Register Core)
*Mục tiêu: Xử lý dữ liệu từ Client gửi lên và lưu an toàn vào Database.*

### 1. Xử lý Dữ liệu đầu vào (Input Handling)
- [x] **Middleware:** Cấu hình `express.urlencoded` để Server đọc được dữ liệu từ Form HTML (`req.body`).
- [x] **Routing:** Phân tách rõ ràng phương thức `GET` (Hiển thị Form) và `POST` (Xử lý dữ liệu) cho route `/register`.

### 2. Logic Đăng ký (Business Logic)
- [x] **Kiểm tra dữ liệu:** Sử dụng `User.findOne` để check trùng lặp Email (Validation).
- [x] **Bảo mật mật khẩu:**
  - Tìm hiểu về Hashing (Băm mật khẩu).
  - Sử dụng thư viện `bcrypt` để mã hóa password trước khi lưu (Không lưu plain text).
- [x] **Tương tác Database:**
  - Sử dụng `User.create` để lưu user mới vào MongoDB.
  - Áp dụng `try/catch` để bắt lỗi trong quá trình xử lý bất đồng bộ (`async/await`).

### 3. Kết quả (Outcome)
- [x] Đăng ký thành công -> Dữ liệu User xuất hiện trong MongoDB Compass (với mật khẩu đã mã hóa).

---

## Tuần 3: Hoàn thiện Authentication (Login, Session, Logout)

### 1. Logic Đăng nhập & Session (Core)
- [x] **Xử lý đăng nhập:** So khớp mật khẩu (`bcrypt.compare`).
- [x] **Cấu hình Session:** Cài đặt `express-session` trong `app.js`.
  - Thiết lập `secret` trong `.env`.
  - Cấu hình `cookie` (maxAge: 1 giờ, httpOnly).
- [x] **Lưu trạng thái:** Ghi thông tin user (`id`, `username`, `role`) vào `req.session` khi login thành công.

### 2. Giao diện & Bảo mật (Dashboard)
- [x] **View:** Tạo trang `dashboard.ejs` hiển thị thông tin lấy từ Session.
- [x] **Middleware cơ bản:** Kiểm tra `if (req.session.user)` trong Controller để chặn truy cập trái phép.

### 3. Tối ưu hóa & Refactoring (Clean Code)
- [x] **Chức năng Đăng xuất:**
  - Tạo route `/logout`.
  - Sử dụng `req.session.destroy()` để hủy phiên làm việc.
- [x] **Tách Middleware:**
  - Chuyển logic kiểm tra session ra file riêng `middleware/authMiddleware.js`.
  - Sử dụng `next()` để điều hướng luồng dữ liệu.
  - Áp dụng middleware `isAuthenticated` vào route `/dashboard`.

### 4. Kết quả kiểm thử (Testing)
- [x] **Flow chuẩn:** Login -> Dashboard -> Logout -> Login.
- [x] **Bảo mật:**
  - Không thể vào Dashboard nếu chưa Login (bị đá về Login).
  - Không thể vào lại Dashboard sau khi đã Logout (bấm nút Back cũng không được).
  - Tab ẩn danh không truy cập được.

  ---
## Tuần 4: Phân quyền & Quản trị (Authorization & Admin Panel)

### 1. Cấu trúc Dữ liệu & Middleware (Backend)
- [x] **Database:** Cập nhật Schema User, thêm trường `role` (enum: 'user', 'admin').
- [x] **Middleware nâng cao:**
  - Viết hàm `isAdmin` trong `authMiddleware.js`.
  - Logic: Kiểm tra `req.session.user.role === 'admin'`. Chặn đứng nếu không phải Admin.
- [x] **Controller:** Cập nhật logic `login` để điều hướng thông minh:
  - Admin -> Chuyển hướng sang `/admin`.
  - User -> Chuyển hướng sang `/dashboard`.

### 2. Giao diện Quản trị (Admin Interface)
- [x] **Controller:** Viết hàm `getAdminPage` sử dụng `User.find()` để lấy danh sách toàn bộ người dùng.
- [x] **View:** Tạo `admin.ejs` hiển thị bảng dữ liệu (HTML Table), bao gồm thông tin: Email, Username, Role, Ngày tạo.
- [x] **Route:** Bảo vệ route `/admin` bằng 2 lớp khóa: `isAuthenticated` (Đăng nhập chưa?) và `isAdmin` (Có phải Sếp không?).

### 3. Kết quả kiểm thử (Testing)
- [x] **Phân quyền:** User thường cố tình truy cập link `/admin` bị chặn lại.
- [x] **Luồng đi:** Admin đăng nhập được chuyển thẳng vào trang quản trị.
- [x] **Hiển thị:** Danh sách user hiển thị đầy đủ, chính xác từ Database.

## 28/12/2025: Triển khai Phase 2 - API & Tích hợp JWT
- **Kiến trúc**: Chuyển đổi sang kiến trúc Lai (Hybrid) - MVC cho Web và REST API cho Mobile/Frontend.
- **Cấu trúc**:
  - Tạo `routes/apiRoutes.js` xử lý các endpoint API (prefix `/api`).
  - Tạo `controllers/apiController.js` xử lý logic và trả về JSON.
  - Tạo `middleware/apiAuth.js` xử lý xác thực không trạng thái (stateless).
- **Tính năng**:
  - Hoàn thiện luồng Đăng nhập qua API.
  - Tích hợp thư viện `jsonwebtoken`.
  - Xây dựng cơ chế tạo (signing) và xác thực (verifying) JWT.
  - Bảo vệ các Route API bằng cơ chế Bearer Token.
- **Trạng thái**: API Login hoạt động tốt, đã kích hoạt kiểm tra Token.

## 01/01/2026: Triển khai Phase 3 - Bảo mật 2 lớp (2FA/TOTP)
- **Mục tiêu**: Nâng cấp bảo mật cho API Login bằng phương thức xác thực 2 yếu tố (Password + OTP).
- **Công nghệ**: `speakeasy` (TOTP Algorithm), `qrcode` (QR Generation).
- **Thay đổi Database**:
  - Thêm `twoFactorSecret` (String): Lưu khóa bí mật.
  - Thêm `twoFactorEnabled` (Boolean): Cờ trạng thái kích hoạt.
- **Quy trình thực hiện**:
  - [x] **Setup API**: Tạo endpoint `/api/2fa/setup` để sinh Secret & QR Code.
  - [x] **Verify API**: Tạo endpoint `/api/2fa/verify` để xác nhận mã OTP lần đầu -> Kích hoạt 2FA.
  - [x] **Login Logic**: Cập nhật `apiController.login`:
    - Nếu user chưa bật 2FA -> Cấp Token ngay.
    - Nếu user đã bật 2FA -> Yêu cầu mã `totp` -> Verify đúng mới cấp Token.
- **Kết quả**:
  - Đã test thành công luồng: Login -> Setup -> Verify -> Login lại (bị chặn) -> Login kèm OTP (thành công).
  - Hệ thống hoạt động ổn định với Google Authenticator.