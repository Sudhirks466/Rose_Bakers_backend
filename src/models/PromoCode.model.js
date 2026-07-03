const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
   code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
   },

   promoType: {
      type: String,
      enum: ['CUSTOMER', 'SELLER'],
      required: true,
      index: true
   },

   title: { type: String, required: true },
   description: String,

   discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED_AMOUNT'],
      required: true
   },

   discountValue: {
      type: Number,
      required: true
   },

   maxDiscountAmount: {
      type: Number,
      default: 0
   },

   minOrderAmount: {
      type: Number,
      default: 0
   },

   applicableProducts: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Product'
      }
   ],

   applicableCategories: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Category'
      }
   ],

   sellerExtraMarginType: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'NONE'],
      default: 'NONE'
   },

   sellerExtraMarginValue: {
      type: Number,
      default: 0
   },

   usageLimit: {
      type: Number,
      default: 0
   },

   perUserLimit: {
      type: Number,
      default: 1
   },

   usedCount: {
      type: Number,
      default: 0
   },

   startDate: {
      type: Date,
      required: true
   },

   endDate: {
      type: Date,
      required: true
   },

   status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
      default: 'ACTIVE',
      index: true
   },

   isPublic: {
      type: Boolean,
      default: false
   },

   createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },

   isDeleted: {
      type: Boolean,
      default: false
   }
}, { timestamps: true });

promoCodeSchema.index({ promoType: 1, status: 1 });
promoCodeSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('PromoCode', promoCodeSchema);