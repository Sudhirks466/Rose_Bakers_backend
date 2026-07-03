const Order = require('../models/Order.model');
const OrderItem = require('../models/OrderItem.model');
const User = require('../models/User.model');
const SellerProfile = require('../models/SellerProfile.model');
const Product = require('../models/Product.model');
const Inventory = require('../models/Inventory.model');
const Payment = require('../models/Payment.model');
const SellerAccount = require('../models/SellerAccount.model');
const Category = require('../models/Category.model');
const InventoryTransaction = require('../models/InventoryTransaction.model');
const PromoCodeUsage = require('../models/PromoCodeUsage.model');
const Report = require('../models/Report.model');

class ReportRepository {
   dateMatch(dateRange) {
      return {
         createdAt: {
            $gte: dateRange.start,
            $lte: dateRange.end
         }
      };
   }

   getDateFormat(groupBy) {
      if (groupBy === 'month') return '%Y-%m';
      if (groupBy === 'year') return '%Y';
      return '%Y-%m-%d';
   }

   async salesSummary(dateRange) {
      const result = await Order.aggregate([
         {
            $match: {
               ...this.dateMatch(dateRange),
               orderStatus: { $ne: 'CANCELLED' }
            }
         },
         {
            $group: {
               _id: null,
               totalOrders: { $sum: 1 },
               grossSales: { $sum: '$grandTotal' },
               subtotal: { $sum: '$subtotal' },
               discountAmount: { $sum: '$discountAmount' },
               deliveryCharge: { $sum: '$deliveryCharge' },
               gstAmount: { $sum: '$gstAmount' },
               averageOrderValue: { $avg: '$grandTotal' }
            }
         },
         {
            $project: {
               _id: 0,
               totalOrders: 1,
               grossSales: { $round: ['$grossSales', 2] },
               subtotal: { $round: ['$subtotal', 2] },
               discountAmount: { $round: ['$discountAmount', 2] },
               deliveryCharge: { $round: ['$deliveryCharge', 2] },
               gstAmount: { $round: ['$gstAmount', 2] },
               averageOrderValue: { $round: ['$averageOrderValue', 2] }
            }
         }
      ]);

      return result[0] || {
         totalOrders: 0,
         grossSales: 0,
         subtotal: 0,
         discountAmount: 0,
         deliveryCharge: 0,
         gstAmount: 0,
         averageOrderValue: 0
      };
   }

   async orderSummary(dateRange) {
      const result = await Order.aggregate([
         { $match: this.dateMatch(dateRange) },
         {
            $group: {
               _id: '$orderStatus',
               count: { $sum: 1 }
            }
         }
      ]);

      const summary = {
         total: 0,
         pending: 0,
         placed: 0,
         accepted: 0,
         preparing: 0,
         packed: 0,
         outForDelivery: 0,
         delivered: 0,
         cancelled: 0
      };

      result.forEach((item) => {
         summary.total += item.count;

         if (item._id === 'PENDING') summary.pending = item.count;
         if (item._id === 'PLACED') summary.placed = item.count;
         if (item._id === 'ACCEPTED') summary.accepted = item.count;
         if (item._id === 'PREPARING') summary.preparing = item.count;
         if (item._id === 'PACKED') summary.packed = item.count;
         if (item._id === 'OUT_FOR_DELIVERY') summary.outForDelivery = item.count;
         if (item._id === 'DELIVERED') summary.delivered = item.count;
         if (item._id === 'CANCELLED') summary.cancelled = item.count;
      });

      return summary;
   }

   async customerSummary(dateRange) {
      const [totalCustomers, newCustomers] = await Promise.all([
         User.countDocuments({
            roles: 'CUSTOMER',
            isDeleted: false
         }),

         User.countDocuments({
            roles: 'CUSTOMER',
            isDeleted: false,
            createdAt: {
               $gte: dateRange.start,
               $lte: dateRange.end
            }
         })
      ]);

      return {
         totalCustomers,
         newCustomers
      };
   }

   async sellerSummary(dateRange) {
      const [totalSellers, newSellers, approvedSellers, pendingSellers] = await Promise.all([
         SellerProfile.countDocuments({ isDeleted: false }),

         SellerProfile.countDocuments({
            isDeleted: false,
            createdAt: {
               $gte: dateRange.start,
               $lte: dateRange.end
            }
         }),

         SellerProfile.countDocuments({
            isDeleted: false,
            status: 'APPROVED'
         }),

         SellerProfile.countDocuments({
            isDeleted: false,
            status: 'PENDING'
         })
      ]);

      return {
         totalSellers,
         newSellers,
         approvedSellers,
         pendingSellers
      };
   }

   async productSummary() {
      const [totalProducts, activeProducts, inactiveProducts, outOfStockProducts] = await Promise.all([
         Product.countDocuments({ isDeleted: false }),

         Product.countDocuments({
            isDeleted: false,
            status: 'ACTIVE'
         }),

         Product.countDocuments({
            isDeleted: false,
            status: 'INACTIVE'
         }),

         Product.countDocuments({
            isDeleted: false,
            status: 'OUT_OF_STOCK'
         })
      ]);

      return {
         totalProducts,
         activeProducts,
         inactiveProducts,
         outOfStockProducts
      };
   }

