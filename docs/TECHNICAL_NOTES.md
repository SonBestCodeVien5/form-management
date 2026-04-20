# SỔ TAY KỸ THUẬT DỰ ÁN (TECHNICAL NOTES)

*Cập nhật lần cuối: Tuần 6

Tài liệu này tổng hợp các kiến thức cốt lõi, giải thích bản chất "Tại sao làm thế" cho dự án Node.js/MongoDB Authentication.

-----

## 1\. KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

### 1.1. Node.js: Đơn luồng & Bất đồng bộ (Single-Threaded & Async)

  * **Bản chất:** Node.js chỉ dùng **1 luồng duy nhất (Main Thread)** để xử lý mọi request.
  * **Ví dụ:** Giống như quán cafe chỉ có 1 nhân viên phục vụ.
  * **Cơ chế Non-blocking I/O:**
      * Khi gặp tác vụ nặng (kết nối DB, đọc file), Node.js sẽ "dán giấy nhớ" (`await`) và ném tác vụ đó ra sau nền.
      * Nhân viên quay lại phục vụ khách hàng khác ngay lập tức -\> Giúp chịu tải hàng chục nghìn kết nối cùng lúc.
  * **Tại sao cần `await`?** Để ép code chạy tuần tự ở những chỗ cần thiết (VD: Phải chờ tìm thấy User trong DB xong mới được kiểm tra password).

### 1.2. Frontend vs Backend (Ranh giới môi trường)

  * **Backend (Node.js):**
      * Chạy trên Server. Có toàn quyền (đọc/ghi file, kết nối DB).
      * Dùng: `require`, `module.exports`, `process.env`.
      * **Không có:** `window`, `document`, `alert` (vì Server không có màn hình).
  * **Frontend (Browser):**
      * Chạy trên trình duyệt người dùng (Chrome/Edge).
      * Dùng: `document.getElementById`, `window`, `fetch`.
      * **Cấm:** `require`, kết nối trực tiếp DB (lỗi bảo mật).

### 1.3. Server-Side Rendering (SSR) - Mô hình hiện tại

  * **Cơ chế:** Server (Node.js) tính toán, điền dữ liệu vào file `.ejs`, sau đó vẽ ra mã **HTML thuần** rồi mới gửi về cho trình duyệt.
  * **Vai trò:**
      * **Node.js:** Là "Họa sĩ" vẽ tranh.
      * **Browser:** Chỉ là cái "Tivi" hiển thị bức tranh đó.
  * **Khác biệt với React/Next.js:** React là Client-Side Rendering (Trình duyệt tự tải code JS về để vẽ giao diện).

-----

## 2\. QUẢN LÝ PHIÊN & BẢO MẬT (SESSION & SECURITY)

### 2.1. Vấn đề "Cá vàng" của HTTP

  * HTTP là giao thức không trạng thái (Stateless). Server không tự nhớ user giữa 2 lần F5.
  * **Giải pháp:** Dùng **Session** (Bộ nhớ tạm trên Server) và **Cookie** (Thẻ bài đánh dấu phía Client).

### 2.2. Cấu hình `express-session`

```javascript
app.use(session({
    secret: process.env.SESSION_SECRET, // Chữ ký bảo mật
    resave: false,           // Không ghi đè nếu không đổi
    saveUninitialized: true, // Lưu session ngay khi khách vừa vào
    cookie: { 
        maxAge: 3600000,     // Thời gian sống (ms)
        httpOnly: true       // CHỐNG TRỘM (JS không đọc được)
    }
}));
```

### 2.3. Các lớp bảo mật Session

1.  **Chống sửa đổi (Anti-Tampering):** Dùng `secret` để ký vào Cookie. Nếu User tự sửa cookie, chữ ký sai -\> Server hủy thẻ.
2.  **Chống ăn trộm (Anti-Theft/XSS):**
      * `httpOnly: true`: Ngăn chặn mã JavaScript độc hại (do Hacker cài cắm) đọc trộm `document.cookie`.
3.  **Chống nghe lén (Sniffing):**
      * `secure: true`: Chỉ gửi cookie qua HTTPS (Chỉ bật khi lên Production, tắt khi chạy Localhost).

-----

## 3\. MIDDLEWARE & LUỒNG DỮ LIỆU (THE FLOW)

### 3.1. Bản chất Middleware

  * Là dây chuyền sản xuất. `req` (gói hàng) đi qua từng trạm kiểm soát (`app.use`) trước khi đến đích (Controller).

