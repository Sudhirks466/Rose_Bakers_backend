const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
   action: { type: String, required: true },

   module: {
      type: String,
      enum: [
         'AUTH',
         'USER',
         'SELLER',
         'PRODUCT',
         'CATEGORY',
         'INVENTORY',
         'ORDER',
         'PAYMENT',
         'REPORT',
         'SETTING'
      ],
      required: true
   },

   entityId: { type: mongoose.Schema.Types.ObjectId },
   entityName: String,

   performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   performedByRole: String,

   oldValue: mongoose.Schema.Types.Mixed,
   newValue: mongoose.Schema.Types.Mixed,

   ipAddress: String,
   userAgent: String,

   note: String
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);