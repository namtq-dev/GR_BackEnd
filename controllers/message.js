const { updateLatestMessage } = require('../helpers/conversation');
const { createMessage, populateMessage } = require('../helpers/message');

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, converId, files } = req.body;
    if (!converId || (!message && !files)) {
      return res
        .status(400)
        .json({ message: 'Invalid conversation or message' });
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
    res.send('get');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
