# YÊU CẦU CÔNG CỤ & MÔI TRƯỜNG (TOOL REQUIREMENTS)

Tài liệu này liệt kê toàn bộ các công cụ cần thiết để triển khai dự án Web Authentication bằng Node.js & Express.

---

## 1. Phần Mềm Cốt Lõi (Cài vào máy tính)

Đây là các phần mềm nền tảng bắt buộc phải có để chạy server và cơ sở dữ liệu.

| Phần mềm | Phiên bản khuyến nghị | Mục đích | Link tải |
| :--- | :--- | :--- | :--- |
| **Node.js** | **LTS** (Long Term Support) | Môi trường chạy mã JavaScript phía Server. | [nodejs.org](https://nodejs.org/) |
| **MongoDB Community Server** | Bản mới nhất | Hệ quản trị cơ sở dữ liệu (nơi lưu user/pass). | [mongodb.com](https://www.mongodb.com/try/download/community) |
| **MongoDB Compass** | Bản mới nhất | Công cụ giao diện (GUI) để xem dữ liệu trong MongoDB dễ dàng hơn. | (Thường đi kèm khi cài MongoDB) |
| **Postman** | Bản Free | Dùng để test API (Login, Register) trước khi ghép giao diện. Cực kỳ quan trọng khi làm JWT. | [postman.com](https://www.postman.com/downloads/) |
| **Git** | Bản mới nhất | Quản lý phiên bản code (đề phòng sửa sai muốn quay lại). | [git-scm.com](https://git-scm.com/) |

---

## 2. VS Code Extensions (Cài vào VS Code)

Để cài đặt: Bấm tổ hợp phím `Ctrl + Shift + X` (hoặc icon 4 ô vuông bên trái), gõ tên Extension và bấm **Install**.

### A. Hỗ trợ Code (Coding Support)
1.  **Prettier - Code formatter**
    * *Tác dụng:* Tự động định dạng code cho đẹp, thẳng hàng ngay ngắn khi bấm Save. Giúp code dễ đọc hơn rất nhiều.
2.  **EJS Language Support** (của *DigitalOcean*)
    * *Tác dụng:* Hỗ trợ tô màu cú pháp và gợi ý code cho file `.ejs` (Giao diện HTML). Nếu không cài, file EJS sẽ chỉ là màu trắng đen.
3.  **JavaScript (ES6) code snippets** (của *charalampos karypidis*)
    * *Tác dụng:* Gõ tắt các lệnh JS nhanh hơn (VD: gõ `clg` -> `console.log()`).
4.  **DotENV** (của *mikestead*)
    * *Tác dụng:* Tô màu cú pháp cho file `.env` (nơi chứa các khóa bí mật, password DB).

### B. Hỗ trợ Quản lý & Báo cáo
5.  **Material Icon Theme** (của *Philipp Kief*)
    * *Tác dụng:* Thay đổi icon folder/file cho đẹp và dễ nhìn, dễ phân biệt file code và file ảnh.
6.  **Markdown PDF** (của *yzane*)
    * *Tác dụng:* Chuột phải vào file `.md` -> Export PDF để nộp báo cáo ngay lập tức.
7.  **Thunder Client** (Tùy chọn thay thế Postman)
    * *Tác dụng:* Test API ngay trong VS Code mà không cần mở phần mềm Postman nặng nề.

---

## 3. Kiểm Tra Cài Đặt (Verification)

Sau khi cài đặt xong phần 1, hãy mở **Terminal** trong VS Code (`Ctrl + ~`) và gõ các lệnh sau để kiểm tra version:

```bash
# Kiểm tra Node.js
node -v
# (Kết quả mong đợi: v18.x.x hoặc v20.x.x)

# Kiểm tra NPM (Trình quản lý gói)
npm -v

# Kiểm tra Git (Nếu có cài)
git --version
```