### 3.2. Nguồn gốc các biến trong `req`

  * **`req.body`:** Được sinh ra bởi middleware `express.urlencoded`. Nó "bóc" dữ liệu form và nhét vào `req`.
  * **`req.session`:** Được sinh ra bởi middleware `session`. Nó "tra cứu" kho lưu trữ và nhét thông tin user vào `req`.
  * **`user` (trong Controller):** Được lấy từ Database thông qua Mongoose (`User.findOne`).

### 3.3. Thứ tự quan trọng

1.  `express.urlencoded` (Phải chạy trước để lấy data).
2.  `session` (Phải chạy trước Routes để kịp cấp thẻ).
3.  `routes` (Chạy sau cùng).

-----

## 4\. QUY TRÌNH LOGIN HOÀN CHỈNH (BEST PRACTICE)

1.  **Nhận Request:** `POST /login` với `email`, `password`.
2.  **Tìm kiếm:** `User.findOne({ email })`.
3.  **So khớp:** `bcrypt.compare(password, user.password)`.
      * *Tại sao không so sánh `===`?* Vì mật khẩu trong DB đã bị băm (Hash), không thể dịch ngược lại, chỉ có thể băm cái mới rồi so sánh 2 bản băm.
4.  **Cấp thẻ (Session):**
      * Lưu `req.session.user = { id, username, role }`.
      * **Lưu ý:** Tuyệt đối không lưu `password` vào Session.
5.  **Điều hướng:** `res.redirect('/dashboard')`.

-----

## 5\. GIT & GITHUB (VERSION CONTROL)

### 5.1. Quy tắc `.gitignore`

  * File `.gitignore` là tấm khiên chặn các file rác hoặc nhạy cảm.
  * **Bắt buộc chặn:**
      * `node_modules/`: Quá nặng, không cần thiết (người khác tự `npm install`).
      * `.env`: Chứa mật khẩu DB và Secret Key (Lộ là mất dữ liệu).

### 5.2. Các lệnh cơ bản

  * `git init`: Khởi tạo kho.
  * `git add .`: Gom file.
  * `git commit -m "messsage"`: Lưu trạng thái.
  * `git push`: Đẩy lên GitHub.

  -----

## 6\.. MIDDLEWARE & FLOW XỬ LÝ (NÂNG CAO)

### 6.1. Cơ chế hoạt động của Middleware
* **Khái niệm:** Là những trạm kiểm soát nằm giữa Request và Response.
* **Luồng chạy:** `Request` -> `Middleware 1` -> `Middleware 2` -> ... -> `Controller`.
* **Lệnh `next()`:**
  - Là "chìa khóa" để mở cửa sang trạm tiếp theo.
  - Nếu Middleware không gọi `next()` (hoặc không `res.send/redirect`), request sẽ bị treo mãi mãi.

### 6.2. Cú pháp Destructuring khi Import
* Code: `const { isAuthenticated } = require(...)`
* **Ý nghĩa:** Chỉ lấy đúng hàm `isAuthenticated` từ trong file export ra, không lấy cả object. Giúp code gọn hơn.

### 6.3. Tại sao Logout dùng GET?
* Route `/logout` bản chất là hành động điều hướng (Navigation), không gửi dữ liệu lên server, nên dùng `GET` cho tiện (gắn vào thẻ `<a>` được).
* **Lưu ý:** Với các hệ thống lớn, nên dùng `POST` để tránh lỗi CSRF (bị lừa bấm link đăng xuất).

---

## 7\. CHI TIẾT VỀ SESSION (DATA FLOW)

### 7.1. Flow 2 chiều (Browser <-> Server)
* **Chiều đi (Server -> Browser):**
  - Khi gán `req.session.user = ...`, thư viện tự động gửi header `Set-Cookie: connect.sid=...` về trình duyệt.
* **Chiều về (Browser -> Server):**
  - Trình duyệt tự động gửi header `Cookie: connect.sid=...` lên Server.
  - Middleware `session` dùng mã ID đó để lục lọi trong RAM và trả lại dữ liệu user vào biến `req.session`.

### 7.2. Các hàm quan trọng
* `req.session.user = {...}`: **Cấp thẻ** (Ghi vào RAM).
* `req.session.destroy()`: **Xé thẻ** (Xóa khỏi RAM).
* `res.redirect()`: **Đuổi về** (Điều hướng sang trang khác).

---
## 8\. PHÂN QUYỀN (AUTHORIZATION - RBAC)

### 8.1. Khái niệm Role-Based Access Control (RBAC)
* Hệ thống phân quyền dựa trên vai trò.
* **Database:** Thêm trường `role` vào bản ghi User.
* **Session:** Khi đăng nhập, Server lưu `role` vào Session để "đóng dấu" lên thẻ bài của người dùng.

