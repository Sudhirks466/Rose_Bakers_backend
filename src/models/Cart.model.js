const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
   productPriceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductPrice', required: true },

   quantity: { type: Number, required: true, min: 1 },

   cakeMessage: { type: String, default: '' },

   priceType: {
      type: String,
      enum: ['CUSTOMER', 'SELLER'],
      default: 'CUSTOMER'
   },

   unitPrice: { type: Number, required: true },
   totalPrice: { type: Number, required: true }
}, { _id: true });

const cartSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

   items: [cartItemSchema],

   subtotal: { type: Number, default: 0 },
   deliveryCharge: { type: Number, default: 0 },
   gstAmount: { type: Number, default: 0 },
   grandTotal: { type: Number, default: 0 },

   couponCode: { type: String },
   discountAmount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);