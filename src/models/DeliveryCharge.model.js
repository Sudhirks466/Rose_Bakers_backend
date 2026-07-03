const mongoose = require('mongoose');

const deliveryChargeSchema = new mongoose.Schema({
   city: { type: String, required: true, trim: true },
   pincode: { type: String, trim: true },

   minDistanceKm: { type: Number, default: 0 },
   maxDistanceKm: { type: Number, required: true },

   baseCharge: { type: Number, required: true },
   perKmCharge: { type: Number, default: 0 },

   freeDeliveryAbove: { type: Number, default: 0 },
   midnightCharge: { type: Number, default: 0 },

   isActive: { type: Boolean, default: true }
}, { timestamps: true });

deliveryChargeSchema.index({ city: 1, pincode: 1, maxDistanceKm: 1 });

module.exports = mongoose.model('DeliveryCharge', deliveryChargeSchema);