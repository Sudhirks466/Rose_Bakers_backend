const BaseRepository = require('./base.repository');
const PromoCodeAssignment = require('../models/PromoCodeAssignment.model');

class PromoCodeAssignmentRepository extends BaseRepository {
   constructor() {
      super(PromoCodeAssignment);
      this.assignment = PromoCodeAssignment;
   }

   findByPromoCodeId(promoCodeId) {
      return this.assignment
         .find({ promoCodeId })
         .populate('assignedToUserId', 'name email phone roles')
         .populate('assignedToSellerId', 'shopName ownerName phone')
         .populate('assignedBy', 'name email')
         .sort({ createdAt: -1 })
         .lean()
         .exec();
   }

   findByPromoAndUser(promoCodeId, userId) {
      return this.assignment
         .findOne({
            promoCodeId,
            assignedToUserId: userId,
            status: { $ne: 'REMOVED' }
         })
         .exec();
   }

   findByPromoAndSeller(promoCodeId, sellerId) {
      return this.assignment
         .findOne({
            promoCodeId,
            assignedToSellerId: sellerId,
            status: { $ne: 'REMOVED' }
         })
         .exec();
   }

   findActiveCustomerAssignments(userId) {
      const now = new Date();

      return this.assignment
         .find({
            assignedToUserId: userId,
            assignedToSellerId: { $exists: false },
            status: 'ACTIVE',
            $or: [
               { expiresAt: null },
               { expiresAt: { $gte: now } }
            ]
         })
         .populate('promoCodeId')
         .lean()
         .exec();
   }

   findActiveSellerAssignments(sellerId) {
      const now = new Date();

      return this.assignment
         .find({
            assignedToSellerId: sellerId,
            status: 'ACTIVE',
            $or: [
               { expiresAt: null },
               { expiresAt: { $gte: now } }
            ]
         })
         .populate('promoCodeId')
         .lean()
         .exec();
   }
}

module.exports = PromoCodeAssignmentRepository;