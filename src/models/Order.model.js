const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
   orderNo: { type: String, required: true, unique: true },

   orderType: {
      type: String,
      enum: ['CUSTOMER_ORDER', 'SELLER_PURCHASE'],
      required: true
   },

   customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile' },

   deliveryAddress: {
      fullName: String,
      mobile: String,
      houseNo: String,
      street: String,
      landmark: String,
      city: String,
      state: String,
      pincode: String
   },

   deliveryDate: Date,
   deliverySlot: String,

   specialInstructions: String,

   subtotal: { type: Number, required: true },
   deliveryCharge: { type: Number, default: 0 },
   gstAmount: { type: Number, default: 0 },
   discountAmount: { type: Number, default: 0 },
   grandTotal: { type: Number, required: true },

   platformFee: { type: Number, default: 0 },
   sellerPayout: { type: Number, default: 0 },

   paymentMethod: {
      type: String,
      enum: ['COD', 'UPI', 'CARD', 'RAZORPAY'],
      default: 'COD'
   },

   paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING'
   },

   orderStatus: {
      type: String,
      enum: ['PENDING', 'PLACED', 'ACCEPTED', 'PREPARING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      default: 'PLACED',
      index: true
   },

   couponCode: String,

   placedAt: { type: Date, default: Date.now },
   deliveredAt: Date,
   cancelledAt: Date,
   cancellationReason: String,

   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);