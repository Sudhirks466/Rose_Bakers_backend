const BaseRepository = require('./base.repository');
const Product = require('../models/Product.model');

class ProductRepository extends BaseRepository {
   constructor() {
      super(Product);
      this.product = Product;
   }

   findActiveById(id) {
      return this.product.findOne({
         _id: id,
         isDeleted: false,
         isActive: true,
         status: 'ACTIVE'
      }).exec();
   }

   findPublicById(id) {
      return this.product
         .findOne({
            _id: id,
            isDeleted: false,
            isActive: true,
            status: 'ACTIVE'
         })
         .populate('categoryId')
         .lean()
         .exec();
   }

   async findPublicProducts(query = {}) {
      const {
         page = 1,
         limit = 12,
         search,
         categoryId,
         sortBy = 'createdAt',
         sortOrder = 'desc',
         isFeatured,
         isBestSeller,
         isCustomCake
      } = query;

      const filter = {
         isDeleted: false,
         isActive: true,
         status: 'ACTIVE'
      };

      if (search) {
         filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } },
            { shortDescription: { $regex: search, $options: 'i' } }
         ];
      }

      if (categoryId) filter.categoryId = categoryId;
      if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true' || isFeatured === true;
      if (isBestSeller !== undefined) filter.isBestSeller = isBestSeller === 'true' || isBestSeller === true;
      if (isCustomCake !== undefined) filter.isCustomCake = isCustomCake === 'true' || isCustomCake === true;

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const [data, total] = await Promise.all([
         this.product
            .find(filter)
            .populate('categoryId')
            .sort(sort)
            .skip(skip)
            .limit(pageLimit)
            .lean()
            .exec(),

         this.product.countDocuments(filter)
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

   findFeaturedProducts() {
      return this.product
         .find({
            isDeleted: false,
            isActive: true,
            status: 'ACTIVE',
            isFeatured: true
         })
         .populate('categoryId')
         .sort({ createdAt: -1 })
         .limit(8)
         .lean()
         .exec();
   }

   findBestSellerProducts() {
      return this.product
         .find({
            isDeleted: false,
            isActive: true,
            status: 'ACTIVE',
            isBestSeller: true
         })
         .populate('categoryId')
         .sort({ totalOrders: -1, createdAt: -1 })
         .limit(8)
         .lean()
         .exec();
   }

   findCustomCakeProducts() {
      return this.product
         .find({
            isDeleted: false,
            isActive: true,
            status: 'ACTIVE',
            isCustomCake: true
         })
         .populate('categoryId')
         .sort({ createdAt: -1 })
         .limit(8)
         .lean()
         .exec();
   }

   async findAdminProducts(query = {}) {
      const { page = 1, limit = 10, search, status, categoryId } = query;

      const filter = { isDeleted: false };

      if (status) filter.status = status;
      if (categoryId) filter.categoryId = categoryId;

      if (search) {
         filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { productCode: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } }
         ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [data, total] = await Promise.all([
         this.product
            .find(filter)
            .populate('categoryId')
            .populate('createdBy', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean()
            .exec(),

         this.product.countDocuments(filter)
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

   findAdminById(id) {
      return this.product
         .findOne({ _id: id, isDeleted: false })
         .populate('categoryId')
         .populate('createdBy', 'name email phone')
         .lean()
         .exec();
   }

   findBySlugAdmin(slug) {
      return this.product
         .findOne({ slug, isDeleted: false })
         .exec();
   }

     async findSellerProducts(query = {}) {
    const {
      page = 1,
      limit = 12,
      search,
      categoryId,
      isFeatured,
      isBestSeller,
      isCustomCake
    } = query;

    const filter = {
      isDeleted: false,
      isActive: true,
      status: 'ACTIVE'
    };

    if (categoryId) filter.categoryId = categoryId;

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    if (isBestSeller !== undefined) {
      filter.isBestSeller = isBestSeller === 'true' || isBestSeller === true;
    }

    if (isCustomCake !== undefined) {
      filter.isCustomCake = isCustomCake === 'true' || isCustomCake === true;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { productCode: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNo = Number(page);
    const pageLimit = Number(limit);
    const skip = (pageNo - 1) * pageLimit;

    const [data, total] = await Promise.all([
      this.product
        .find(filter)
        .populate('categoryId', 'name slug image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .lean()
        .exec(),

      this.product.countDocuments(filter)
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

  findSellerProductById(id) {
    return this.product
      .findOne({
        _id: id,
        isDeleted: false,
        isActive: true,
        status: 'ACTIVE'
      })
      .populate('categoryId', 'name slug image')
      .lean()
      .exec();
  }
}

module.exports = ProductRepository;