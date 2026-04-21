# Hệ Thống Quản lý form động 

## Giới thiệu
Dự án web app quản lý form động sử dụng Node.js và MongoDB.

## Công nghệ sử dụng
* **Backend:** Node.js, Express.js
* **Frontend:** EJS, Bootstrap 5
* **Database:** MongoDB
* **Security:** Bcrypt, Express-session

## Hướng dẫn cài đặt & Chạy
1.  **Clone dự án:**
    ```bash
    git clone <link-repo-nay>
    ```
2.  **Cài đặt thư viện:**
    ```bash
    npm install
    docker compose up -d
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
* `app.js`: File chính khởi tạo server.
