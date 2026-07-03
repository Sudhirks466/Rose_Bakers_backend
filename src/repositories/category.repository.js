const BaseRepository = require('./base.repository');
const Category = require('../models/Category.model');

class CategoryRepository extends BaseRepository {
   constructor() {
      super(Category);
      this.category = Category;
   }

   findActive() {
      return this.category
         .find({ isActive: true, isDeleted: false })
         .sort({ sortOrder: 1, name: 1 })
         .lean()
         .exec();
   }

   findActiveFeatured() {
      return this.category
         .find({
            isActive: true,
            isDeleted: false,
            isFeatured: true
         })
         .sort({ sortOrder: 1 })
         .limit(10)
         .lean()
         .exec();
   }

   findBySlug(slug) {
      return this.category
         .findOne({
            slug,
            isActive: true,
            isDeleted: false
         })
         .lean()
         .exec();
   }

   findAllAdmin() {
      return this.category
         .find({ isDeleted: false })
         .sort({ sortOrder: 1, createdAt: -1 })
         .lean()
         .exec();
   }

   findBySlugAdmin(slug) {
      return this.category
         .findOne({ slug, isDeleted: false })
         .exec();
   }
}

module.exports = CategoryRepository;