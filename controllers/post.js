const mongoose = require('mongoose');
const Post = require('../models/post');
const User = require('../models/user');

exports.createPost = async (req, res) => {
  try {
    const post = await new Post(req.body).save();
    await post.populate(
      'user',
      'firstName lastName username picture gender cover'
    );

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    // get all users i'm following
    const following = await User.findById(req.user.id).select('following');
    const myFollowing = following.following;

    // get posts of users i'm following and my posts only
    const allPosts = await Post.find({
      $or: [
        { user: { $in: myFollowing } },
        { user: { $eq: mongoose.Types.ObjectId(req.user.id) } },
      ],
    })
      .populate('user', 'firstName lastName username picture gender cover')
      .populate('comments.commentBy', 'firstName lastName username picture')
      .sort({ createdAt: -1 })
      .limit(30);

    allPosts.sort((post1, post2) => {
      return post2.createdAt - post1.createdAt;
    });
    res.json(allPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.comment = async (req, res) => {
  try {
    const { comment, image, postId } = req.body;

    let newComments = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            comment,
            image,
            commentBy: req.user.id,
            commentAt: new Date(),
          },
        },
      },
      { new: true }
    ).populate('comments.commentBy', 'firstName lastName username picture');

    res.json(newComments.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.savePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user = await User.findById(req.user.id);

    const isSaved = user?.savedPosts.find(
      (post) => post.post.toString() === postId
    );
    if (isSaved) {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: {
          savedPosts: {
            _id: isSaved._id,
          },
        },
      });
    } else {
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          savedPosts: {
            post: postId,
            savedAt: new Date(),
          },
        },
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
