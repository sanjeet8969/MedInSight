const Report = require('../models/Report');
const ocrService = require('../services/ocrService');
const ollamaService = require('../services/ollamaService');
const { deidentifyText } = require('../services/deidentifyService');
const { cloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs').promises;

// @desc    Upload and analyze medical report
// @route   POST /api/reports/upload
// @access  Private
exports.uploadReport = async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const fileName = req.file.originalname;
    const fileUrl = req.file.path;
    const cloudinaryPublicId = req.file.filename;
    const fileExt = path.extname(fileName).toLowerCase();
    const fileType = fileExt === '.pdf' ? 'pdf' : 'image';

    console.log(`📄 Processing file: ${fileName}`);
    console.log(`☁️  Cloudinary URL: ${fileUrl}`);

    // Step 1: Extract text via OCR from Cloudinary URL
    console.log('🔍 Step 1: Extracting text...');
    const extractedText = await ocrService.extractText(fileUrl, fileType);

    // Validate medical content
    const validation = ocrService.validateMedicalText(extractedText);
    if (!validation.isValid) {
      await cloudinary.uploader.destroy(cloudinaryPublicId);
      return res.status(400).json({ success: false, message: validation.message });
    }

    // De-identify: remove personal info before sending to AI
    const cleanedText = deidentifyText(extractedText);
    console.log('🔒 Personal info stripped before AI processing');

    // Step 2: Check Ollama
    console.log('🤖 Step 2: Checking Ollama...');
    const isOllamaRunning = await ollamaService.checkHealth();
    if (!isOllamaRunning) {
      await cloudinary.uploader.destroy(cloudinaryPublicId);
      return res.status(503).json({ success: false, message: 'AI service is not running. Please start Ollama.' });
    }

    // Step 3: Simplify report
    console.log('💡 Step 3: Simplifying report...');
    const simplifiedText = await ollamaService.simplifyReport(cleanedText);

    // Step 4: Precautions
    console.log('🛡️  Step 4: Generating precautions...');
    const precautions = await ollamaService.generatePrecautions(cleanedText);

    // Step 5: Short term consequences
    console.log('⚡ Step 5: Short-term consequences...');
    const shortTermConsequences = await ollamaService.generateShortTermConsequences(cleanedText);

    // Step 6: Long term consequences
    console.log('📅 Step 6: Long-term consequences...');
    const longTermConsequences = await ollamaService.generateLongTermConsequences(cleanedText);

    // Step 7: Diet advice
    console.log('🥗 Step 7: Diet advice...');
    const dietAdvice = await ollamaService.generateDietAdvice(cleanedText);

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Step 8: Save to database
    console.log('💾 Step 8: Saving to database...');
    const report = await Report.create({
      userId: req.user._id,
      fileName,
      fileUrl,
      cloudinaryPublicId,
      fileType,
      reportType: 'general',
      originalText: extractedText,
      simplifiedText,
      precautions,
      shortTermConsequences,
      longTermConsequences,
      dietAdvice,
      processingTime: parseFloat(processingTime),
      status: 'completed'
    });

    console.log(`✅ Report processed in ${processingTime}s`);

    res.status(201).json({
      success: true,
      message: 'Report analyzed successfully',
      data: {
        reportId: report._id,
        fileName: report.fileName,
        fileUrl: report.fileUrl,
        uploadDate: report.uploadDate,
        simplifiedText: report.simplifiedText,
        precautions: report.precautions,
        shortTermConsequences: report.shortTermConsequences,
        longTermConsequences: report.longTermConsequences,
        dietAdvice: report.dietAdvice,
        processingTime: report.processingTime
      }
    });

  } catch (error) {
    console.error('❌ Report Upload Error:', error);
    if (req.file?.filename) {
      try { await cloudinary.uploader.destroy(req.file.filename); } catch (_) {}
    }
    res.status(500).json({ success: false, message: 'Failed to process report', error: error.message });
  }
};

// @desc    Get all reports for logged in user
// @route   GET /api/reports
// @access  Private
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .select('-originalText')
      .sort({ uploadDate: -1 });

    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch report' });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(report.cloudinaryPublicId);
    } catch (err) {
      console.error('Cloudinary delete error:', err);
    }

    await report.deleteOne();
    res.status(200).json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete report' });
  }
};

// @desc    Ask question about report
// @route   POST /api/reports/:id/ask
// @access  Private
exports.askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ success: false, message: 'Please provide a question' });

    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    const answer = await ollamaService.answerQuestion(report.originalText, question);
    res.status(200).json({ success: true, data: { question, answer } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to answer question' });
  }
};
