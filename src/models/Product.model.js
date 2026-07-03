const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
   productCode: { type: String, unique: true, sparse: true },
   name: { type: String, required: true, trim: true },
   slug: { type: String, required: true, unique: true, trim: true },

   categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

   description: { type: String },
   shortDescription: { type: String },

   mainImage: { type: String },
   tags: [{ type: String }],

   cakeType: {
      type: String,
      enum: ['EGG', 'EGGLESS', 'BOTH'],
      default: 'BOTH'
   },

   productType: {
      type: String,
      enum: ['REGULAR', 'CUSTOM', 'PHOTO', 'DESIGNER'],
      default: 'REGULAR'
   },

   preparationTime: { type: String, default: '20 min' },

   rating: { type: Number, default: 0 },
   totalReviews: { type: Number, default: 0 },
   totalOrders: { type: Number, default: 0 },

   status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'],
      default: 'ACTIVE',
      index: true
   },

   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

   isFeatured: { type: Boolean, default: false },
   isBestSeller: { type: Boolean, default: false },
   isCustomCake: { type: Boolean, default: false },

   isActive: { type: Boolean, default: true },
   isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);