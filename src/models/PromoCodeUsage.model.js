const mongoose = require('mongoose');

const promoCodeUsageSchema = new mongoose.Schema({
   promoCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PromoCode',
      required: true
   },

   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },

   sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerProfile'
   },

   orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
   },

   code: {
      type: String,
      required: true,
      uppercase: true
   },

   promoType: {
      type: String,
      enum: ['CUSTOMER', 'SELLER'],
      required: true
   },

   discountAmount: {
      type: Number,
      default: 0
   },

   sellerExtraMarginAmount: {
      type: Number,
      default: 0
   },

   orderAmountBeforeDiscount: {
      type: Number,
      required: true
   },

   orderAmountAfterDiscount: {
      type: Number,
      required: true
   }
}, { timestamps: true });

promoCodeUsageSchema.index({ promoCodeId: 1, userId: 1 });
promoCodeUsageSchema.index({ orderId: 1 }, { unique: true });

module.exports = mongoose.model('PromoCodeUsage', promoCodeUsageSchema);