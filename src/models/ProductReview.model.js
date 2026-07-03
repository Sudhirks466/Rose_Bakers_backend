const mongoose = require('mongoose');

const productReviewSchema = new mongoose.Schema({
   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

   rating: { type: Number, required: true, min: 1, max: 5 },
   reviewTitle: String,
   reviewText: String,
   images: [{ type: String }],

   status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
   },

   approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   approvedAt: Date,

   isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

productReviewSchema.index({ productId: 1, userId: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model('ProductReview', productReviewSchema);