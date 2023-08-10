const express = require('express');
const {
  createPost,
  getAllPosts,
  comment,
  savePost,
  deletePost,
} = require('../controllers/post');
const { authUser } = require('../middleware/auth');
const sentiment = require('../middleware/sentiment');

const router = express.Router();

router.post('/createPost', authUser, sentiment, createPost);
router.get('/getAllPosts', authUser, getAllPosts);
router.patch('/comment', authUser, sentiment, comment);
router.patch('/savePost/:id', authUser, savePost);
router.delete('/deletePost/:id', authUser, deletePost);

module.exports = router;
