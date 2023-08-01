const express = require('express');
const {
  createOrOpenConversation,
  getAllConversations,
  createGroup,
} = require('../controllers/conversation');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/conversation', authUser, createOrOpenConversation);
router.get('/getAllConversations', authUser, getAllConversations);
router.post('/group', authUser, createGroup);

module.exports = router;
