const mongoose = require('mongoose');
const validator = require('validator');

const contactQuerySchema = new mongoose.Schema({
   name: { type: String, required: true, trim: true },

   email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
         validator: (v) => !v || validator.isEmail(v),
         message: 'Invalid email format.'
      }
   },

   phone: { type: String, trim: true },
   subject: String,
   message: { type: String, required: true },

   status: {
      type: String,
      enum: ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'NEW'
   },

   assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   resolvedAt: Date,
   adminNote: String
}, { timestamps: true });

module.exports = mongoose.model('ContactQuery', contactQuerySchema);