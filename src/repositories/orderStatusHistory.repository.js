const BaseRepository = require('./base.repository');
const OrderStatusHistory = require('../models/OrderStatusHistory.model');

class OrderStatusHistoryRepository extends BaseRepository {
   constructor() {
      super(OrderStatusHistory);
      this.history = OrderStatusHistory;
   }

   findByOrderId(orderId) {
      return this.history
         .find({ orderId })
         .populate('changedBy', 'name email phone')
         .sort({ createdAt: 1 })
         .lean()
         .exec();
   }
}

module.exports = OrderStatusHistoryRepository;