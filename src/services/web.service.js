const BannerRepository = require('../repositories/banner.repository');
const CategoryRepository = require('../repositories/category.repository');
const ProductRepository = require('../repositories/product.repository');
const ProductImageRepository = require('../repositories/productImage.repository');
const ProductVariantRepository = require('../repositories/productVariant.repository');
const ProductVariantPriceRepository = require('../repositories/productVariantPrice.repository');
const ProductReviewRepository = require('../repositories/productReview.repository');
const ContactQueryRepository = require('../repositories/contactQuery.repository');

class WebService {
   constructor() {
      this.bannerRepo = new BannerRepository();
      this.categoryRepo = new CategoryRepository();
      this.productRepo = new ProductRepository();
      this.productImageRepo = new ProductImageRepository();
      this.variantRepo = new ProductVariantRepository();
      this.priceRepo = new ProductVariantPriceRepository();
      this.reviewRepo = new ProductReviewRepository();
      this.contactRepo = new ContactQueryRepository();
   }

   async home() {
      const banners = await this.bannerRepo.findActiveByPosition('HOME_HERO');
      const categories = await this.categoryRepo.findActiveFeatured();
      const featuredProducts = await this.productRepo.findFeaturedProducts();
      const bestSellers = await this.productRepo.findBestSellerProducts();
      const customCakes = await this.productRepo.findCustomCakeProducts();

      return {
         banners,
         categories,
         featuredProducts,
         bestSellers,
         customCakes
      };
   }

   async banners(query) {
      return this.bannerRepo.findActiveByPosition(query.position);
   }

   async categories() {
      return this.categoryRepo.findActive();
   }

   async categoryProducts(slug, query) {
      const category = await this.categoryRepo.findBySlug(slug);
      if (!category) throw new Error('Category not found');

      return this.productRepo.findPublicProducts({
         ...query,
         categoryId: category._id
      });
   }

   async products(query) {
      const result = await this.productRepo.findPublicProducts(query);

      return {
         products: result.data,
         pagination: result.pagination
      };
   }

   async productDetails(id) {
      const product = await this.productRepo.findPublicById(id);
      if (!product) throw new Error('Product not found');

      const images = await this.productImageRepo.findByProductId(id);
      const variants = await this.variantRepo.findByProductId(id);
      const prices = await this.priceRepo.findByProductId(id);
      const reviews = await this.reviewRepo.findApprovedByProductId(id, 5);

      return {
         product,
         images,
         variants,
         prices,
         reviews
      };
   }

   async productReviews(productId) {
      return this.reviewRepo.findApprovedByProductId(productId);
   }

   async contact(body) {
      const { name, email, phone, subject, message } = body;

      if (!name || !message) {
         throw new Error('Name and message are required');
      }

      return this.contactRepo.create({
         name,
         email,
         phone,
         subject,
         message,
         status: 'NEW'
      });
   }

   async newsletterSubscribe(body) {
      const { email, phone } = body;
      if (!email && !phone) throw new Error('Email or phone is required');

      return {
         email,
         phone,
         subscribed: true
      };
   }
}

module.exports = WebService;