const express = require('express');
const {
  createPost,
  getAllPosts,
  comment,
  savePost,
} = require('../controllers/post');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/createPost', authUser, createPost);
router.get('/getAllPosts', authUser, getAllPosts);
router.patch('/comment', authUser, comment);
router.patch('/savePost/:id', authUser, savePost);

module.exports = router;
