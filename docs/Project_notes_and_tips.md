# TỔNG HỢP LƯU Ý QUAN TRỌNG & MẸO (NOTES & TIPS)

Tài liệu này chứa các quy tắc "xương máu" cần tuân thủ để dự án chạy ổn định, bảo mật và được đánh giá cao.

---

## ⚠️ 1. QUẢN LÝ SOURCE CODE (CỰC KỲ QUAN TRỌNG)

### ⛔ Tuyệt đối không copy/upload `node_modules`
* **Lý do:** Thư mục này chứa hàng ngàn file thư viện, rất nặng (vài trăm MB).
* **Cách làm đúng:**
    * Khi nộp bài hoặc copy sang máy khác: Chỉ copy code của bạn và file `package.json`.
    * Ở máy mới: Mở terminal và chạy lệnh `npm install`. Node.js sẽ tự động tải lại các thư viện dựa trên `package.json`.
* **Git:** Nếu dùng Git, hãy tạo file `.gitignore` và thêm dòng: `node_modules/`.

### 🔒 File `.env` và Bảo mật
* **Lưu ý:** Không bao giờ viết cứng (hardcode) các thông tin nhạy cảm như: Mật khẩu Database, Secret Key của Session/JWT trực tiếp vào code.
* **Cách làm đúng:**
    * Lưu chúng trong file `.env`.
    * Ví dụ: `SESSION_SECRET=chuoi_bi_mat_khong_ai_biet`
    * Gọi ra bằng: `process.env.SESSION_SECRET`.

---

## 🛡️ 2. CÁC LƯU Ý VỀ BẢO MẬT (SECURITY)
*Phần này quyết định điểm số môn học của bạn.*

### 🔑 Mật khẩu (Password)
* **QUY TẮC VÀNG:** Không bao giờ lưu password dạng văn bản thô (plain text) trong Database. Admin cũng không được quyền biết pass của User.
* **Giải pháp:** Luôn dùng thư viện **`bcrypt`** (hoặc `argon2`) để băm (hash) password trước khi lưu.

### 🍪 Session & Cookies
* **Secret Key:** Chuỗi bí mật dùng để ký session phải đủ dài và ngẫu nhiên. Đừng đặt kiểu `secret = '123456'`.
* **HTTPOnly:** Khi cấu hình Cookie, nên để `httpOnly: true` để ngăn chặn hacker dùng JavaScript lấy trộm cookie (XSS).

### 🛑 Xử lý Lỗi (Error Handling)
* Khi code bị lỗi, đừng để lộ chi tiết lỗi (stack trace) ra ngoài trình duyệt cho người dùng thấy. Hãy `console.log` lỗi ở Server, còn Client chỉ hiện thông báo chung chung (Ví dụ: "Đã có lỗi xảy ra, vui lòng thử lại").

---

## 💻 3. MẸO KHI CODE (CODING TIPS)

### 🔄 Tự động khởi động lại Server
* Mặc định, mỗi khi sửa code, bạn phải tắt server và bật lại (`node app.js`) mới nhận code mới. Rất mất thời gian.
* **Mẹo:** Cài đặt `nodemon` để tự động restart server khi lưu file.
    * Cài đặt: `npm install -g nodemon`
    * Chạy lệnh: `nodemon app.js` (thay vì `node app.js`).

### ⚡ Async / Await
* Node.js xử lý bất đồng bộ. Khi thao tác với Database (tìm user, lưu user), **bắt buộc** phải chờ nó làm xong mới chạy dòng tiếp theo.
* **Lời khuyên:** Hãy dùng từ khóa `async` và `await`. Code sẽ dễ đọc hơn nhiều so với dùng `.then() .catch()`.
    ```javascript
    // Ví dụ đúng:
    app.post('/login', async (req, res) => {
        const user = await User.findOne({ email: req.body.email });
        // ...
    });
    ```

### 📝 Comment Code
* Vì đây là dự án để học và viết báo cáo, hãy **comment thật nhiều**.
* Giải thích tại sao lại dùng hàm này, dòng này có ý nghĩa gì. Điều này giúp bạn khi viết báo cáo chỉ cần mở code ra đọc lại là viết được ngay.

---

## 📊 4. LƯU Ý CHO BÁO CÁO (REPORTING)

### 📸 Chụp ảnh minh chứng ("Pic or it didn't happen")
* Đừng đợi làm xong hết mới chụp. Hãy chụp lại từng bước:
    1.  Ảnh database khi User chưa đăng ký.
    2.  Ảnh database sau khi User đăng ký (để chứng minh password đã được mã hóa loằng ngoằng).
    3.  Ảnh Tab "Application" -> "Cookies" trên trình duyệt để chứng minh Session ID đã được tạo.
    4.  Ảnh Postman trả về Token (khi làm phần JWT).

### 🎨 So sánh các phương pháp
* Để báo cáo có chiều sâu, hãy luôn đặt câu hỏi: "Tại sao dùng cái này mà không dùng cái kia?".
* Ví dụ: Tại sao dùng MongoDB (NoSQL) mà không dùng MySQL (SQL)? (Trả lời: Vì cấu trúc linh hoạt, dễ thay đổi field User khi đang phát triển).

---

## 🛠️ 5. CHECKLIST TRƯỚC KHI NỘP/DEMO

1.  [ ] Xóa các dòng `console.log` rác (ví dụ: `console.log('test 123')`).
2.  [ ] Kiểm tra file `.gitignore` đã chặn `node_modules` chưa.
3.  [ ] Đảm bảo file `README.md` có hướng dẫn cách chạy (VD: Cần chạy `npm install` trước).
4.  [ ] Kiểm tra kết nối Database (MongoDB phải đang chạy `Running`).