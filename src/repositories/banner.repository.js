const BaseRepository = require('./base.repository');
const Banner = require('../models/Banner.model');

class BannerRepository extends BaseRepository {
   constructor() {
      super(Banner);
      this.banner = Banner;
   }

   findActiveByPosition(position) {
      const now = new Date();

      const filter = {
         isActive: true,
         isDeleted: false,
         $and: [
            {
               $or: [
                  { startDate: { $exists: false } },
                  { startDate: null },
                  { startDate: { $lte: now } }
               ]
            },
            {
               $or: [
                  { endDate: { $exists: false } },
                  { endDate: null },
                  { endDate: { $gte: now } }
               ]
            }
         ]
      };

      if (position) {
         filter.bannerPosition = position;
      }

      return this.banner
         .find(filter)
         .sort({ sortOrder: 1, createdAt: -1 })
         .lean()
         .exec();
   }

   async findAdminBanners(query = {}) {
      const {
         page = 1,
         limit = 10,
         bannerPosition,
         isActive,
         search
      } = query;

      const filter = {
         isDeleted: false
      };

      if (bannerPosition) {
         filter.bannerPosition = bannerPosition;
      }

      if (isActive !== undefined) {
         filter.isActive = isActive === 'true' || isActive === true;
      }

      if (search) {
         filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { subtitle: { $regex: search, $options: 'i' } }
         ];
      }

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const [data, total] = await Promise.all([
         this.banner
            .find(filter)
            .populate('productId', 'name mainImage')
            .populate('categoryId', 'name slug image')
            .populate('createdBy', 'name email phone')
            .sort({ sortOrder: 1, createdAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .lean()
            .exec(),

         this.banner.countDocuments(filter)
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
      return this.banner
         .findOne({
            _id: id,
            isDeleted: false
         })
         .populate('productId', 'name mainImage')
         .populate('categoryId', 'name slug image')
         .populate('createdBy', 'name email phone')
         .lean()
         .exec();
   }
}

module.exports = BannerRepository;