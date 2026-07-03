require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminUser = require('./src/models/AdminUser.model'); // path adjust if needed

(async () => {
   try {
      await mongoose.connect(process.env.CONNECTION_STRING);
      console.log('DB connected');

      const email = 'admin@test.com';
      const phone = '9999999999';
      const plainPassword = '123456';

      const exists = await AdminUser.findOne({ $or: [{ email }, { phone }] });
      if (exists) {
         console.log('Admin already exists:', exists.email);
         process.exit(0);
      }

      const passwordHash = await bcrypt.hash(plainPassword, 12);

      const doc = await AdminUser.create({
         firstName: 'Admin',
         lastName: 'User',
         email,
         phone,
         role: 'SUPER_ADMIN',      // or ADMIN / ANALYST
         permissions: [],
         passwordHash,
         isActive: true,
         isDeleted: false,
      });

      console.log('Admin created:', doc._id, doc.email);
      process.exit(0);
   } catch (e) {
      console.error('Seed error:', e);
      process.exit(1);
   }
})();
