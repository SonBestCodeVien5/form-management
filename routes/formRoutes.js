const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// === API Nhóm 3.3: SUBMISSION (Employee) ===
router.get('/active', isAuthenticated, formController.getActiveForms);
router.post('/:id/submit', isAuthenticated, formController.submitForm);

// === API Nhóm 3.1: QUẢN LÝ FORM (Chỉ Admin mới có quyền) ===
router.route('/')
  .get(isAuthenticated, isAdmin, formController.getAllForms)
  .post(isAuthenticated, isAdmin, formController.createForm);

router.route('/:id')
  .get(isAuthenticated, isAdmin, formController.getFormById)
  .put(isAuthenticated, isAdmin, formController.updateForm)
  .delete(isAuthenticated, isAdmin, formController.deleteForm);

// === API Nhóm 3.2: QUẢN LÝ FIELD (Chỉ Admin) ===
router.post('/:id/fields', isAuthenticated, isAdmin, formController.addField);

router.route('/:id/fields/:fid')
  .put(isAuthenticated, isAdmin, formController.updateField)
  .delete(isAuthenticated, isAdmin, formController.deleteField);

module.exports = router;