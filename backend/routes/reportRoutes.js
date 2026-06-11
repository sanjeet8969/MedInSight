const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  uploadReport,
  getReports,
  getReportById,
  deleteReport,
  askQuestion
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept PDFs and images only
  const allowedTypes = /jpeg|jpg|png|pdf|tiff|bmp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF and image files (JPEG, PNG, TIFF, BMP) are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

// All routes are protected (require authentication)
router.post('/upload', protect, upload.single('report'), uploadReport);
router.get('/', protect, getReports);
router.get('/:id', protect, getReportById);
router.delete('/:id', protect, deleteReport);
router.post('/:id/ask', protect, askQuestion);

module.exports = router;
