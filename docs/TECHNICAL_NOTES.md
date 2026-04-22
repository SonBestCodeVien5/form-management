# TECHNICAL NOTES

## 1. Session-based Authentication

### 1.1 Thành phần sử dụng
- `express-session`
- `bcrypt`

### 1.2 Mô hình hoạt động
- Server tạo session sau khi login thành công.
- Session ID được gửi về client qua cookie (`connect.sid`).
- Các request tiếp theo dùng cookie để xác định user đã đăng nhập.

### 1.3 Middleware
- `isAuthenticated`: cho phép truy cập nếu tồn tại `req.session.user`.
- `isAdmin`: chỉ cho phép role `admin`.

## 2. Security Notes
- Không hardcode `SESSION_SECRET`.
- Bật `cookie.secure = true` trong production (HTTPS).
- Giữ `httpOnly: true` cho cookie session.

## 3. MongoDB Notes
- Dùng Mongoose models: `User`, `FormTemplate`, `FormSubmission`.
- `FormTemplate` chứa mảng `fields` để tạo dynamic form.

## 4. API Notes
- `/register`, `/login`, `/logout`
- `/dashboard`, `/admin` (có bảo vệ middleware)
- `/api/forms` và nested routes quản lý field
