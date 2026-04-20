# KẾ HOẠCH TRIỂN KHAI DỰ ÁN: HỆ THỐNG XÁC THỰC & PHÂN QUYỀN WEB (MULTI-AUTH SYSTEM)

## 1. Tổng Quan Dự Án
- **Tên dự án:** Xây dựng Web App với Đa phương thức Xác thực.
- **Mục tiêu:** Nghiên cứu và triển khai các kỹ thuật Authentication (Xác thực) và Authorization (Phân quyền) từ cơ bản đến nâng cao.
- **Thời gian:** 6 - 7 tuần.
- **Người thực hiện:** [Nguyễn Khánh Sơn]
- **Vai trò:** Full-stack Developer.

## 2. Công Nghệ Sử Dụng (Tech Stack)
| Thành phần | Công nghệ | Ghi chú |
| :--- | :--- | :--- |
| **Backend** | Node.js + Express.js | Framework chính xử lý logic. |
| **Frontend** | EJS + Bootstrap 5 | Render giao diện phía Server (Server-side rendering). |
| **Database** | MongoDB (Mongoose) | NoSQL Database, linh hoạt cho thay đổi cấu trúc. |
| **Authentication** | Bcrypt, Express-session, JWT | Các thư viện lõi để xử lý bảo mật. |

---

## 3. Lộ Trình Triển Khai Chi Tiết

### 🚀 GIAI ĐOẠN 1: NỀN TẢNG & SESSION-BASED AUTH (4 Tuần)
*Mục tiêu: Hoàn thiện web chạy được với phương pháp xác thực truyền thống.*

#### Tuần 1: Khởi tạo & Cơ sở dữ liệu
- [ ] Cài đặt môi trường: Node.js, MongoDB Compass, Postman.
- [ ] Khởi tạo project (`npm init`), cài đặt packages: `express`, `mongoose`, `ejs`, `dotenv`.
- [ ] Thiết kế Database Schema (User Model):
    - `username`: String, unique
    - `email`: String, unique
    - `password`: String (Hash)
    - `role`: String (Default: 'user')
- [ ] Xây dựng giao diện tĩnh (Home, Login, Register) bằng EJS.

#### Tuần 2: Chức năng Đăng ký (Registration)
- [ ] Tạo API `POST /register`.
- [ ] Validate dữ liệu đầu vào (Email hợp lệ, Password đủ mạnh).
- [ ] **Core:** Tích hợp `bcrypt` để mã hóa mật khẩu trước khi lưu DB.
- [ ] Xử lý lỗi trùng lặp Email/Username.

#### Tuần 3: Đăng nhập & Session (Auth Method 1)
- [ ] Cài đặt `express-session` và cấu hình Cookie.
- [ ] Tạo API `POST /login`:
    - Tìm user trong DB.
    - So sánh password (`bcrypt.compare`).
    - Lưu thông tin user vào `req.session`.
- [ ] Viết Middleware `isAuthenticated` để bảo vệ các route cần đăng nhập.
- [ ] Xử lý Đăng xuất (`req.session.destroy`).

#### Tuần 4: Phân quyền (Authorization) & Báo cáo sơ bộ
- [ ] Tạo trang Admin Dashboard (chỉ Admin mới thấy).
- [ ] Viết Middleware `isAdmin`: Kiểm tra `req.session.user.role === 'admin'`.
- [ ] Phân quyền trên giao diện (Ẩn/hiện nút Admin dựa trên role).
- [ ] **Viết báo cáo (Phần 1):** Vẽ sơ đồ luồng Session, giải thích cơ chế Cookie.

---

### 💡 GIAI ĐOẠN 2: MỞ RỘNG & NÂNG CAO (2-3 Tuần)
*Mục tiêu: Triển khai thêm phương thức mới để so sánh và viết báo cáo tổng hợp.*

#### Tuần 5: JWT Authentication (Auth Method 2)
- [ ] Tạo nhánh chức năng mới (hoặc bộ API riêng).
- [ ] Cài đặt `jsonwebtoken`.
- [ ] Triển khai luồng JWT:
    - Login thành công -> Server trả về Token.
    - Client lưu Token (LocalStorage/Cookie).
    - Gửi Token kèm Header trong các request sau.
- [ ] Viết Middleware `verifyToken`.

#### Tuần 6: Tính năng nâng cao (Chọn 1)
- [ ] **Option A:** Tích hợp Google Login (OAuth 2.0) dùng `Passport.js`.
- [ ] **Option B:** Xác thực 2 lớp (2FA) gửi mã qua Email/Google Authenticator.

#### Tuần 7: Tổng hợp & Báo cáo
- [ ] Refactor code, thêm comments giải thích logic khó.
- [ ] Kiểm tra bảo mật cơ bản (XSS, NoSQL Injection).
- [ ] Hoàn thiện báo cáo: So sánh ưu nhược điểm của Session vs JWT.

---

## 4. Cấu Trúc Báo Cáo Dự Kiến
1.  **Mở đầu:** Lý do chọn đề tài, giới thiệu công nghệ.
2.  **Cơ sở lý thuyết:** Khái niệm Auth vs Author, Hashing, Salt.
3.  **Thiết kế hệ thống:** Sơ đồ CSDL, kiến trúc MVC.
4.  **Triển khai chi tiết:**
    - Code snippet phần Đăng ký (Hashing).
    - Code snippet phần Login (Session).
    - Code snippet phần Verify Token (JWT).
5.  **Đánh giá & So sánh:** Bảng so sánh hiệu năng, bảo mật giữa các phương pháp.
6.  **Kết luận.**