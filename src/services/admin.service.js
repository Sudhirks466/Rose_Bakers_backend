const crypto = require('crypto');
const UserRepository = require('./../repositories/user.repository');
const SellerProfileRepository = require('././../repositories/sellerProfile.repository');
const SellerInviteRepository = require('./../repositories/sellerInvite.repository');
const CategoryRepository = require('./../repositories/category.repository');
const OrderRepository = require('./../repositories/order.repository');
const ProductRepository = require('./../repositories/product.repository');

const ProductImageRepository = require('./../repositories/productImage.repository');
const ProductVariantRepository = require('./../repositories/productVariant.repository');
const ProductVariantPriceRepository = require('./../repositories/productVariantPrice.repository');
const InventoryRepository = require('./../repositories/inventory.repository');
const InventoryTransactionRepository = require('./../repositories/inventoryTransaction.repository');

const OrderItemRepository = require('./../repositories/orderItem.repository');
const OrderStatusHistoryRepository = require('./../repositories/orderStatusHistory.repository');

const PaymentRepository = require('./../repositories/payment.repository');
const TransactionRepository = require('./../repositories/transaction.repository');
const SellerAccountRepository = require('./../repositories/sellerAccount.repository');

const PromoCodeRepository = require('../repositories/promoCode.repository');
const PromoCodeAssignmentRepository = require('../repositories/promoCodeAssignment.repository');
const PromoCodeUsageRepository = require('../repositories/promoCodeUsage.repository');

const BannerRepository = require('../repositories/banner.repository');
const NotificationRepository = require('../repositories/notification.repository');
const PlatformSettingRepository = require('../repositories/platformSetting.repository');
const AuditLogRepository = require('../repositories/auditLog.repository');

const ProductReviewRepository = require('../repositories/productReview.repository');
const ContactQueryRepository = require('../repositories/contactQuery.repository');
const FileRepository = require('../repositories/file.repository');

class AdminService {
   constructor() {
      this.userRepo = new UserRepository();
      this.sellerRepo = new SellerProfileRepository();
      this.inviteRepo = new SellerInviteRepository();
      this.categoryRepo = new CategoryRepository();
      this.orderRepo = new OrderRepository();
      this.productRepo = new ProductRepository();

      this.productImageRepo = new ProductImageRepository();
      this.variantRepo = new ProductVariantRepository();
      this.priceRepo = new ProductVariantPriceRepository();
      this.inventoryRepo = new InventoryRepository();
      this.inventoryTransactionRepo = new InventoryTransactionRepository();

      this.orderItemRepo = new OrderItemRepository();
      this.orderStatusRepo = new OrderStatusHistoryRepository();

      this.promoRepo = new PromoCodeRepository();
      this.promoAssignRepo = new PromoCodeAssignmentRepository();
      this.promoUsageRepo = new PromoCodeUsageRepository();

      this.bannerRepo = new BannerRepository();
      this.notificationRepo = new NotificationRepository();
      this.platformSettingRepo = new PlatformSettingRepository();
      this.auditLogRepo = new AuditLogRepository();

      this.reviewRepo = new ProductReviewRepository();
      this.contactRepo = new ContactQueryRepository();
      this.fileRepo = new FileRepository();
   }

   async dashboard() {
      const [
         totalCustomers,
         totalSellers,
         totalOrders,
         totalProducts,
         latestOrders
      ] = await Promise.all([
         this.userRepo.countCustomers(),
         this.sellerRepo.count({ isDeleted: false }),
         this.orderRepo.count({}),
         this.productRepo.count({ isDeleted: false }),
         this.orderRepo.findLatestOrders(10)
      ]);

      return {
         totalCustomers,
         totalSellers,
         totalOrders,
         totalProducts,
         latestOrders
      };
   }

   customers(query) {
      return this.userRepo.findCustomers(query);
   }

   async customerDetails(id) {
      const customer = await this.userRepo.findPublicById(id);
      if (!customer) throw new Error('Customer not found');

      const orders = await this.orderRepo.findByCustomerId(id);

      return { customer, orders };
   }

   updateUserStatus(id, status) {
      return this.userRepo.updateById(id, { status, isActive: status === 'ACTIVE' });
   }

