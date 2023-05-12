const ClientError = require('./ClientError');

class CanNotMoreThanOnceError extends ClientError {
  constructor(message) {
    super(message, 400);
    this.name = 'CanNotMoreThanOnceError';
  }
}

module.exports = CanNotMoreThanOnceError;