   async stockSummary() {
      const result = await Inventory.aggregate([
         {
            $group: {
               _id: '$status',
               count: { $sum: 1 },
               totalStock: { $sum: '$currentStock' }
            }
         }
      ]);

      const summary = {
         totalInventoryItems: 0,
         totalStock: 0,
         inStock: 0,
         lowStock: 0,
         outOfStock: 0
      };

      result.forEach((item) => {
         summary.totalInventoryItems += item.count;
         summary.totalStock += item.totalStock || 0;

         if (item._id === 'IN_STOCK') summary.inStock = item.count;
         if (item._id === 'LOW_STOCK') summary.lowStock = item.count;
         if (item._id === 'OUT_OF_STOCK') summary.outOfStock = item.count;
      });

      return summary;
   }

   async paymentSummary(dateRange) {
      const result = await Payment.aggregate([
         { $match: this.dateMatch(dateRange) },
         {
            $group: {
               _id: '$paymentStatus',
               count: { $sum: 1 },
               amount: { $sum: '$amount' }
            }
         }
      ]);

      const summary = {
         pending: { count: 0, amount: 0 },
         paid: { count: 0, amount: 0 },
         failed: { count: 0, amount: 0 },
         refunded: { count: 0, amount: 0 }
      };

      result.forEach((item) => {
         const key = String(item._id || '').toLowerCase();

         if (summary[key]) {
            summary[key] = {
               count: item.count,
               amount: item.amount || 0
            };
         }
      });

      return summary;
   }

   salesChart(dateRange, groupBy = 'day') {
      return Order.aggregate([
         {
            $match: {
               ...this.dateMatch(dateRange),
               orderStatus: { $ne: 'CANCELLED' }
            }
         },
         {
            $group: {
               _id: {
                  $dateToString: {
                     format: this.getDateFormat(groupBy),
                     date: '$createdAt'
                  }
               },
               totalSales: { $sum: '$grandTotal' },
               totalOrders: { $sum: 1 }
            }
         },
         {
            $project: {
               _id: 0,
               label: '$_id',
               totalSales: { $round: ['$totalSales', 2] },
               totalOrders: 1
            }
         },
         { $sort: { label: 1 } }
      ]);
   }

   ordersChart(dateRange, groupBy = 'day') {
      return Order.aggregate([
         { $match: this.dateMatch(dateRange) },
         {
            $group: {
               _id: {
                  date: {
                     $dateToString: {
                        format: this.getDateFormat(groupBy),
                        date: '$createdAt'
                     }
                  },
                  status: '$orderStatus'
               },
               count: { $sum: 1 }
            }
         },
         {
            $project: {
               _id: 0,
               label: '$_id.date',
               status: '$_id.status',
               count: 1
            }
         },
         { $sort: { label: 1 } }
      ]);
   }

   topProducts(dateRange, limit = 10) {
      return OrderItem.aggregate([
         {
            $lookup: {
               from: 'orders',
               localField: 'orderId',
               foreignField: '_id',
               as: 'order'
            }
         },
         { $unwind: '$order' },
         {
            $match: {
               'order.createdAt': {
                  $gte: dateRange.start,
                  $lte: dateRange.end
               },
               'order.orderStatus': { $ne: 'CANCELLED' }
            }
         },
         {
            $group: {
               _id: '$productId',
               totalQuantity: { $sum: '$quantity' },
               totalRevenue: { $sum: '$totalPrice' },
               orderCount: { $sum: 1 }
            }
         },
         {
            $lookup: {
               from: 'products',
               localField: '_id',
               foreignField: '_id',
               as: 'product'
            }
         },
         { $unwind: '$product' },
         {
            $project: {
               _id: 0,
               productId: '$_id',
               productName: '$product.name',
               productImage: '$product.mainImage',
               totalQuantity: 1,
               totalRevenue: { $round: ['$totalRevenue', 2] },
               orderCount: 1
            }
         },
         { $sort: { totalQuantity: -1 } },
         { $limit: limit }
      ]);
   }

   topSellers(dateRange, limit = 10) {
      return Order.aggregate([
         {
            $match: {
               ...this.dateMatch(dateRange),
               sellerId: { $ne: null },
               orderStatus: { $ne: 'CANCELLED' }
            }
         },
         {
            $group: {
               _id: '$sellerId',
               totalOrders: { $sum: 1 },
               totalRevenue: { $sum: '$grandTotal' }
            }
         },
         {
            $lookup: {
               from: 'sellerprofiles',
               localField: '_id',
               foreignField: '_id',
               as: 'seller'
            }
         },
         { $unwind: '$seller' },
         {
            $project: {
               _id: 0,
               sellerId: '$_id',
               shopName: '$seller.shopName',
               ownerName: '$seller.ownerName',
               phone: '$seller.phone',
               totalOrders: 1,
               totalRevenue: { $round: ['$totalRevenue', 2] }
            }
         },
         { $sort: { totalRevenue: -1 } },
         { $limit: limit }
      ]);
   }

   lowStock(limit = 20) {
      return Inventory.find({
         status: { $in: ['LOW_STOCK', 'OUT_OF_STOCK'] }
      })
         .populate('productId')
         .populate('productPriceId')
         .sort({ currentStock: 1 })
         .limit(limit)
         .lean()
         .exec();
   }

