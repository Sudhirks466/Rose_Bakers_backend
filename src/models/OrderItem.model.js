const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
   orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
   productPriceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductPrice', required: true },

   productName: { type: String, required: true },
   productImage: String,
   weightLabel: String,

   quantity: { type: Number, required: true },
   unitPrice: { type: Number, required: true },
   totalPrice: { type: Number, required: true },

   cakeMessage: String,

   sellerPurchasePrice: { type: Number, default: 0 },
   customerSellingPrice: { type: Number, default: 0 },
   sellerMargin: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('OrderItem', orderItemSchema);