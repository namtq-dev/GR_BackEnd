const { updateLatestMessage } = require('../helpers/conversation');
const {
  createMessage,
  populateMessage,
  getAllConverMessages,
} = require('../helpers/message');
const Conversation = require('../models/conversation');

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, converId, files } = req.body;
    if (!converId || (!message && !files)) {
      return res
        .status(400)
        .json({ message: 'Invalid conversation or message' });
    }

    const conver = await Conversation.findById(converId);
    if (!conver) {
      return res.status(400).json({ message: 'Invalid conversation' });
    }

    const messageData = {
      sender: userId,
      message,
      conversation: converId,
      files: files || [],
    };

    const newMessage = await createMessage(messageData);
    if (newMessage.message === 'Oops... Something went wrong!') {
      return res.status(400).json(newMessage);
    }

    const populatedMessage = await populateMessage(newMessage._id);
    await updateLatestMessage(converId, newMessage);

    res.status(200).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { converId } = req.params;
    if (!converId) {
      res.status(400).json({ message: 'Conversation not found' });
    }

    const messages = await getAllConverMessages(converId);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