### 8.2. Chiến lược bảo vệ nhiều lớp (Defense in Depth)
* Muốn vào phòng Admin, Request phải đi qua 2 cổng kiểm soát:
  1.  `isAuthenticated`: Kiểm tra xem đã có Session chưa (đã đăng nhập chưa).
  2.  `isAdmin`: Mở Session ra, kiểm tra trường `role` có phải là 'admin' không.
* Code: `router.get('/admin', isAuthenticated, isAdmin, controller)`

---

## 9\. CƠ CHẾ ĐIỀU HƯỚNG (REDIRECT FLOW)

### 9.1. Bản chất của `res.redirect`
* Server không tự chuyển hàm nội bộ. `res.redirect('/admin')` thực chất là Server gửi tín hiệu về Browser: *"Hãy đi sang địa chỉ /admin đi!"*.
* Mã HTTP Status: **302 Found**.

### 9.2. Luồng đi "Bóng bàn" (Ping-Pong)
1.  **Request 1 (POST /login):** Browser gửi user/pass. Server kiểm tra OK -> Trả về lệnh Redirect.
2.  **Request 2 (GET /admin):** Browser nhận lệnh -> Tự động gửi Request mới đến `/admin`.
3.  **Hệ quả:** Vì là Request mới, nên nó bắt buộc phải chạy qua toàn bộ Middleware (`isAuthenticated`, `isAdmin`) từ đầu. Điều này đảm bảo an ninh tuyệt đối, không có chuyện "đi cửa sau" từ hàm Login sang hàm Admin.

## 10. CÔNG CỤ KIỂM THỬ API (POSTMAN)

### 10.1. Vai trò trong dự án
* Do API trả về dữ liệu dạng JSON (không phải giao diện HTML), việc kiểm thử trên trình duyệt gặp nhiều hạn chế (khó gửi POST request với JSON body, không thể tùy chỉnh Header).
* Postman đóng vai trò là một **Client giả lập**, cho phép gửi các request phức tạp để kiểm tra logic của Backend trước khi tích hợp vào Frontend (Mobile/Web App).

### 10.2. Quy trình kiểm thử JWT với Postman
1.  **Login:** Gửi Request `POST /api/login` với body JSON (email, pass) -> Nhận về chuỗi `token`.
2.  **Xác thực:** Copy chuỗi `token` nhận được.
3.  **Gọi API bảo mật:** Mở tab mới, chọn tab **Headers**, thêm key `Authorization` với giá trị `Bearer <token_vua_copy>` -> Gửi Request để kiểm tra quyền truy cập.

---
# Giai đoạn 2: 

## 1\. Xác thực JWT (Stateless)**

### 1.1. Kiến trúc Hybrid (Lai)
Dự án hiện tại chạy song song hai cơ chế xác thực:
- **Web (Browser)**: Sử dụng **Session-based** (Stateful). Server lưu trạng thái trong memory/store, Client dùng Cookie `connect.sid`.
- **API (Mobile/React)**: Sử dụng **Token-based** (Stateless). Server không lưu trạng thái, Client tự lưu Token.

### 1.2. Khái niệm JWT (JSON Web Token)
JWT là chuẩn mở (RFC 7519) dùng để truyền tải thông tin an toàn giữa các bên dưới dạng đối tượng JSON.

#### Cấu trúc
Gồm 3 phần tách nhau bởi dấu chấm (`.`): `Header.Payload.Signature`
- **Header**: Loại token (JWT) và thuật toán mã hóa (HS256).
- **Payload**: Chứa thông tin user (Claims). *Lưu ý: Không để password hay dữ liệu nhạy cảm vào đây.*
  - Ví dụ: `{ id: "user_123", role: "admin", iat: 1700000000 }`
- **Signature**: Chữ ký để Server kiểm tra tính toàn vẹn (được tạo từ Header + Payload + Secret Key).

### 1.3. Cơ chế hoạt động trong Project
1. **Login**: Client gửi `email/password` -> Server kiểm tra DB -> Nếu đúng, Server ký (sign) một JWT và trả về Client.
2. **Storage**: Client (Mobile App/Frontend) lưu JWT (thường lưu ở LocalStorage hoặc SecureStore).
3. **Request**: Với các request cần bảo mật, Client gửi JWT trong Header:
   `Authorization: Bearer <token_string>`
4. **Verify**: Middleware `apiAuth.js`:
   - Lấy token từ Header.
   - Dùng `jwt.verify(token, process.env.JWT_SECRET)` để kiểm tra.
   - Nếu hợp lệ: Gán `req.user = decodedData` và cho phép đi tiếp (`next()`).
   - Nếu không hợp lệ/hết hạn: Trả về 401/403.

