const mongoose = require('mongoose');

const orderStatusHistorySchema = new mongoose.Schema({
   orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },

   status: {
      type: String,
      enum: ['PENDING', 'PLACED', 'ACCEPTED', 'PREPARING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      required: true
   },

   note: String,

   changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   changedByRole: {
      type: String,
      enum: ['CUSTOMER', 'SELLER', 'SUPER_ADMIN', 'SYSTEM'],
      default: 'SYSTEM'
   }
}, { timestamps: true });

module.exports = mongoose.model('OrderStatusHistory', orderStatusHistorySchema);