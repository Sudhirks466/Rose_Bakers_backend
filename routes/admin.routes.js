const express = require('express');
const router = express.Router();

const multer = require('multer');

const uploadProduct = multer({
  dest: 'storage/uploads/products'
});

const uploadBanner = multer({
  dest: 'storage/uploads/banners'
});

const uploadProfile = multer({
  dest: 'storage/uploads/profiles'
});

const AuthMiddleware = require('./../src/middlewares/auth.middleware');
const RoleMiddleware = require('./../src/middlewares/role.middleware');
const AdminController = require('./../src/controllers/admin.controller');
const ReportController = require('./../src/controllers/report.controller');

const ctrl = new AdminController();
const reportCtrl = new ReportController();

router.use(AuthMiddleware.verifyAccessToken);
router.use(RoleMiddleware.onlySuperAdmin);

// Dashboard   
router.get('/dashboard', ctrl.dashboard);

// Customers
router.get('/customers', ctrl.customers);
router.get('/customers/:id', ctrl.customerDetails);
router.patch('/customers/:id/block', ctrl.blockCustomer);
router.patch('/customers/:id/unblock', ctrl.unblockCustomer);
router.delete('/customers/:id', ctrl.deleteCustomer);

// Sellers
router.get('/sellers', ctrl.sellers);
router.get('/sellers/:id', ctrl.sellerDetails);
router.post('/sellers/invite', ctrl.createSellerInvite);
router.patch('/sellers/:id/approve', ctrl.approveSeller);
router.patch('/sellers/:id/reject', ctrl.rejectSeller);
router.patch('/sellers/:id/suspend', ctrl.suspendSeller);
router.patch('/sellers/:id/activate', ctrl.activateSeller);

// Categories
router.get('/categories', ctrl.categories);
router.post('/categories', ctrl.createCategory);
router.put('/categories/:id', ctrl.updateCategory);
router.delete('/categories/:id', ctrl.deleteCategory);
router.patch('/categories/:id/status', ctrl.updateCategoryStatus);

// Products
router.get('/products', ctrl.products);
router.get('/products/:id', ctrl.productDetails);
router.post('/products', ctrl.createProduct);
router.put('/products/:id', ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);
router.patch('/products/:id/status', ctrl.updateProductStatus);

// Product Images
router.post('/products/:productId/images', uploadProduct.array('images', 10), ctrl.uploadProductImages);
router.delete('/product-images/:id', ctrl.deleteProductImage);
router.patch('/product-images/:id/primary', ctrl.setPrimaryProductImage);

// Variants
router.get('/products/:productId/variants', ctrl.productVariants);
router.post('/products/:productId/variants', ctrl.createProductVariant);
router.put('/product-variants/:id', ctrl.updateProductVariant);
router.delete('/product-variants/:id', ctrl.deleteProductVariant);

// Variant Prices
router.get('/product-variants/:variantId/prices', ctrl.variantPrices);
router.post('/product-variants/:variantId/prices', ctrl.createVariantPrice);
router.put('/product-variant-prices/:id', ctrl.updateVariantPrice);
router.delete('/product-variant-prices/:id', ctrl.deleteVariantPrice);

// Inventory
router.get('/inventory', ctrl.inventory);
router.get('/inventory/:id', ctrl.inventoryDetails);
router.patch('/inventory/:id/stock', ctrl.updateStock);
router.get('/inventory-transactions', ctrl.inventoryTransactions);

// Admin Orders
router.get('/orders', ctrl.orders);
router.get('/orders/:id', ctrl.orderDetails);
router.patch('/orders/:id/status', ctrl.updateOrderStatus);
router.patch('/orders/:id/assign-seller', ctrl.assignSellerToOrder);
router.patch('/orders/:id/cancel', ctrl.cancelOrderByAdmin);

// Payments
router.get('/payments', ctrl.payments);
router.get('/payments/:id', ctrl.paymentDetails);
router.patch('/payments/:id/status', ctrl.updatePaymentStatus);

// Transactions
router.get('/transactions', ctrl.transactions);
router.post('/transactions', ctrl.createTransaction);

// Seller Accounts
router.get('/seller-accounts', ctrl.sellerAccounts);
router.get('/seller-accounts/:sellerId', ctrl.sellerAccountDetails);
router.post('/seller-accounts/:sellerId/payment', ctrl.recordSellerPayment);
router.patch('/seller-accounts/:sellerId/credit-limit', ctrl.updateSellerCreditLimit);

