const mongoose = require('mongoose');
const React = require('../models/react');
const User = require('../models/user');

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
    const reactsArray = await React.find({ post: req.params.id });

    const newReactsArray = reactsArray.reduce((group, react) => {
      let key = react.react;
      group[key] = group[key] || [];
      group[key].push(react);

      return group;
    }, {});

    const reacts = [
      {
        react: 'like',
        count: newReactsArray.like ? newReactsArray.like.length : 0,
      },
      {
        react: 'love',
        count: newReactsArray.love ? newReactsArray.love.length : 0,
      },
      {
        react: 'haha',
        count: newReactsArray.haha ? newReactsArray.haha.length : 0,
      },
      {
        react: 'wow',
        count: newReactsArray.wow ? newReactsArray.wow.length : 0,
      },
      {
        react: 'sad',
        count: newReactsArray.sad ? newReactsArray.sad.length : 0,
      },
      {
        react: 'angry',
        count: newReactsArray.angry ? newReactsArray.angry.length : 0,
      },
    ];

    const myReact = await React.findOne({
      post: req.params.id,
      reactBy: req.user.id,
    });

    const user = await User.findById(req.user.id);
    const isPostSaved = user?.savedPosts.find(
      (post) => post.post.toString() === req.params.id
    );

    res.json({
      reacts,
      myReact: myReact?.react,
      total: reactsArray.length,
      isPostSaved: !!isPostSaved,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
