const express = require('express');
const {
  createOrOpenConversation,
  getAllConversations,
} = require('../controllers/conversation');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/conversation', authUser, createOrOpenConversation);
router.get('/getAllConversations', authUser, getAllConversations);

module.exports = router;
