const express = require('express');
const router = express.Router();
const { authUser, registerAdmin, registerUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', authUser);
router.route('/').post(registerUser); // Student registration
router.post('/register-admin', registerAdmin); // Separating admin reg if needed

module.exports = router;
