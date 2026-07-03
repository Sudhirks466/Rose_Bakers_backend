const BaseRepository = require('./base.repository');
const ProductReview = require('../models/ProductReview.model');

class ProductReviewRepository extends BaseRepository {
   constructor() {
      super(ProductReview);
      this.review = ProductReview;
   }

   findByUserId(userId) {
      return this.review
         .find({ userId, isDeleted: false })
         .populate('productId')
         .sort({ createdAt: -1 })
         .lean()
         .exec();
   }

   findByUserAndId(userId, id) {
      return this.review.findOne({
         _id: id,
         userId,
         isDeleted: false
      }).exec();
   }

   findApprovedByProductId(productId, limit = 0) {
      let query = this.review
         .find({
            productId,
            status: 'APPROVED',
            isDeleted: false
         })
         .populate('userId', 'name firstName lastName profilePic')
         .sort({ createdAt: -1 });

      if (limit) {
         query = query.limit(Number(limit));
      }

      return query.lean().exec();
   }

   async findAdminReviews(query = {}) {
      const { page = 1, limit = 20, status, productId } = query;
      const filter = { isDeleted: false };

      if (status) filter.status = status;
      if (productId) filter.productId = productId;

      const skip = (Number(page) - 1) * Number(limit);

      const [data, total] = await Promise.all([
         this.review.find(filter)
            .populate('productId', 'name mainImage')
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean()
            .exec(),
         this.review.countDocuments(filter)
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

module.exports = ProductReviewRepository;