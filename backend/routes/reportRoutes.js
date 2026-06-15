const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const {
  uploadReport,
  getReports,
  getReportById,
  deleteReport,
  askQuestion
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|tiff|bmp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Only PDF and image files are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

router.post('/upload', protect, upload.single('report'), uploadReport);
router.get('/', protect, getReports);
router.get('/:id', protect, getReportById);
router.delete('/:id', protect, deleteReport);
router.post('/:id/ask', protect, askQuestion);

module.exports = router;
