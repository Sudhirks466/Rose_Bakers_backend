const BaseRepository = require('./base.repository');
const ContactQuery = require('../models/ContactQuery.model');

class ContactQueryRepository extends BaseRepository {
   constructor() {
      super(ContactQuery);
      this.contact = ContactQuery;
   }

   async findAdminQueries(query = {}) {
      const { page = 1, limit = 20, status, search } = query;
      const filter = {};

      if (status) filter.status = status;

      if (search) {
         filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { subject: { $regex: search, $options: 'i' } }
         ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [data, total] = await Promise.all([
         this.contact.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean()
            .exec(),
         this.contact.countDocuments(filter)
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
}

module.exports = ContactQueryRepository;