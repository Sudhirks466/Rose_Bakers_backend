const BaseRepository = require('./base.repository');
const SessionModel = require('../models/Session.model');

class SessionRepository extends BaseRepository {
  constructor() {
    super(SessionModel);
    this.session = SessionModel;
  }

  createSession(data) {
    return this.session.create(data);
  }

  findById(id) {
    return this.session.findById(id).exec();
  }

  updateById(id, data) {
    return this.session.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  revokeById(id) {
    return this.session
      .findByIdAndUpdate(id, { revokedAt: new Date() }, { new: true })
      .exec();
  }

  revokeAllByUserId(userId) {
    return this.session.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() }
    ).exec();
  }

  revokeOtherSessions(userId, currentSessionId) {
    return this.session.updateMany(
      {
        userId,
        _id: { $ne: currentSessionId },
        revokedAt: null
      },
      { revokedAt: new Date() }
    ).exec();
  }

  findActiveByUserId(userId) {
    return this.session
      .find({
        userId,
        revokedAt: null,
        expiresAt: { $gt: new Date() }
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  deleteExpired() {
    return this.session.deleteMany({
      expiresAt: { $lt: new Date() }
    }).exec();
  }
}

module.exports = SessionRepository;