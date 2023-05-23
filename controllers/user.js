const {
  validateEmail,
  validateLength,
  validateUsername,
} = require('../helpers/validation');
const { generateToken } = require('../helpers/tokens');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { sendVerificationEmail } = require('../helpers/mailer');
const jwt = require('jsonwebtoken');

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
    const emailVerificationUrl = `${process.env.FRONTEND_BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.firstName, emailVerificationUrl);

    const loginToken = generateToken({ id: user._id }, '7d');
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      firstName: user.firstName,
      lastName: user.lastName,
      loginToken,
      verified: user.verified,
      message:
        'Register successfully! Please check your email to activate your account!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const validUser = req.user.id;
    const { token } = req.body;
    const user = jwt.verify(token, process.env.TOKEN_SECRET);

    if (validUser !== user.id) {
      return res
        .status(401)
        .json({ message: "You don't have permission to perform this action." });
    }

    const newUser = await User.findById(user.id);
    if (newUser.verified) {
      return res
        .status(400)
        .json({ message: 'This account has already been verified.' });
    } else {
      await User.findByIdAndUpdate(user.id, { verified: true });
      return res
        .status(200)
        .json({ message: 'Your account has been activated successfully.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // login success
    const loginToken = generateToken({ id: user._id }, '7d');
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      firstName: user.firstName,
      lastName: user.lastName,
      loginToken,
      verified: user.verified,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
