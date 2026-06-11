const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image'],
    required: true
  },
  reportType: {
    type: String,
    enum: ['laboratory', 'radiology', 'pathology', 'general', 'unknown'],
    default: 'general'
  },
  originalText: {
    type: String,
    required: true
  },
  simplifiedText: {
    type: String,
    required: true
  },
  keyFindings: [{
    type: String
  }],
  recommendations: [{
    type: String
  }],
  processingTime: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
reportSchema.index({ userId: 1, uploadDate: -1 });

module.exports = mongoose.model('Report', reportSchema);
