const BaseRepository = require('./base.repository');
const UserModel = require('../models/User.model');

class UserRepository extends BaseRepository {
   constructor() {
      super(UserModel);
      this.user = UserModel;
   }

   findByEmail(email) {
      return this.user.findOne({
         email: String(email).toLowerCase(),
         isDeleted: false
      }).exec();
   }

   findByPhone(phone) {
      return this.user.findOne({
         phone: String(phone),
         isDeleted: false
      }).exec();
   }

   findByEmailOrPhone(identifier) {
      return this.user.findOne({
         $or: [
            { email: String(identifier).toLowerCase() },
            { phone: String(identifier) }
         ],
         isDeleted: false
      }).exec();
   }

   findPublicById(id) {
      return this.user
         .findById(id)
         .select('_id firstName lastName name email phone roles status profilePic isActive lastLoginAt')
         .lean()
         .exec();
   }

   updateLastLogin(id) {
      return this.user.findByIdAndUpdate(
         id,
         { lastLoginAt: new Date() },
         { new: true }
      ).exec();
   }

   updatePassword(id, passwordHash) {
      return this.user.findByIdAndUpdate(
         id,
         {
            passwordHash,
            lastChangePassword: new Date(),
            passwordResetTokenHash: null,
            passwordResetExpiresAt: null
         },
         { new: true }
      ).exec();
   }

   updateProfile(id, data) {
      return this.user.findByIdAndUpdate(
         id,
         data,
         { new: true, runValidators: true }
      ).select('_id firstName lastName name email phone roles status profilePic').lean().exec();
   }

   findUsersWithActiveResetToken() {
      return this.user.find({
         passwordResetTokenHash: { $ne: null },
         passwordResetExpiresAt: { $gt: new Date() },
         isDeleted: false
      }).exec();
   }

   async findCustomers(query = {}) {
      const { page = 1, limit = 10, search, status } = query;

      const filter = {
         roles: 'CUSTOMER',
         isDeleted: false
      };

      if (status) filter.status = status;

      if (search) {
         filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
         ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [data, total] = await Promise.all([
         this.user
            .find(filter)
            .select('_id firstName lastName name email phone roles status profilePic isActive createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean()
            .exec(),

         this.user.countDocuments(filter)
      ]);

      return {
         data,
         pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
         }
      };
   }

   countCustomers() {
      return this.user.countDocuments({
         roles: 'CUSTOMER',
         isDeleted: false
      });
   }

   addRole(userId, role) {
      return this.user.findByIdAndUpdate(
         userId,
         { $addToSet: { roles: role } },
         { new: true }
      ).exec();
   }
}

module.exports = UserRepository;