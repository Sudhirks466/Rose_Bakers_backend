const mongoose = require('mongoose');

const promoCodeAssignmentSchema = new mongoose.Schema({
   promoCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PromoCode',
      required: true
   },

   assignedToUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },

   assignedToSellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerProfile'
   },

   encryptedCode: {
      type: String,
      required: true
   },

   status: {
      type: String,
      enum: ['ACTIVE', 'USED', 'EXPIRED', 'REMOVED'],
      default: 'ACTIVE'
   },

   assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },

   assignedAt: {
      type: Date,
      default: Date.now
   },

   expiresAt: Date,
   usedAt: Date
}, { timestamps: true });

promoCodeAssignmentSchema.index(
   { promoCodeId: 1, assignedToUserId: 1 },
   { unique: true }
);

module.exports = mongoose.model('PromoCodeAssignment', promoCodeAssignmentSchema);