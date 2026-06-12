const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  // Encrypted email stored here
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: false
  },
  // SHA-256 hash of email for fast unique lookups
  emailHash: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: { type: String, select: false },
  otpExpire: { type: Date, select: false },
  otpPurpose: {
    type: String,
    enum: ['register', 'login', 'reset', null],
    default: null,
    select: false
  },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Helper to hash email for lookup
const hashEmail = (email) => {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
};

// Helper to encrypt a value using AES-256
const encryptValue = (value) => {
  const key = Buffer.from(process.env.ENCRYPTION_KEY.padEnd(32).slice(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Helper to decrypt a value
const decryptValue = (encryptedValue) => {
  try {
    const [ivHex, encHex] = encryptedValue.split(':');
    const key = Buffer.from(process.env.ENCRYPTION_KEY.padEnd(32).slice(0, 32));
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return encryptedValue; // return as-is if not encrypted
  }
};

// Before saving: encrypt name & email, generate emailHash
userSchema.pre('save', async function (next) {
  // Encrypt name if modified
  if (this.isModified('name') && this.name && !this.name.includes(':')) {
    this.name = encryptValue(this.name);
  }

  // Encrypt email and generate hash if modified
  if (this.isModified('email') && this.email && !this.email.includes(':')) {
    this.emailHash = hashEmail(this.email);
    this.email = encryptValue(this.email);
  }

  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// Decrypt name and email after fetching
userSchema.post(['find', 'findOne', 'findOneAndUpdate', 'save'], function (docs) {
  if (!docs) return;
  const decryptDoc = (doc) => {
    if (doc.name && doc.name.includes(':')) {
      doc.name = decryptValue(doc.name);
    }
    if (doc.email && doc.email.includes(':')) {
      doc.email = decryptValue(doc.email);
    }
  };
  if (Array.isArray(docs)) {
    docs.forEach(decryptDoc);
  } else {
    decryptDoc(docs);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Static method to find by email (uses hash)
userSchema.statics.findByEmail = function (email) {
  const hash = hashEmail(email);
  return this.findOne({ emailHash: hash });
};

module.exports = mongoose.model('User', userSchema);
