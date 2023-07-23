const express = require('express');
const { sendMessage, getMessages } = require('../controllers/message.js');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/messages', authUser, sendMessage);
router.get('/messages/:converId', authUser, getMessages);

module.exports = router;
