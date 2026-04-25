const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const submissionController = require('../controllers/submissionController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// === API Nhóm 3.3: NHÂN VIÊN SW ĐIỀN FORM ===
// Các route này chỉ yêu cầu đã đăng nhập
router.get('/active', isAuthenticated, formController.getActiveForms);
router.post('/:id/submit', isAuthenticated, submissionController.submitForm);
router.get('/submissions', isAuthenticated, submissionController.getMySubmissions);

// === API Nhóm 3.1 & 3.2: QUẢN LÝ FORM/FIELD (Chỉ Admin) ===
const adminOnly = [isAuthenticated, isAdmin];

router.route('/')
  .get(...adminOnly, formController.getAllForms)    // Lấy danh sách
  .post(...adminOnly, formController.createForm);   // Tạo form mới

// Route: /api/forms/:id/fields/:fid
router.route('/:id/fields/:fid')
  .put(...adminOnly, formController.updateField)
  .delete(...adminOnly, formController.deleteField);

// Route: /api/forms/:id/fields
router.post('/:id/fields', ...adminOnly, formController.addField);

router.route('/:id')
  .get(...adminOnly, formController.getFormById)    // Lấy chi tiết
  .put(...adminOnly, formController.updateForm)     // Sửa form
  .delete(...adminOnly, formController.deleteForm); // Xóa form

module.exports = router;