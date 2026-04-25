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
2.  **Cấu hình môi trường:**
    * Copy `.env.example` thành `.env`
    * Điều chỉnh `SESSION_SECRET` theo máy của bạn

3.  **Chạy theo 1 trong 2 cách:**

    **Cách A - Full Docker (khuyến nghị khi đóng gói nộp):**
    ```bash
    docker compose up --build -d
    ```
    Truy cập tại `http://localhost:3000`.

    **Cách B - Chạy local Node.js + Docker MongoDB:**
    ```bash
    npm install
    docker compose up -d
    npm start
    ```
    Hoặc chạy chế độ dev:
    ```bash
    npm run dev
    ```

## Cấu trúc dự án
* `/models`: Chứa Schema Database.
* `/views`: Chứa giao diện EJS.
* `/routes`: Chứa các đường dẫn URL.
* `/middleware`: Chứa logic kiểm tra đăng nhập/phân quyền.
* `app.js`: File chính khởi tạo server.
