const BaseRepository = require('./base.repository');
const PromoCodeUsage = require('../models/PromoCodeUsage.model');

class PromoCodeUsageRepository extends BaseRepository {
   constructor() {
      super(PromoCodeUsage);
      this.usage = PromoCodeUsage;
   }

   async findAdminUsages(promoCodeId, query = {}) {
      const { page = 1, limit = 10, userId, sellerId } = query;

      const filter = { promoCodeId };

      if (userId) filter.userId = userId;
      if (sellerId) filter.sellerId = sellerId;

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const [data, total] = await Promise.all([
         this.usage
            .find(filter)
            .populate('promoCodeId', 'code promoType title')
            .populate('userId', 'name email phone')
            .populate('sellerId', 'shopName ownerName phone')
            .populate('orderId', 'orderNo grandTotal orderStatus')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .lean()
            .exec(),

         this.usage.countDocuments(filter)
      ]);

      return {
         data,
         pagination: {
            page: pageNo,
            limit: pageLimit,
            total,
            totalPages: Math.ceil(total / pageLimit)
         }
      };
   }

   countUserUsage(promoCodeId, userId) {
      return this.usage.countDocuments({
         promoCodeId,
         userId
      });
   }

   countTotalUsage(promoCodeId) {
      return this.usage.countDocuments({
         promoCodeId
      });
   }
}

module.exports = PromoCodeUsageRepository;