const Tesseract = require('tesseract.js');
const pdf = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

class OCRService {
  // Extract text from PDF
  async extractFromPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const pdfData = await pdf(dataBuffer);
      
      let text = pdfData.text.trim();
      
      // If PDF is empty or very short, might be scanned - need OCR
      if (text.length < 50) {
        console.log('📄 PDF appears to be scanned, using OCR...');
        return await this.extractFromImage(filePath);
      }
      
      console.log(`✅ Extracted ${text.length} characters from PDF`);
      return text;
    } catch (error) {
      console.error('❌ PDF Extraction Error:', error.message);
      throw new Error('Failed to extract text from PDF');
    }
  }

  // Extract text from image using Tesseract OCR
  async extractFromImage(filePath) {
    try {
      console.log('🔍 Starting OCR on image...');
      
      const result = await Tesseract.recognize(filePath, 'eng', {
        logger: info => {
          if (info.status === 'recognizing text') {
           // console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
          }
        }
      });

      const text = result.data.text.trim();
      
      if (text.length < 20) {
        throw new Error('Could not extract meaningful text from image. Please ensure the image is clear and readable.');
      }

      console.log(`✅ Extracted ${text.length} characters from image`);
      return text;
    } catch (error) {
      console.error('❌ OCR Error:', error.message);
      throw new Error('Failed to extract text from image. Please upload a clearer scan.');
    }
  }

  // Main method to extract text based on file type
  async extractText(filePath, fileType) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      
      if (ext === '.pdf') {
        return await this.extractFromPDF(filePath);
      } else if (['.jpg', '.jpeg', '.png', '.tiff', '.bmp'].includes(ext)) {
        return await this.extractFromImage(filePath);
      } else {
        throw new Error(`Unsupported file type: ${ext}`);
      }
    } catch (error) {
      console.error('❌ Text Extraction Error:', error.message);
      throw error;
    }
  }

  // Validate if extracted text looks like a medical report
  validateMedicalText(text) {
    const medicalKeywords = [
      'patient', 'test', 'result', 'diagnosis', 'report', 'laboratory',
      'blood', 'urine', 'scan', 'x-ray', 'mri', 'ct', 'ultrasound',
      'doctor', 'physician', 'hospital', 'clinic', 'medical',
      'normal', 'abnormal', 'positive', 'negative', 'level', 'count'
    ];

    const lowerText = text.toLowerCase();
    const foundKeywords = medicalKeywords.filter(keyword => 
      lowerText.includes(keyword)
    );

    if (foundKeywords.length < 2) {
      return {
        isValid: false,
        message: 'The uploaded file does not appear to contain a medical report. Please upload a valid medical document.'
      };
    }

    return {
      isValid: true,
      confidence: foundKeywords.length / medicalKeywords.length
    };
  }
}

module.exports = new OCRService();
