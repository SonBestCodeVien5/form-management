# Tài liệu dự án Form Management (Session-based)

## 1) Mục tiêu
Xây dựng hệ thống quản lý form động với xác thực người dùng bằng **Session-based Authentication**.

## 2) Công nghệ
- Backend: Node.js, Express
- View Engine: EJS
- Database: MongoDB (Mongoose)
- Authentication: bcrypt + express-session

## 3) Phạm vi chức năng hiện tại
- Đăng ký tài khoản
- Đăng nhập/đăng xuất bằng session
- Phân quyền `admin` / `employee`
- Admin quản lý FormTemplate (CRUD)
- Admin quản lý field trong mỗi form

## 4) Luồng xác thực hiện tại
1. User gửi `email/password` tới endpoint login.
2. Server kiểm tra mật khẩu bằng `bcrypt.compare()`.
3. Nếu hợp lệ, server lưu thông tin user vào `req.session.user`.
4. Các route bảo vệ dùng middleware kiểm tra session:
   - `isAuthenticated`
   - `isAdmin`

## 5) Cấu trúc chính
- `app.js`: cấu hình middleware, session, routes, start server.
- `controllers/`: xử lý nghiệp vụ auth và form.
- `routes/`: định nghĩa endpoint.
- `models/`: schema dữ liệu MongoDB.
- `middleware/`: kiểm tra đăng nhập và phân quyền.

## 6) Kế hoạch mở rộng
- API cho FormSubmission
- Validation request body
- Bộ test tự động
- Tối ưu Docker workflow
