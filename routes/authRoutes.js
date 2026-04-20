// routes/authRoutes.js
// đây là file định nghĩa các route liên quan đến xác thực
const exspress = require('express');
const router = exspress.Router(); // tạo router riêng cho các route liên quan đến xác thực

// gọi controller để xử lí các yêu cầu
const authController = require('../controllers/authController');
// gọi middleware để kiểm tra xác thực
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// -- Định nghĩa các route liên quan cần đi
// A. hiển thị trang đăng kí (GET)
// truy cập: localhost/3000/register
router.get('/register', authController.getRegisterPage);

// B. xử lí đăng kí (POST)
// khi người dùng đăng kí và submit form
router.post('/register',authController.register);

// C. hiển thị trang đăng nhập (GET)
// truy cập: localhost/3000/login hoặc sau khi đăng kí thành công
router.get('/login', authController.getLoginPage);

// D. xử lí đăng nhập (POST)
// khi người dùng đăng nhập và submit form
router.post('/login', authController.login);

// hiển thị trang dashboard (GET)
router.get('/dashboard', isAuthenticated ,authController.getDashboard);

// E. xử lí đăng xuất (GET)
router.get('/logout', authController.logout);

// F. hiển thị trang admin 
router.get('/admin', isAuthenticated, isAdmin,authController.getAdminPage);

// G. Xác thực 2FA (GET & POST)
router.get('/2fa/verify', authController.getVerify2FAPage);
router.post('/2fa/verify', authController.verify2FA);

// xuất khẩu router để dùng ở file khác
module.exports = router;
