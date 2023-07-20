const express = require('express');
const {
  register,
  activateAccount,
  login,
  logout,
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
  acceptFriend,
  unfriend,
  deleteFriendRequest,
  search,
  addToSearchHistory,
  getSearchHistory,
  deleteSearchHistory,
  getFriendsPage,
} = require('../controllers/user');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/activate', authUser, activateAccount);
router.post('/login', login);
router.post('/logout', authUser, logout);

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
router.delete('/cancelFriendRequest/:id', authUser, cancelFriendRequest);
router.patch('/follow/:id', authUser, follow);
router.patch('/unfollow/:id', authUser, unfollow);
router.patch('/acceptFriend/:id', authUser, acceptFriend);
router.delete('/unfriend/:id', authUser, unfriend);
router.delete('/deleteFriendRequest/:id', authUser, deleteFriendRequest);

router.post('/search/:searchTerm', authUser, search);
router.patch('/addToSearchHistory', authUser, addToSearchHistory);
router.get('/getSearchHistory', authUser, getSearchHistory);
router.patch('/deleteSearchHistory', authUser, deleteSearchHistory);

router.get('/getFriendsPage', authUser, getFriendsPage);

module.exports = router;
