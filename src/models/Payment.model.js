const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
   orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },

   paymentMethod: {
      type: String,
      enum: ['COD', 'UPI', 'CARD', 'RAZORPAY'],
      required: true
   },

   paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING'
   },

   amount: { type: Number, required: true },
   transactionId: String,
   gatewayOrderId: String,
   gatewayPaymentId: String,
   gatewaySignature: String,

   paidAt: Date,
   failedReason: String,
   refundAmount: { type: Number, default: 0 },
   refundedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);