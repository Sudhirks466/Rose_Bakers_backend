const BaseRepository = require('./base.repository');
const SellerAccount = require('../models/SellerAccount.model');

class SellerAccountRepository extends BaseRepository {
   constructor() {
      super(SellerAccount);
      this.account = SellerAccount;
   }

   findBySellerId(sellerId) {
      return this.account
         .findOne({ sellerId })
         .populate('sellerId')
         .exec();
   }

   async findAdminSellerAccounts(query = {}) {
      const {
         page = 1,
         limit = 10,
         accountStatus
      } = query;

      const filter = {};

      if (accountStatus) filter.accountStatus = accountStatus;

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const [data, total] = await Promise.all([
         this.account
            .find(filter)
            .populate({
               path: 'sellerId',
               populate: {
                  path: 'userId',
                  select: 'name email phone roles status'
               }
            })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .lean()
            .exec(),

         this.account.countDocuments(filter)
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
}

module.exports = SellerAccountRepository;