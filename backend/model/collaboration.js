// models/CollaborationInquiry.js
const mongoose = require('mongoose');

const collaborationInquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    validate: {
      validator: function(v) {
        return /^[A-Za-z\s]{2,}$/.test(v);
      },
      message: 'Name must contain only letters and spaces'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[A-Za-z0-9\s\-&,.'()]+$/.test(v);
      },
      message: 'Company name contains invalid characters'
    }
  },
  foundUs: {
    type: String,
    required: [true, 'Please select how you found us'],
    enum: {
      values: [
        'Clutch',
        'Shopify expert list',
        'Google Search',
        'Google Map',
        'Social media post',
        'Social media app'
      ],
      message: '{VALUE} is not a valid option'
    }
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'completed', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
collaborationInquirySchema.index({ email: 1 });
collaborationInquirySchema.index({ status: 1 });
collaborationInquirySchema.index({ submittedAt: -1 });

module.exports = mongoose.model('CollaborationInquiry', collaborationInquirySchema);