// Promo Codes
router.get('/promocodes', ctrl.promoCodes);
router.get('/promocodes/:id', ctrl.promoCodeDetails);
router.post('/promocodes', ctrl.createPromoCode);
router.put('/promocodes/:id', ctrl.updatePromoCode);
router.delete('/promocodes/:id', ctrl.deletePromoCode);
router.patch('/promocodes/:id/status', ctrl.updatePromoCodeStatus);

router.post('/promocodes/:id/assign-customer', ctrl.assignPromoToCustomer);
router.post('/promocodes/:id/assign-seller', ctrl.assignPromoToSeller);
router.get('/promocodes/:id/usages', ctrl.promoCodeUsages);

// Banners
router.get('/banners', ctrl.banners);
router.get('/banners/:id', ctrl.bannerDetails);
router.post('/banners', uploadBanner.single('image'), ctrl.createBanner);
router.put('/banners/:id', uploadBanner.single('image'), ctrl.updateBanner);
router.delete('/banners/:id', ctrl.deleteBanner);
router.patch('/banners/:id/status', ctrl.updateBannerStatus);

// Reports Dashboard
router.get('/reports/dashboard', reportCtrl.dashboard);
router.get('/reports/sales-chart', reportCtrl.salesChart);
router.get('/reports/orders-chart', reportCtrl.ordersChart);
router.get('/reports/top-products', reportCtrl.topProducts);
router.get('/reports/top-sellers', reportCtrl.topSellers);
router.get('/reports/low-stock', reportCtrl.lowStock);

// Reports - Sales & Revenue
router.get('/reports/sales', reportCtrl.salesReport);
router.get('/reports/revenue', reportCtrl.revenueReport);
router.get('/reports/revenue/monthly', reportCtrl.monthlyRevenue);
router.get('/reports/revenue/seller-wise', reportCtrl.sellerWiseRevenue);

// Reports - Orders, Customers, Sellers
router.get('/reports/orders', reportCtrl.ordersReport);
router.get('/reports/customers', reportCtrl.customersReport);
router.get('/reports/sellers', reportCtrl.sellersReport);

// Reports - Products, Categories, Inventory
router.get('/reports/products', reportCtrl.productsReport);
router.get('/reports/categories', reportCtrl.categoriesReport);
router.get('/reports/inventory', reportCtrl.inventoryReport);
router.get('/reports/inventory-movement', reportCtrl.inventoryMovementReport);

// Notifications
router.get('/notifications', ctrl.notifications);
router.get('/notifications/:id', ctrl.notificationDetails);
router.post('/notifications', ctrl.createNotification);
router.post('/notifications/send-customer', ctrl.sendCustomerNotification);
router.post('/notifications/send-seller', ctrl.sendSellerNotification);
router.post('/notifications/send-all', ctrl.sendAllNotification);
router.delete('/notifications/:id', ctrl.deleteNotification);

// Platform Settings
router.get('/settings', ctrl.getSettings);
router.put('/settings', ctrl.updateSettings);
router.patch('/settings/status', ctrl.updatePlatformStatus);
router.patch('/settings/delivery', ctrl.updateDeliverySettings);
router.patch('/settings/commission', ctrl.updateCommissionSettings);
router.patch('/settings/notification', ctrl.updateNotificationSettings);

// Audit Logs
router.get('/audit-logs', ctrl.auditLogs);
router.get('/audit-logs/:id', ctrl.auditLogDetails);

router.get('/reviews', ctrl.reviews);
router.patch('/reviews/:id/approve', ctrl.approveReview);
router.patch('/reviews/:id/reject', ctrl.rejectReview);

router.get('/contact-queries', ctrl.contactQueries);
router.get('/contact-queries/:id', ctrl.contactQueryDetails);
router.patch('/contact-queries/:id/status', ctrl.updateContactQueryStatus);

router.get('/files', ctrl.files);
router.post('/files/upload', uploadProfile.single('file'), ctrl.uploadFile);
router.delete('/files/:id', ctrl.deleteFile);

router.get('/reports/payments', reportCtrl.paymentsReport);
router.get('/reports/promocodes', reportCtrl.promocodesReport);
router.post('/reports/export', reportCtrl.exportReport);

module.exports = router;