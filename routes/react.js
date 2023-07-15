const express = require('express');
const { getAllReacts, reactPost } = require('../controllers/react');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.put('/reactPost', authUser, reactPost);
router.get('/getAllReacts/:id', authUser, getAllReacts);

module.exports = router;
