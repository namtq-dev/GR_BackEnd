const mongoose = require('mongoose');
const React = require('../models/react');

exports.reactPost = async (req, res) => {
  try {
    const { postId, react } = req.body;

    const isReacted = await React.findOne({
      post: postId,
      reactBy: mongoose.Types.ObjectId(req.user.id),
    });

    if (isReacted == null) {
      const newReact = await new React({
        react: react,
        post: postId,
        reactBy: req.user.id,
      }).save();
    } else {
      if (isReacted.react === react) {
        await React.findByIdAndRemove(isReacted._id);
      } else {
        await React.findByIdAndUpdate(isReacted._id, { react: react });
      }
    }

    return res.json({ message: 'OK' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all reacts for 1 post
exports.getAllReacts = async (req, res) => {
  try {
    const reacts = await React.find({ post: req.params.id });

    res.json({ reacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
