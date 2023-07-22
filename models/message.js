const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      trim: true,
    },
    conversation: {
      type: ObjectId,
      ref: 'Conversation',
    },
    files: [],
  },
  {
    collection: 'messages',
    timestamps: true,
  }
);

const Message =
  mongoose.models.Message || mongoose.model('Message', messageSchema);

module.exports = Message;
