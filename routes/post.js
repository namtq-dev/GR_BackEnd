const express = require('express');
const {
  createPost,
  getAllPosts,
  comment,
  savePost,
  deletePost,
} = require('../controllers/post');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/createPost', authUser, createPost);
router.get('/getAllPosts', authUser, getAllPosts);
router.patch('/comment', authUser, comment);
router.patch('/savePost/:id', authUser, savePost);
router.delete('/deletePost/:id', authUser, deletePost);

module.exports = router;
