const mongoose = require('mongoose');

const sellerAccountSchema = new mongoose.Schema({
   sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerProfile',
      required: true,
      unique: true
   },

   totalPurchaseAmount: { type: Number, default: 0 },
   totalPaidAmount: { type: Number, default: 0 },
   outstandingAmount: { type: Number, default: 0 },
   creditLimit: { type: Number, default: 0 },

   accountStatus: {
      type: String,
      enum: ['ACTIVE', 'ON_HOLD', 'BLOCKED'],
      default: 'ACTIVE'
   },

   lastPaymentDate: Date,
   lastPurchaseDate: Date
}, { timestamps: true });

module.exports = mongoose.model('SellerAccount', sellerAccountSchema);