   deleteUser(id) {
      return this.userRepo.softDeleteById(id);
   }

   sellers(query) {
      return this.sellerRepo.findSellers(query);
   }

   async sellerDetails(id) {
      const seller = await this.sellerRepo.findDetailsById(id);
      if (!seller) throw new Error('Seller not found');
      return seller;
   }

   async createSellerInvite(adminId, body) {
      if (!body.email && !body.phone) {
         throw new Error('Email or phone is required');
      }

      const token = crypto.randomBytes(32).toString('hex');
      const inviteCode = `RBSELLER-${Date.now()}`;

      return this.inviteRepo.create({
         inviteCode,
         token,
         email: body.email,
         phone: body.phone,
         createdBy: adminId,
         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
         status: 'PENDING'
      });
   }

   async updateSellerStatus(id, status, adminId) {
      const seller = await this.sellerRepo.updateById(id, {
         status,
         approvedBy: adminId,
         approvedAt: status === 'APPROVED' ? new Date() : undefined,
         isActive: status === 'APPROVED'
      });

      if (!seller) throw new Error('Seller not found');

      if (status === 'APPROVED') {
         await this.userRepo.addRole(seller.userId, 'SELLER');
      }

      return seller;
   }

   async rejectSeller(id, adminId, reason) {
      const seller = await this.sellerRepo.updateById(id, {
         status: 'REJECTED',
         approvedBy: adminId,
         rejectedReason: reason || ''
      });

      if (!seller) throw new Error('Seller not found');
      return seller;
   }

   categories() {
      return this.categoryRepo.findAllAdmin();
   }

   async createCategory(body) {
      if (!body.name || !body.slug) {
         throw new Error('Name and slug are required');
      }

      const exists = await this.categoryRepo.findBySlugAdmin(body.slug);
      if (exists) throw new Error('Category slug already exists');

      return this.categoryRepo.create(body);
   }

   async updateCategory(id, body) {
      const category = await this.categoryRepo.updateById(id, body);
      if (!category) throw new Error('Category not found');
      return category;
   }

   deleteCategory(id) {
      return this.categoryRepo.softDeleteById(id);
   }

   updateCategoryStatus(id, isActive) {
      return this.categoryRepo.updateById(id, { isActive: !!isActive });
   }

   products(query) {
      return this.productRepo.findAdminProducts(query);
   }

   async productDetails(id) {
      const product = await this.productRepo.findAdminById(id);
      if (!product) throw new Error('Product not found');

      const images = await this.productImageRepo.findByProductId(id);
      const variants = await this.variantRepo.findByProductId(id);
      const prices = await this.priceRepo.findByProductId(id);
      const inventory = await this.inventoryRepo.findByProductId(id);

      return { product, images, variants, prices, inventory };
   }

   async createProduct(adminId, body) {
      if (!body.name || !body.slug || !body.categoryId) {
         throw new Error('Name, slug and category are required');
      }

      const exists = await this.productRepo.findBySlugAdmin(body.slug);
      if (exists) throw new Error('Product slug already exists');

      return this.productRepo.create({
         ...body,
         createdBy: adminId,
         status: body.status || 'ACTIVE',
         isActive: true,
         isDeleted: false
      });
   }

   async updateProduct(id, body) {
      const product = await this.productRepo.updateById(id, body);
      if (!product) throw new Error('Product not found');
      return product;
   }

   deleteProduct(id) {
      return this.productRepo.softDeleteById(id);
   }

   updateProductStatus(id, status) {
      if (!['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'].includes(status)) {
         throw new Error('Invalid product status');
      }

      return this.productRepo.updateById(id, {
         status,
         isActive: status === 'ACTIVE'
      });
   }

   async uploadProductImages(productId, files) {
      const product = await this.productRepo.findAdminById(productId);
      if (!product) throw new Error('Product not found');

      if (!files.length) throw new Error('Images are required');

      const count = await this.productImageRepo.countByProductId(productId);

      const payload = files.map((file, index) => ({
         productId,
         imageUrl: file.path.replace(/\\/g, '/'),
         altText: product.name,
         sortOrder: count + index + 1,
         isPrimary: count === 0 && index === 0,
         isActive: true
      }));

      const images = await this.productImageRepo.createMany(payload);

      if (!product.mainImage && images[0]) {
         await this.productRepo.updateById(productId, {
            mainImage: images[0].imageUrl
         });
      }

      return images;
   }