   async salesReport(dateRange, query = {}) {
      const {
         page = 1,
         limit = 20,
         sellerId,
         customerId,
         orderType,
         paymentMethod,
         paymentStatus
      } = query;

      const match = {
         createdAt: {
            $gte: dateRange.start,
            $lte: dateRange.end
         },
         orderStatus: { $ne: 'CANCELLED' }
      };

      if (sellerId) match.sellerId = new require('mongoose').Types.ObjectId(sellerId);
      if (customerId) match.customerId = new require('mongoose').Types.ObjectId(customerId);
      if (orderType) match.orderType = orderType;
      if (paymentMethod) match.paymentMethod = paymentMethod;
      if (paymentStatus) match.paymentStatus = paymentStatus;

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const pipeline = [
         { $match: match },
         {
            $lookup: {
               from: 'users',
               localField: 'customerId',
               foreignField: '_id',
               as: 'customer'
            }
         },
         { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
         {
            $lookup: {
               from: 'sellerprofiles',
               localField: 'sellerId',
               foreignField: '_id',
               as: 'seller'
            }
         },
         { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
         {
            $project: {
               orderNo: 1,
               orderType: 1,
               orderStatus: 1,
               paymentMethod: 1,
               paymentStatus: 1,
               subtotal: 1,
               deliveryCharge: 1,
               gstAmount: 1,
               discountAmount: 1,
               grandTotal: 1,
               sellerPayout: 1,
               platformFee: 1,
               createdAt: 1,
               customer: {
                  _id: '$customer._id',
                  name: '$customer.name',
                  phone: '$customer.phone',
                  email: '$customer.email'
               },
               seller: {
                  _id: '$seller._id',
                  shopName: '$seller.shopName',
                  ownerName: '$seller.ownerName',
                  phone: '$seller.phone'
               }
            }
         },
         { $sort: { createdAt: -1 } },
         {
            $facet: {
               data: [
                  { $skip: skip },
                  { $limit: pageLimit }
               ],
               totalCount: [
                  { $count: 'total' }
               ],
               summary: [
                  {
                     $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        subtotal: { $sum: '$subtotal' },
                        deliveryCharge: { $sum: '$deliveryCharge' },
                        gstAmount: { $sum: '$gstAmount' },
                        discountAmount: { $sum: '$discountAmount' },
                        grandTotal: { $sum: '$grandTotal' },
                        sellerPayout: { $sum: '$sellerPayout' },
                        platformFee: { $sum: '$platformFee' }
                     }
                  }
               ]
            }
         }
      ];

      const result = await Order.aggregate(pipeline);
      const row = result[0] || {};

      const total = row.totalCount && row.totalCount[0] ? row.totalCount[0].total : 0;

      return {
         data: {
            summary: row.summary && row.summary[0]
               ? {
                  totalOrders: row.summary[0].totalOrders || 0,
                  subtotal: row.summary[0].subtotal || 0,
                  deliveryCharge: row.summary[0].deliveryCharge || 0,
                  gstAmount: row.summary[0].gstAmount || 0,
                  discountAmount: row.summary[0].discountAmount || 0,
                  grandTotal: row.summary[0].grandTotal || 0,
                  sellerPayout: row.summary[0].sellerPayout || 0,
                  platformFee: row.summary[0].platformFee || 0
               }
               : {
                  totalOrders: 0,
                  subtotal: 0,
                  deliveryCharge: 0,
                  gstAmount: 0,
                  discountAmount: 0,
                  grandTotal: 0,
                  sellerPayout: 0,
                  platformFee: 0
               },
            orders: row.data || []
         },
         pagination: {
            page: pageNo,
            limit: pageLimit,
            total,
            totalPages: Math.ceil(total / pageLimit)
         }
      };
   }

   async revenueReport(dateRange, query = {}) {
      const match = {
         createdAt: {
            $gte: dateRange.start,
            $lte: dateRange.end
         },
         orderStatus: { $ne: 'CANCELLED' }
      };

      if (query.orderType) match.orderType = query.orderType;

      const [orderRevenue, paymentRevenue, transactionRevenue] = await Promise.all([
         Order.aggregate([
            { $match: match },
            {
               $group: {
                  _id: null,
                  grossRevenue: { $sum: '$grandTotal' },
                  subtotal: { $sum: '$subtotal' },
                  deliveryRevenue: { $sum: '$deliveryCharge' },
                  gstCollected: { $sum: '$gstAmount' },
                  totalDiscount: { $sum: '$discountAmount' },
                  sellerPayout: { $sum: '$sellerPayout' },
                  platformFee: { $sum: '$platformFee' },
                  totalOrders: { $sum: 1 },
                  averageOrderValue: { $avg: '$grandTotal' }
               }
            },
            {
               $project: {
                  _id: 0,
                  grossRevenue: { $round: ['$grossRevenue', 2] },
                  subtotal: { $round: ['$subtotal', 2] },
                  deliveryRevenue: { $round: ['$deliveryRevenue', 2] },
                  gstCollected: { $round: ['$gstCollected', 2] },
                  totalDiscount: { $round: ['$totalDiscount', 2] },
                  sellerPayout: { $round: ['$sellerPayout', 2] },
                  platformFee: { $round: ['$platformFee', 2] },
                  netRevenue: {
                     $round: [
                        {
                           $subtract: [
                              '$grossRevenue',
                              '$sellerPayout'
                           ]
                        },
                        2
                     ]
                  },
                  totalOrders: 1,
                  averageOrderValue: { $round: ['$averageOrderValue', 2] }
               }
            }
         ]),

         Payment.aggregate([
            {
               $match: {
                  createdAt: {
                     $gte: dateRange.start,
                     $lte: dateRange.end
                  }
               }
            },
            {
               $group: {
                  _id: '$paymentStatus',
                  amount: { $sum: '$amount' },
                  count: { $sum: 1 }
               }
            }
         ]),

         require('../models/Transaction.model').aggregate([
            {
               $match: {
                  transactionDate: {
                     $gte: dateRange.start,
                     $lte: dateRange.end
                  }
               }
            },
            {
               $group: {
                  _id: '$transactionType',
                  amount: { $sum: '$amount' },
                  count: { $sum: 1 }
               }
            }
         ])
      ]);

      const revenue = orderRevenue[0] || {
         grossRevenue: 0,
         subtotal: 0,
         deliveryRevenue: 0,
         gstCollected: 0,
         totalDiscount: 0,
         sellerPayout: 0,
         platformFee: 0,
         netRevenue: 0,
         totalOrders: 0,
         averageOrderValue: 0
      };

      return {
         revenue,
         paymentBreakup: paymentRevenue,
         transactionBreakup: transactionRevenue
      };
   }

   monthlyRevenue(year) {
      return Order.aggregate([
         {
            $match: {
               createdAt: {
                  $gte: new Date(year, 0, 1),
                  $lte: new Date(year, 11, 31, 23, 59, 59, 999)
               },
               orderStatus: { $ne: 'CANCELLED' }
            }
         },
         {
            $group: {
               _id: { $month: '$createdAt' },
               totalOrders: { $sum: 1 },
               grossRevenue: { $sum: '$grandTotal' },
               sellerPayout: { $sum: '$sellerPayout' },
               discount: { $sum: '$discountAmount' },
               deliveryCharge: { $sum: '$deliveryCharge' }
            }
         },
         {
            $project: {
               _id: 0,
               month: '$_id',
               totalOrders: 1,
               grossRevenue: { $round: ['$grossRevenue', 2] },
               sellerPayout: { $round: ['$sellerPayout', 2] },
               discount: { $round: ['$discount', 2] },
               deliveryCharge: { $round: ['$deliveryCharge', 2] },
               netRevenue: {
                  $round: [
                     { $subtract: ['$grossRevenue', '$sellerPayout'] },
                     2
                  ]
               }
            }
         },
         { $sort: { month: 1 } }
      ]);
   }

   async sellerWiseRevenue(dateRange, query = {}) {
      const { page = 1, limit = 20, sellerId } = query;

      const match = {
         createdAt: {
            $gte: dateRange.start,
            $lte: dateRange.end
         },
         sellerId: { $ne: null },
         orderStatus: { $ne: 'CANCELLED' }
      };

      if (sellerId) {
         match.sellerId = new require('mongoose').Types.ObjectId(sellerId);
      }

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const pipeline = [
         { $match: match },
         {
            $group: {
               _id: '$sellerId',
               totalOrders: { $sum: 1 },
               grossRevenue: { $sum: '$grandTotal' },
               sellerPayout: { $sum: '$sellerPayout' },
               platformFee: { $sum: '$platformFee' },
               discountAmount: { $sum: '$discountAmount' },
               averageOrderValue: { $avg: '$grandTotal' }
            }
         },
         {
            $lookup: {
               from: 'sellerprofiles',
               localField: '_id',
               foreignField: '_id',
               as: 'seller'
            }
         },
         { $unwind: '$seller' },
         {
            $project: {
               _id: 0,
               sellerId: '$_id',
               shopName: '$seller.shopName',
               ownerName: '$seller.ownerName',
               phone: '$seller.phone',
               city: '$seller.city',
               totalOrders: 1,
               grossRevenue: { $round: ['$grossRevenue', 2] },
               sellerPayout: { $round: ['$sellerPayout', 2] },
               platformFee: { $round: ['$platformFee', 2] },
               discountAmount: { $round: ['$discountAmount', 2] },
               averageOrderValue: { $round: ['$averageOrderValue', 2] }
            }
         },
         { $sort: { grossRevenue: -1 } },
         {
            $facet: {
               data: [
                  { $skip: skip },
                  { $limit: pageLimit }
               ],
               totalCount: [
                  { $count: 'total' }
               ]
            }
         }
      ];

      const result = await Order.aggregate(pipeline);
      const row = result[0] || {};
      const total = row.totalCount && row.totalCount[0] ? row.totalCount[0].total : 0;

      return {
         data: row.data || [],
         pagination: {
            page: pageNo,
            limit: pageLimit,
            total,
            totalPages: Math.ceil(total / pageLimit)
         }
      };
   }

   ordersReport(query) {
      const dateRange = this.getDateRange(query);
      return this.reportRepo.ordersReport(dateRange, query);
   }

   customersReport(query) {
      const dateRange = this.getDateRange(query);
      return this.reportRepo.customersReport(dateRange, query);
   }

   sellersReport(query) {
      const dateRange = this.getDateRange(query);
      return this.reportRepo.sellersReport(dateRange, query);
   }

   async ordersReport(dateRange, query = {}) {
      const {
         page = 1,
         limit = 20,
         orderStatus,
         paymentStatus,
         orderType,
         sellerId,
         customerId
      } = query;

      const match = {
         createdAt: {
            $gte: dateRange.start,
            $lte: dateRange.end
         }
      };

      if (orderStatus) match.orderStatus = orderStatus;
      if (paymentStatus) match.paymentStatus = paymentStatus;
      if (orderType) match.orderType = orderType;

      if (sellerId) {
         match.sellerId = new require('mongoose').Types.ObjectId(sellerId);
      }

      if (customerId) {
         match.customerId = new require('mongoose').Types.ObjectId(customerId);
      }

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const pipeline = [
         { $match: match },
         {
            $lookup: {
               from: 'users',
               localField: 'customerId',
               foreignField: '_id',
               as: 'customer'
            }
         },
         { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
         {
            $lookup: {
               from: 'sellerprofiles',
               localField: 'sellerId',
               foreignField: '_id',
               as: 'seller'
            }
         },
         { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
         {
            $project: {
               orderNo: 1,
               orderType: 1,
               orderStatus: 1,
               paymentMethod: 1,
               paymentStatus: 1,
               subtotal: 1,
               deliveryCharge: 1,
               gstAmount: 1,
               discountAmount: 1,
               grandTotal: 1,
               sellerPayout: 1,
               platformFee: 1,
               createdAt: 1,
               deliveredAt: 1,
               cancelledAt: 1,
               cancellationReason: 1,
               customer: {
                  _id: '$customer._id',
                  name: '$customer.name',
                  phone: '$customer.phone',
                  email: '$customer.email'
               },
               seller: {
                  _id: '$seller._id',
                  shopName: '$seller.shopName',
                  ownerName: '$seller.ownerName',
                  phone: '$seller.phone'
               }
            }
         },
         { $sort: { createdAt: -1 } },
         {
            $facet: {
               data: [
                  { $skip: skip },
                  { $limit: pageLimit }
               ],
               totalCount: [
                  { $count: 'total' }
               ],
               statusSummary: [
                  {
                     $group: {
                        _id: '$orderStatus',
                        count: { $sum: 1 },
                        amount: { $sum: '$grandTotal' }
                     }
                  }
               ],
               paymentSummary: [
                  {
                     $group: {
                        _id: '$paymentStatus',
                        count: { $sum: 1 },
                        amount: { $sum: '$grandTotal' }
                     }
                  }
               ],
               orderTypeSummary: [
                  {
                     $group: {
                        _id: '$orderType',
                        count: { $sum: 1 },
                        amount: { $sum: '$grandTotal' }
                     }
                  }
               ]
            }
         }
      ];

      const result = await Order.aggregate(pipeline);
      const row = result[0] || {};
      const total = row.totalCount && row.totalCount[0] ? row.totalCount[0].total : 0;

      return {
         data: {
            orders: row.data || [],
            statusSummary: row.statusSummary || [],
            paymentSummary: row.paymentSummary || [],
            orderTypeSummary: row.orderTypeSummary || []
         },
         pagination: {
            page: pageNo,
            limit: pageLimit,
            total,
            totalPages: Math.ceil(total / pageLimit)
         }
      };
   }

   async customersReport(dateRange, query = {}) {
      const {
         page = 1,
         limit = 20,
         search,
         minOrders,
         minSpent
      } = query;

      const matchUser = {
         roles: 'CUSTOMER',
         isDeleted: false
      };

      if (search) {
         matchUser.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
         ];
      }

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const pipeline = [
         { $match: matchUser },
         {
            $lookup: {
               from: 'orders',
               let: { customerId: '$_id' },
               pipeline: [
                  {
                     $match: {
                        $expr: { $eq: ['$customerId', '$$customerId'] },
                        createdAt: {
                           $gte: dateRange.start,
                           $lte: dateRange.end
                        },
                        orderStatus: { $ne: 'CANCELLED' }
                     }
                  }
               ],
               as: 'orders'
            }
         },
         {
            $addFields: {
               totalOrders: { $size: '$orders' },
               totalSpent: { $sum: '$orders.grandTotal' },
               lastOrderAt: { $max: '$orders.createdAt' },
               averageOrderValue: {
                  $cond: [
                     { $gt: [{ $size: '$orders' }, 0] },
                     { $divide: [{ $sum: '$orders.grandTotal' }, { $size: '$orders' }] },
                     0
                  ]
               }
            }
         },
         {
            $match: {
               ...(minOrders ? { totalOrders: { $gte: Number(minOrders) } } : {}),
               ...(minSpent ? { totalSpent: { $gte: Number(minSpent) } } : {})
            }
         },
         {
            $project: {
               _id: 1,
               name: 1,
               firstName: 1,
               lastName: 1,
               email: 1,
               phone: 1,
               status: 1,
               roles: 1,
               createdAt: 1,
               totalOrders: 1,
               totalSpent: { $round: ['$totalSpent', 2] },
               averageOrderValue: { $round: ['$averageOrderValue', 2] },
               lastOrderAt: 1
            }
         },
         { $sort: { totalSpent: -1, totalOrders: -1 } },
         {
            $facet: {
               data: [
                  { $skip: skip },
                  { $limit: pageLimit }
               ],
               totalCount: [
                  { $count: 'total' }
               ],
               summary: [
                  {
                     $group: {
                        _id: null,
                        totalCustomers: { $sum: 1 },
                        activeCustomers: {
                           $sum: {
                              $cond: [{ $gt: ['$totalOrders', 0] }, 1, 0]
                           }
                        },
                        totalOrders: { $sum: '$totalOrders' },
                        totalSpent: { $sum: '$totalSpent' },
                        averageCustomerValue: { $avg: '$totalSpent' }
                     }
                  }
               ]
            }
         }
      ];

      const result = await User.aggregate(pipeline);
      const row = result[0] || {};
      const total = row.totalCount && row.totalCount[0] ? row.totalCount[0].total : 0;

      return {
         data: {
            customers: row.data || [],
            summary: row.summary && row.summary[0]
               ? row.summary[0]
               : {
                  totalCustomers: 0,
                  activeCustomers: 0,
                  totalOrders: 0,
                  totalSpent: 0,
                  averageCustomerValue: 0
               }
         },
         pagination: {
            page: pageNo,
            limit: pageLimit,
            total,
            totalPages: Math.ceil(total / pageLimit)
         }
      };
   }

   async sellersReport(dateRange, query = {}) {
      const {
         page = 1,
         limit = 20,
         search,
         status
      } = query;

      const matchSeller = {
         isDeleted: false
      };

      if (status) matchSeller.status = status;

      if (search) {
         matchSeller.$or = [
            { shopName: { $regex: search, $options: 'i' } },
            { ownerName: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
         ];
      }

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const pipeline = [
         { $match: matchSeller },
         {
            $lookup: {
               from: 'orders',
               let: { sellerId: '$_id' },
               pipeline: [
                  {
                     $match: {
                        $expr: { $eq: ['$sellerId', '$$sellerId'] },
                        createdAt: {
                           $gte: dateRange.start,
                           $lte: dateRange.end
                        },
                        orderStatus: { $ne: 'CANCELLED' }
                     }
                  }
               ],
               as: 'orders'
            }
         },
         {
            $lookup: {
               from: 'selleraccounts',
               localField: '_id',
               foreignField: 'sellerId',
               as: 'account'
            }
         },
         { $unwind: { path: '$account', preserveNullAndEmptyArrays: true } },
         {
            $addFields: {
               totalOrders: { $size: '$orders' },
               grossRevenue: { $sum: '$orders.grandTotal' },
               sellerPayout: { $sum: '$orders.sellerPayout' },
               platformFee: { $sum: '$orders.platformFee' },
               lastOrderAt: { $max: '$orders.createdAt' }
            }
         },
         {
            $project: {
               _id: 1,
               userId: 1,
               shopName: 1,
               ownerName: 1,
               phone: 1,
               email: 1,
               city: 1,
               status: 1,
               createdAt: 1,
               totalOrders: 1,
               grossRevenue: { $round: ['$grossRevenue', 2] },
               sellerPayout: { $round: ['$sellerPayout', 2] },
               platformFee: { $round: ['$platformFee', 2] },
               lastOrderAt: 1,
               totalPurchaseAmount: { $ifNull: ['$account.totalPurchaseAmount', 0] },
               totalPaidAmount: { $ifNull: ['$account.totalPaidAmount', 0] },
               outstandingAmount: { $ifNull: ['$account.outstandingAmount', 0] },
               creditLimit: { $ifNull: ['$account.creditLimit', 0] },
               accountStatus: { $ifNull: ['$account.accountStatus', 'NA'] }
            }
         },
         { $sort: { grossRevenue: -1, totalOrders: -1 } },
         {
            $facet: {
               data: [
                  { $skip: skip },
                  { $limit: pageLimit }
               ],
               totalCount: [
                  { $count: 'total' }
               ],
               summary: [
                  {
                     $group: {
                        _id: null,
                        totalSellers: { $sum: 1 },
                        activeSellers: {
                           $sum: {
                              $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0]
                           }
                        },
                        totalOrders: { $sum: '$totalOrders' },
                        grossRevenue: { $sum: '$grossRevenue' },
                        sellerPayout: { $sum: '$sellerPayout' },
                        platformFee: { $sum: '$platformFee' },
                        outstandingAmount: { $sum: '$outstandingAmount' },
                        totalPaidAmount: { $sum: '$totalPaidAmount' }
                     }
                  }
               ]
            }
         }
      ];

      const result = await SellerProfile.aggregate(pipeline);
      const row = result[0] || {};
      const total = row.totalCount && row.totalCount[0] ? row.totalCount[0].total : 0;

      return {
         data: {
            sellers: row.data || [],
            summary: row.summary && row.summary[0]
               ? row.summary[0]
               : {
                  totalSellers: 0,
                  activeSellers: 0,
                  totalOrders: 0,
                  grossRevenue: 0,
                  sellerPayout: 0,
                  platformFee: 0,
                  outstandingAmount: 0,
                  totalPaidAmount: 0
               }
         },
         pagination: {
            page: pageNo,
            limit: pageLimit,
            total,
            totalPages: Math.ceil(total / pageLimit)
         }
      };
   }

   async productsReport(dateRange, query = {}) {
      const { page = 1, limit = 20, categoryId, search } = query;

      const matchProduct = { isDeleted: false };

      if (categoryId) {
         matchProduct.categoryId = new require('mongoose').Types.ObjectId(categoryId);
      }

      if (search) {
         matchProduct.$or = [
            { name: { $regex: search, $options: 'i' } },
            { productCode: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } }
         ];
      }

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const pipeline = [
         { $match: matchProduct },
         {
            $lookup: {
               from: 'categories',
               localField: 'categoryId',
               foreignField: '_id',
               as: 'category'
            }
         },
         { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
         {
            $lookup: {
               from: 'orderitems',
               let: { productId: '$_id' },
               pipeline: [
                  {
                     $lookup: {
                        from: 'orders',
                        localField: 'orderId',
                        foreignField: '_id',
                        as: 'order'
                     }
                  },
                  { $unwind: '$order' },
                  {
                     $match: {
                        $expr: { $eq: ['$productId', '$$productId'] },
                        'order.createdAt': {
                           $gte: dateRange.start,
                           $lte: dateRange.end
                        },
                        'order.orderStatus': { $ne: 'CANCELLED' }
                     }
                  }
               ],
               as: 'soldItems'
            }
         },
         {
            $lookup: {
               from: 'inventories',
               localField: '_id',
               foreignField: 'productId',
               as: 'inventory'
            }
         },
         {
            $addFields: {
               totalSoldQty: { $sum: '$soldItems.quantity' },
               totalRevenue: { $sum: '$soldItems.totalPrice' },
               orderCount: { $size: '$soldItems' },
               currentStock: { $sum: '$inventory.currentStock' },
               reservedStock: { $sum: '$inventory.reservedStock' }
            }
         },
         {
            $project: {
               name: 1,
               slug: 1,
               productCode: 1,
               mainImage: 1,
               status: 1,
               isActive: 1,
               createdAt: 1,
               category: {
                  _id: '$category._id',
                  name: '$category.name',
                  slug: '$category.slug'
               },
               totalSoldQty: 1,
               totalRevenue: { $round: ['$totalRevenue', 2] },
               orderCount: 1,
               currentStock: 1,
               reservedStock: 1
            }
         },
         { $sort: { totalRevenue: -1, totalSoldQty: -1 } },
         {
            $facet: {
               data: [{ $skip: skip }, { $limit: pageLimit }],
               totalCount: [{ $count: 'total' }],
               summary: [
                  {
                     $group: {
                        _id: null,
                        totalProducts: { $sum: 1 },
                        totalSoldQty: { $sum: '$totalSoldQty' },
                        totalRevenue: { $sum: '$totalRevenue' },
                        totalStock: { $sum: '$currentStock' }
                     }
                  }
               ]
            }
         }
      ];

      const result = await Product.aggregate(pipeline);
      const row = result[0] || {};
      const total = row.totalCount && row.totalCount[0] ? row.totalCount[0].total : 0;

      return {
         data: {
            products: row.data || [],
            summary: row.summary && row.summary[0] ? row.summary[0] : {
               totalProducts: 0,
               totalSoldQty: 0,
               totalRevenue: 0,
               totalStock: 0
            }
         },
         pagination: {
            page: pageNo,
            limit: pageLimit,
            total,
            totalPages: Math.ceil(total / pageLimit)
         }
      };
   }

   async categoriesReport(dateRange, query = {}) {
      const { page = 1, limit = 20, search } = query;

      const matchCategory = { isDeleted: false };

      if (search) {
         matchCategory.$or = [
            { name: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } }
         ];
      }

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const pipeline = [
         { $match: matchCategory },
         {
            $lookup: {
               from: 'products',
               localField: '_id',
               foreignField: 'categoryId',
               as: 'products'
            }
         },
         {
            $lookup: {
               from: 'orderitems',
               let: { productIds: '$products._id' },
               pipeline: [
                  {
                     $lookup: {
                        from: 'orders',
                        localField: 'orderId',
                        foreignField: '_id',
                        as: 'order'
                     }
                  },
                  { $unwind: '$order' },
                  {
                     $match: {
                        $expr: { $in: ['$productId', '$$productIds'] },
                        'order.createdAt': {
                           $gte: dateRange.start,
                           $lte: dateRange.end
                        },
                        'order.orderStatus': { $ne: 'CANCELLED' }
                     }
                  }
               ],
               as: 'soldItems'
            }
         },
         {
            $addFields: {
               totalProducts: { $size: '$products' },
               activeProducts: {
                  $size: {
                     $filter: {
                        input: '$products',
                        as: 'p',
                        cond: { $eq: ['$$p.status', 'ACTIVE'] }
                     }
                  }
               },
               totalSoldQty: { $sum: '$soldItems.quantity' },
               totalRevenue: { $sum: '$soldItems.totalPrice' },
               orderCount: { $size: '$soldItems' }
            }
         },
         {
            $project: {
               name: 1,
               slug: 1,
               image: 1,
               isActive: 1,
               sortOrder: 1,
               totalProducts: 1,
               activeProducts: 1,
               totalSoldQty: 1,
               totalRevenue: { $round: ['$totalRevenue', 2] },
               orderCount: 1
            }
         },
         { $sort: { totalRevenue: -1, totalSoldQty: -1 } },
         {
            $facet: {
               data: [{ $skip: skip }, { $limit: pageLimit }],
               totalCount: [{ $count: 'total' }],
               summary: [
                  {
                     $group: {
                        _id: null,
                        totalCategories: { $sum: 1 },
                        totalProducts: { $sum: '$totalProducts' },
                        totalSoldQty: { $sum: '$totalSoldQty' },
                        totalRevenue: { $sum: '$totalRevenue' }
                     }
                  }
               ]
            }
         }
      ];

      const result = await Category.aggregate(pipeline);
      const row = result[0] || {};
      const total = row.totalCount && row.totalCount[0] ? row.totalCount[0].total : 0;

      return {
         data: {
            categories: row.data || [],
            summary: row.summary && row.summary[0] ? row.summary[0] : {
               totalCategories: 0,
               totalProducts: 0,
               totalSoldQty: 0,
               totalRevenue: 0
            }
         },
         pagination: {
            page: pageNo,
            limit: pageLimit,
            total,
            totalPages: Math.ceil(total / pageLimit)
         }
      };
   }

   async inventoryReport(query = {}) {
      const { page = 1, limit = 20, status, productId } = query;

      const match = {};
      if (status) match.status = status;
      if (productId) match.productId = new require('mongoose').Types.ObjectId(productId);

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const pipeline = [
         { $match: match },
         {
            $lookup: {
               from: 'products',
               localField: 'productId',
               foreignField: '_id',
               as: 'product'
            }
         },
         { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
         {
            $lookup: {
               from: 'productvariantprices',
               localField: 'productPriceId',
               foreignField: '_id',
               as: 'price'
            }
         },
         { $unwind: { path: '$price', preserveNullAndEmptyArrays: true } },
         {
            $project: {
               productId: 1,
               productPriceId: 1,
               currentStock: 1,
               reservedStock: 1,
               minStock: 1,
               unit: 1,
               status: 1,
               lastUpdatedAt: 1,
               product: {
                  _id: '$product._id',
                  name: '$product.name',
                  mainImage: '$product.mainImage',
                  status: '$product.status'
               },
               price: {
                  _id: '$price._id',
                  customerPrice: '$price.customerPrice',
                  sellerPurchasePrice: '$price.sellerPurchasePrice'
               }
            }
         },
         { $sort: { currentStock: 1 } },
         {
            $facet: {
               data: [{ $skip: skip }, { $limit: pageLimit }],
               totalCount: [{ $count: 'total' }],
               summary: [
                  {
                     $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalStock: { $sum: '$currentStock' },
                        reservedStock: { $sum: '$reservedStock' }
                     }
                  }
               ]
            }
         }
      ];

      const result = await Inventory.aggregate(pipeline);
      const row = result[0] || {};
      const total = row.totalCount && row.totalCount[0] ? row.totalCount[0].total : 0;

      return {
         data: {
            inventory: row.data || [],
            summary: row.summary || []
         },
         pagination: {
            page: pageNo,
            limit: pageLimit,
            total,
            totalPages: Math.ceil(total / pageLimit)
         }
      };
   }

   async inventoryMovementReport(dateRange, query = {}) {
      const { page = 1, limit = 20, productId, type } = query;

      const match = {
         createdAt: {
            $gte: dateRange.start,
            $lte: dateRange.end
         }
      };

      if (productId) match.productId = new require('mongoose').Types.ObjectId(productId);
      if (type) match.type = type;

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const pipeline = [
         { $match: match },
         {
            $lookup: {
               from: 'products',
               localField: 'productId',
               foreignField: '_id',
               as: 'product'
            }
         },
         { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
         {
            $lookup: {
               from: 'users',
               localField: 'createdBy',
               foreignField: '_id',
               as: 'createdByUser'
            }
         },
         { $unwind: { path: '$createdByUser', preserveNullAndEmptyArrays: true } },
         {
            $project: {
               inventoryId: 1,
               productId: 1,
               type: 1,
               quantity: 1,
               previousStock: 1,
               newStock: 1,
               note: 1,
               createdAt: 1,
               product: {
                  _id: '$product._id',
                  name: '$product.name',
                  mainImage: '$product.mainImage'
               },
               createdBy: {
                  _id: '$createdByUser._id',
                  name: '$createdByUser.name',
                  email: '$createdByUser.email'
               }
            }
         },
         { $sort: { createdAt: -1 } },
         {
            $facet: {
               data: [{ $skip: skip }, { $limit: pageLimit }],
               totalCount: [{ $count: 'total' }],
               summary: [
                  {
                     $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                        quantity: { $sum: '$quantity' }
                     }
                  }
               ]
            }
         }
      ];

      const result = await InventoryTransaction.aggregate(pipeline);
      const row = result[0] || {};
      const total = row.totalCount && row.totalCount[0] ? row.totalCount[0].total : 0;

      return {
         data: {
            movements: row.data || [],
            summary: row.summary || []
         },
         pagination: {
            page: pageNo,
            limit: pageLimit,
            total,
            totalPages: Math.ceil(total / pageLimit)
         }
      };
   }

   paymentsReport(query) {
      const dateRange = this.getDateRange(query);
      return this.reportRepo.paymentsReport(dateRange, query);
   }

   promocodesReport(query) {
      const dateRange = this.getDateRange(query);
      return this.reportRepo.promocodesReport(dateRange, query);
   }

   async exportReport(adminId, body) {
      const { reportType, format = 'CSV', filters = {} } = body;
      if (!reportType) throw new Error('Report type is required');

      return this.reportRepo.createExportReport({
         reportName: `${reportType}_${Date.now()}`,
         reportType,
         format,
         status: 'READY',
         filters,
         generatedBy: adminId,
         generatedAt: new Date(),
         fileUrl: ''
      });
   }

   async paymentsReport(dateRange, query = {}) {
      const { page = 1, limit = 20, paymentStatus, paymentMethod } = query;
      const filter = {
         createdAt: { $gte: dateRange.start, $lte: dateRange.end }
      };

      if (paymentStatus) filter.paymentStatus = paymentStatus;
      if (paymentMethod) filter.paymentMethod = paymentMethod;

      const skip = (Number(page) - 1) * Number(limit);

      const [data, total, summary] = await Promise.all([
         Payment.find(filter).populate('orderId').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean().exec(),
         Payment.countDocuments(filter),
         Payment.aggregate([
            { $match: filter },
            { $group: { _id: '$paymentStatus', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
         ])
      ]);

      return {
         data: { payments: data, summary },
         pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
         }
      };
   }

   async promocodesReport(dateRange, query = {}) {
      const { page = 1, limit = 20, promoType } = query;

      const match = {
         createdAt: { $gte: dateRange.start, $lte: dateRange.end }
      };

      if (promoType) match.promoType = promoType;

      const skip = (Number(page) - 1) * Number(limit);

      const [data, total] = await Promise.all([
         PromoCodeUsage.find(match)
            .populate('promoCodeId', 'code title promoType')
            .populate('userId', 'name email phone')
            .populate('sellerId', 'shopName ownerName phone')
            .populate('orderId', 'orderNo grandTotal')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean()
            .exec(),
         PromoCodeUsage.countDocuments(match)
      ]);

      const summary = await PromoCodeUsage.aggregate([
         { $match: match },
         {
            $group: {
               _id: '$promoType',
               usedCount: { $sum: 1 },
               discountAmount: { $sum: '$discountAmount' },
               revenueAfterDiscount: { $sum: '$orderAmountAfterDiscount' }
            }
         }
      ]);

      return {
         data: { usages: data, summary },
         pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
         }
      };
   }

   createExportReport(data) {
      return Report.create(data);
   }
}

module.exports = ReportRepository;