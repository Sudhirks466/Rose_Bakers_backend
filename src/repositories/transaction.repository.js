const BaseRepository = require('./base.repository');
const Transaction = require('../models/Transaction.model');

class TransactionRepository extends BaseRepository {
   constructor() {
      super(Transaction);
      this.transaction = Transaction;
   }

   async findAdminTransactions(query = {}) {
      const {
         page = 1,
         limit = 10,
         transactionType,
         status,
         sellerId,
         userId,
         orderId,
         fromDate,
         toDate
      } = query;

      const filter = {};

      if (transactionType) filter.transactionType = transactionType;
      if (status) filter.status = status;
      if (sellerId) filter.sellerId = sellerId;
      if (userId) filter.userId = userId;
      if (orderId) filter.orderId = orderId;

      if (fromDate || toDate) {
         filter.transactionDate = {};
         if (fromDate) filter.transactionDate.$gte = new Date(fromDate);
         if (toDate) filter.transactionDate.$lte = new Date(toDate);
      }

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const [data, total] = await Promise.all([
         this.transaction
            .find(filter)
            .populate('userId', 'name email phone')
            .populate('sellerId', 'shopName ownerName phone')
            .populate('orderId', 'orderNo grandTotal orderStatus')
            .populate('paymentId', 'paymentMethod paymentStatus amount')
            .populate('createdBy', 'name email')
            .sort({ transactionDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .lean()
            .exec(),

         this.transaction.countDocuments(filter)
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

   findBySellerId(sellerId) {
      return this.transaction
         .find({ sellerId })
         .populate('orderId', 'orderNo grandTotal orderStatus')
         .populate('createdBy', 'name email')
         .sort({ transactionDate: -1, createdAt: -1 })
         .lean()
         .exec();
   }
   async findSellerTransactions(sellerId, query = {}) {
      const { page = 1, limit = 20, transactionType, status } = query;

      const filter = { sellerId };

      if (transactionType) filter.transactionType = transactionType;
      if (status) filter.status = status;

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const [data, total] = await Promise.all([
         this.transaction
            .find(filter)
            .populate('orderId', 'orderNo grandTotal orderStatus')
            .populate('paymentId', 'paymentMethod paymentStatus amount')
            .populate('createdBy', 'name email')
            .sort({ transactionDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .lean()
            .exec(),

         this.transaction.countDocuments(filter)
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

   findSellerLatestTransactions(sellerId, limit = 10) {
      return this.transaction
         .find({ sellerId })
         .populate('orderId', 'orderNo grandTotal orderStatus')
         .sort({ transactionDate: -1, createdAt: -1 })
         .limit(Number(limit))
         .lean()
         .exec();
   }
}

module.exports = TransactionRepository;