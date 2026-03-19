const express = require('express');
const router = express.Router();
const {
    getContentByPage,
    updateContent,
    getAllContent,
} = require('../controllers/contentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getAllContent) // Admin only to list all
    .post(protect, admin, updateContent);

router.route('/:page')
    .get(getContentByPage);

module.exports = router;
