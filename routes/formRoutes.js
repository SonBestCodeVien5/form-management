const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// === API Nhóm 3.1: QUẢN LÝ FORM (Chỉ Admin mới có quyền) ===
// Áp dụng middleware bảo vệ cho tất cả các route ở dưới
router.use(isAuthenticated, isAdmin);

router.route('/')
  .get(formController.getAllForms)    // Lấy danh sách
  .post(formController.createForm);   // Tạo form mới

router.route('/:id')
  .get(formController.getFormById)    // Lấy chi tiết
  .put(formController.updateForm)     // Sửa form
  .delete(formController.deleteForm); // Xóa form

// (Lát nữa chúng ta sẽ viết tiếp nhóm 3.2 Field Management ở ngay dưới file này)
// ... các route 3.1 cũ ...

// === API Nhóm 3.2: QUẢN LÝ FIELD ===
// Route: /api/forms/:id/fields
router.post('/:id/fields', formController.addField);

// Route: /api/forms/:id/fields/:fid
router.route('/:id/fields/:fid')
  .put(formController.updateField)
  .delete(formController.deleteField);

module.exports = router;