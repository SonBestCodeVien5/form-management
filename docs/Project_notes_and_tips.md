# Project Notes & Tips

## 1) Environment
- Sao chép `.env.example` thành `.env`.
- Cập nhật `MONGO_URI` và `SESSION_SECRET`.

## 2) Coding Tips
- Tách rõ `routes` và `controllers`.
- Tránh business logic trong route file.
- Dùng middleware cho authorization.

## 3) Session Tips
- Kiểm tra cookie `connect.sid` trong trình duyệt.
- Nếu login thành công nhưng bị redirect về login, kiểm tra:
  - `SESSION_SECRET`
  - thứ tự `app.use(session(...))` trước `app.use(routes)`
  - domain/port khi test local

## 4) Debug Tips
- Log `req.session` ở route cần kiểm tra.
- Kiểm tra MongoDB connection trước khi test auth flow.
