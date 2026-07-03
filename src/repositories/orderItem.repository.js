const BaseRepository = require('./base.repository');
const OrderItem = require('../models/OrderItem.model');

class OrderItemRepository extends BaseRepository {
   constructor() {
      super(OrderItem);
      this.orderItem = OrderItem;
   }

   findByOrderId(orderId) {
      return this.orderItem.find({ orderId }).populate('productId').populate('productPriceId').lean().exec();
   }
}

module.exports = OrderItemRepository;