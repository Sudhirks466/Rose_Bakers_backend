const BaseRepository = require('./base.repository');
const Address = require('../models/Address.model');

class AddressRepository extends BaseRepository {
   constructor() {
      super(Address);
      this.address = Address;
   }

   findByUserId(userId) {
      return this.address.find({ userId, isDeleted: false }).sort({ isDefault: -1, createdAt: -1 }).lean().exec();
   }

   findByUserAndId(userId, id) {
      return this.address.findOne({ _id: id, userId, isDeleted: false }).exec();
   }

   countByUserId(userId) {
      return this.address.countDocuments({ userId, isDeleted: false });
   }

   removeDefault(userId) {
      return this.address.updateMany({ userId }, { isDefault: false }).exec();
   }
}

module.exports = AddressRepository;