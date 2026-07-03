const bcrypt = require('bcrypt');
class HashUtil {
  static async hashPassword(password, rounds = 12) {
    return bcrypt.hash(password, rounds);
  }
  static async comparePassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
  }
  static async hashToken(token, rounds = 10) {
    return bcrypt.hash(token, rounds);
  }
  static async compareToken(token, tokenHash) {
    return bcrypt.compare(token, tokenHash);
  }
}

module.exports = HashUtil;