   async deleteProductImage(id) {
      const image = await this.productImageRepo.findById(id);
      if (!image) throw new Error('Image not found');

      return this.productImageRepo.updateById(id, {
         isActive: false
      });
   }

   async setPrimaryProductImage(id) {
      const image = await this.productImageRepo.findById(id);
      if (!image) throw new Error('Image not found');

      await this.productImageRepo.removePrimary(image.productId);

      await this.productRepo.updateById(image.productId, {
         mainImage: image.imageUrl
      });

      return this.productImageRepo.updateById(id, {
         isPrimary: true
      });
   }

   async productVariants(productId) {
      return this.variantRepo.findByProductId(productId);
   }

   async createProductVariant(productId, body) {
      const product = await this.productRepo.findAdminById(productId);
      if (!product) throw new Error('Product not found');

      if (!body.weightLabel || !body.weightInGram || !body.cakeType) {
         throw new Error('Weight and cake type are required');
      }

      return this.variantRepo.create({
         ...body,
         productId,
         isActive: true
      });
   }

   async updateProductVariant(id, body) {
      const variant = await this.variantRepo.updateById(id, body);
      if (!variant) throw new Error('Variant not found');
      return variant;
   }

   deleteProductVariant(id) {
      return this.variantRepo.updateById(id, {
         isActive: false
      });
   }

   async variantPrices(variantId) {
      return this.priceRepo.findByVariantId(variantId);
   }

   async createVariantPrice(variantId, body) {
      const variant = await this.variantRepo.findById(variantId);
      if (!variant) throw new Error('Variant not found');

      const required = ['mrp', 'customerPrice', 'sellerPurchasePrice'];
      for (const key of required) {
         if (body[key] === undefined || body[key] === null) {
            throw new Error(`${key} is required`);
         }
      }

      return this.priceRepo.create({
         ...body,
         variantId,
         productId: variant.productId,
         isActive: true
      });
   }

   async updateVariantPrice(id, body) {
      const price = await this.priceRepo.updateById(id, body);
      if (!price) throw new Error('Variant price not found');
      return price;
   }

   deleteVariantPrice(id) {
      return this.priceRepo.updateById(id, {
         isActive: false,
         effectiveTo: new Date()
      });
   }

   inventory(query) {
      return this.inventoryRepo.findAdminInventory(query);
   }

   async inventoryDetails(id) {
      const inventory = await this.inventoryRepo.findDetailsById(id);
      if (!inventory) throw new Error('Inventory not found');

      const transactions = await this.inventoryTransactionRepo.findByInventoryId(id);

      return { inventory, transactions };
   }

   async updateStock(adminId, inventoryId, body) {
      const { quantity, type = 'ADJUSTMENT', note = '' } = body;

      if (quantity === undefined || quantity === null) {
         throw new Error('Quantity is required');
      }

      const inventory = await this.inventoryRepo.findById(inventoryId);
      if (!inventory) throw new Error('Inventory not found');

      const previousStock = Number(inventory.currentStock || 0);
      const newStock = previousStock + Number(quantity);

      if (newStock < 0) {
         throw new Error('Stock cannot be negative');
      }

      const status =
         newStock <= 0
            ? 'OUT_OF_STOCK'
            : newStock <= Number(inventory.minStock || 0)
               ? 'LOW_STOCK'
               : 'IN_STOCK';

      const updatedInventory = await this.inventoryRepo.updateById(inventoryId, {
         currentStock: newStock,
         status,
         lastUpdatedBy: adminId,
         lastUpdatedAt: new Date()
      });

      await this.inventoryTransactionRepo.create({
         inventoryId,
         productId: inventory.productId,
         type,
         quantity: Number(quantity),
         previousStock,
         newStock,
         note,
         createdBy: adminId
      });

      return updatedInventory;
   }

   inventoryTransactions(query) {
      return this.inventoryTransactionRepo.findAdminTransactions(query);
   }

   orders(query) {
      return this.orderRepo.findAdminOrders(query);
   }

