const Post = require('../models/post');

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
    const posts = await Post.find()
      .populate('user', 'firstName lastName username picture gender')
      .sort({ createdAt: 'desc' });
    return res.json(posts);
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
