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
    .populate('users', 'firstName lastName username email picture status')
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

exports.getUserConversation = async (userId) => {
  let conversations;

  await Conversation.find({
    users: { $elemMatch: { $eq: userId } },
  })
    .populate('users', 'firstName lastName username email picture status')
    .populate('admin', 'firstName lastName username email picture status')
    .populate('latestMessage')
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      results = await User.populate(results, {
        path: 'latestMessage.sender',
        select: 'firstName lastName username email picture status',
      });

      conversations = results;
    })
    .catch((error) => {
      return { message: "Can't get all conversations" };
    });

  return conversations;
};

exports.updateLatestMessage = async (id, message) => {
  const updatedConver = await Conversation.findByIdAndUpdate(
    id,
    {
      latestMessage: message,
    },
    { new: true }
  );

  return updatedConver;
};