   async orderDetails(orderId) {
      const order = await this.orderRepo.findAdminOrderById(orderId);
      if (!order) throw new Error('Order not found');

      const items = await this.orderItemRepo.findByOrderId(orderId);
      const timeline = await this.orderStatusRepo.findByOrderId(orderId);

      return {
         order,
         items,
         timeline
      };
   }

   async updateOrderStatus(adminId, orderId, status, note = '') {
      const allowedStatus = [
         'PENDING',
         'PLACED',
         'ACCEPTED',
         'PREPARING',
         'PACKED',
         'OUT_FOR_DELIVERY',
         'DELIVERED',
         'CANCELLED'
      ];

      if (!allowedStatus.includes(status)) {
         throw new Error('Invalid order status');
      }

      const order = await this.orderRepo.findRawById(orderId);
      if (!order) throw new Error('Order not found');

      if (order.orderStatus === 'CANCELLED') {
         throw new Error('Cancelled order cannot be updated');
      }

      if (order.orderStatus === 'DELIVERED') {
         throw new Error('Delivered order cannot be updated');
      }

      order.orderStatus = status;

      if (status === 'DELIVERED') {
         order.deliveredAt = new Date();
      }

      if (status === 'CANCELLED') {
         order.cancelledAt = new Date();
         order.cancellationReason = note || 'Cancelled by admin';
      }

      await order.save();

      await this.orderStatusRepo.create({
         orderId,
         status,
         note: note || `Order status changed to ${status}`,
         changedBy: adminId,
         changedByRole: 'SUPER_ADMIN'
      });

      return this.orderRepo.findAdminOrderById(orderId);
   }

   async assignSellerToOrder(adminId, orderId, sellerId) {
      if (!sellerId) throw new Error('Seller id is required');

      const order = await this.orderRepo.findRawById(orderId);
      if (!order) throw new Error('Order not found');

      const seller = await this.sellerRepo.findById(sellerId);
      if (!seller) throw new Error('Seller not found');

      if (seller.status !== 'APPROVED' || !seller.isActive) {
         throw new Error('Seller is not active');
      }

      order.sellerId = sellerId;
      await order.save();

      await this.orderStatusRepo.create({
         orderId,
         status: order.orderStatus,
         note: `Seller assigned: ${seller.shopName}`,
         changedBy: adminId,
         changedByRole: 'SUPER_ADMIN'
      });

      return this.orderRepo.findAdminOrderById(orderId);
   }

   async cancelOrderByAdmin(adminId, orderId, reason = '') {
      const order = await this.orderRepo.findRawById(orderId);
      if (!order) throw new Error('Order not found');

      if (order.orderStatus === 'DELIVERED') {
         throw new Error('Delivered order cannot be cancelled');
      }

      if (order.orderStatus === 'CANCELLED') {
         throw new Error('Order already cancelled');
      }

      order.orderStatus = 'CANCELLED';
      order.cancelledAt = new Date();
      order.cancellationReason = reason || 'Cancelled by admin';

      await order.save();

      await this.orderStatusRepo.create({
         orderId,
         status: 'CANCELLED',
         note: reason || 'Cancelled by admin',
         changedBy: adminId,
         changedByRole: 'SUPER_ADMIN'
      });

      return this.orderRepo.findAdminOrderById(orderId);
   }

   promoCodes(query) {
      return this.promoRepo.findAdminPromoCodes(query);
   }

   async promoCodeDetails(id) {
      const promo = await this.promoRepo.findDetailsById(id);
      if (!promo) throw new Error('Promo code not found');

      const assignments = await this.promoAssignRepo.findByPromoCodeId(id);

      return {
         promo,
         assignments
      };
   }

   async createPromoCode(adminId, body) {
      const {
         code,
         promoType,
         title,
         discountType,
         discountValue,
         startDate,
         endDate
      } = body;

      if (!code || !promoType || !title || !discountType || discountValue === undefined) {
         throw new Error('Code, promo type, title, discount type and discount value are required');
      }

      if (!['CUSTOMER', 'SELLER'].includes(promoType)) {
         throw new Error('Invalid promo type');
      }

      if (!['PERCENTAGE', 'FIXED_AMOUNT'].includes(discountType)) {
         throw new Error('Invalid discount type');
      }

      if (!startDate || !endDate) {
         throw new Error('Start date and end date are required');
      }

      const exists = await this.promoRepo.findByCode(code);
      if (exists) throw new Error('Promo code already exists');

      return this.promoRepo.create({
         ...body,
         code: String(code).toUpperCase(),
         createdBy: adminId,
         status: body.status || 'ACTIVE',
         isDeleted: false
      });
   }

