const express = require('express');
const router = express.Router();

const formController = require('../controllers/formController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// GET /api/submissions
router.get('/', isAuthenticated, formController.getSubmissions);

// PUT /api/submissions/:id/status
router.put('/:id/status', isAuthenticated, isAdmin, formController.updateSubmissionStatus);

module.exports = router;
