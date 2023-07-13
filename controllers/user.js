const {
  validateEmail,
  validateLength,
  validateUsername,
} = require('../helpers/validation');
const { generateToken } = require('../helpers/tokens');
const generateCode = require('../helpers/generateCode');
const User = require('../models/user');
const Code = require('../models/code');
const Post = require('../models/post');
const bcrypt = require('bcrypt');
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require('../helpers/mailer');
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

exports.sendVerification = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.verified === true) {
      return res
        .status(400)
        .json({ message: 'This account has already been verified.' });
    }

    const emailVerificationToken = generateToken({ id: user._id }, '30m');
    const emailVerificationUrl = `${process.env.FRONTEND_BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.firstName, emailVerificationUrl);

    return res
      .status(200)
      .json({ message: 'A new email verification link has been sent to you.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.findUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('-password'); // don't take the password
    if (!user) {
      return res
        .status(404)
        .json({ message: "Couldn't find your Aimer account." });
    }

    return res.status(200).json({
      email: user.email,
      picture: user.picture,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendResetPasswordCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('-password'); // don't take the password
    await Code.findOneAndRemove({ userId: user._id });
    const newCode = generateCode(6);
    const savedCode = await new Code({
      code: newCode,
      userId: user._id,
    }).save();
    sendResetPasswordEmail(user.email, user.firstName, savedCode.code);

    return res.status(200).json({
      message:
        'A reset password code has been dispatched to your email. Please check.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validateResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email }).select('-password'); // don't take the password
    const codeFoundInDb = await Code.findOne({ userId: user._id });
    if (codeFoundInDb.code !== code) {
      return res.status(400).json({
        message: 'Invalid password reset code.',
      });
    }

    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cryptedPassword = await bcrypt.hash(password, 12);
    const result = await User.findOneAndUpdate(
      { email },
      { password: cryptedPassword }
    );

    if (!result) {
      return res
        .status(400)
        .json({ message: 'Failed to reset your password.' });
    }

    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await User.findOne({ username }).select('-password'); // get user info except password
    if (!profile) {
      return res.json({ message: 'User not found.' });
    }
    const posts = await Post.find({ user: profile._id })
      .populate('user')
      .sort({ createdAt: 'desc' });
    res.json({ ...profile.toObject(), posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    const { url } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      picture: url,
    });
    res.json(updatedUser.picture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCoverPicture = async (req, res) => {
  try {
    const { url } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      cover: url,
    });
    res.json(updatedUser.cover);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
