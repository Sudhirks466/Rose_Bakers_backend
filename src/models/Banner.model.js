const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
   title: { type: String, required: true },
   subtitle: String,
   image: { type: String, required: true },

   redirectType: {
      type: String,
      enum: ['NONE', 'PRODUCT', 'CATEGORY', 'URL'],
      default: 'NONE'
   },

   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
   categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
   redirectUrl: String,

   bannerPosition: {
      type: String,
      enum: [
         'HOME_HERO',
         'HOME_MIDDLE',
         'CATEGORY_TOP',
         'PRODUCT_TOP',
         'SELLER_DASHBOARD',
         'ADMIN_DASHBOARD'
      ],
      default: 'HOME_HERO'
   },

   sortOrder: { type: Number, default: 0 },
   startDate: Date,
   endDate: Date,

   isActive: { type: Boolean, default: true },
   isDeleted: { type: Boolean, default: false },

   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);