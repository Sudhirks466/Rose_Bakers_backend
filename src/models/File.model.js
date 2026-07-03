const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
   originalName: { type: String, required: true },
   fileName: { type: String, required: true },
   fileUrl: { type: String, required: true },
   mimeType: String,
   size: Number,

   module: {
      type: String,
      enum: ['PRODUCT', 'CATEGORY', 'SELLER', 'BANNER', 'REVIEW', 'USER', 'ORDER', 'OTHER'],
      default: 'OTHER'
   },

   referenceId: mongoose.Schema.Types.ObjectId,

   uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   isActive: { type: Boolean, default: true },
   isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);