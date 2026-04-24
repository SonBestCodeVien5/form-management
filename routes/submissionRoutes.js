const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Tất cả các thao tác nộp/xem bài đều yêu cầu đăng nhập
router.use(isAuthenticated);

// Route nộp bài: /api/submissions/:templateId
router.post('/:templateId', submissionController.submitForm);

// Route xem danh sách bài đã nộp: /api/submissions
router.get('/', submissionController.getSubmissions);

module.exports = router;