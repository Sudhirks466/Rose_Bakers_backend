const BaseController = require('./base.controller');
const LoginsRepository = require('../repositories/logins.repository');
const AdminUserSchema = require('../models/User.model');

class LoginsController extends BaseController {
  constructor() {
    super(AdminUserSchema);
    this.loginsRepo = new LoginsRepository();
  }

  login = async (req, res) => {
    try {
      return this.commonSuccessResponse(res, { ok: true }, '', 'Login endpoint working');
    } catch (error) {
      return this.commonErrorResponse(res, 'Login error');
    }
  };
}

module.exports = LoginsController;
