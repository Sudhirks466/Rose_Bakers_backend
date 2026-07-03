const BaseRepository = require('./base.repository');
const Order = require('../models/Order.model');

class OrderRepository extends BaseRepository {
   constructor() {
      super(Order);
      this.order = Order;
   }

   findByCustomerId(customerId) {
      return this.order
         .find({ customerId })
         .sort({ createdAt: -1 })
         .lean()
         .exec();
   }

   findCustomerOrderById(customerId, id) {
      return this.order
         .findOne({ _id: id, customerId })
         .lean()
         .exec();
   }

   findCustomerOrderRawById(customerId, id) {
      return this.order
         .findOne({ _id: id, customerId })
         .exec();
   }

   findDetailsById(id) {
      return this.order
         .findById(id)
         .lean()
         .exec();
   }

   findRawById(id) {
      return this.order
         .findById(id)
         .exec();
   }

   async findAdminOrders(query = {}) {
      const {
         page = 1,
         limit = 10,
         search,
         orderStatus,
         paymentStatus,
         orderType,
         sellerId,
         customerId,
         fromDate,
         toDate
      } = query;

      const filter = {};

      if (orderStatus) filter.orderStatus = orderStatus;
      if (paymentStatus) filter.paymentStatus = paymentStatus;
      if (orderType) filter.orderType = orderType;
      if (sellerId) filter.sellerId = sellerId;
      if (customerId) filter.customerId = customerId;

      if (fromDate || toDate) {
         filter.createdAt = {};
         if (fromDate) filter.createdAt.$gte = new Date(fromDate);
         if (toDate) filter.createdAt.$lte = new Date(toDate);
      }

      if (search) {
         filter.$or = [
            { orderNo: { $regex: search, $options: 'i' } },
            { 'deliveryAddress.fullName': { $regex: search, $options: 'i' } },
            { 'deliveryAddress.mobile': { $regex: search, $options: 'i' } }
         ];
      }

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const [data, total] = await Promise.all([
         this.order
            .find(filter)
            .populate('customerId', 'name email phone')
            .populate('sellerId', 'shopName ownerName phone city status')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .lean()
            .exec(),

         this.order.countDocuments(filter)
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

   findAdminOrderById(id) {
      return this.order
         .findById(id)
         .populate('customerId', 'name email phone profilePic')
         .populate('sellerId', 'shopName ownerName phone email city status')
         .lean()
         .exec();
   }

   findLatestOrders(limit = 10) {
      return this.order
         .find({})
         .populate('customerId', 'name email phone')
         .sort({ createdAt: -1 })
         .limit(Number(limit))
         .lean()
         .exec();
   }

   sellerOrderSummary(sellerId) {
      return this.order.aggregate([
         {
            $match: {
               sellerId: sellerId
            }
         },
         {
            $group: {
               _id: '$orderStatus',
               count: { $sum: 1 },
               amount: { $sum: '$grandTotal' }
            }
         }
      ]);
   }

   findSellerLatestOrders(sellerId, limit = 10) {
      return this.order
         .find({ sellerId })
         .populate('customerId', 'name email phone')
         .sort({ createdAt: -1 })
         .limit(Number(limit))
         .lean()
         .exec();
   }

   async findSellerPurchaseOrders(sellerId, query = {}) {
      const { page = 1, limit = 20, orderStatus, paymentStatus } = query;

      const filter = {
         sellerId,
         orderType: 'SELLER_PURCHASE'
      };

      if (orderStatus) filter.orderStatus = orderStatus;
      if (paymentStatus) filter.paymentStatus = paymentStatus;

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const [data, total] = await Promise.all([
         this.order
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .lean()
            .exec(),

         this.order.countDocuments(filter)
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

   findSellerPurchaseOrderById(sellerId, orderId) {
      return this.order
         .findOne({
            _id: orderId,
            sellerId,
            orderType: 'SELLER_PURCHASE'
         })
         .lean()
         .exec();
   }

   findSellerPurchaseOrderRawById(sellerId, orderId) {
      return this.order
         .findOne({
            _id: orderId,
            sellerId,
            orderType: 'SELLER_PURCHASE'
         })
         .exec();
   }

   async findSellerCustomerOrders(sellerId, query = {}) {
      const {
         page = 1,
         limit = 20,
         orderStatus,
         paymentStatus
      } = query;

      const filter = {
         sellerId,
         orderType: 'CUSTOMER_ORDER'
      };

      if (orderStatus) filter.orderStatus = orderStatus;
      if (paymentStatus) filter.paymentStatus = paymentStatus;

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const [data, total] = await Promise.all([
         this.order
            .find(filter)
            .populate('customerId', 'name email phone profilePic')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .lean()
            .exec(),

         this.order.countDocuments(filter)
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

   findSellerCustomerOrderById(sellerId, orderId) {
      return this.order
         .findOne({
            _id: orderId,
            sellerId,
            orderType: 'CUSTOMER_ORDER'
         })
         .populate('customerId', 'name email phone profilePic')
         .populate('sellerId', 'shopName ownerName phone email city')
         .lean()
         .exec();
   }

   findSellerCustomerOrderRawById(sellerId, orderId) {
      return this.order
         .findOne({
            _id: orderId,
            sellerId,
            orderType: 'CUSTOMER_ORDER'
         })
         .exec();
   }
}

module.exports = OrderRepository;