###  1.4. Chi tiết triển khai (Implementation)
- **Thư viện**: `jsonwebtoken`
- **Secret Key**: Lưu trong biến môi trường `JWT_SECRET` (file `.env`). Tuyệt đối không hardcode.
- **Luồng xử lý**:
  - `apiController.js`: Đăng nhập & Tạo token (`jwt.sign`).
  - `apiAuth.js`: Middleware chặn bắt request & Xác thực token.

  -----

## 2. XÁC THỰC 2 LỚP (2FA - TOTP)

### 2.1. Khái niệm TOTP (Time-based One-Time Password)
*   **Định nghĩa:** Là phương thức xác thực sử dụng mật khẩu dùng một lần được sinh ra dựa trên thời gian thực.
*   **Chuẩn:** RFC 6238.
*   **Công thức toán học:**
    $$ \text{OTP} = \text{HMAC-SHA1}(\text{SecretKey}, \text{TimeCounter}) $$
    *   `SecretKey`: Chuỗi ký tự ngẫu nhiên (Base32) được Server sinh ra và chia sẻ cho Client (thông qua mã QR).
    *   `TimeCounter`: Thời gian hiện tại (Unix Timestamp) chia cho chu kỳ (thường là 30 giây).
    *   `HMAC-SHA1`: Hàm băm mật mã dùng khóa.
*   **Đặc điểm nổi bật:**
    *   **Offline:** Server và Client (Điện thoại) không cần kết nối mạng với nhau. Chúng chỉ cần có chung `SecretKey` và đồng hồ thời gian tương đối chính xác.
    *   **Dynamic:** Mã thay đổi liên tục mỗi 30 giây, chống lại tấn công phát lại (Replay Attack) sau khi mã hết hạn.

### 2.2. Thư viện sử dụng
*   **`speakeasy`:** Thư viện Node.js thực hiện các thuật toán TOTP.
    *   `generateSecret()`: Tạo khóa bí mật ngẫu nhiên.
    *   `totp.verify()`: Kiểm tra mã OTP gửi lên có khớp với tính toán của Server không.
*   **`qrcode`:** Thư viện tạo mã QR từ chuỗi URL `otpauth://`. Giúp người dùng quét mã thay vì nhập tay chuỗi Secret dài ngoằng.

### 2.3. Quy trình bảo mật (Security Flow)
Tại sao không bật 2FA ngay khi tạo Secret?
*   **Vấn đề (Lockout Risk):** Nếu Server bật cờ `twoFactorEnabled = true` ngay khi sinh mã QR, nhưng người dùng chưa kịp quét (hoặc camera hỏng), lần sau đăng nhập Server sẽ đòi mã OTP mà người dùng không có -> Người dùng bị khóa vĩnh viễn khỏi tài khoản.
*   **Giải pháp (Verify-First):** Quy trình 2 bước (Setup -> Verify).
    1.  **Setup:** Server tạo secret, lưu vào DB nhưng **chưa kích hoạt** (`enabled = false`). Gửi QR cho user.
    2.  **Verify:** Bắt buộc user phải nhập đúng mã 6 số lần đầu tiên để chứng minh họ đã quét thành công và đang nắm giữ mã. Chỉ khi verify thành công, Server mới set `enabled = true`.

### 2.4. Workflow Đăng nhập với 2FA (Login Flow)
Quy trình đăng nhập thay đổi từ 1 bước sang quy trình có điều kiện:

1.  **Bước 1 (Authentication):** User gửi `Email + Pass`.
2.  **Bước 2 (Check 2FA Status):** Server kiểm tra trường `twoFactorEnabled` của user.
    *   **Trường hợp A (Chưa bật):** Cấp Token ngay lập tức.
    *   **Trường hợp B (Đã bật):**
        *   Kiểm tra xem request có gửi kèm mã `totp` không.
        *   Nếu **KHÔNG**: Trả về lỗi `400 Bad Request` kèm thông điệp "Vui lòng nhập mã 2FA" và cờ `require2FA: true`.
        *   Nếu **CÓ**: Dùng `speakeasy` verify mã `totp` với `twoFactorSecret` trong DB.
            *   Đúng -> Cấp Token.
            *   Sai -> Trả về lỗi `400` "Mã không hợp lệ".

### 2.5. Cửa sổ thời gian (Time Window)
*   Do đồng hồ giữa Server và Điện thoại có thể lệch nhau vài giây, thuật toán TOTP cho phép một "cửa sổ" sai số (Window).
*   Mặc định `speakeasy` thường cho phép sai lệch ±1 bước (tức là chấp nhận cả mã của 30s trước và 30s sau) để đảm bảo trải nghiệm người dùng mượt mà.
