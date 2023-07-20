const jwt = require('jsonwebtoken');

exports.generateToken = (payload, expires, secret) => {
  return jwt.sign(payload, secret, { expiresIn: expires });
};
