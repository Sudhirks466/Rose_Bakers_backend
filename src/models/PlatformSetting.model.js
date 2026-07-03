const mongoose = require('mongoose');

const platformSettingSchema = new mongoose.Schema({
   platformName: { type: String, default: 'RoseBakers' },
   supportEmail: { type: String, default: 'support@rosebakers.in' },
   supportPhone: { type: String },
   defaultCity: { type: String, default: 'Deoria' },

   platformStatus: {
      type: String,
      enum: ['ACTIVE', 'MAINTENANCE', 'DISABLED'],
      default: 'ACTIVE'
   },

   commissionPercent: { type: Number, default: 15 },
   settlementCycle: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'MONTHLY'],
      default: 'WEEKLY'
   },
   minimumPayout: { type: Number, default: 1000 },

   baseDeliveryCharge: { type: Number, default: 40 },
   freeDeliveryAbove: { type: Number, default: 499 },
   midnightDeliveryCharge: { type: Number, default: 199 },
   deliveryRadiusKm: { type: Number, default: 10 },
   defaultDeliveryTime: { type: String, default: '20 Minutes' },

   paymentGateway: {
      type: String,
      enum: ['RAZORPAY', 'NONE'],
      default: 'RAZORPAY'
   },

   notifications: {
      newSellerRegistration: { type: Boolean, default: true },
      sellerApprovalRequest: { type: Boolean, default: true },
      orderIssueAlert: { type: Boolean, default: true },
      payoutAlert: { type: Boolean, default: true },
      reportReadyNotification: { type: Boolean, default: false }
   },

   updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('PlatformSetting', platformSettingSchema);