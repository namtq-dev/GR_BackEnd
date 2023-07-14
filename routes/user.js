const express = require('express');
const {
  register,
  activateAccount,
  login,
  sendVerification,
  findUser,
  sendResetPasswordCode,
  validateResetCode,
  changePassword,
  getProfile,
  updateProfilePicture,
  updateCoverPicture,
  updateDetails,
  addFriend,
  cancelFriendRequest,
  follow,
  unfollow,
} = require('../controllers/user');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/activate', authUser, activateAccount);
router.post('/login', login);
router.post('/sendVerification', authUser, sendVerification);
router.post('/findUser', findUser);
router.post('/sendResetPasswordCode', sendResetPasswordCode);
router.post('/validateResetCode', validateResetCode);
router.post('/changePassword', changePassword);
router.get('/getProfile/:username', authUser, getProfile);
router.patch('/updateProfilePicture', authUser, updateProfilePicture);
router.patch('/updateCoverPicture', authUser, updateCoverPicture);
router.patch('/updateDetails', authUser, updateDetails);
router.patch('/addFriend/:id', authUser, addFriend);
router.patch('/cancelFriendRequest/:id', authUser, cancelFriendRequest);
router.patch('/follow/:id', authUser, follow);
router.patch('/unfollow/:id', authUser, unfollow);

module.exports = router;
