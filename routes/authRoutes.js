const express = require('express'); 
const router = express.Router(); 

const authController = require('../controllers/authController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// A. Hiển thị trang đăng kí (GET)
router.get('/register', authController.getRegisterPage);

// B. Xử lí đăng kí (POST)
router.post('/register', authController.register);

// C. Hiển thị trang đăng nhập (GET)
router.get('/login', authController.getLoginPage);

// D. Xử lí đăng nhập (POST)
router.post('/login', authController.login);

// E. Hiển thị trang dashboard (GET)
router.get('/dashboard', isAuthenticated, authController.getDashboard);

// F. Xử lí đăng xuất (GET)
router.get('/logout', authController.logout);

// G. Hiển thị trang admin 
router.get('/admin', isAuthenticated, isAdmin, authController.getAdminPage);

module.exports = router;