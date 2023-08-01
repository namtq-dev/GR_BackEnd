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
    const { receiverId, isGroup } = req.body;

    if (!isGroup) {
      if (!receiverId) {
        return res.status(404).json({ message: 'User not found' });
      }

      // check if conversation existed
      const existedConversation = await checkConversationExist(
        senderId,
        receiverId,
        false
      );

      if (existedConversation) {
        return res.json(existedConversation);
      }

      // let receiver = await User.findById(receiverId);
      let newConverInfos = {
        name: 'conversation name',
        picture: 'conversation picture',
        isGroup: false,
        users: [senderId, receiverId],
      };

      const newConver = await Conversation.create(newConverInfos);
      if (!newConver) {
        return res
          .status(500)
          .json({ message: 'Oops... Something went wrong' });
      }

      const populatedConver = await populateConversation(
        newConver._id,
        'users',
        'firstName lastName username picture status'
      );

      res.status(200).json(populatedConver);
    } else {
      // open group chat

      // check if group chat existed
      const existedGroupChat = await checkConversationExist('', '', isGroup);

      if (existedGroupChat) {
        return res.json(existedGroupChat);
      }
    }
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

exports.createGroup = async (req, res) => {
  const DEFAULT_GROUP_PIC =
    'https://res.cloudinary.com/djccswary/image/upload/v1690879443/group_zbbkg3.png';

  try {
    const { groupName, users } = req.body;

    if (!groupName || users.length < 1) {
      res.status(400).json({ message: 'Oops... Something went wrong' });
    }

    const currentUserId = req.user.id;
    users.push(currentUserId);

    let newConverInfos = {
      name: groupName,
      users,
      isGroup: true,
      admin: currentUserId,
      picture: DEFAULT_GROUP_PIC,
    };

    const newConver = await Conversation.create(newConverInfos);

    const populatedConver = await populateConversation(
      newConver._id,
      'users admin',
      'firstName lastName username picture status'
    );

    res.status(200).json(populatedConver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
