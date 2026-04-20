# 🐳 TÀI LIỆU KỸ THUẬT: KIẾN TRÚC VÀ NGUYÊN LÝ DOCKER
**Mục tiêu:** Hiểu bản chất vận hành của Docker, kiến trúc hệ thống và cách giải quyết bài toán môi trường trong phát triển phần mềm.

---

## 1. Bối cảnh: Docker sinh ra để giải quyết nỗi đau nào?

Trước khi có Docker, giới lập trình viên (đặc biệt là Backend) luôn đau đầu với 3 bài toán kinh điển:

* **Hội chứng "Works on my machine" (Chạy ngon trên máy em):** Code chạy hoàn hảo trên Windows của lập trình viên, nhưng khi đẩy lên Server (thường là Linux) thì sập do thiếu thư viện, sai đường dẫn, hoặc lệch phiên bản hệ điều hành.
* **Địa ngục thư viện (Dependency Hell):** Quản lý phiên bản trên cùng một máy tính. Ví dụ: Dự án A cần Node.js 18, dự án B cần Node.js 14. Hoặc sự nguy hiểm của các ngôn ngữ cài thư viện Global như Python (cài đè thư viện hệ thống làm hỏng các dự án cũ).
* **Mở rộng quy mô (Scaling) thủ công:** Khi hệ thống quá tải, việc cài đặt một máy chủ mới từ đầu (tải môi trường, cấu hình biến, clone code) tốn quá nhiều thời gian và dễ sai sót.

> **Giải pháp của Docker:** Gói gọn ứng dụng và *tất cả môi trường xung quanh nó* (Hệ điều hành mini, Node.js, thư viện, biến môi trường...) vào một chiếc hộp kín. Đem hộp đó đặt ở bất kỳ đâu (Windows, Mac, Server Linux) nó đều chạy ra một kết quả duy nhất.

---

## 2. Bốn trụ cột kiến trúc (Core Concepts)

### 2.1. Image (Khuôn đúc / Class)
* **Bản chất:** Là một tệp tin **chỉ đọc (read-only)** chứa mọi thứ cần thiết để chạy code.
* **Tại sao lại thế?** Đảm bảo tính nhất quán tuyệt đối. Bạn không thể sửa trực tiếp Image. Muốn đổi code, phải đúc lại Image mới. Giống như `Class` trong lập trình hướng đối tượng.
* **Tối ưu dung lượng (Layer Caching):** Image được xây dựng theo từng "lớp" (Layers). Nếu dự án A tải lõi `Node.js 18` mất 300MB, dự án B cũng dùng `Node.js 18`, Docker sẽ **dùng chung** lớp nền đó chứ không tải lại. Dung lượng thực tế tốn thêm chỉ là vài MB code của bạn.

### 2.2. Container (Thực thể / Object)
* **Bản chất:** Là một phiên bản "đang chạy" của Image. Nếu Image là `Class`, Container là `Object`.
* **Tại sao lại thế?** Từ 1 Image, bạn có thể tạo ra hàng nghìn Container chạy song song độc lập.
* **Đặc tính Vô thường:** Container được thiết kế để dễ dàng bị xóa bỏ và tạo mới. Khi Container tắt, mọi dữ liệu rác sinh ra bên trong nó sẽ **bị xóa sạch**. Nó là một môi trường cô lập hoàn toàn (Sandbox an toàn).

### 2.3. Volume (Lưu trữ bền vững / USB gắn ngoài)
* **Bản chất:** Là cơ chế đục một lỗ xuyên qua vỏ Container, nối thẳng thư mục bên trong Container ra một vùng an toàn trên ổ cứng máy thật.
* **Tại sao lại thế?** Để giải quyết "đặc tính vô thường" của Container. Đối với Database (như MongoDB), ta không thể để dữ liệu người dùng mất đi khi tắt Container. Volume đóng vai trò như chiếc USB, giữ lại toàn bộ data. Đập Container cũ, xây Container mới, cắm USB vào lại chạy tiếp.

### 2.4. Network (Mạng nội bộ)
* **Bản chất:** Hệ thống mạng LAN ảo do Docker tự giăng ra để các Container nói chuyện với nhau.
* **Tại sao lại thế?** Mặc định các Container không biết sự tồn tại của nhau. Thay vì kết nối qua IP phức tạp, Network cho phép Server gọi Database bằng **chính tên của Container** (VD: gọi `mongodb://auth-mongo:27017` thay vì `localhost`).

---

## 3. Giải phẫu các file cấu hình cốt lõi

### 3.1. `.dockerignore` (Màng lọc rác)
* **Chức năng:** Chặn không cho Docker copy các file/thư mục cụ thể vào Image.
* **Tại sao phải chặn `node_modules`?** Khác biệt về hệ điều hành (OS Mismatch). Code trên máy thật là Windows, nhưng Container chạy Linux. Một số thư viện (như mã hóa bcrypt) dùng nhân C++ sẽ biên dịch khác nhau trên 2 hệ điều hành. Bắt buộc phải để Container tự chạy `npm install` lại từ đầu để lấy bản Linux chuẩn.

### 3.2. `Dockerfile` (Công thức đúc Image)
* **Chức năng:** Từng bước ra lệnh cho Docker tạo ra Image.
* **Tại sao phải cố định Version?** (`FROM node:18-alpine` thay vì `node:latest`). Để đảm bảo 5 năm sau tải lại, ứng dụng vẫn chạy trên đúng môi trường đó, không bị sập do framework cập nhật phá vỡ cấu trúc cũ (Breaking changes). `alpine` là phiên bản Linux rút gọn siêu nhẹ giúp tối ưu dung lượng ổ cứng.

### 3.3. `docker-compose.yml` (Bản thiết kế Nhạc trưởng)
* **Chức năng:** Gom tất cả các lệnh tạo Image, khởi chạy nhiều Container, cắm Volume, và giăng Network vào một file định dạng YAML duy nhất.
* **Tại sao lại thế?** Trong hệ thống thực tế (như Xác thực người dùng), ứng dụng luôn có ít nhất 2 phần: Server (Node.js) và Database (MongoDB). Thay vì gõ hàng chục câu lệnh thủ công, ta chỉ cần 1 lệnh `docker-compose up -d` để "Nhạc trưởng" tự động dàn xếp mọi thứ theo đúng thứ tự (`depends_on`).

---

## 4. Các khái niệm bổ trợ cần nhớ

* **Port Mapping (Đục tường):** Container là phòng cách ly. Muốn máy tính thật truy cập được web đang chạy bên trong (ví dụ ở cổng 3000), phải làm thao tác nối cổng `3000:3000` (Cổng Windows : Cổng Container).
* **Docker Hub (Registry):** Nơi lưu trữ các Image công khai. Tương tự như GitHub dành cho code, hay NPM dành cho thư viện JS. Ta kéo các "phôi chuẩn" (Mongo, Redis, Node) từ đây về.

***