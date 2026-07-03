const BaseRepository = require('./base.repository');
const SellerProfile = require('../models/SellerProfile.model');

class SellerProfileRepository extends BaseRepository {
   constructor() {
      super(SellerProfile);
      this.seller = SellerProfile;
   }

   async findSellers(query = {}) {
      const { page = 1, limit = 10, search, status } = query;

      const filter = { isDeleted: false };

      if (status) filter.status = status;

      if (search) {
         filter.$or = [
            { shopName: { $regex: search, $options: 'i' } },
            { ownerName: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
         ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [data, total] = await Promise.all([
         this.seller
            .find(filter)
            .populate('userId', 'name email phone roles status')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean()
            .exec(),

         this.seller.countDocuments(filter)
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

   findDetailsById(id) {
      return this.seller
         .findById(id)
         .populate('userId', 'name email phone roles status profilePic')
         .populate('approvedBy', 'name email')
         .lean()
         .exec();
   }

   findByUserId(userId) {
      return this.seller
         .findOne({
            userId,
            isDeleted: false
         })
         .populate('userId', 'name email phone roles status profilePic')
         .lean()
         .exec();
   }
}

module.exports = SellerProfileRepository;