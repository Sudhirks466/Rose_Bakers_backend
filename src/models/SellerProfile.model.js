const mongoose = require('mongoose');

const sellerProfileSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

   sellerCode: { type: String, unique: true, sparse: true },
   shopName: { type: String, required: true, trim: true },
   ownerName: { type: String, required: true, trim: true },

   phone: { type: String, required: true, trim: true },
   email: { type: String, trim: true, lowercase: true },

   address: { type: String, required: true },
   city: { type: String, required: true, trim: true },
   state: { type: String, default: 'Uttar Pradesh' },
   pincode: { type: String, required: true },

   gstNumber: { type: String, trim: true },
   panNumber: { type: String, trim: true },
   fssaiNumber: { type: String, trim: true },

   documents: {
      gst: { type: String },
      pan: { type: String },
      fssai: { type: String },
      shopPhoto: { type: String }
   },

   bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String
   },

   status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
      index: true
   },

   commissionPercent: { type: Number, default: 0 },
   approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   approvedAt: Date,
   rejectedReason: String,

   isActive: { type: Boolean, default: true },
   isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('SellerProfile', sellerProfileSchema);