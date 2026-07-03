const BaseRepository = require('./base.repository');
const PromoCode = require('../models/PromoCode.model');

class PromoCodeRepository extends BaseRepository {
   constructor() {
      super(PromoCode);
      this.promo = PromoCode;
   }

   findByCode(code) {
      return this.promo
         .findOne({
            code: String(code).toUpperCase(),
            isDeleted: false
         })
         .exec();
   }

   findByCodeExceptId(code, id) {
      return this.promo
         .findOne({
            _id: { $ne: id },
            code: String(code).toUpperCase(),
            isDeleted: false
         })
         .exec();
   }

   findActiveCustomerPromo(code) {
      const now = new Date();

      return this.promo.findOne({
         code: String(code).toUpperCase(),
         promoType: 'CUSTOMER',
         status: 'ACTIVE',
         isDeleted: false,
         startDate: { $lte: now },
         endDate: { $gte: now }
      }).exec();
   }

   findActiveSellerPromo(code) {
      const now = new Date();

      return this.promo.findOne({
         code: String(code).toUpperCase(),
         promoType: 'SELLER',
         status: 'ACTIVE',
         isDeleted: false,
         startDate: { $lte: now },
         endDate: { $gte: now }
      }).exec();
   }

   async findAdminPromoCodes(query = {}) {
      const {
         page = 1,
         limit = 10,
         search,
         promoType,
         status
      } = query;

      const filter = { isDeleted: false };

      if (promoType) filter.promoType = promoType;
      if (status) filter.status = status;

      if (search) {
         filter.$or = [
            { code: { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } }
         ];
      }

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const [data, total] = await Promise.all([
         this.promo
            .find(filter)
            .populate('createdBy', 'name email phone')
            .populate('applicableProducts', 'name mainImage')
            .populate('applicableCategories', 'name slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .lean()
            .exec(),

         this.promo.countDocuments(filter)
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

   findDetailsById(id) {
      return this.promo
         .findOne({
            _id: id,
            isDeleted: false
         })
         .populate('createdBy', 'name email phone')
         .populate('applicableProducts', 'name mainImage')
         .populate('applicableCategories', 'name slug')
         .lean()
         .exec();
   }
}

module.exports = PromoCodeRepository;