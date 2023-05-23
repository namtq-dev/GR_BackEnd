const jwt = require('jsonwebtoken');

exports.authUser = async (req, res, next) => {
  try {
    let bearerToken = req.header('Authorization');
    const jwtToken = bearerToken
      ? bearerToken.slice(7, bearerToken.length)
      : '';
    if (!jwtToken) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(jwtToken, process.env.TOKEN_SECRET, (error, user) => {
      if (error) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
