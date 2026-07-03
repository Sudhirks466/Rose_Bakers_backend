const BaseRepository = require('./base.repository');
const Payment = require('../models/Payment.model');

class PaymentRepository extends BaseRepository {
   constructor() {
      super(Payment);
      this.payment = Payment;
   }

   async findAdminPayments(query = {}) {
      const {
         page = 1,
         limit = 10,
         paymentStatus,
         paymentMethod,
         fromDate,
         toDate
      } = query;

      const filter = {};

      if (paymentStatus) filter.paymentStatus = paymentStatus;
      if (paymentMethod) filter.paymentMethod = paymentMethod;

      if (fromDate || toDate) {
         filter.createdAt = {};
         if (fromDate) filter.createdAt.$gte = new Date(fromDate);
         if (toDate) filter.createdAt.$lte = new Date(toDate);
      }

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const [data, total] = await Promise.all([
         this.payment
            .find(filter)
            .populate('orderId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .lean()
            .exec(),

         this.payment.countDocuments(filter)
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

   findDetailsById(id) {
      return this.payment
         .findById(id)
         .populate('orderId')
         .lean()
         .exec();
   }
}

module.exports = PaymentRepository;