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
    const user = await User.findById(req.user.id);
    const friendship = {
      friends: false,
      following: false, // i follow u
      requestSent: false, // i sent u a friend request
      requestReceived: false, // u sent me a friend request
    };
    const { username } = req.params;

    const profile = await User.findOne({ username }).select('-password'); // get user info except password
    if (!profile) {
      return res.json({ message: 'User not found.' });
    }

    if (
      user.friends.includes(profile._id) &&
      profile.friends.includes(user._id)
    ) {
      friendship.friends = true;
    }
    if (
      user.following.includes(profile._id) &&
      profile.followers.includes(user._id)
    ) {
      friendship.following = true;
    }
    if (profile.requests.includes(user._id)) {
      friendship.requestSent = true;
    }
    if (user.requests.includes(profile._id)) {
      friendship.requestReceived = true;
    }

    const posts = await Post.find({ user: profile._id })
      .populate('user')
      .populate(
        'comments.commentBy',
        'firstName lastName username picture commentAt'
      )
      .sort({ createdAt: 'desc' });

    await profile.populate('friends', 'firstName lastName username picture');
    res.json({ ...profile.toObject(), posts, friendship });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    const { url } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        picture: url,
      },
      { new: true }
    );
    res.json(updatedUser.picture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCoverPicture = async (req, res) => {
  try {
    const { url } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        cover: url,
      },
      { new: true }
    );
    res.json(updatedUser.cover);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDetails = async (req, res) => {
  try {
    const { infos } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { details: infos },
      { new: true }
    );
    res.json(updatedUser.details);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addFriend = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (!receiver) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (receiver.requests.includes(sender._id)) {
        return res
          .status(400)
          .json({ message: 'The request has already been sent' });
      }
      if (receiver.friends.includes(sender._id)) {
        return res
          .status(400)
          .json({ message: "You're already friends on Aimer" });
      }

      await receiver.updateOne({
        $push: { requests: sender._id },
      });
      await receiver.updateOne({
        $push: { followers: sender._id },
      });
      await sender.updateOne({
        $push: { following: receiver._id },
      });

      res.json({ message: 'Your friend request has been sent successfully' });
    } else {
      return res
        .status(400)
        .json({ message: "Can't send friend request to yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelFriendRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (!receiver) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (
        !receiver.requests.includes(sender._id) &&
        !receiver.friends.includes(sender._id)
      ) {
        return res.status(200).json({
          message: "You haven't sent friend request to this user yet",
        });
      }

      if (
        receiver.requests.includes(sender._id) &&
        !receiver.friends.includes(sender._id)
      ) {
        await receiver.updateOne({
          $pull: { requests: sender._id },
        });
        await receiver.updateOne({
          $pull: { followers: sender._id },
        });
        await sender.updateOne({
          $pull: { following: receiver._id },
        });

        res.json({ message: 'Your cancel request has been sent successfully' });
      } else {
        return res.status(400).json({
          message: "Can't send request to your friend",
        });
      }
    } else {
      return res
        .status(400)
        .json({ message: "Can't send request to yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.follow = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (!receiver) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (
        !receiver.followers.includes(sender._id) &&
        !sender.following.includes(receiver._id)
      ) {
        await receiver.updateOne({
          $push: { followers: sender._id },
        });
        await sender.updateOne({
          $push: { following: receiver._id },
        });

        res.json({ message: 'Your follow request has been sent successfully' });
      } else {
        return res
          .status(400)
          .json({ message: 'The follow request has already been sent' });
      }
    } else {
      return res
        .status(400)
        .json({ message: "Can't send follow request to yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unfollow = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (!receiver) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (
        !receiver.followers.includes(sender._id) &&
        !sender.following.includes(receiver._id)
      ) {
        return res
          .status(400)
          .json({ message: 'You are not following this user' });
      }

      await receiver.updateOne({
        $pull: { followers: sender._id },
      });
      await sender.updateOne({
        $pull: { following: receiver._id },
      });

      res.json({ message: 'Your unfollow request has been sent successfully' });
    } else {
      return res
        .status(400)
        .json({ message: "Can't send unfollow request to yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptFriend = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const receiver = await User.findById(req.user.id);
      const sender = await User.findById(req.params.id);
      if (!sender) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (receiver.requests.includes(sender._id)) {
        await receiver.update({
          $push: { friends: sender._id, following: sender._id },
        });
        await sender.update({
          $push: { friends: receiver._id, followers: receiver._id },
        });
        await receiver.updateOne({
          $pull: { requests: sender._id },
        });

        res.json({
          message: 'You have successfully become friend with this user',
        });
      } else if (receiver.friends.includes(sender._id)) {
        return res
          .status(400)
          .json({ message: "You're already friends on Aimer" });
      } else {
        return res
          .status(400)
          .json({ message: "This user hasn't sent you a friend request" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "Can't accept request from yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unfriend = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (!receiver) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (
        receiver.friends.includes(sender._id) &&
        sender.friends.includes(receiver._id)
      ) {
        await sender.update({
          $pull: {
            friends: receiver._id,
            following: receiver._id,
            followers: receiver._id,
          },
        });
        await receiver.update({
          $pull: {
            friends: sender._id,
            following: sender._id,
            followers: sender._id,
          },
        });

        res.json({
          message: 'You have successfully unfriend this user',
        });
      } else {
        return res.status(400).json({ message: 'You two are not friends' });
      }
    } else {
      return res.status(400).json({ message: "Can't unfriend yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFriendRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const receiver = await User.findById(req.user.id);
      const sender = await User.findById(req.params.id);
      if (!sender) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (receiver.requests.includes(sender._id)) {
        await sender.update({
          $pull: {
            following: receiver._id,
          },
        });
        await receiver.update({
          $pull: {
            requests: sender._id,
            followers: sender._id,
          },
        });

        res.json({
          message: 'You have successfully decline a friend request',
        });
      } else {
        return res
          .status(400)
          .json({ message: 'This friend request has already been declined' });
      }
    } else {
      return res.status(400).json({ message: "Can't decline yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm;
    const results = await User.find({ $text: { $search: searchTerm } })
      .select('firstName lastName username picture')
      .limit(20);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToSearchHistory = async (req, res) => {
  try {
    const { searchedUser } = req.body;
    const search = {
      user: searchedUser,
      createdAt: new Date(),
    };

    const user = await User.findById(req.user.id);
    const checkHistory = user.search.find(
      (item) => item.user.toString() === searchedUser
    );

    if (checkHistory) {
      await User.updateOne(
        {
          _id: req.user.id,
          'search._id': checkHistory._id,
        },
        { $set: { 'search.$.createdAt': new Date() } }
      );
    } else {
      await User.findByIdAndUpdate(req.user.id, {
        $push: { search },
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
