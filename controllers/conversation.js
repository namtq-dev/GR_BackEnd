const {
  checkConversationExist,
  populateConversation,
  getUserConversation,
} = require('../helpers/conversation');
const Conversation = require('../models/conversation');
const User = require('../models/user');

exports.createOrOpenConversation = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(404).json({ message: 'User not found' });
    }

    // check if conversation existed
    const existedConversation = await checkConversationExist(
      senderId,
      receiverId
    );

    if (existedConversation) {
      return res.json(existedConversation);
    }

    let receiver = await User.findById(receiverId);
    let newConverInfos = {
      name: `${receiver.firstName} ${receiver.lastName}`,
      isGroup: false,
      users: [senderId, receiverId],
    };

    const newConver = await Conversation.create(newConverInfos);
    if (!newConver) {
      return res.status(500).json({ message: 'Oops... Something went wrong' });
    }

    const populatedConver = await populateConversation(
      newConver._id,
      'users',
      'firstName lastName username picture status'
    );

    res.status(200).json(populatedConver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await getUserConversation(userId);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
