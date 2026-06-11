const Report = require('../models/Report');
const ocrService = require('../services/ocrService');
const ollamaService = require('../services/ollamaService');
const path = require('path');
const fs = require('fs').promises;

// @desc    Upload and analyze medical report
// @route   POST /api/reports/upload
// @access  Private
exports.uploadReport = async (req, res) => {
  const startTime = Date.now();

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileExt = path.extname(fileName).toLowerCase();
    
    // Determine file type
    const fileType = fileExt === '.pdf' ? 'pdf' : 'image';

    console.log(`📄 Processing file: ${fileName}`);

    // Step 1: Extract text using OCR
    console.log('🔍 Step 1: Extracting text...');
    const extractedText = await ocrService.extractText(filePath, fileType);

    // Validate if it's a medical report
    const validation = ocrService.validateMedicalText(extractedText);
    if (!validation.isValid) {
      // Delete uploaded file
      await fs.unlink(filePath);
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Step 2: Check Ollama health
    console.log('🤖 Step 2: Checking Ollama connection...');
    const isOllamaRunning = await ollamaService.checkHealth();
    if (!isOllamaRunning) {
      await fs.unlink(filePath);
      return res.status(503).json({
        success: false,
        message: 'AI service (Ollama) is not running. Please start Ollama and try again.'
      });
    }

    // Step 3: Simplify report using Ollama
    console.log('💡 Step 3: Simplifying medical text...');
    const simplifiedText = await ollamaService.simplifyReport(extractedText);

    // Step 4: Extract key findings
    console.log('🔑 Step 4: Extracting key findings...');
    const keyFindings = await ollamaService.extractKeyFindings(extractedText);

    // Step 5: Generate recommendations
    console.log('📋 Step 5: Generating recommendations...');
    const recommendations = await ollamaService.generateRecommendations(
      simplifiedText,
      keyFindings
    );

    // Calculate processing time
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Step 6: Save to database
    console.log('💾 Step 6: Saving to database...');
    const report = await Report.create({
      userId: req.user._id,
      fileName,
      filePath,
      fileType,
      reportType: 'general',
      originalText: extractedText,
      simplifiedText,
      keyFindings,
      recommendations,
      processingTime: parseFloat(processingTime),
      status: 'completed'
    });

    console.log(`✅ Report processed successfully in ${processingTime}s`);

    res.status(201).json({
      success: true,
      message: 'Report analyzed successfully',
      data: {
        reportId: report._id,
        fileName: report.fileName,
        uploadDate: report.uploadDate,
        simplifiedText: report.simplifiedText,
        keyFindings: report.keyFindings,
        recommendations: report.recommendations,
        processingTime: report.processingTime
      }
    });

  } catch (error) {
    console.error('❌ Report Upload Error:', error);
    
    // Clean up uploaded file if exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process report',
      error: error.message
    });
  }
};

// @desc    Get all reports for logged in user
// @route   GET /api/reports
// @access  Private
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .select('-originalText -filePath')
      .sort({ uploadDate: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('❌ Get Reports Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
};

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Private
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('❌ Get Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report'
    });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(report.filePath);
    } catch (err) {
      console.error('Failed to delete file:', err);
    }

    // Delete from database
    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report'
    });
  }
};

// @desc    Ask question about report
// @route   POST /api/reports/:id/ask
// @access  Private
exports.askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question'
      });
    }

    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Get answer from Ollama
    const answer = await ollamaService.answerQuestion(
      report.originalText,
      question
    );

    res.status(200).json({
      success: true,
      data: {
        question,
        answer
      }
    });
  } catch (error) {
    console.error('❌ Ask Question Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to answer question'
    });
  }
};
