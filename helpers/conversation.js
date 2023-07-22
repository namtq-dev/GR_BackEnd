const Conversation = require('../models/conversation');
const User = require('../models/user');

exports.checkConversationExist = async (senderId, receiverId) => {
  let conversations = await Conversation.find({
    isGroup: false,
    $and: [
      { users: { $elemMatch: { $eq: senderId } } },
      { users: { $elemMatch: { $eq: receiverId } } },
    ],
  })
    .populate('users', 'firstName lastName username picture')
    .populate('latestMessage');

  if (!conversations) return false;

  // get the user talking to you
  conversation = await User.populate(conversations, {
    path: 'latestMessage.sender',
    select: 'firstName lastName username email picture status',
  });

  return conversations[0];
};

exports.populateConversation = async (id, field, attributes) => {
  const populatedConver = await Conversation.findOne({ _id: id }).populate(
    field,
    attributes
  );

  if (!populatedConver) return { message: 'Conversation not found!' };

  return populatedConver;
};
