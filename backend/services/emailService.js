const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send OTP email (register / login / reset)
exports.sendOTPEmail = async (userEmail, userName, otp, purpose) => {
  try {
    const transporter = createTransporter();

    const subjects = {
      register: '✅ Verify Your Account - Medical AI',
      login: '🔐 Your Login OTP - Medical AI',
      reset: '🔑 Password Reset OTP - Medical AI'
    };

    const headings = {
      register: 'Account Verification',
      login: 'Login Verification',
      reset: 'Password Reset'
    };

    const bodyTexts = {
      register: 'Use the OTP below to verify your account.',
      login: 'Use the OTP below to complete your login.',
      reset: 'Use the OTP below to reset your password.'
    };

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: subjects[purpose] || subjects.register,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; font-size: 28px;">🏥 Medical AI</h1>
            <p style="color: #6B7280; font-size: 16px;">${headings[purpose]}</p>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1F2937; margin-bottom: 10px;">Hello, ${userName}! 👋</h2>
            <p style="color: #4B5563; line-height: 1.6;">${bodyTexts[purpose]}</p>

            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #6366F1); padding: 20px 40px; border-radius: 12px;">
                <p style="color: white; font-size: 13px; margin: 0 0 8px 0; letter-spacing: 2px; text-transform: uppercase;">Your OTP</p>
                <p style="color: white; font-size: 42px; font-weight: bold; margin: 0; letter-spacing: 10px;">${otp}</p>
              </div>
            </div>

            <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B;">
              <p style="color: #92400E; margin: 0; font-size: 14px;">
                ⏱️ This OTP expires in <strong>10 minutes</strong>.<br/>
                Never share this OTP with anyone.
              </p>
            </div>
          </div>

          <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 20px;">
            UCET, VBU, Hazaribag | AI Medical Report Analysis System
          </p>
        </div>
      `
    });

    console.log(`✅ OTP email (${purpose}) sent to ${userEmail}`);
  } catch (error) {
    console.error('❌ OTP Email Error:', error.message);
    throw new Error('Failed to send OTP email');
  }
};

// Send welcome email after registration
exports.sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: '🏥 Welcome to Medical AI Report Analyzer',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; font-size: 28px;">🏥 Medical AI</h1>
            <p style="color: #6B7280; font-size: 16px;">AI-Based Medical Report Analysis System</p>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1F2937; margin-bottom: 15px;">Welcome, ${userName}! 👋</h2>
            <p style="color: #4B5563; line-height: 1.6;">
              Your account has been successfully created. You can now upload your medical reports
              and get easy-to-understand explanations powered by AI.
            </p>

            <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
              <p style="color: #1D4ED8; margin: 0; font-weight: bold;">What you can do:</p>
              <ul style="color: #3B82F6; margin: 10px 0; padding-left: 20px;">
                <li>Upload PDF or image medical reports</li>
                <li>Get simplified explanations in plain language</li>
                <li>View key findings from your reports</li>
                <li>Get health recommendations</li>
                <li>Ask questions about your report</li>
              </ul>
            </div>

            <a href="${process.env.FRONTEND_URL}/dashboard"
               style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">
              Go to Dashboard →
            </a>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #FEF3C7; border-radius: 8px;">
            <p style="color: #92400E; font-size: 12px; margin: 0;">
              ⚠️ <strong>Disclaimer:</strong> This is an educational tool only.
              Always consult a qualified healthcare professional for medical advice.
            </p>
          </div>

          <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 20px;">
            UCET, VBU, Hazaribag | AI Medical Report Analysis System
          </p>
        </div>
      `
    });

    console.log(`✅ Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error('❌ Welcome Email Error:', error.message);
  }
};
