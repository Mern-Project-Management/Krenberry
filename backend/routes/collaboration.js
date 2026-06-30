// routes/collaborationRoutes.js
const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry
} = require('../controller/collaboration');

// Middleware to protect admin routes (implement based on your auth system)
// const { protect, authorize } = require('../middleware/auth');

// Public route - Submit collaboration inquiry
router.post('/', createInquiry);

// Admin routes - Require authentication and admin role
// Uncomment and adjust based on your authentication middleware
// router.use(protect);
// router.use(authorize('admin'));

router.get('/', getAllInquiries);
router.get('/:id', getInquiryById);
router.patch('/:id', updateInquiryStatus);
router.delete('/:id', deleteInquiry);

module.exports = router;