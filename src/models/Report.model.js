const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
   reportName: { type: String, required: true },

   reportType: {
      type: String,
      enum: ['SALES', 'SELLER', 'CUSTOMER', 'PRODUCT', 'REVENUE'],
      required: true
   },

   format: {
      type: String,
      enum: ['EXCEL', 'PDF', 'CSV'],
      required: true
   },

   status: {
      type: String,
      enum: ['PROCESSING', 'READY', 'FAILED'],
      default: 'PROCESSING'
   },

   fileUrl: String,

   filters: {
      fromDate: Date,
      toDate: Date,
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile' },
      categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
   },

   generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   generatedAt: { type: Date, default: Date.now },
   downloadedCount: { type: Number, default: 0 },

   errorMessage: String
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);