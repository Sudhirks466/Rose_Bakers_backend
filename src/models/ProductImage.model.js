const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema({
   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
   imageUrl: { type: String, required: true },
   altText: { type: String },
   sortOrder: { type: Number, default: 0 },
   isPrimary: { type: Boolean, default: false },
   isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ProductImage', productImageSchema);