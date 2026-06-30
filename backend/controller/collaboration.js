// controllers/collaborationController.js
const CollaborationInquiry = require('../model/collaboration');

// @desc    Submit a new collaboration inquiry
// @route   POST /api/collaboration
// @access  Public
exports.createInquiry = async (req, res) => {
  try {
    const { name, email, company, foundUs, message } = req.body;

    // Create new inquiry
    const inquiry = await CollaborationInquiry.create({
      name,
      email,
      company,
      foundUs,
      message: message || ''
    });

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully! We\'ll get back to you soon.',
      data: {
        id: inquiry._id,
        submittedAt: inquiry.submittedAt
      }
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle other errors
    console.error('Error creating collaboration inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit form. Please try again later.'
    });
  }
};

// @desc    Get all collaboration inquiries (Admin only)
// @route   GET /api/collaboration
// @access  Private/Admin
exports.getAllInquiries = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = status ? { status } : {};
    
    const inquiries = await CollaborationInquiry.find(query)
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await CollaborationInquiry.countDocuments(query);

    res.status(200).json({
      success: true,
      data: inquiries,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries'
    });
  }
};

// @desc    Get single inquiry by ID (Admin only)
// @route   GET /api/collaboration/:id
// @access  Private/Admin
exports.getInquiryById = async (req, res) => {
  try {
    const inquiry = await CollaborationInquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry'
    });
  }
};

// @desc    Update inquiry status (Admin only)
// @route   PATCH /api/collaboration/:id
// @access  Private/Admin
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'contacted', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const inquiry = await CollaborationInquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry'
    });
  }
};

// @desc    Delete inquiry (Admin only)
// @route   DELETE /api/collaboration/:id
// @access  Private/Admin
exports.deleteInquiry = async (req, res) => {
  try {
    const inquiry = await CollaborationInquiry.findByIdAndDelete(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry'
    });
  }
};