   async updatePromoCode(id, body) {
      if (body.code) {
         body.code = String(body.code).toUpperCase();

         const exists = await this.promoRepo.findByCodeExceptId(body.code, id);
         if (exists) throw new Error('Promo code already exists');
      }

      const promo = await this.promoRepo.updateById(id, body);
      if (!promo) throw new Error('Promo code not found');

      return promo;
   }

   async deletePromoCode(id) {
      const promo = await this.promoRepo.updateById(id, {
         isDeleted: true,
         status: 'INACTIVE'
      });

      if (!promo) throw new Error('Promo code not found');

      return promo;
   }

   async updatePromoCodeStatus(id, status) {
      if (!['ACTIVE', 'INACTIVE', 'EXPIRED'].includes(status)) {
         throw new Error('Invalid promo status');
      }

      const promo = await this.promoRepo.updateById(id, { status });
      if (!promo) throw new Error('Promo code not found');

      return promo;
   }

   async assignPromoToCustomer(adminId, promoCodeId, userId) {
      if (!userId) throw new Error('Customer user id is required');

      const promo = await this.promoRepo.findById(promoCodeId);
      if (!promo || promo.isDeleted) throw new Error('Promo code not found');

      if (promo.promoType !== 'CUSTOMER') {
         throw new Error('This promo code is not for customer');
      }

      const user = await this.userRepo.findById(userId);
      if (!user || user.isDeleted) throw new Error('Customer not found');

      const alreadyAssigned = await this.promoAssignRepo.findByPromoAndUser(promoCodeId, userId);
      if (alreadyAssigned) throw new Error('Promo already assigned to this customer');

      return this.promoAssignRepo.create({
         promoCodeId,
         assignedToUserId: userId,
         encryptedCode: Buffer.from(promo.code).toString('base64'),
         assignedBy: adminId,
         assignedAt: new Date(),
         expiresAt: promo.endDate,
         status: 'ACTIVE'
      });
   }

   async assignPromoToSeller(adminId, promoCodeId, sellerId) {
      if (!sellerId) throw new Error('Seller id is required');

      const promo = await this.promoRepo.findById(promoCodeId);
      if (!promo || promo.isDeleted) throw new Error('Promo code not found');

      if (promo.promoType !== 'SELLER') {
         throw new Error('This promo code is not for seller');
      }

      const seller = await this.sellerRepo.findById(sellerId);
      if (!seller || seller.isDeleted) throw new Error('Seller not found');

      if (seller.status !== 'APPROVED') {
         throw new Error('Seller is not approved');
      }

      const alreadyAssigned = await this.promoAssignRepo.findByPromoAndSeller(promoCodeId, sellerId);
      if (alreadyAssigned) throw new Error('Promo already assigned to this seller');

      return this.promoAssignRepo.create({
         promoCodeId,
         assignedToUserId: seller.userId,
         assignedToSellerId: sellerId,
         encryptedCode: Buffer.from(promo.code).toString('base64'),
         assignedBy: adminId,
         assignedAt: new Date(),
         expiresAt: promo.endDate,
         status: 'ACTIVE'
      });
   }

   promoCodeUsages(promoCodeId, query) {
      return this.promoUsageRepo.findAdminUsages(promoCodeId, query);
   }

   banners(query) {
      return this.bannerRepo.findAdminBanners(query);
   }

   async bannerDetails(id) {
      const banner = await this.bannerRepo.findDetailsById(id);
      if (!banner) throw new Error('Banner not found');
      return banner;
   }

   async createBanner(adminId, body, imagePath) {
      const { title, bannerPosition } = body;

      if (!title) {
         throw new Error('Banner title is required');
      }

      if (!imagePath) {
         throw new Error('Banner image is required');
      }

      return this.bannerRepo.create({
         ...body,
         image: imagePath,
         bannerPosition: bannerPosition || 'HOME_HERO',
         createdBy: adminId,
         isActive: body.isActive !== undefined ? body.isActive : true,
         isDeleted: false
      });
   }

