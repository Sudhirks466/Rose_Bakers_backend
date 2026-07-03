const BaseRepository = require('./base.repository');
const InventoryTransaction = require('../models/InventoryTransaction.model');

class InventoryTransactionRepository extends BaseRepository {
   constructor() {
      super(InventoryTransaction);
      this.transaction = InventoryTransaction;
   }

   findByInventoryId(inventoryId) {
      return this.transaction
         .find({ inventoryId })
         .populate('createdBy', 'name email')
         .sort({ createdAt: -1 })
         .lean()
         .exec();
   }

   async findAdminTransactions(query = {}) {
      const { page = 1, limit = 10, productId, type } = query;

      const filter = {};

      if (productId) filter.productId = productId;
      if (type) filter.type = type;

      const skip = (Number(page) - 1) * Number(limit);

      const [data, total] = await Promise.all([
         this.transaction
            .find(filter)
            .populate('productId')
            .populate('inventoryId')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean()
            .exec(),

         this.transaction.countDocuments(filter)
      ]);

      return {
         data,
         pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
         }
      };
   }
}

module.exports = InventoryTransactionRepository;