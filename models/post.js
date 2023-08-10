const mongoose = require('mongoose');

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['profilePicture', 'cover', null],
      default: null,
    },
    text: {
      type: String,
    },
    images: {
      type: Array,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    background: {
      type: String,
    },
    comments: [
      {
        comment: {
          type: String,
          required: true,
        },
        image: {
          type: String,
        },
        score: {
          type: String,
        },
        commentBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        commentAt: {
          type: Date,
          required: true,
        },
      },
    ],
    score: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
