const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getMyApplications,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, submitApplication)
  .get(protect, admin, getApplications);

router.route('/mine').get(protect, getMyApplications);

router.route('/:id')
  .get(protect, admin, getApplicationById)
  .put(protect, admin, updateApplicationStatus);

module.exports = router;
