const express = require('express'); // khởi tạo express từ package đã cài
const app = express(); // khởi tạo app từ express
const session = require('express-session'); // import thư viện quản lí session 

require('dotenv').config(); // Đọc file .env
const connectDB = require('./config/database'); // Gọi file cấu hình DB

const authRoutes = require('./routes/authRoutes'); // Gọi các route liên quan đến xác thực
const formRoutes = require('./routes/formRoutes'); // Gọi các route liên quan đến form
const submissionRoutes = require('./routes/submissionRoutes'); // Gọi các route liên quan đến nộp bài

connectDB(); // Thực hiện kết nối ngay lập tức tới DB

const port = process.env.PORT || 3000; // nếu không có PORT trong .env thì dùng 3000

// --- 2. MIDDLEWARE CƠ BẢN ---
// bóc tách dữ liệu từ request gửi lên
app.use(express.urlencoded({ extended: true })); // xử lý dữ liệu form gửi lên
app.use(express.json()); // xử lý dữ liệu json gửi lên

// Thiết lập EJS làm view engine
app.set('view engine', 'ejs'); // sử dụng ejs làm view engine lấy từ package đã cài
app.set('views', './views'); // thư mục chứa file ejs

//Thiết lập cấu hình session (đặt trước Routes)
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_key', // khóa bí mật dùng để mã hóa session
  resave: false, // không lưu lại session nếu không có thay đổi
  saveUninitialized: true, // lưu session mới chưa có thay đổi hay session rỗng 
  cookie: {
    maxAge: 60 * 60 * 1000, // thời gian sống của cookie (ms)
    httpOnly: true // chỉ cho phép truy cập cookie qua HTTP, không cho truy cập bằng JavaScript
    // secure: false ------- // mặc định là false để chạy được localhost 
  }
}));

// --- 3. ROUTES ---
app.get('/', (req, res) => { // get phải giống hệt là '/'
  res.render('home'); // Tìm file views/home.ejs
});

app.use('/', authRoutes); // Sử dụng các route liên quan đến xác thực (đăng nhập, đăng ký, đăng xuất)
app.use('/api/forms', formRoutes); // Sử dụng các route liên quan đến form
app.use('/api/submissions', submissionRoutes); // Sử dụng các route liên quan đến nộp bài

// --- 4. KHỞI ĐỘNG SERVER ---
app.listen(port, () => {
  console.log(`Server đang chạy tại: http://localhost:${port}`);
  console.log('Nhấn Ctrl+C để tắt server');
});