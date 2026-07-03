const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 32 },
  lastName: { type: String, default: '', trim: true, maxlength: 32 },
  name: { type: String, trim: true, maxlength: 80 },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
    unique: true,
    validate: {
      validator: (v) => !v || validator.isEmail(v),
      message: 'Invalid email format.'
    }
  },

  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 10,
    maxlength: 14
  },

  passwordHash: { type: String, required: true },

  roles: {
    type: [String],
    enum: ['CUSTOMER', 'SELLER', 'SUPER_ADMIN'],
    default: ['CUSTOMER'],
    index: true
  },

  status: {
    type: String,
    enum: ['ACTIVE', 'BLOCKED'],
    default: 'ACTIVE',
    index: true
  },

  profilePic: { type: String, default: 'uploads/img/user.png' },
  permissions: { type: [String], default: [] },

  lastLoginAt: Date,
  lastChangePassword: Date,
  passwordResetRequestedAt: Date,

  passwordResetTokenHash: { type: String },
  passwordResetExpiresAt: { type: Date },

  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', function (next) {
  if (!this.name) {
    this.name = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);