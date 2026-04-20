// routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController'); 
// Import Middleware bảo vệ
const { verifyToken } = require('../middleware/apiAuth');

// định nghĩa phương thức POST cho login
router.post('/login', apiController.login);

// Route 2: Xem Profile (Cần bảo vệ)
// Luồng đi: verifyToken (Soi vé) -> Nếu OK -> apiController.getProfile (Mời vào)
router.get('/profile', verifyToken, apiController.getProfile);

module.exports = router;