   async updateBanner(id, body, imagePath) {
      const banner = await this.bannerRepo.findById(id);
      if (!banner || banner.isDeleted) {
         throw new Error('Banner not found');
      }

      const updateData = {
         ...body
      };

      if (imagePath) {
         updateData.image = imagePath;
      }

      const updatedBanner = await this.bannerRepo.updateById(id, updateData);
      if (!updatedBanner) throw new Error('Banner not found');

      return updatedBanner;
   }

   async deleteBanner(id) {
      const banner = await this.bannerRepo.updateById(id, {
         isDeleted: true,
         isActive: false
      });

      if (!banner) throw new Error('Banner not found');

      return banner;
   }

   async updateBannerStatus(id, isActive) {
      const banner = await this.bannerRepo.updateById(id, {
         isActive: !!isActive
      });

      if (!banner) throw new Error('Banner not found');

      return banner;
   }

   notifications(query) {
      return this.notificationRepo.findAdminNotifications(query);
   }

   async notificationDetails(id) {
      const notification = await this.notificationRepo.findDetailsById(id);
      if (!notification) throw new Error('Notification not found');
      return notification;
   }

   async createNotification(adminId, body) {
      const { title, message, type = 'SYSTEM', targetRole = 'ALL', userId } = body;

      if (!title || !message) {
         throw new Error('Title and message are required');
      }

      return this.notificationRepo.create({
         userId: userId || null,
         title,
         message,
         type,
         targetRole,
         referenceId: body.referenceId,
         referenceModule: body.referenceModule,
         createdBy: adminId,
         isRead: false
      });
   }

   async sendCustomerNotification(adminId, body) {
      const { userId, title, message, type = 'SYSTEM' } = body;

      if (!userId || !title || !message) {
         throw new Error('Customer user id, title and message are required');
      }

      const user = await this.userRepo.findById(userId);
      if (!user || user.isDeleted) throw new Error('Customer not found');

      return this.notificationRepo.create({
         userId,
         title,
         message,
         type,
         targetRole: 'CUSTOMER',
         referenceId: body.referenceId,
         referenceModule: body.referenceModule,
         createdBy: adminId,
         isRead: false
      });
   }

   async sendSellerNotification(adminId, body) {
      const { sellerId, title, message, type = 'SYSTEM' } = body;

      if (!sellerId || !title || !message) {
         throw new Error('Seller id, title and message are required');
      }

      const seller = await this.sellerRepo.findById(sellerId);
      if (!seller || seller.isDeleted) throw new Error('Seller not found');

      return this.notificationRepo.create({
         userId: seller.userId,
         title,
         message,
         type,
         targetRole: 'SELLER',
         referenceId: body.referenceId,
         referenceModule: body.referenceModule,
         createdBy: adminId,
         isRead: false
      });
   }

   async sendAllNotification(adminId, body) {
      const { title, message, type = 'SYSTEM', targetRole = 'ALL' } = body;

      if (!title || !message) {
         throw new Error('Title and message are required');
      }

      return this.notificationRepo.create({
         userId: null,
         title,
         message,
         type,
         targetRole,
         referenceId: body.referenceId,
         referenceModule: body.referenceModule,
         createdBy: adminId,
         isRead: false
      });
   }

   async deleteNotification(id) {
      const notification = await this.notificationRepo.deleteById(id);
      if (!notification) throw new Error('Notification not found');
      return notification;
   }

   async getSettings() {
      return this.platformSettingRepo.getOrCreateDefault();
   }

   async updateSettings(adminId, body) {
      const settings = await this.platformSettingRepo.getOrCreateDefault();

      return this.platformSettingRepo.updateById(settings._id, {
         ...body,
         updatedBy: adminId
      });
   }

   async updatePlatformStatus(adminId, platformStatus) {
      if (!['ACTIVE', 'MAINTENANCE', 'DISABLED'].includes(platformStatus)) {
         throw new Error('Invalid platform status');
      }

      const settings = await this.platformSettingRepo.getOrCreateDefault();

      return this.platformSettingRepo.updateById(settings._id, {
         platformStatus,
         updatedBy: adminId
      });
   }

