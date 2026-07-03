const BaseRepository = require('./base.repository');
const AdminUserModel = require('../models/User.model');

class LoginRepository extends BaseRepository {
   constructor() {
      super(AdminUserModel);
      this.adminUser = AdminUserModel;
   }
   async findByEmail(email) {
      return this.adminUser.findOne({ email: String(email).toLowerCase() });
   }
   async findById(id) {
      return this.adminUser.findById(id).select('_id email roles name passwordHash password password_hash');
   }
}
module.exports = LoginRepository;