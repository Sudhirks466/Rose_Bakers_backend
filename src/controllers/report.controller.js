const ReportRepository = require('./../repositories/report.repository');

class ReportService {
   constructor() {
      this.reportRepo = new ReportRepository();
   }

   getDateRange(query = {}) {
      const { fromDate, toDate, range = 'today' } = query;

      let start;
      let end = new Date();

      if (fromDate && toDate) {
         start = new Date(fromDate);
         end = new Date(toDate);
         end.setHours(23, 59, 59, 999);
         return { start, end };
      }

      const now = new Date();

      if (range === 'today') {
         start = new Date(now.setHours(0, 0, 0, 0));
         end = new Date();
      } else if (range === 'yesterday') {
         start = new Date();
         start.setDate(start.getDate() - 1);
         start.setHours(0, 0, 0, 0);

         end = new Date(start);
         end.setHours(23, 59, 59, 999);
      } else if (range === 'this_week') {
         start = new Date();
         start.setDate(start.getDate() - start.getDay());
         start.setHours(0, 0, 0, 0);
      } else if (range === 'this_month') {
         start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      } else if (range === 'this_year') {
         start = new Date(new Date().getFullYear(), 0, 1);
      } else {
         start = new Date();
         start.setHours(0, 0, 0, 0);
      }

      return { start, end };
   }

   async dashboard(query) {
      const dateRange = this.getDateRange(query);

      const [
         salesSummary,
         orderSummary,
         customerSummary,
         sellerSummary,
         productSummary,
         stockSummary,
         paymentSummary
      ] = await Promise.all([
         this.reportRepo.salesSummary(dateRange),
         this.reportRepo.orderSummary(dateRange),
         this.reportRepo.customerSummary(dateRange),
         this.reportRepo.sellerSummary(dateRange),
         this.reportRepo.productSummary(),
         this.reportRepo.stockSummary(),
         this.reportRepo.paymentSummary(dateRange)
      ]);

      return {
         dateRange,
         salesSummary,
         orderSummary,
         customerSummary,
         sellerSummary,
         productSummary,
         stockSummary,
         paymentSummary
      };
   }

   salesChart(query) {
      const dateRange = this.getDateRange(query);
      return this.reportRepo.salesChart(dateRange, query.groupBy || 'day');
   }

   ordersChart(query) {
      const dateRange = this.getDateRange(query);
      return this.reportRepo.ordersChart(dateRange, query.groupBy || 'day');
   }

   topProducts(query) {
      const dateRange = this.getDateRange(query);
      return this.reportRepo.topProducts(dateRange, Number(query.limit || 10));
   }

   topSellers(query) {
      const dateRange = this.getDateRange(query);
      return this.reportRepo.topSellers(dateRange, Number(query.limit || 10));
   }

   lowStock(query) {
      return this.reportRepo.lowStock(Number(query.limit || 20));
   }

   salesReport = async (req, res) => {
      try {
         const data = await this.service.salesReport(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Sales report fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   revenueReport = async (req, res) => {
      try {
         const data = await this.service.revenueReport(req.query);
         return this.commonSuccessResponse(res, data, '', 'Revenue report fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   monthlyRevenue = async (req, res) => {
      try {
         const data = await this.service.monthlyRevenue(req.query);
         return this.commonSuccessResponse(res, data, '', 'Monthly revenue fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   sellerWiseRevenue = async (req, res) => {
      try {
         const data = await this.service.sellerWiseRevenue(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Seller wise revenue fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   ordersReport = async (req, res) => {
      try {
         const data = await this.service.ordersReport(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Orders report fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   customersReport = async (req, res) => {
      try {
         const data = await this.service.customersReport(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Customers report fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   sellersReport = async (req, res) => {
      try {
         const data = await this.service.sellersReport(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Sellers report fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   productsReport = async (req, res) => {
      try {
         const data = await this.service.productsReport(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Products report fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   categoriesReport = async (req, res) => {
      try {
         const data = await this.service.categoriesReport(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Categories report fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   inventoryReport = async (req, res) => {
      try {
         const data = await this.service.inventoryReport(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Inventory report fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
   };

   inventoryMovementReport = async (req, res) => {
      try {
         const data = await this.service.inventoryMovementReport(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Inventory movement report fetched');
      } catch (e) {
         return this.commonErrorResponse(res, e.message);
      }
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

   paymentsReport = async (req, res) => {
      try {
         const data = await this.service.paymentsReport(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Payments report fetched');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };

   promocodesReport = async (req, res) => {
      try {
         const data = await this.service.promocodesReport(req.query);
         return this.commonSuccessResponse(res, data.data, data.pagination, 'Promocodes report fetched');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };

   exportReport = async (req, res) => {
      try {
         const data = await this.service.exportReport(req.user.sub, req.body);
         return this.commonSuccessResponse(res, data, '', 'Report export created');
      } catch (e) { return this.commonErrorResponse(res, e.message); }
   };
}

module.exports = ReportService;