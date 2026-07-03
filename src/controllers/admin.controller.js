const BaseController = require('./base.controller');
const AdminService = require('./../services/admin.service');

class AdminController extends BaseController {
   constructor() {
      super(class { });
      this.service = new AdminService();
   }

   dashboard = async (req, res) => {
      try {
         const data = await this.service.dashboard();
         return this.commonSuccessResponse(res, data, '', 'Dashboard fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   customers = async (req, res) => {
      try {
         const data = await this.service.customers(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Customers fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   customerDetails = async (req, res) => {
      try {
         const data = await this.service.customerDetails(req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Customer details fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   blockCustomer = async (req, res) => {
      try {
         const data = await this.service.updateUserStatus(req.params.id, 'BLOCKED');
         return this.commonSuccessResponse(res, data, '', 'Customer blocked');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   unblockCustomer = async (req, res) => {
      try {
         const data = await this.service.updateUserStatus(req.params.id, 'ACTIVE');
         return this.commonSuccessResponse(res, data, '', 'Customer unblocked');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   deleteCustomer = async (req, res) => {
      try {
         await this.service.deleteUser(req.params.id);
         return this.commonSuccessResponse(res, { ok: true }, '', 'Customer deleted');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   sellers = async (req, res) => {
      try {
         const data = await this.service.sellers(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Sellers fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   sellerDetails = async (req, res) => {
      try {
         const data = await this.service.sellerDetails(req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Seller details fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   createSellerInvite = async (req, res) => {
      try {
         const data = await this.service.createSellerInvite(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Seller invite created');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   approveSeller = async (req, res) => {
      try {
         const data = await this.service.updateSellerStatus(req.params.id, 'APPROVED', req.user.sub);
         return this.commonSuccessResponse(res, data, '', 'Seller approved');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   rejectSeller = async (req, res) => {
      try {
         const data = await this.service.rejectSeller(req.params.id, req.user.sub, req.body.reason);
         return this.commonSuccessResponse(res, data, '', 'Seller rejected');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   suspendSeller = async (req, res) => {
      try {
         const data = await this.service.updateSellerStatus(req.params.id, 'SUSPENDED', req.user.sub);
         return this.commonSuccessResponse(res, data, '', 'Seller suspended');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   activateSeller = async (req, res) => {
      try {
         const data = await this.service.updateSellerStatus(req.params.id, 'APPROVED', req.user.sub);
         return this.commonSuccessResponse(res, data, '', 'Seller activated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   categories = async (req, res) => {
      try {
         const data = await this.service.categories(req.query);
         return this.commonSuccessResponse(res, data, '', 'Categories fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   createCategory = async (req, res) => {
      try {
         const data = await this.service.createCategory(req.body);
         return this.commonSuccessResponse(res, data, '', 'Category created');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateCategory = async (req, res) => {
      try {
         const data = await this.service.updateCategory(req.params.id, req.body);
         return this.commonSuccessResponse(res, data, '', 'Category updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   deleteCategory = async (req, res) => {
      try {
         await this.service.deleteCategory(req.params.id);
         return this.commonSuccessResponse(res, { ok: true }, '', 'Category deleted');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateCategoryStatus = async (req, res) => {
      try {
         const data = await this.service.updateCategoryStatus(req.params.id, req.body.isActive);
         return this.commonSuccessResponse(res, data, '', 'Category status updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   products = async (req, res) => {
      try {
         const data = await this.service.products(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Products fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   productDetails = async (req, res) => {
      try {
         const data = await this.service.productDetails(req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Product details fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   createProduct = async (req, res) => {
      try {
         const data = await this.service.createProduct(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Product created');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateProduct = async (req, res) => {
      try {
         const data = await this.service.updateProduct(req.params.id, req.body);
         return this.commonSuccessResponse(res, data, '', 'Product updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   deleteProduct = async (req, res) => {
      try {
         await this.service.deleteProduct(req.params.id);
         return this.commonSuccessResponse(res, { ok: true }, '', 'Product deleted');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateProductStatus = async (req, res) => {
      try {
         const data = await this.service.updateProductStatus(req.params.id, req.body.status);
         return this.commonSuccessResponse(res, data, '', 'Product status updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   uploadProductImages = async (req, res) => {
      try {
         const data = await this.service.uploadProductImages(req.params.productId, req.files || []);
         return this.commonSuccessResponse(res, data, '', 'Product images uploaded');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   deleteProductImage = async (req, res) => {
      try {
         await this.service.deleteProductImage(req.params.id);
         return this.commonSuccessResponse(res, { ok: true }, '', 'Product image deleted');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   setPrimaryProductImage = async (req, res) => {
      try {
         const data = await this.service.setPrimaryProductImage(req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Primary image updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   productVariants = async (req, res) => {
      try {
         const data = await this.service.productVariants(req.params.productId);
         return this.commonSuccessResponse(res, data, '', 'Variants fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   createProductVariant = async (req, res) => {
      try {
         const data = await this.service.createProductVariant(req.params.productId, req.body);
         return this.commonSuccessResponse(res, data, '', 'Variant created');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateProductVariant = async (req, res) => {
      try {
         const data = await this.service.updateProductVariant(req.params.id, req.body);
         return this.commonSuccessResponse(res, data, '', 'Variant updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   deleteProductVariant = async (req, res) => {
      try {
         await this.service.deleteProductVariant(req.params.id);
         return this.commonSuccessResponse(res, { ok: true }, '', 'Variant deleted');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   variantPrices = async (req, res) => {
      try {
         const data = await this.service.variantPrices(req.params.variantId);
         return this.commonSuccessResponse(res, data, '', 'Variant prices fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   createVariantPrice = async (req, res) => {
      try {
         const data = await this.service.createVariantPrice(req.params.variantId, req.body);
         return this.commonSuccessResponse(res, data, '', 'Variant price created');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateVariantPrice = async (req, res) => {
      try {
         const data = await this.service.updateVariantPrice(req.params.id, req.body);
         return this.commonSuccessResponse(res, data, '', 'Variant price updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   deleteVariantPrice = async (req, res) => {
      try {
         await this.service.deleteVariantPrice(req.params.id);
         return this.commonSuccessResponse(res, { ok: true }, '', 'Variant price deleted');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   inventory = async (req, res) => {
      try {
         const data = await this.service.inventory(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Inventory fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   inventoryDetails = async (req, res) => {
      try {
         const data = await this.service.inventoryDetails(req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Inventory details fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateStock = async (req, res) => {
      try {
         const data = await this.service.updateStock(req.user.sub, req.params.id, req.body);
         return this.commonSuccessResponse(res, data, '', 'Stock updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   inventoryTransactions = async (req, res) => {
      try {
         const data = await this.service.inventoryTransactions(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Inventory transactions fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   orders = async (req, res) => {
      try {
         const data = await this.service.orders(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Orders fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   orderDetails = async (req, res) => {
      try {
         const data = await this.service.orderDetails(req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Order details fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateOrderStatus = async (req, res) => {
      try {
         const data = await this.service.updateOrderStatus(
            req.user.sub,
            req.params.id,
            req.body.status,
            req.body.note
         );

         return this.commonSuccessResponse(res, data, '', 'Order status updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   assignSellerToOrder = async (req, res) => {
      try {
         const data = await this.service.assignSellerToOrder(
            req.user.sub,
            req.params.id,
            req.body.sellerId
         );

         return this.commonSuccessResponse(res, data, '', 'Seller assigned to order');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   cancelOrderByAdmin = async (req, res) => {
      try {
         const data = await this.service.cancelOrderByAdmin(
            req.user.sub,
            req.params.id,
            req.body.reason
         );

         return this.commonSuccessResponse(res, data, '', 'Order cancelled');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   payments = async (req, res) => {
      try {
         const data = await this.service.payments(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Payments fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   paymentDetails = async (req, res) => {
      try {
         const data = await this.service.paymentDetails(req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Payment details fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updatePaymentStatus = async (req, res) => {
      try {
         const data = await this.service.updatePaymentStatus(
            req.user.sub,
            req.params.id,
            req.body
         );

         return this.commonSuccessResponse(res, data, '', 'Payment status updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   transactions = async (req, res) => {
      try {
         const data = await this.service.transactions(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Transactions fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   createTransaction = async (req, res) => {
      try {
         const data = await this.service.createTransaction(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Transaction created');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   sellerAccounts = async (req, res) => {
      try {
         const data = await this.service.sellerAccounts(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Seller accounts fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   sellerAccountDetails = async (req, res) => {
      try {
         const data = await this.service.sellerAccountDetails(req.params.sellerId);
         return this.commonSuccessResponse(res, data, '', 'Seller account details fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   recordSellerPayment = async (req, res) => {
      try {
         const data = await this.service.recordSellerPayment(
            req.user.sub,
            req.params.sellerId,
            req.body
         );

         return this.commonSuccessResponse(res, data, '', 'Seller payment recorded');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateSellerCreditLimit = async (req, res) => {
      try {
         const data = await this.service.updateSellerCreditLimit(
            req.user.sub,
            req.params.sellerId,
            req.body.creditLimit
         );

         return this.commonSuccessResponse(res, data, '', 'Credit limit updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   promoCodes = async (req, res) => {
      try {
         const data = await this.service.promoCodes(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Promo codes fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   promoCodeDetails = async (req, res) => {
      try {
         const data = await this.service.promoCodeDetails(req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Promo code details fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   createPromoCode = async (req, res) => {
      try {
         const data = await this.service.createPromoCode(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Promo code created');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updatePromoCode = async (req, res) => {
      try {
         const data = await this.service.updatePromoCode(req.params.id, req.body);
         return this.commonSuccessResponse(res, data, '', 'Promo code updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   deletePromoCode = async (req, res) => {
      try {
         await this.service.deletePromoCode(req.params.id);
         return this.commonSuccessResponse(res, { ok: true }, '', 'Promo code deleted');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updatePromoCodeStatus = async (req, res) => {
      try {
         const data = await this.service.updatePromoCodeStatus(req.params.id, req.body.status);
         return this.commonSuccessResponse(res, data, '', 'Promo code status updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   assignPromoToCustomer = async (req, res) => {
      try {
         const data = await this.service.assignPromoToCustomer(
            req.user.sub,
            req.params.id,
            req.body.userId
         );
         return this.commonSuccessResponse(res, data, '', 'Promo assigned to customer');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   assignPromoToSeller = async (req, res) => {
      try {
         const data = await this.service.assignPromoToSeller(
            req.user.sub,
            req.params.id,
            req.body.sellerId
         );
         return this.commonSuccessResponse(res, data, '', 'Promo assigned to seller');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   promoCodeUsages = async (req, res) => {
      try {
         const data = await this.service.promoCodeUsages(req.params.id, req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Promo usages fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   banners = async (req, res) => {
      try {
         const data = await this.service.banners(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Banners fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   bannerDetails = async (req, res) => {
      try {
         const data = await this.service.bannerDetails(req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Banner details fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   createBanner = async (req, res) => {
      try {
         const imagePath = req.file ? req.file.path.replace(/\\/g, '/') : '';

         const data = await this.service.createBanner(
            req.user.sub,
            req.body,
            imagePath
         );

         return this.commonSuccessResponse(res, data, '', 'Banner created');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateBanner = async (req, res) => {
      try {
         const imagePath = req.file ? req.file.path.replace(/\\/g, '/') : '';

         const data = await this.service.updateBanner(
            req.params.id,
            req.body,
            imagePath
         );

         return this.commonSuccessResponse(res, data, '', 'Banner updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   deleteBanner = async (req, res) => {
      try {
         await this.service.deleteBanner(req.params.id);
         return this.commonSuccessResponse(res, { ok: true }, '', 'Banner deleted');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateBannerStatus = async (req, res) => {
      try {
         const data = await this.service.updateBannerStatus(
            req.params.id,
            req.body.isActive
         );

         return this.commonSuccessResponse(res, data, '', 'Banner status updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   getSettings = async (req, res) => {
      try {
         const data = await this.service.getSettings();
         return this.commonSuccessResponse(res, data, '', 'Settings fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateSettings = async (req, res) => {
      try {
         const data = await this.service.updateSettings(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Settings updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updatePlatformStatus = async (req, res) => {
      try {
         const data = await this.service.updatePlatformStatus(
            req.user.sub,
            req.body.platformStatus
         );

         return this.commonSuccessResponse(res, data, '', 'Platform status updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateDeliverySettings = async (req, res) => {
      try {
         const data = await this.service.updateDeliverySettings(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Delivery settings updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateCommissionSettings = async (req, res) => {
      try {
         const data = await this.service.updateCommissionSettings(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Commission settings updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   updateNotificationSettings = async (req, res) => {
      try {
         const data = await this.service.updateNotificationSettings(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Notification settings updated');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   auditLogs = async (req, res) => {
      try {
         const data = await this.service.auditLogs(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Audit logs fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   auditLogDetails = async (req, res) => {
      try {
         const data = await this.service.auditLogDetails(req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Audit log details fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   reviews = async (req, res) => {
      try {
         const data = await this.service.reviews(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Reviews fetched');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };

   approveReview = async (req, res) => {
      try {
         const data = await this.service.updateReviewStatus(req.user.sub, req.params.id, 'APPROVED');
         return this.commonSuccessResponse(res, data, '', 'Review approved');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };

   rejectReview = async (req, res) => {
      try {
         const data = await this.service.updateReviewStatus(req.user.sub, req.params.id, 'REJECTED');
         return this.commonSuccessResponse(res, data, '', 'Review rejected');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };
   contactQueries = async (req, res) => {
      try {
         const data = await this.service.contactQueries(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Contact queries fetched');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };

   contactQueryDetails = async (req, res) => {
      try {
         const data = await this.service.contactQueryDetails(req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Contact query fetched');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };

   updateContactQueryStatus = async (req, res) => {
      try {
         const data = await this.service.updateContactQueryStatus(req.params.id, req.body);
         return this.commonSuccessResponse(res, data, '', 'Contact query updated');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };

   files = async (req, res) => {
      try {
         const data = await this.service.files(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Files fetched');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };

   uploadFile = async (req, res) => {
      try {
         const data = await this.service.uploadFile(req.user.sub, req.file, req.body);
         return this.commonSuccessResponse(res, data, '', 'File uploaded');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };

   deleteFile = async (req, res) => {
      try {
         await this.service.deleteFile(req.params.id);
         return this.commonSuccessResponse(res, { ok: true }, '', 'File deleted');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };

   notifications = async (req, res) => {
      try {
         const data = await this.service.notifications(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Notifications fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   notificationDetails = async (req, res) => {
      try {
         const data = await this.service.notificationDetails(req.params.id);
         return this.commonSuccessResponse(res, data, '', 'Notification details fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   createNotification = async (req, res) => {
      try {
         const data = await this.service.createNotification(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Notification created');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   sendCustomerNotification = async (req, res) => {
      try {
         const data = await this.service.sendCustomerNotification(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Customer notification sent');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   sendSellerNotification = async (req, res) => {
      try {
         const data = await this.service.sendSellerNotification(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Seller notification sent');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   sendAllNotification = async (req, res) => {
      try {
         const data = await this.service.sendAllNotification(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Notification sent to all');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   deleteNotification = async (req, res) => {
      try {
         await this.service.deleteNotification(req.params.id);
         return this.commonSuccessResponse(res, { ok: true }, '', 'Notification deleted');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };
}

module.exports = AdminController;