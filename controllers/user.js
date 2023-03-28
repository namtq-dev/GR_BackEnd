const { validateEmail, validateLength } = require('../helpers/validation');
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
