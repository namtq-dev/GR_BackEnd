const express = require('express');
const { sendMessage, getMessages } = require('../controllers/message.js');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/message', authUser, sendMessage);
router.get('/message/:converId', authUser, getMessages);

module.exports = router;
