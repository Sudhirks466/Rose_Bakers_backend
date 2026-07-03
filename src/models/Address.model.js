const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

   fullName: { type: String, required: true },
   mobile: { type: String, required: true },

   houseNo: { type: String, required: true },
   street: { type: String, required: true },
   landmark: { type: String },

   city: { type: String, required: true },
   state: { type: String, default: 'Uttar Pradesh' },
   pincode: { type: String, required: true },

   addressType: {
      type: String,
      enum: ['HOME', 'OFFICE', 'OTHER'],
      default: 'HOME'
   },

   isDefault: { type: Boolean, default: false },
   isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);