   async updateDeliverySettings(adminId, body) {
      const allowedFields = [
         'baseDeliveryCharge',
         'freeDeliveryAbove',
         'midnightDeliveryCharge',
         'deliveryRadiusKm',
         'defaultDeliveryTime'
      ];

      const updateData = {};

      allowedFields.forEach((key) => {
         if (body[key] !== undefined) {
            updateData[key] = body[key];
         }
      });

      const settings = await this.platformSettingRepo.getOrCreateDefault();

      return this.platformSettingRepo.updateById(settings._id, {
         ...updateData,
         updatedBy: adminId
      });
   }

   async updateCommissionSettings(adminId, body) {
      const { commissionPercent, settlementCycle, minimumPayout } = body;

      const updateData = {};

      if (commissionPercent !== undefined) {
         if (Number(commissionPercent) < 0 || Number(commissionPercent) > 100) {
            throw new Error('Commission percent must be between 0 and 100');
         }

         updateData.commissionPercent = Number(commissionPercent);
      }

      if (settlementCycle !== undefined) {
         if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(settlementCycle)) {
            throw new Error('Invalid settlement cycle');
         }

         updateData.settlementCycle = settlementCycle;
      }

      if (minimumPayout !== undefined) {
         if (Number(minimumPayout) < 0) {
            throw new Error('Minimum payout cannot be negative');
         }

         updateData.minimumPayout = Number(minimumPayout);
      }

      const settings = await this.platformSettingRepo.getOrCreateDefault();

      return this.platformSettingRepo.updateById(settings._id, {
         ...updateData,
         updatedBy: adminId
      });
   }

   async updateNotificationSettings(adminId, body) {
      const settings = await this.platformSettingRepo.getOrCreateDefault();

      return this.platformSettingRepo.updateById(settings._id, {
         notifications: {
            ...settings.notifications,
            ...body
         },
         updatedBy: adminId
      });
   }

   auditLogs(query) {
      return this.auditLogRepo.findAdminAuditLogs(query);
   }

   async auditLogDetails(id) {
      const log = await this.auditLogRepo.findDetailsById(id);
      if (!log) throw new Error('Audit log not found');
      return log;
   }

   createAuditLog(data) {
      return this.auditLogRepo.create(data);
   }

   reviews(query) {
      return this.reviewRepo.findAdminReviews(query);
   }

   async updateReviewStatus(adminId, reviewId, status) {
      const review = await this.reviewRepo.updateById(reviewId, {
         status,
         approvedBy: adminId,
         approvedAt: status === 'APPROVED' ? new Date() : null
      });

      if (!review) throw new Error('Review not found');
      return review;
   }

   contactQueries(query) {
      return this.contactRepo.findAdminQueries(query);
   }

   async contactQueryDetails(id) {
      const data = await this.contactRepo.findById(id);
      if (!data) throw new Error('Contact query not found');
      return data;
   }

   async updateContactQueryStatus(id, body) {
      const updateData = {
         status: body.status,
         adminNote: body.adminNote
      };

      if (body.status === 'RESOLVED' || body.status === 'CLOSED') {
         updateData.resolvedAt = new Date();
      }

      const data = await this.contactRepo.updateById(id, updateData);
      if (!data) throw new Error('Contact query not found');
      return data;
   }

   files(query) {
      return this.fileRepo.findAdminFiles(query);
   }

   async uploadFile(adminId, file, body) {
      if (!file) throw new Error('File is required');

      return this.fileRepo.create({
         originalName: file.originalname,
         fileName: file.filename,
         fileUrl: file.path.replace(/\\/g, '/'),
         mimeType: file.mimetype,
         size: file.size,
         module: body.module || 'OTHER',
         referenceId: body.referenceId,
         uploadedBy: adminId,
         isActive: true,
         isDeleted: false
      });
   }

   async deleteFile(id) {
      const file = await this.fileRepo.updateById(id, {
         isDeleted: true,
         isActive: false
      });

      if (!file) throw new Error('File not found');
      return file;
   }
}

module.exports = AdminService;