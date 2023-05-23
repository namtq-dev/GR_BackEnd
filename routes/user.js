const express = require('express');
const { register, activateAccount, login } = require('../controllers/user');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/activate', authUser, activateAccount);
router.post('/login', login);

module.exports = router;
