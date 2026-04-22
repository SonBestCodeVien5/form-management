# Hướng dẫn kiểm thử các trang EJS mới

Chào bạn, đây là hướng dẫn chi tiết để cài đặt, chạy và kiểm thử các trang giao diện (EJS) mới cho dự án quản lý form.

## 1. Cài đặt & cấu hình môi trường
1. **Copy file môi trường:**
   ```bash
   cp .env.example .env
   ```
2. **Mở `.env` và chỉnh sửa:**
   - `MONGO_URI`: URL kết nối MongoDB của bạn.
   - `SESSION_SECRET`: Một chuỗi bí mật ngẫu nhiên.
   - `PORT`: Cổng server (mặc định 3000).
3. **Cài đặt các phụ thuộc:**
   ```bash
   npm install
   ```
4. **Khởi động MongoDB (nếu dùng Docker):**
   ```bash
   docker compose up -d
   ```

## 2. Khởi động server
```bash
npm start
# Hoặc dùng chế độ dev:
npm run dev
```
Truy cập `http://localhost:3000` trên trình duyệt.

## 3. Bảng kiểm tra quy trình

| Bước | URL | Mô tả |
|------|-----|-------|
| **Đăng ký** | `/register` | Tạo tài khoản (admin hoặc employee). |
| **Đăng nhập** | `/login` | Đăng nhập vào hệ thống. |
| **Dashboard** | `/dashboard` | Xem thông tin người dùng. |
| **Quản trị form** | `/admin/forms` | Danh sách form, tạo/sửa/xóa (Admin). |
| **Chỉnh sửa form** | `/admin/forms/:id/edit` | Thêm/sửa fields, thay đổi trạng thái (Admin). |
| **Danh sách form** | `/forms` | Xem các form đang `active` (Employee). |
| **Điền form** | `/forms/:id` | Điền và gửi form. |
| **Lịch sử submission** | `/submissions` | Xem danh sách các submission. |
| **Chi tiết submission** | `/submissions/:id` | Xem câu trả lời, duyệt/từ chối (Admin). |

## 4. Kiểm thử bằng REST Client (`test_api.http`)
Sử dụng file `test_api.http` để test các API backend:
1. Đăng nhập để lấy `connect.sid`.
2. Tạo form, thêm field, kích hoạt form.
3. Nộp form và kiểm tra lịch sử submission.
4. Admin duyệt/từ chối submission.
