const BaseRepository = require('./base.repository');
const Notification = require('../models/Notification.model');

class NotificationRepository extends BaseRepository {
   constructor() {
      super(Notification);
      this.notification = Notification;
   }

   findByUserId(userId) {
      return this.notification
         .find({
            $or: [
               { userId },
               { targetRole: 'CUSTOMER' },
               { targetRole: 'ALL' }
            ]
         })
         .sort({ createdAt: -1 })
         .lean()
         .exec();
   }

   findByUserAndId(userId, id) {
      return this.notification
         .findOne({
            _id: id,
            $or: [
               { userId },
               { targetRole: 'CUSTOMER' },
               { targetRole: 'ALL' }
            ]
         })
         .exec();
   }

   async findAdminNotifications(query = {}) {
      const {
         page = 1,
         limit = 20,
         type,
         targetRole,
         isRead,
         search
      } = query;

      const filter = {};

      if (type) filter.type = type;
      if (targetRole) filter.targetRole = targetRole;

      if (isRead !== undefined) {
         filter.isRead = isRead === 'true' || isRead === true;
      }

      if (search) {
         filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { message: { $regex: search, $options: 'i' } }
         ];
      }

      const pageNo = Number(page);
      const pageLimit = Number(limit);
      const skip = (pageNo - 1) * pageLimit;

      const [data, total] = await Promise.all([
         this.notification
            .find(filter)
            .populate('userId', 'name email phone roles')
            .populate('createdBy', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .lean()
            .exec(),

         this.notification.countDocuments(filter)
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
      return this.notification
         .findById(id)
         .populate('userId', 'name email phone roles')
         .populate('createdBy', 'name email phone')
         .lean()
         .exec();
   }

   markAllReadByUserId(userId) {
      return this.notification.updateMany(
         { userId, isRead: false },
         { isRead: true, readAt: new Date() }
      ).exec();
   }
}

module.exports = NotificationRepository;