const BaseRepository = require('./base.repository');
const SellerInvite = require('../models/SellerInvite.model');

class SellerInviteRepository extends BaseRepository {
   constructor() {
      super(SellerInvite);
      this.invite = SellerInvite;
   }
}

module.exports = SellerInviteRepository;