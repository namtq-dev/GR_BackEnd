const {
  validateEmail,
  validateLength,
  validateUsername,
} = require('../helpers/validation');
const { generateToken } = require('../helpers/tokens');
const User = require('../models/user');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email address.',
      });
    }
    const isUsedEmail = await User.findOne({ email });
    if (isUsedEmail) {
      return res.status(400).json({
        message: 'This email address is already associated with an account.',
      });
    }

    if (!validateLength(firstName, 3, 30)) {
      return res.status(400).json({
        message: 'First name must be between 3 and 30 characters.',
      });
    }

    if (!validateLength(lastName, 3, 30)) {
      return res.status(400).json({
        message: 'Last name must be between 3 and 30 characters.',
      });
    }

    if (!validateLength(password, 6, 50)) {
      return res.status(400).json({
        message: 'Password must have at least 6 characters.',
      });
    }

    const cryptedPassword = await bcrypt.hash(password, 12);
    let generatedUsername = await validateUsername(firstName + lastName);

    const user = await new User({
      firstName,
      lastName,
      email,
      password: cryptedPassword,
      username: generatedUsername,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();

    const emailVerificationToken = generateToken({ id: user._id }, '30m');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
