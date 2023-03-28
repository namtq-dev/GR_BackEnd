const { validateEmail } = require('../helpers/validation');
const User = require('../models/user');

exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      username,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: 'invalid email address',
      });
    }

    return;
    const user = await new User({
      firstName,
      lastName,
      email,
      password,
      username,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
