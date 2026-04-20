// routes/twoFactorRoutes.js
const express = require('express');
const router = express.Router();

const twoFactorController = require('../controllers/twoFactorController');
const {verifyToken} = require('../middleware/apiAuth');

// Post /api/2fa/setup - Tạo 2FA (yêu cầu token)
router.post('/setup', verifyToken, twoFactorController.setup2FA);

// Post /api/2fa/verify - Xác thực mã 2FA (yêu cầu token)
router.post('/verify', verifyToken, twoFactorController.verify2FA);

module.exports = router;