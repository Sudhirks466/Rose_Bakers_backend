const mongoose = require('mongoose');

const productCustomizationSchema = new mongoose.Schema({
   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

   customizationType: {
      type: String,
      enum: ['CAKE_MESSAGE', 'PHOTO_UPLOAD', 'FLAVOR', 'SHAPE', 'THEME', 'ADDON'],
      required: true
   },

   label: { type: String, required: true },
   options: [
      {
         name: String,
         extraPrice: { type: Number, default: 0 },
         image: String
      }
   ],

   isRequired: { type: Boolean, default: false },
   isActive: { type: Boolean, default: true },
   sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ProductCustomization', productCustomizationSchema);