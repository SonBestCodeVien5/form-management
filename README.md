# Hệ Thống Xác Thực & Phân Quyền (Authentication & Authorization System)

## Giới thiệu
Dự án web app demo các kỹ thuật xác thực người dùng (Session-based, JWT) và phân quyền (Admin/User) sử dụng Node.js và MongoDB.

## Công nghệ sử dụng
* **Backend:** Node.js, Express.js
* **Frontend:** EJS, Bootstrap 5
* **Database:** MongoDB
* **Security:** Bcrypt, JSON Web Token (JWT), Express-session

## Hướng dẫn cài đặt & Chạy
1.  **Clone dự án:**
    ```bash
    git clone <link-repo-nay>
    ```
2.  **Cài đặt thư viện:**
    ```bash
    npm install
    ```
3.  **Cấu hình môi trường:**
    * Đổi tên file `.env.example` thành `.env`
    * Điền thông tin kết nối MongoDB và Secret Key.
4.  **Chạy dự án:**
    ```bash
    npm start
    # Hoặc chạy chế độ dev:
    npm run dev
    ```
5.  **Truy cập:** Mở trình duyệt tại `http://localhost:3000`

## Cấu trúc dự án
* `/models`: Chứa Schema Database.
* `/views`: Chứa giao diện EJS.
* `/routes`: Chứa các đường dẫn URL.
* `/middleware`: Chứa logic kiểm tra đăng nhập/phân quyền.

## các tài khoàn test đã tạo 
username: "test_user_01"
email: "test01@gmail.com"
pass: "123456"

username: "test_user_02"
email: "abc@gmail.com"
pass: "123456"