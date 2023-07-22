import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema.Types;

const conversationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'conversation name is required'],
      trim: true,
    },
    picture: {
      type: String,
      required: true,
    },
    isGroup: {
      type: Boolean,
      required: true,
      default: false,
    },
    users: [
      {
        type: ObjectId,
        ref: 'User',
      },
    ],
    latestMessage: {
      type: ObjectId,
      ref: 'Message',
    },
    admin: {
      type: ObjectId,
      ref: 'User',
    },
  },
  {
    collection: 'conversations',
    timestamps: true,
  }
);

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model('Conversation', conversationSchema);

export default Conversation;
