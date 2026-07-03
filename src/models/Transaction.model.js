const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
   transactionNo: { type: String, required: true, unique: true },

   transactionType: {
      type: String,
      enum: ['ORDER_PAYMENT', 'SELLER_PAYMENT', 'REFUND', 'PAYOUT', 'ADJUSTMENT'],
      required: true
   },

   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile' },
   orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
   paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },

   amount: { type: Number, required: true },

   direction: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      required: true
   },

   status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
      default: 'PENDING'
   },

   paymentMode: {
      type: String,
      enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'WALLET', 'OTHER'],
      default: 'OTHER'
   },

   note: String,
   transactionDate: { type: Date, default: Date.now },

   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);