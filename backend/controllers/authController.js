const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOTPEmail
} = require('../services/emailService');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP before storing
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// @desc    Register - Step 1: Save user & send OTP
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if verified user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const otp = generateOTP();

    if (existingUser && !existingUser.isVerified) {
      // Update existing unverified user with new OTP
      existingUser.name = name;
      existingUser.password = password;
      existingUser.otp = hashOTP(otp);
      existingUser.otpExpire = Date.now() + 10 * 60 * 1000;
      existingUser.otpPurpose = 'register';
      await existingUser.save();
    } else {
      // Create new user
      await User.create({
        name,
        email,
        password,
        isVerified: false,
        otp: hashOTP(otp),
        otpExpire: Date.now() + 10 * 60 * 1000,
        otpPurpose: 'register'
      });
    }

    await sendOTPEmail(email, name, otp, 'register');

    res.status(200).json({
      success: true,
      message: `OTP sent to ${email}. Please verify to complete registration.`,
      data: { email }
    });
  } catch (error) {
    console.error('❌ Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Register - Step 2: Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpire +otpPurpose');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check OTP expiry
    if (!user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify OTP
    if (user.otp !== hashOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    const purpose = user.otpPurpose;

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpire = undefined;
    user.otpPurpose = undefined;

    if (purpose === 'register') {
      user.isVerified = true;
      await user.save({ validateBeforeSave: false });

      // Send welcome email
      sendWelcomeEmail(user.email, user.name);

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'Account verified successfully! Welcome aboard.',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    }

    if (purpose === 'login') {
      await user.save({ validateBeforeSave: false });

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    }
  } catch (error) {
    console.error('❌ Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
};

// @desc    Login - Direct login with email & password
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Account not verified. Please complete registration first.'
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select('+otpPurpose');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    const purpose = user.otpPurpose || 'register';
    const otp = generateOTP();

    user.otp = hashOTP(otp);
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    user.otpPurpose = purpose;
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail(email, user.name, otp, purpose);

    res.status(200).json({
      success: true,
      message: `New OTP sent to ${email}`
    });
  } catch (error) {
    console.error('❌ Resend OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Get User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
};

// @desc    Forgot password - send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    const otp = generateOTP();
    user.otp = hashOTP(otp);
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    user.otpPurpose = 'reset';
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail(email, user.name, otp, 'reset');

    res.status(200).json({
      success: true,
      message: `OTP sent to ${email}`,
      data: { email }
    });
  } catch (error) {
    console.error('❌ Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP and new password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpire +otpPurpose');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if (user.otp !== hashOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    if (user.otpPurpose !== 'reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP purpose'
      });
    }

    user.password = password;
    user.otp = undefined;
    user.otpExpire = undefined;
    user.otpPurpose = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You are now logged in.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('❌ Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
};
