const express = require('express');
const { createOrOpenConversation } = require('../controllers/conversation');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/conversation', authUser, createOrOpenConversation);

module.exports = router;
