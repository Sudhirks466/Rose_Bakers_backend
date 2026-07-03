const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

   title: { type: String, required: true },
   message: { type: String, required: true },

   type: {
      type: String,
      enum: ['ORDER', 'PROMO', 'SELLER', 'PAYMENT', 'INVENTORY', 'SYSTEM'],
      default: 'SYSTEM'
   },

   targetRole: {
      type: String,
      enum: ['CUSTOMER', 'SELLER', 'SUPER_ADMIN', 'ALL'],
      default: 'ALL'
   },

   referenceId: mongoose.Schema.Types.ObjectId,
   referenceModule: String,

   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

   isRead: { type: Boolean, default: false },
   readAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);