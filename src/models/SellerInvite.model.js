const mongoose = require('mongoose');

const sellerInviteSchema = new mongoose.Schema({
   inviteCode: { type: String, required: true, unique: true },
   token: { type: String, required: true, unique: true },

   phone: { type: String, trim: true },
   email: { type: String, trim: true, lowercase: true },

   status: {
      type: String,
      enum: ['PENDING', 'USED', 'EXPIRED', 'CANCELLED'],
      default: 'PENDING'
   },

   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

   expiresAt: { type: Date, required: true },
   usedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('SellerInvite', sellerInviteSchema);