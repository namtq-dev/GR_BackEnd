const Post = require('../models/post');
const User = require('../models/user');

exports.createPost = async (req, res) => {
  try {
    const post = await new Post(req.body).save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const allPosts = [];

    // get all users i'm following
    const following = await User.findById(req.user.id).select('following');
    const myFollowing = following.following;

    // get posts of users i'm following only
    const promises = myFollowing.map((user) => {
      return Post.find({ user })
        .populate('user', 'firstName lastName username picture gender cover')
        .populate('comments.commentBy', 'firstName lastName username picture')
        .sort({ createdAt: -1 })
        .limit(5);
    });
    const followingPosts = (await Promise.all(promises)).flat();
    allPosts.push(...followingPosts);

    const myPost = await Post.find({ user: req.user.id })
      .populate('user', 'firstName lastName username picture gender cover')
      .populate('comments.commentBy', 'firstName lastName username picture')
      .sort({ createdAt: -1 })
      .limit(5);
    allPosts.push(...myPost);

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
