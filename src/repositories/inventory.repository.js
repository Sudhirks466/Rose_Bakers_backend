const BaseRepository = require('./base.repository');
const Inventory = require('../models/Inventory.model');

class InventoryRepository extends BaseRepository {
   constructor() {
      super(Inventory);
      this.inventory = Inventory;
   }

   async findAdminInventory(query = {}) {
      const { page = 1, limit = 10, status, productId } = query;

      const filter = {};

      if (status) filter.status = status;
      if (productId) filter.productId = productId;

      const skip = (Number(page) - 1) * Number(limit);

      const [data, total] = await Promise.all([
         this.inventory
            .find(filter)
            .populate('productId')
            .populate('productPriceId')
            .populate('lastUpdatedBy', 'name email')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean()
            .exec(),

         this.inventory.countDocuments(filter)
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

   findByProductId(productId) {
      return this.inventory
         .find({ productId })
         .populate('productPriceId')
         .lean()
         .exec();
   }

   findDetailsById(id) {
      return this.inventory
         .findById(id)
         .populate('productId')
         .populate('productPriceId')
         .populate('lastUpdatedBy', 'name email')
         .lean()
         .exec();
   }
}

module.exports = InventoryRepository;