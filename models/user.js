const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'firstName is required'],
      trim: true,
      text: true,
    },
    lastName: {
      type: String,
      required: [true, 'lastName is required'],
      trim: true,
      text: true,
    },
    username: {
      type: String,
      required: [true, 'username is required'],
      trim: true,
      text: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      trim: true,
      unique: [true, 'email address is already exist'],
    },
    password: {
      type: String,
      required: [true, 'password is required'],
    },
    status: {
      type: String,
      default: 'idle',
    },
    picture: {
      type: String,
      trim: true,
      default:
        'https://res.cloudinary.com/djccswary/image/upload/v1688650774/default_pic_jeaybr_ddc73n.png',
    },
    cover: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      required: [true, 'gender is required'],
      trim: true,
      default: 'male',
    },
    bYear: {
      type: Number,
      // required: true,
      trim: true,
    },
    bMonth: {
      type: Number,
      // required: true,
      trim: true,
    },
    bDay: {
      type: Number,
      // required: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    requests: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    search: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        createdAt: {
          type: Date,
          required: true,
        },
      },
    ],
    details: {
      bio: {
        type: String,
      },
      otherName: {
        type: String,
      },
      job: {
        type: String,
      },
      workplace: {
        type: String,
      },
      highSchool: {
        type: String,
      },
      college: {
        type: String,
      },
      currentCity: {
        type: String,
      },
      hometown: {
        type: String,
      },
      relationship: {
        type: String,
        enum: ['Single', 'In a relationship', 'Married', 'Divorced'],
      },
      instagram: {
        type: String,
      },
    },
    savedPosts: [
      {
        post: {
          type: Schema.Types.ObjectId,
          ref: 'Post',
        },
        savedAt: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    collection: 'users',
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
